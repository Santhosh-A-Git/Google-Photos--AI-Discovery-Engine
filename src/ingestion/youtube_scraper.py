import os
import re
from datetime import datetime
from src.database.models import Conversation
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from googleapiclient.discovery import build
# pyrefly: ignore [missing-import]
from googleapiclient.errors import HttpError

load_dotenv()

def extract_video_id(url):
    """Extracts the YouTube video ID from a standard or short URL."""
    # Match ?v=ID or &v=ID or youtu.be/ID
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if match:
        return match.group(1)
    return None

def get_youtube_client():
    """Initialize the official Google YouTube API client."""
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        print("Warning: YOUTUBE_API_KEY not found. YouTube scraping will be skipped.")
        return None
    try:
        return build('youtube', 'v3', developerKey=api_key)
    except Exception as e:
        print(f"Failed to build YouTube client: {e}")
        return None

def scrape_youtube(video_urls=None, limit=100):
    """
    Scrape comments from specific YouTube videos using the official Google YouTube API.
    Returns a list of Conversation objects.
    """
    youtube = get_youtube_client()
    if not youtube:
        return []

    # If no URLs are passed, try to load from environment
    if not video_urls:
        env_urls = os.getenv("YOUTUBE_VIDEO_URLS", "")
        if env_urls:
            video_urls = [url.strip() for url in env_urls.split(",") if url.strip()]
        else:
            print("No YouTube video URLs provided. Searching YouTube for relevant videos...")
            try:
                search_response = youtube.search().list(
                    q="google photos find search remember",
                    part="id",
                    type="video",
                    maxResults=10
                ).execute()
                video_urls = [f"https://www.youtube.com/watch?v={item['id']['videoId']}" 
                              for item in search_response.get("items", [])]
                print(f"Found {len(video_urls)} relevant videos via search.")
            except Exception as e:
                print(f"Failed to search for videos: {e}")
                return []
            
            if not video_urls:
                return []

    conversations = []
    keywords = ['find', 'search', 'remember', 'lost', 'screenshot', 'locate', 'old photo']

    print(f"Scraping {len(video_urls)} YouTube videos using official API...")

    for url in video_urls:
        video_id = extract_video_id(url)
        if not video_id:
            print(f"Could not extract video ID from URL: {url}")
            continue

        try:
            # We can use pagination (pageToken) if we need to go beyond 100 comments, 
            # but limit=100 is easily handled in one or two requests.
            request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=min(100, limit), 
                textFormat="plainText"
            )
            response = request.execute()

            for item in response.get("items", []):
                comment = item["snippet"]["topLevelComment"]["snippet"]
                text = comment.get("textDisplay", "")
                
                # Filter for keywords client-side to ensure relevance
                if any(keyword in text.lower() for keyword in keywords):
                    published_at = comment.get("publishedAt")
                    try:
                        timestamp = datetime.fromisoformat(published_at.replace('Z', '+00:00')).replace(tzinfo=None)
                    except (ValueError, TypeError):
                        timestamp = datetime.utcnow()

                    comment_id = item.get("id")
                    comment_url = f"https://www.youtube.com/watch?v={video_id}&lc={comment_id}"

                    conv = Conversation(
                        source="YouTube",
                        source_type="Comment",
                        url=comment_url,
                        timestamp=timestamp,
                        raw_text=text
                    )
                    conversations.append(conv)
                    
                    if len(conversations) >= limit:
                        break # Stop if we hit the global limit across videos
                        
        except HttpError as e:
            if e.resp.status == 403 and "disabled comments" in str(e).lower():
                print(f"Comments are disabled for video: {url}")
            else:
                print(f"YouTube API error for {url}: {e}")
        except Exception as e:
            print(f"Unexpected error scraping {url}: {e}")

        if len(conversations) >= limit:
            break

    print(f"Scraped {len(conversations)} relevant comments from YouTube")
    return conversations

if __name__ == "__main__":
    results = scrape_youtube(limit=10)
    for r in results:
        print(r)
