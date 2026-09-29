import os
from src.database.db_manager import SessionLocal
from src.database.models import Conversation
from src.processing.vector_pipeline import generate_embeddings_and_upsert

def push_to_chroma():
    session = SessionLocal()
    conversations = session.query(Conversation).all()
    print(f"Found {len(conversations)} conversations in SQLite")
    if conversations:
        generate_embeddings_and_upsert(conversations)
        print("Done pushing to ChromaDB")
    session.close()

if __name__ == '__main__':
    push_to_chroma()
