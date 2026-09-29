import os
from datetime import datetime
from src.database.models import Conversation
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from apify_client import ApifyClient

load_dotenv()

def get_apify_client():
    api_token = os.getenv('APIFY_API_TOKEN')
    if not api_token:
        print("Warning: APIFY_API_TOKEN not found. Forum scraping will be skipped.")
        return None
    return ApifyClient(api_token)

def scrape_forums(limit=50):
    """
    Scrape Google Support communities and generic forums using Apify Google Search scraper.
    Returns a list of Conversation objects.
    """
    client = get_apify_client()
    if not client:
        return []

    conversations = []
    
    google_search_actor = os.getenv('APIFY_GOOGLE_SEARCH_ACTOR_ID', 'apify/google-search-scraper')
    print(f"Calling Apify Google Search Actor '{google_search_actor}' for forums...")
    
    # We use Google Search dorks to find specific forum discussions
    queries = [
        'site:support.google.com/photos "search" OR "find" OR "lost"',
        'inurl:forum "google photos" "search" OR "remember"'
    ]

    try:
        run_input = {
            "queries": "\n".join(queries),
            "resultsPerPage": limit,
            "maxPagesPerQuery": 1
        }
        
        run = client.actor(google_search_actor).call(run_input=run_input)
        
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            # Google search scraper returns 'organicResults'
            organic_results = item.get('organicResults', [])
            
            for result in organic_results:
                text = result.get('description', '')
                title = result.get('title', '')
                url = result.get('url', '')
                
                # Combine title and description as the raw text
                full_text = f"{title}\n{text}"
                
                # We can't reliably get timestamps from search snippets easily, 
                # but we can default to UTC now to represent when we found it.
                dt = datetime.utcnow()
                
                source = "Google Support" if "support.google.com" in url else "Public Forum"

                conv = Conversation(
                    source=source,
                    source_type="Thread",
                    url=url,
                    timestamp=dt,
                    raw_text=full_text
                )
                conversations.append(conv)
                
        print(f"Scraped {len(conversations)} relevant threads from Forums and Google Support")
    except Exception as e:
        print(f"Forum scraping failed: {e}")

    return conversations

if __name__ == "__main__":
    results = scrape_forums(limit=5)
    for r in results:
        print(r)
