import os
import json
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from groq import Groq
# pyrefly: ignore [missing-import]
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

SYSTEM_PROMPT = """You are a strict data extraction AI for a product management research team.
Your job is to analyze user feedback about Google Photos and uncover deep retrieval analytics.

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must have EXACTLY these keys: "retrieval_struggle", "remembered_info", "forgotten_info", "search_formulation", "opportunity_area", and "exact_quote".
3. CONTEXT FILTER: The review MUST be about searching, finding, retrieving, organizing, or discovering old photos/videos. If it is about something else (e.g., pricing, backup issues, storage limits, crashing, editing features), you MUST return `null` for ALL fields EXCEPT exact_quote, which should be an empty string "".
4. ZERO HALLUCINATION. The "exact_quote" MUST be a verbatim substring copied and pasted directly from the user's raw text. Do not summarize, do not fix grammar, do not add punctuation. If you cannot find a relevant quote, output an empty string for exact_quote.
5. If a specific field cannot be deduced from the text, return `null` for that field. Do NOT guess.
6. "retrieval_struggle": A short phrase describing what kind of old photos they struggle to retrieve (e.g., "Finding specific event photos from years ago").
7. "remembered_info": What the user actually remembers about the photo (e.g., "The year, the general location, the people in it").
8. "forgotten_info": What the user has forgotten (e.g., "The exact date, the album name").
9. "search_formulation": How they tried to search for it (e.g., "Scrolled endlessly through timeline instead of using search bar").
10. "opportunity_area": A 2-5 word product feature opportunity (e.g., "NLP search for events", "Timeline Visual Scrubber", "Contextual Tagging").

EXAMPLE OUTPUT:
{
  "retrieval_struggle": "Finding old screenshots of recipes",
  "remembered_info": "It was a screenshot of a recipe from last year",
  "forgotten_info": "The exact date it was taken",
  "search_formulation": "Tried searching 'recipe' but got food photos instead of screenshots",
  "opportunity_area": "OCR Screenshot Filtering",
  "exact_quote": "I hate how hard it is to find old screenshots of recipes. I search recipe and it shows my dinner plates!"
}
"""

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Warning: GROQ_API_KEY not found. AI extraction will be skipped.")
        return None
    return Groq(api_key=api_key)

# We use tenacity to automatically handle Groq rate limits (429 Too Many Requests)
@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_groq_api(client, text, model="openai/gpt-oss-20b"):
    """
    Calls the Groq API with strict JSON mode enabled.
    Automatic retries with exponential backoff on failure (rate limits).
    """
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"Extract insights from this user review:\n\n{text}",
            }
        ],
        model=model,
        response_format={"type": "json_object"},
        temperature=0.1, # Low temperature for highly deterministic extraction
        timeout=15.0, # Added timeout to prevent infinite hanging
    )
    
    response_content = chat_completion.choices[0].message.content
    return json.loads(response_content)

def extract_insight(conversation_text):
    """
    Public function to extract an insight from a raw text string.
    Returns the parsed JSON dictionary, or None if it fails.
    """
    client = get_groq_client()
    if not client:
        return None
        
    try:
        return call_groq_api(client, conversation_text)
    except Exception as e:
        print(f"Failed to extract insight from Groq after retries: {e}")
        return None

if __name__ == "__main__":
    # Test
    mock = "Google Photos is completely broken. I can never find the pictures I took of my dog from last year."
    res = extract_insight(mock)
    print(res)
