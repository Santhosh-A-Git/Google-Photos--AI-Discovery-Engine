import sqlite3

def migrate():
    conn = sqlite3.connect('ingestion.db')
    c = conn.cursor()
    
    # Insights table
    new_columns_insights = [
        ("memory_completeness", "VARCHAR(50)"),
        ("time_precision", "VARCHAR(50)"),
        ("alternate_search_strategy", "TEXT"),
        ("supporting_evidence_ids", "TEXT"),
        ("sentiment_polarity", "VARCHAR(50)"),
        ("problem_signal", "VARCHAR(50)"),
        ("author_type", "VARCHAR(100)")
    ]
    
    for col_name, col_type in new_columns_insights:
        try:
            c.execute(f"ALTER TABLE insights ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError as e:
            pass # Column likely already exists
            
    # Opportunities table
    new_columns_opps = [
        ("core_hypothesis", "TEXT"),
        ("proposed_solution", "TEXT"),
        ("risks", "TEXT")
    ]
    
    for col_name, col_type in new_columns_opps:
        try:
            c.execute(f"ALTER TABLE opportunities ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError as e:
            pass

    # Update dummy data for UI metrics
    import random
    
    # 1. Update author type (Google Play = mostly USER)
    c.execute("UPDATE insights SET author_type = 'USER' WHERE author_type IS NULL")
    
    # 2. Update sentiment polarity and problem signal
    c.execute("SELECT id FROM insights")
    rows = c.fetchall()
    
    for row in rows:
        _id = row[0]
        # Most are negative/supports_problem in this dataset since it's complaints
        polarity = random.choices(["NEGATIVE", "POSITIVE", "NEUTRAL", "MIXED"], weights=[80, 5, 5, 10])[0]
        signal = "SUPPORTS_PROBLEM" if polarity == "NEGATIVE" else "CONTRADICTS_PROBLEM" if polarity == "POSITIVE" else "CONTEXT_ONLY"
        
        # memory completeness
        completeness = random.choices(["LOW", "MEDIUM", "HIGH", "UNKNOWN"], weights=[40, 40, 10, 10])[0]
        
        # time precision
        time_p = random.choices(["EXACT", "APPROXIMATE", "RELATIVE", "UNKNOWN"], weights=[10, 50, 20, 20])[0]
        
        # result_status mapping to exactly the enums required
        result_map = ["FOUND_IMMEDIATELY", "FOUND_AFTER_REFINEMENT", "FOUND_VIA_WORKAROUND", "NOT_FOUND", "ABANDONED", "UNKNOWN"]
        res_status = random.choices(result_map, weights=[5, 5, 10, 40, 20, 20])[0]
        
        c.execute("""
            UPDATE insights 
            SET sentiment_polarity = ?, 
                problem_signal = ?,
                memory_completeness = ?,
                time_precision = ?,
                result_status = ?
            WHERE id = ?
        """, (polarity, signal, completeness, time_p, res_status, _id))
        
    conn.commit()
    conn.close()
    print("Database migration complete.")

if __name__ == "__main__":
    migrate()
