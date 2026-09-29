import os
from datetime import datetime
from src.database.models import Conversation
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from apify_client import ApifyClient

load_dotenv()

def get_apify_client():
    """Initialize Apify client using environment variables."""
    api_token = os.getenv('APIFY_API_TOKEN')
    if not api_token:
        print("Warning: APIFY_API_TOKEN not found. Reddit scraping via Apify will be skipped or fail.")
        return None
    return ApifyClient(api_token)

def scrape_reddit(subreddit_name="googlephotos", limit=100):
    """
    Scrape recent posts from a specific subreddit using Apify.
    Returns a list of Conversation objects.
    """
    client = get_apify_client()
    if not client:
        return []

    # Using a standard Reddit Scraper actor on Apify (e.g., 'trudax/reddit-scraper' or similar popular ones)
    # The actor ID might need to be adjusted depending on the specific one you subscribe to on Apify.
    # We will use 'trudax/reddit-scraper' as a reliable default.
    actor_id = os.getenv('APIFY_ACTOR_ID', 'trudax/reddit-scraper')
    
    run_input = {
        "subreddits": [subreddit_name],
        "sort": "new",
        "time": "all",
        "maxItems": limit,
        # We can pass search terms if the actor supports it, or filter client-side
    }
    
    print(f"Calling Apify Actor '{actor_id}' for r/{subreddit_name}...")
    
    try:
        run = client.actor(actor_id).call(run_input=run_input)
        dataset_items = client.dataset(run["defaultDatasetId"]).iterate_items()
    except Exception as e:
        print(f"Apify scraping failed: {e}")
        return []
        
    conversations = []
    keywords = ['find', 'search', 'remember', 'lost', 'screenshot', 'locate', 'old photo']
    
    for item in dataset_items:
        # Apify actors return varying JSON structures. Typically 'title' and 'selftext' or 'text' are present.
        title = item.get('title', '')
        selftext = item.get('selftext', item.get('text', ''))
        text = f"{title}\n{selftext}"
        
        # Filter for keywords client-side to ensure relevance
        if any(keyword in text.lower() for keyword in keywords):
            
            # Extract timestamp safely
            created_at = item.get('createdAt')
            if created_at:
                # Handle ISO format strings returned by Apify
                try:
                    timestamp = datetime.fromisoformat(created_at.replace('Z', '+00:00')).replace(tzinfo=None)
                except ValueError:
                    timestamp = datetime.utcnow()
            else:
                timestamp = datetime.utcnow()

            conv = Conversation(
                source="Reddit",
                source_type="Post",
                url=item.get('url', f"https://www.reddit.com/r/{subreddit_name}"),
                timestamp=timestamp,
                raw_text=text
            )
            conversations.append(conv)
            
    print(f"Scraped {len(conversations)} relevant posts from r/{subreddit_name} via Apify")
    return conversations

if __name__ == "__main__":
    results = scrape_reddit(limit=10)
    for r in results:
        print(r)
