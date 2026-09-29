import sqlite3
conn = sqlite3.connect('ingestion.db')
try:
    conn.execute("UPDATE conversations SET is_processed = 1 WHERE id IN (SELECT conversation_id FROM insights)")
    print("Updated existing conversations to is_processed = 1")
except Exception as e:
    print(e)
conn.commit()
conn.close()
