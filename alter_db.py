import sqlite3
conn = sqlite3.connect('ingestion.db')
try:
    conn.execute("ALTER TABLE conversations ADD COLUMN is_processed INTEGER DEFAULT 0")
    print("Column added.")
except Exception as e:
    print(e)
conn.commit()
conn.close()
