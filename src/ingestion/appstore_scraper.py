# pyrefly: ignore [missing-import]
from app_store_scraper import AppStore
from datetime import datetime
from src.database.models import Conversation

def scrape_appstore(app_name="google-photos", app_id=962194608, count=100):
    """
    Scrape recent reviews from the Apple App Store for a specific app.
    Returns a list of Conversation objects containing relevant keywords.
    """
    try:
        scraper = AppStore(country='us', app_name=app_name, app_id=app_id)
        # Using how_many controls how many to fetch
        scraper.review(how_many=count)
    except Exception as e:
        print(f"Failed to scrape App Store: {e}")
        return []

    conversations = []
    keywords = ['find', 'search', 'remember', 'lost', 'screenshot', 'locate', 'old photo']

    for review in scraper.reviews:
        text = review.get('review', '')
        # Only keep reviews that mention retrieval keywords
        if any(keyword in text.lower() for keyword in keywords):
            conv = Conversation(
                source="Apple App Store",
                source_type="Review",
                url=f"https://apps.apple.com/us/app/{app_name}/id{app_id}",  # App store doesn't have review-level URLs easily accessible
                timestamp=review.get('date', datetime.utcnow()),
                raw_text=text
            )
            conversations.append(conv)

    print(f"Scraped {len(conversations)} relevant reviews from Apple App Store")
    return conversations

if __name__ == "__main__":
    results = scrape_appstore(count=20)
    for r in results:
        print(r)
