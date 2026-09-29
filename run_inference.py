import time
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from src.database.db_manager import engine, init_db
from src.database.models import Conversation, Insight
from src.processing.groq_extractor import extract_insight
from src.processing.guardrails import validate_insight

def run_inference_pipeline():
    """
    1. Fetches all Conversations that do not have a corresponding Insight.
    2. Batches them and sends them to Groq for extraction.
    3. Runs anti-hallucination guardrails on the response.
    4. Saves valid Insights back to the database.
    """
    init_db()  # Ensure tables exist, especially after schema migrations
    
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
        
        # Mark as processed immediately so we don't retry if it fails or gets rejected
        conv.is_processed = 1
        
        # 1. Extract
        result_json = extract_insight(conv.raw_text)
        
        if not result_json:
            print("Skipping due to extraction failure. Halting script to catch API limits immediately.")
            import sys
            sys.exit(1)
            
        # 2. Guardrail Validation (ZERO HALLUCINATION CHECK)
        # We consider it rejected if it's nulls (due to our context filter) or hallucinated
        is_empty_or_irrelevant = (
            result_json.get("opportunity_area") is None and 
            result_json.get("retrieval_struggle") is None
        )

        if is_empty_or_irrelevant:
            print(f"REJECTED: Context filter applied (irrelevant to discovery/search).")
            rejected_insights += 1
            session.commit()
        elif validate_insight(result_json, conv):
            # 3. Save to DB
            insight = Insight(
                conversation_id=conv.id,
                retrieval_struggle=result_json.get("retrieval_struggle"),
                remembered_info=result_json.get("remembered_info"),
                forgotten_info=result_json.get("forgotten_info"),
                search_formulation=result_json.get("search_formulation"),
                opportunity_area=result_json.get("opportunity_area"),
                exact_quote=result_json.get("exact_quote")
            )
            session.add(insight)
            session.commit()
            
            # Print without emojis to avoid Windows console errors
            safe_area = insight.opportunity_area.encode('ascii', 'replace').decode('ascii') if insight.opportunity_area else "None"
            print(f"VALID: Saved insight -> {safe_area}")
            valid_insights += 1
        else:
            print(f"REJECTED: Failed Hallucination Guardrails.")
            rejected_insights += 1
            session.commit()
            
        # Optional: Add a tiny sleep to be completely safe with Groq RPM limits on free tier,
        # although tenacity will handle the 429 backoff automatically if we hit it.
        # Increased to 15 seconds to avoid Tokens-Per-Minute rate limits.
        time.sleep(15) 
        
    print("\n--- AI Inference Complete ---")
    print(f"Total Valid Insights Generated: {valid_insights}")
    print(f"Total Insights Rejected by Guardrails: {rejected_insights}")

if __name__ == "__main__":
    run_inference_pipeline()
