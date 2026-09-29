# pyrefly: ignore [missing-import]
from google_play_scraper import Sort, reviews
from datetime import datetime
from src.database.models import Conversation

def scrape_playstore(app_id='com.google.android.apps.photos', lang='en', country='us', count=100):
    """
    Scrape recent reviews from the Google Play Store for a specific app.
    Returns a list of Conversation objects containing relevant keywords.
    """
    try:
        result, continuation_token = reviews(
            app_id,
            lang=lang, # defaults to 'en'
            country=country, # defaults to 'us'
            sort=Sort.NEWEST, # newest reviews
            count=count
        )
    except Exception as e:
        print(f"Failed to scrape Play Store: {e}")
        return []

    conversations = []
    keywords = ['find', 'search', 'remember', 'lost', 'screenshot', 'locate', 'old photo']

    for review in result:
        text = review.get('content', '')
        # Only keep reviews that mention retrieval keywords
        if any(keyword in text.lower() for keyword in keywords):
            conv = Conversation(
                source="Google Play Store",
                source_type="Review",
                url=f"https://play.google.com/store/apps/details?id={app_id}&reviewId={review.get('reviewId')}",
                timestamp=review.get('at', datetime.utcnow()),
                raw_text=text
            )
            conversations.append(conv)

    print(f"Scraped {len(conversations)} relevant reviews from Google Play Store")
    return conversations

if __name__ == "__main__":
    results = scrape_playstore(count=20)
    for r in results:
        print(r)
