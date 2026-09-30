# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, UploadFile, File
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
import sys
import os
from sqlalchemy import func
import math

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.db_manager import SessionLocal
from src.database.models import Conversation, Insight, ProblemCluster, Opportunity
from src.processing.vector_pipeline import get_chroma_collection, embedder
from src.processing.groq_synthesizer import generate_global_report, generate_rag_answer

app = FastAPI(title="Google Photos AI Discovery Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str
    limit: int = 10

class StatusUpdate(BaseModel):
    pm_status: str
    pm_feedback: str = ""

@app.get("/api/global-report")
def get_global_report():
    session = SessionLocal()
    try:
        # Only query IN_SCOPE insights for the global report
        insights = session.query(Insight).filter(Insight.scope_status == "IN_SCOPE").all()
        if not insights:
            return {
                "in_scope_scenarios": "No in-scope insights available yet.",
                "remembered_landscape": "Data unavailable.",
                "forgotten_landscape": "Data unavailable.",
                "search_behaviors": "Data unavailable.",
                "retrieval_failures": "Data unavailable.",
                "opportunities": "Data unavailable."
            }
            
        data = [{
            "id": i.id,
            "scenario": i.retrieval_scenario,
            "remembered": i.remembered_clues,
            "forgotten": i.forgotten_clues,
            "failure": i.failure_type,
            "workaround": i.workaround,
            "outcome": i.retrieval_outcome
        } for i in insights]
        
        return generate_global_report(data)
    except Exception as e:
        print(f"Error in get_global_report: {e}")
        return {
            "in_scope_scenarios": f"Internal server error: {e}",
            "remembered_landscape": "Data unavailable.",
            "forgotten_landscape": "Data unavailable.",
            "search_behaviors": "Data unavailable.",
            "retrieval_failures": "Data unavailable.",
            "opportunities": "Data unavailable."
        }
    finally:
        session.close()

@app.get("/api/stats")
def get_stats():
    session = SessionLocal()
    try:
        total_raw = session.query(Conversation).count()
        total_insights = session.query(Insight).count()
        
        # Scopes breakdown
        scopes = session.query(
            Insight.scope_status, 
            func.count(Insight.id).label('count')
        ).group_by(Insight.scope_status).order_by(func.count(Insight.id).desc()).all()
        
        # Outcomes breakdown
        outcomes = session.query(
            Insight.retrieval_outcome, 
            func.count(Insight.id).label('count')
        ).group_by(Insight.retrieval_outcome).order_by(func.count(Insight.id).desc()).all()
        
        # Failures breakdown
        failures = session.query(
            Insight.failure_type, 
            func.count(Insight.id).label('count')
        ).group_by(Insight.failure_type).order_by(func.count(Insight.id).desc()).all()

        # Sources breakdown for backwards compatibility
        sources_data = session.query(
            Conversation.source, 
            func.count(Conversation.id).label('count')
        ).group_by(Conversation.source).all()
        
        return {
            "total_raw_records": total_raw,
            "total_conversations": total_raw,
            "total_insights_extracted": total_insights,
            "total_insights": total_insights,
            "scopes": [{"name": c[0] or "UNKNOWN", "value": c[1]} for c in scopes],
            "outcomes": [{"name": c[0] or "UNKNOWN", "value": c[1]} for c in outcomes],
            "failures": [{"name": c[0] or "UNKNOWN", "value": c[1]} for c in failures],
            "sources": [{"name": c[0] or "UNKNOWN", "value": c[1]} for c in sources_data]
        }
    except Exception as e:
        print(f"Error in get_stats: {e}")
        return {
            "total_raw_records": 0,
            "total_insights_extracted": 0,
            "scopes": [],
            "outcomes": [],
            "failures": []
        }
    finally:
        session.close()

@app.get("/api/insights")
def get_insights(limit: int = 50):
    session = SessionLocal()
    try:
        results = session.query(Insight, Conversation).join(
            Conversation, Insight.conversation_id == Conversation.id
        ).order_by(Insight.id.desc()).limit(limit).all()
        
        formatted = []
        for insight, conv in results:
            formatted.append({
                "id": insight.id,
                "scope_status": insight.scope_status,
                "retrieval_scenario": insight.retrieval_scenario,
                "remembered_clues": insight.remembered_clues,
                "forgotten_clues": insight.forgotten_clues,
                "failure_type": insight.failure_type,
                "retrieval_outcome": insight.retrieval_outcome,
                "exact_quote": insight.exact_quote,
                "source": conv.source,
                "url": conv.url,
                "created_at": insight.created_at.isoformat() if insight.created_at else None
            })
        return formatted
    except Exception as e:
        print(f"Error in get_insights: {e}")
        return []
    finally:
        session.close()

@app.post("/api/search")
def search_insights(query: SearchQuery):
    try:
        collection = get_chroma_collection()
        query_embedding = embedder.encode(query.query).tolist()
        
        # Fetch a large number of results, because many might not have insights yet
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=100
        )
        
        formatted_results = []
        raw_documents = []
        if results and results['documents'] and len(results['documents'][0]) > 0:
            for i in range(len(results['documents'][0])):
                doc = results['documents'][0][i]
                metadata = results['metadatas'][0][i]
                
                # Fetch full insight from DB for RAG context
                session = SessionLocal()
                conv_id = metadata.get('conversation_id')
                insight = None
                if conv_id:
                    insight = session.query(Insight).filter(Insight.conversation_id == int(conv_id)).first()
                session.close()
                
                if insight:
                    context_obj = {
                        "id": insight.id,
                        "quote": insight.exact_quote,
                        "failure_type": insight.failure_type,
                        "remembered": insight.remembered_clues,
                        "forgotten": insight.forgotten_clues,
                        "outcome": insight.retrieval_outcome
                    }
                    raw_documents.append(context_obj)
                
                    formatted_results.append({
                        "id": results['ids'][0][i],
                        "document": doc,
                        "metadata": metadata,
                        "distance": results['distances'][0][i] if 'distances' in results and results['distances'] else None
                    })
                
                # Stop if we have enough results
                if len(formatted_results) >= query.limit:
                    break
        
        ai_answer = ""
        if raw_documents:
            ai_answer = generate_rag_answer(query.query, raw_documents[:5])
        else:
            ai_answer = "No relevant context found in the database to answer this query."
                
        return {
            "ai_answer": ai_answer,
            "results": formatted_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/landscape")
def get_landscape():
    session = SessionLocal()
    try:
        # Only in-scope
        insights = session.query(Insight).filter(Insight.scope_status == "IN_SCOPE").all()
        
        return {
            "people_remembered": [i.remembered_people for i in insights if i.remembered_people],
            "place_remembered": [i.remembered_place for i in insights if i.remembered_place],
            "time_remembered": [i.approximate_time for i in insights if i.approximate_time],
            "event_remembered": [i.remembered_event for i in insights if i.remembered_event],
            "object_remembered": [i.remembered_object for i in insights if i.remembered_object],
            "visuals_remembered": [i.remembered_visual_attributes for i in insights if i.remembered_visual_attributes],
            "total_in_scope": len(insights)
        }
    except Exception as e:
        print(f"Error in get_landscape: {e}")
        return {
            "people_remembered": [],
            "place_remembered": [],
            "time_remembered": [],
            "event_remembered": [],
            "object_remembered": [],
            "visuals_remembered": [],
            "total_in_scope": 0
        }
    finally:
        session.close()

@app.get("/api/clusters")
def get_clusters():
    session = SessionLocal()
    try:
        clusters = session.query(ProblemCluster).all()
        result = []
        for c in clusters:
            e = c.evidence_count or 0
            s = c.independent_source_count or 0
            # C = (0.6 * log(E)) + (0.4 * (S/4)) where log is typically base 10 or e; we'll use log10(e+1) to match UI docs roughly
            c_score = (0.6 * math.log10(e + 1)) + (0.4 * (s / 4.0)) if e > 0 else 0
            
            # Re-evaluate confidence string just in case
            conf_str = "HIGH" if c_score > 0.65 else ("MEDIUM" if c_score > 0.4 else "LOW")
            
            result.append({
                "id": c.id,
                "title": c.title,
                "statement": c.statement,
                "situation": c.situation,
                "remembered_info": c.remembered_info,
                "missing_info": c.missing_info,
                "typical_attempt": c.typical_attempt,
                "typical_failure": c.typical_failure,
                "affected_content": c.affected_content,
                "evidence_count": e,
                "independent_source_count": s,
                "confidence_score": conf_str,
                "priority_score": round(c_score, 2)
            })
        return result
    except Exception as e:
        print(f"Error in get_clusters: {e}")
        return []
    finally:
        session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
