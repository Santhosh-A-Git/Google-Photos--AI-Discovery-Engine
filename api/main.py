# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, UploadFile, File
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
import sys
import os
from sqlalchemy import func

# Add project root to python path to import src modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.db_manager import SessionLocal
from src.database.models import Conversation, Insight, ProblemCluster, Opportunity
from src.processing.vector_pipeline import get_chroma_collection, embedder

app = FastAPI(title="Google Photos AI Discovery Engine API")

# Allow CORS for React frontend (Vite defaults to 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
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

from src.processing.groq_synthesizer import generate_global_report

@app.get("/api/global-report")
def get_global_report():
    """
    Synthesizes a global report using Groq based on all insights in the DB.
    """
    session = SessionLocal()
    try:
        insights = session.query(Insight).all()
        if not insights:
            return {
                "struggles": "No insights available yet.",
                "remembered": "Data unavailable.",
                "forgotten": "Data unavailable.",
                "search_behavior": "Data unavailable.",
                "opportunities": "Data unavailable."
            }
            
        data = [{
            "struggle": i.retrieval_struggle,
            "remembered": i.remembered_info,
            "forgotten": i.forgotten_info,
            "search": i.search_formulation,
            "opportunity": i.opportunity_area
        } for i in insights]
        
        # Call the synthesizer
        return generate_global_report(data)
    except Exception as e:
        print(f"Error in get_global_report: {e}")
        return {
            "struggles": f"Internal server error: {e}",
            "remembered": "Data unavailable.",
            "forgotten": "Data unavailable.",
            "search_behavior": "Data unavailable.",
            "opportunities": "Data unavailable."
        }
    finally:
        session.close()

@app.get("/api/stats")
def get_stats():
    session = SessionLocal()
    try:
        total_conversations = session.query(Conversation).count()
        total_insights = session.query(Insight).count()
        
        # Opportunity areas breakdown
        categories = session.query(
            Insight.opportunity_area, 
            func.count(Insight.id).label('count')
        ).group_by(Insight.opportunity_area).order_by(func.count(Insight.id).desc()).all()
        
        # Sources breakdown
        sources = session.query(
            Conversation.source, 
            func.count(Conversation.id).label('count')
        ).group_by(Conversation.source).order_by(func.count(Conversation.id).desc()).all()
        
        return {
            "total_conversations": total_conversations,
            "total_insights": total_insights,
            "categories": [{"name": c[0] or "Uncategorized", "value": c[1]} for c in categories],
            "sources": [{"name": s[0], "value": s[1]} for s in sources]
        }
    except Exception as e:
        print(f"Error in get_stats: {e}")
        return {
            "total_conversations": 0,
            "total_insights": 0,
            "categories": [],
            "sources": []
        }
    finally:
        session.close()

