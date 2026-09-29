import hashlib
from src.database.db_manager import SessionLocal
from src.database.models import Conversation

def generate_hash(text: str) -> str:
    """Generate a stable hash for a given text to quickly identify exact matches."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def deduplicate_conversations(new_conversations):
    """
    Takes a list of new Conversation objects.
    Checks the database to ensure they are not duplicates (based on URL or exact text match).
    Returns a filtered list of unique Conversation objects ready for insertion.
    """
    if not new_conversations:
        return []

    unique_conversations = []
    session = SessionLocal()

    try:
        # Load all existing URLs and text hashes into memory for fast comparison
        # (For very large databases, this should be a direct DB query per batch instead)
        existing_urls = {row[0] for row in session.query(Conversation.url).filter(Conversation.url.isnot(None)).all()}
        
        # We simulate text hashing in DB by hashing texts locally for comparison
        existing_texts = session.query(Conversation.raw_text).all()
        existing_text_hashes = {generate_hash(row[0]) for row in existing_texts}

        for conv in new_conversations:
            # 1. Check URL duplication (prevents scraping the same Reddit post twice)
            if conv.url and conv.url in existing_urls:
                continue
                
            # 2. Check exact text duplication (prevents syndicated content/spam)
            text_hash = generate_hash(conv.raw_text)
            if text_hash in existing_text_hashes:
                continue
                
            # If it passes, it's unique
            unique_conversations.append(conv)
            
            # Add to local sets so we don't duplicate within the same batch
            if conv.url:
                existing_urls.add(conv.url)
            existing_text_hashes.add(text_hash)

    finally:
        session.close()

    print(f"Deduplication complete: {len(unique_conversations)}/{len(new_conversations)} items are new and unique.")
    return unique_conversations
