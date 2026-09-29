import sqlite3
conn = sqlite3.connect('ingestion.db')
cursor = conn.cursor()
tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
for table in tables:
    count = cursor.execute(f"SELECT count(*) FROM {table[0]}").fetchone()[0]
    print(f"Table {table[0]}: {count} records")
