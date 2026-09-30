import os
import json
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from groq import Groq
# pyrefly: ignore [missing-import]
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

SYSTEM_PROMPT = """You are a rigorous data extraction AI for Google Photos Product Managers.
Your job is to analyze user feedback and extract structured deep retrieval analytics focusing specifically on "VAGUE-MEMORY PHOTO RETRIEVAL".

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must contain ALL keys defined in the schema below. If a field cannot be deduced from the text, return `null`. Do NOT guess.
3. CONTEXT FILTER: The review MUST be about finding, retrieving, or discovering old photos/videos. If it is about something else (e.g., pricing, backup), set `scope_status` to "OUT_OF_SCOPE" or "ADJACENT". 
4. ZERO HALLUCINATION. The "exact_quote" MUST be a verbatim substring copied directly from the text.
5. `failure_type` must be one of: "MEMORY -> QUERY TRANSLATION", "CLUE DISAMBIGUATION FAILURE", "QUERY -> RETRIEVAL FAILURE", "RETRIEVAL -> RECOGNITION FAILURE", "SEARCH RECOVERY FAILURE", "CROSS-MODAL MEMORY FAILURE".
6. `result_status` must be one of: "FOUND", "FOUND_AFTER_REFINEMENT", "NOT_FOUND", "ABANDONED", "FOUND_USING_WORKAROUND", "UNKNOWN".
7. `evidence_strength` must be one of: "HIGH", "MEDIUM", "LOW".

SCHEMA KEYS TO EXTRACT:
"scope_status": "IN_SCOPE" (vague memory retrieval), "ADJACENT" (storage/fragmentation), or "OUT_OF_SCOPE" (backup/deletion).
"scope_reason": Short reason for classification.
"scope_confidence": "HIGH", "MEDIUM", "LOW".
"retrieval_scenario": Description of the retrieval attempt.
"photo_type": e.g., "screenshot", "event photo".
"context_type": e.g., "travel", "work".
"remembered_clues": What they remembered.
"forgotten_clues": What they forgot.
"approximate_time": e.g., "last summer".
"remembered_place": e.g., "Goa".
"remembered_people": e.g., "brother".
"remembered_event": e.g., "wedding".
"remembered_object": e.g., "medicine".
"remembered_visual_attributes": e.g., "blue bag".
"remembered_text": Any text they remember.
"remembered_relationship": Contextual relation.
"initial_search_query": What they typed first.
"search_mode": "keyword", "timeline", "albums".
"search_strategy": Strategy used.
"search_attempt_number": e.g., "1", "multiple".
"refinement_attempt": What they did next.
"clues_added": New clues added to search.
"clues_removed": Clues removed.
"result_status": See rule 6.
"result_relevance": "relevant", "irrelevant", "unknown".
"recognition_difficulty": How hard it was to recognize the photo in the grid.
"retrieval_outcome": Final outcome summary.
"failure_point": Where it broke.
"failure_reason": Why it broke.
"failure_type": See rule 5.
"uncertainty": User's stated confusion.
"user_frustration": "HIGH", "MEDIUM", "LOW".
"workaround": What they did outside normal search.
"external_tool_used": e.g., "Google Drive".
"external_platform": e.g., "WhatsApp".
"manual_action": e.g., "Scrolled for 2 hours".
"evidence_strength": See rule 7.
"theme": Main conceptual theme.
"opportunity_area": Product opportunity.
"affected_segment": Who this affects.
"validation_status": "PENDING".
"exact_quote": Verbatim quote from the text.
"""

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Warning: GROQ_API_KEY not found. AI extraction will be skipped.")
        return None
    return Groq(api_key=api_key)

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_groq_api(client, text, model="openai/gpt-oss-120b"):
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
        temperature=0.1,
        timeout=25.0,
    )
    
    response_content = chat_completion.choices[0].message.content
    return json.loads(response_content)

def extract_insight(conversation_text):
    client = get_groq_client()
    if not client:
        return None
        
    try:
        return call_groq_api(client, conversation_text)
    except Exception as e:
        print(f"Failed to extract insight from Groq after retries: {e}")
        return None