@app.get("/api/insights")
def get_insights(limit: int = 50):
    session = SessionLocal()
    try:
        # Join Insight with Conversation to get the source info
        results = session.query(Insight, Conversation).join(
            Conversation, Insight.conversation_id == Conversation.id
        ).order_by(Insight.id.desc()).limit(limit).all()
        
        formatted = []
        for insight, conv in results:
            formatted.append({
                "id": insight.id,
                "retrieval_struggle": insight.retrieval_struggle,
                "remembered_info": insight.remembered_info,
                "forgotten_info": insight.forgotten_info,
                "search_formulation": insight.search_formulation,
                "opportunity_area": insight.opportunity_area,
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

from src.processing.groq_synthesizer import generate_global_report, generate_rag_answer

@app.post("/api/search")
def search_insights(query: SearchQuery):
    try:
        collection = get_chroma_collection()
        
        # Generate embedding for the search query
        query_embedding = embedder.encode(query.query).tolist()
        
        # Query ChromaDB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=query.limit
        )
        
        # Format results
        formatted_results = []
        raw_documents = []
        if results and results['documents'] and len(results['documents'][0]) > 0:
            for i in range(len(results['documents'][0])):
                doc = results['documents'][0][i]
                raw_documents.append(doc)
                formatted_results.append({
                    "id": results['ids'][0][i],
                    "document": doc,
                    "metadata": results['metadatas'][0][i],
                    "distance": results['distances'][0][i] if 'distances' in results and results['distances'] else None
                })
        
        ai_answer = ""
        if raw_documents:
            # We'll send the top 5 documents to Groq for RAG
            ai_answer = generate_rag_answer(query.query, raw_documents[:5])
        else:
            ai_answer = "No relevant context found in the database to answer this query."
                
        return {
            "ai_answer": ai_answer,
            "results": formatted_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/insights/{id}/status")
def update_insight_status(id: int, status_update: StatusUpdate):
    session = SessionLocal()
    try:
        insight = session.query(Insight).filter(Insight.id == id).first()
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        insight.pm_status = status_update.pm_status
        insight.pm_feedback = status_update.pm_feedback
        session.commit()
        return {"message": "Status updated successfully"}
    finally:
        session.close()

@app.get("/api/clusters")
def get_clusters():
    session = SessionLocal()
    try:
        clusters = session.query(ProblemCluster).all()
        cluster_data = []
        import math
        for c in clusters:
            E = c.evidence_count
            S = c.independent_source_count
            penalty = 0.1 if S == 1 else 0.0
            score = (0.6 * math.log(1 + E)) + (0.4 * (S / 4.0)) - penalty
            formatted_score = f"{score:.2f}"
            
            cluster_data.append({
                "id": c.id, 
                "title": c.title, 
                "statement": c.statement, 
                "situation": c.situation, 
                "remembered_info": c.remembered_info, 
                "missing_info": c.missing_info, 
                "typical_attempt": c.typical_attempt, 
                "typical_failure": c.typical_failure, 
                "affected_content": c.affected_content, 
                "evidence_count": E, 
                "independent_source_count": S, 
                "confidence_score": c.confidence_score,
                "priority_score": formatted_score
            })
            
        cluster_data.sort(key=lambda x: float(x["priority_score"]), reverse=True)
        return cluster_data
    except Exception as e:
        print(f"Error in get_clusters: {e}")
        return []
    finally:
        session.close()

@app.get("/api/opportunities")
def get_opportunities():
    session = SessionLocal()
    try:
        opportunities = session.query(Opportunity).all()
        return [{"id": o.id, "cluster_id": o.cluster_id, "opportunity_area": o.opportunity_area, "affected_users": o.affected_users, "evidence_strength": o.evidence_strength, "prevalence": o.prevalence, "retrieval_relevance": o.retrieval_relevance} for o in opportunities]
    except Exception as e:
        print(f"Error in get_opportunities: {e}")
        return []
    finally:
        session.close()

import csv
import io
import datetime

@app.post("/api/ingest")
async def ingest_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    contents = await file.read()
    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))
    
    session = SessionLocal()
    count = 0
    try:
        for row in reader:
            # Expected columns: source, source_type, url, raw_text
            if "raw_text" not in row or not row["raw_text"]:
                continue
                
            conv = Conversation(
                source=row.get("source", "Unknown"),
                source_type=row.get("source_type", "Unknown"),
                url=row.get("url", ""),
                timestamp=datetime.datetime.utcnow(),
                raw_text=row["raw_text"]
            )
            session.add(conv)
            count += 1
        session.commit()
        return {"message": f"Successfully ingested {count} records."}
    finally:
        session.close()

@app.get("/api/landscape")
def get_landscape():
    session = SessionLocal()
    try:
        insights = session.query(Insight).all()
        remembered = [i.remembered_info for i in insights if i.remembered_info]
        forgotten = [i.forgotten_info for i in insights if i.forgotten_info]
        
        return {
            "remembered_items": remembered,
            "forgotten_items": forgotten,
            "total_insights": len(insights)
        }
    except Exception as e:
        print(f"Error in get_landscape: {e}")
        return {
            "remembered_items": [],
            "forgotten_items": [],
            "total_insights": 0
        }
    finally:
        session.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
