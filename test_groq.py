import os
from src.database.db_manager import SessionLocal
from src.database.models import Insight
from src.processing.groq_synthesizer import generate_global_report

session = SessionLocal()
insights = session.query(Insight).filter(Insight.scope_status == "IN_SCOPE").limit(30).all()
data = [{
    "id": i.id,
    "scenario": i.retrieval_scenario,
    "remembered": i.remembered_clues,
    "forgotten": i.forgotten_clues,
    "failure": i.failure_type,
    "workaround": i.workaround,
    "outcome": i.retrieval_outcome
} for i in insights]

print("Calling generate_global_report...")
import time
time.sleep(2) # Give rate limit some breathing room
result = generate_global_report(data)
import json
with open("global_report_cache.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)
print("Saved to global_report_cache.json")
session.close()
