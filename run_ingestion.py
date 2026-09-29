from src.database.db_manager import init_db, bulk_insert_conversations
from src.ingestion.reddit_scraper import scrape_reddit
from src.ingestion.playstore_scraper import scrape_playstore
from src.ingestion.appstore_scraper import scrape_appstore
from src.ingestion.youtube_scraper import scrape_youtube
from src.ingestion.social_scraper import scrape_social_media
from src.ingestion.forum_scraper import scrape_forums
from src.processing.deduplicator import deduplicate_conversations
from src.processing.vector_pipeline import generate_embeddings_and_upsert

def run_pipeline():
    """
    Orchestrates the Phase 1 & 2 Data Ingestion and Processing Pipeline.
    1. Initializes the database schema (PostgreSQL/SQLite).
    2. Runs scrapers to gather raw data.
    3. Deduplicates conversations (exact match & URL).
    4. Normalizes and bulk inserts the data into the database.
    5. Generates embeddings and upserts to Pinecone.
    """
    print("--- Starting Phase 1 Data Ingestion Pipeline ---")
    
    # 1. Initialize DB
    print("Initializing Database...")
    init_db()
    
    all_conversations = []

    # 2. Scrape Reddit
    print("\nScraping Reddit (r/googlephotos)...")
    reddit_convos = scrape_reddit(limit=600)
    all_conversations.extend(reddit_convos)

    # 3. Scrape Play Store
    print("\nScraping Google Play Store...")
    play_convos = scrape_playstore(count=6000)
    all_conversations.extend(play_convos)

    # 4. Scrape App Store
    print("\nScraping Apple App Store...")
    app_convos = scrape_appstore(count=800)
    all_conversations.extend(app_convos)

    # 5. Scrape YouTube
    print("\nScraping YouTube Comments...")
    youtube_convos = scrape_youtube(limit=500)
    all_conversations.extend(youtube_convos)

    # 6. Scrape Social Media (Twitter/Facebook)
    print("\nScraping Social Media...")
    # Skipping social media as apify actors failed previously and cost credits
    # social_convos = scrape_social_media(limit=50)
    # all_conversations.extend(social_convos)

    # 7. Scrape Forums and Google Support
    print("\nScraping Forums and Google Support...")
    forum_convos = scrape_forums(limit=600)
    all_conversations.extend(forum_convos)

    print(f"\nTotal relevant conversations found: {len(all_conversations)}")
    
    # 5. Deduplicate
    unique_conversations = deduplicate_conversations(all_conversations)
    
    # 6. Bulk Insert to Relational Database
    if unique_conversations:
        print("Inserting unique conversations into the relational database...")
        bulk_insert_conversations(unique_conversations)
        
        # 8. Generate Vectors and Upsert to ChromaDB
        print("\nPushing vectors to ChromaDB...")
        generate_embeddings_and_upsert(unique_conversations)
    else:
        print("No new unique conversations to insert.")
        
    print("\n--- Pipeline Run Complete ---")

if __name__ == "__main__":
    run_pipeline()
