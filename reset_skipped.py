import sqlite3
conn = sqlite3.connect('ingestion.db')
cursor = conn.cursor()
cursor.execute("UPDATE conversations SET is_processed = 0 WHERE is_processed = 1 AND id NOT IN (SELECT conversation_id FROM insights)")
print(f"Reset {cursor.rowcount} skipped conversations to unprocessed state.")
conn.commit()
conn.close()
