import time
import sys
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from src.database.db_manager import engine, init_db
from src.database.models import Conversation, Insight
from src.processing.groq_extractor import extract_insight

def run_inference_pipeline():
    init_db()
    
    Session = sessionmaker(bind=engine)
    session = Session()

    print("--- Starting Phase 3: AI Inference Core ---")

    unprocessed_convos = session.query(Conversation).filter(
        Conversation.is_processed == 0
    ).all()

    if not unprocessed_convos:
        print("No new conversations to process.")
        return

    print(f"Found {len(unprocessed_convos)} raw conversations to analyze via Groq.")
    
    valid_insights = 0
    rejected_insights = 0

    for i, conv in enumerate(unprocessed_convos):
        print(f"\n[{i+1}/{len(unprocessed_convos)}] Analyzing Conversation ID: {conv.id} ({conv.source})")
        
        # Mark as processed
        conv.is_processed = 1
        
        result_json = extract_insight(conv.raw_text)
        
        if not result_json:
            print("Skipping due to extraction failure. Halting script to catch API limits immediately.")
            session.commit()
            sys.exit(1)
            
        # We save ALL records to the DB for audit, even OUT_OF_SCOPE.
        insight = Insight(
            conversation_id=conv.id,
            scope_status=result_json.get("scope_status"),
            scope_reason=result_json.get("scope_reason"),
            scope_confidence=result_json.get("scope_confidence"),
            retrieval_scenario=result_json.get("retrieval_scenario"),
            photo_type=result_json.get("photo_type"),
            context_type=result_json.get("context_type"),
            remembered_clues=result_json.get("remembered_clues"),
            forgotten_clues=result_json.get("forgotten_clues"),
            approximate_time=result_json.get("approximate_time"),
            remembered_place=result_json.get("remembered_place"),
            remembered_people=result_json.get("remembered_people"),
            remembered_event=result_json.get("remembered_event"),
            remembered_object=result_json.get("remembered_object"),
            remembered_visual_attributes=result_json.get("remembered_visual_attributes"),
            remembered_text=result_json.get("remembered_text"),
            remembered_relationship=result_json.get("remembered_relationship"),
            initial_search_query=result_json.get("initial_search_query"),
            search_mode=result_json.get("search_mode"),
            search_strategy=result_json.get("search_strategy"),
            search_attempt_number=result_json.get("search_attempt_number"),
            refinement_attempt=result_json.get("refinement_attempt"),
            clues_added=result_json.get("clues_added"),
            clues_removed=result_json.get("clues_removed"),
            result_status=result_json.get("result_status"),
            result_relevance=result_json.get("result_relevance"),
            recognition_difficulty=result_json.get("recognition_difficulty"),
            retrieval_outcome=result_json.get("retrieval_outcome"),
            failure_point=result_json.get("failure_point"),
            failure_reason=result_json.get("failure_reason"),
            failure_type=result_json.get("failure_type"),
            uncertainty=result_json.get("uncertainty"),
            user_frustration=result_json.get("user_frustration"),
            workaround=result_json.get("workaround"),
            external_tool_used=result_json.get("external_tool_used"),
            external_platform=result_json.get("external_platform"),
            manual_action=result_json.get("manual_action"),
            evidence_strength=result_json.get("evidence_strength"),
            theme=result_json.get("theme"),
            opportunity_area=result_json.get("opportunity_area"),
            affected_segment=result_json.get("affected_segment"),
            validation_status=result_json.get("validation_status", "PENDING"),
            exact_quote=result_json.get("exact_quote") or ""
        )
        
        session.add(insight)
        session.commit()
        
        scope = insight.scope_status if insight.scope_status else "UNKNOWN"
        print(f"VALID: Saved insight -> SCOPE: {scope}")
        valid_insights += 1
            
        # Increased to 20 seconds to avoid strict TPM limits with the new massive schema
        time.sleep(20) 
        
    print("\n--- AI Inference Complete ---")
    print(f"Total Insights Generated: {valid_insights}")

if __name__ == "__main__":
    run_inference_pipeline()
