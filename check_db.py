import json
from src.database.db_manager import SessionLocal
from src.database.models import ProblemCluster, Opportunity

session = SessionLocal()

print("--- CLUSTERS ---")
for c in session.query(ProblemCluster).all():
    print(f"Cluster {c.id}: {c.cluster_name}")

print("\n--- OPPORTUNITIES ---")
for o in session.query(Opportunity).all():
    print(f"Opp {o.id}: {o.hypothesis_title} (Cluster ID: {o.cluster_id})")

session.close()
