import os
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from src.database.models import Base

# Force local SQLite database so it uses the pre-populated data from GitHub
DB_PATH = 'sqlite:///ingestion.db'

engine = create_engine(DB_PATH, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Creates all tables in the database if they don't already exist.
    """
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {DB_PATH}")

def get_session():
    """
    Provides a transactional scope around a series of operations.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def bulk_insert_conversations(conversations):
    """
    Bulk inserts a list of Conversation objects into the database.
    """
    session = SessionLocal()
    try:
        session.bulk_save_objects(conversations)
        session.commit()
        print(f"Successfully inserted {len(conversations)} conversations.")
    except Exception as e:
        session.rollback()
        print(f"Failed to insert conversations: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    init_db()
