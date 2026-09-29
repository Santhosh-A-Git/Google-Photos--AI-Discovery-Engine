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
        print("Warning: APIFY_API_TOKEN not found. Social media scraping will be skipped.")
        return None
    return ApifyClient(api_token)

def scrape_social_media(limit=50):
    """
    Scrape recent public posts from Twitter and Facebook using Apify actors.
    Returns a list of Conversation objects.
    """
    client = get_apify_client()
    if not client:
        return []

    conversations = []
    
    # 1. Scrape Twitter
    twitter_actor = os.getenv('APIFY_TWITTER_ACTOR_ID', 'microworlds/twitter-scraper')
    print(f"Calling Apify Twitter Actor '{twitter_actor}'...")
    try:
        run_input = {
            "searchTerms": ["google photos find", "google photos search", "google photos old"],
            "maxItems": limit,
            "sort": "Latest"
        }
        run = client.actor(twitter_actor).call(run_input=run_input)
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            text = item.get('full_text', '')
            timestamp = item.get('created_at')
            try:
                dt = datetime.strptime(timestamp, "%a %b %d %H:%M:%S +0000 %Y") if timestamp else datetime.utcnow()
            except:
                dt = datetime.utcnow()

            conv = Conversation(
                source="Twitter",
                source_type="Tweet",
                url=item.get('url', "https://twitter.com"),
                timestamp=dt,
                raw_text=text
            )
            conversations.append(conv)
        print(f"Scraped {len(conversations)} relevant posts from Twitter")
    except Exception as e:
        print(f"Twitter scraping failed: {e}")

    # 2. Scrape Facebook (Public Search)
    facebook_actor = os.getenv('APIFY_FACEBOOK_ACTOR_ID', 'apify/facebook-search-scraper')
    print(f"Calling Apify Facebook Actor '{facebook_actor}'...")
    try:
        fb_conversations = []
        run_input = {
            "query": "google photos search",
            "maxResults": limit
        }
        # Note: Facebook scrapers are often unstable without proxies. 
        # We wrap in try/except to ensure pipeline doesn't crash if FB blocks the actor.
        run = client.actor(facebook_actor).call(run_input=run_input)
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            text = item.get('text', item.get('postText', ''))
            url = item.get('url', item.get('postUrl', 'https://facebook.com'))
            timestamp_str = item.get('time', item.get('timestamp'))
            
            dt = datetime.utcnow() # Fallback
            if timestamp_str:
                try:
                    dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00')).replace(tzinfo=None)
                except:
                    pass

            # Only append if we got text
            if text:
                conv = Conversation(
                    source="Facebook",
                    source_type="Post",
                    url=url,
                    timestamp=dt,
                    raw_text=text
                )
                fb_conversations.append(conv)
                
        print(f"Scraped {len(fb_conversations)} relevant posts from Facebook")
        conversations.extend(fb_conversations)
    except Exception as e:
        print(f"Facebook scraping failed (this is common for FB without premium proxies): {e}")

    return conversations

if __name__ == "__main__":
    results = scrape_social_media(limit=10)
    for r in results:
        print(r)
