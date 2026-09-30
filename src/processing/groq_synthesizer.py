import os
import json
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from groq import Groq
# pyrefly: ignore [missing-import]
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

SYNTHESIS_PROMPT = """You are a Principal Product Manager leading research for Google Photos.
You have collected hundreds of qualitative data points from user feedback.

Your job is to synthesize all this data into a comprehensive global report that answers five key areas based ONLY on the evidence provided in the JSON data.
Focus specifically on how people remember old visual information and where retrieval breaks down.

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must have exactly five keys: "struggles", "remembered", "forgotten", "search_behavior", and "opportunities".
3. For struggles, remembered, forgotten, and search_behavior, write a highly concise summary (4-5 lines).
4. For opportunities, write a clear bulleted list of 3-5 top opportunity areas, one per line.

EXAMPLE OUTPUT:
{
  "struggles": "Users primarily struggle to retrieve... (4-5 lines max)",
  "remembered": "The most commonly remembered information includes... (4-5 lines max)",
  "forgotten": "Users consistently forget... (4-5 lines max)",
  "search_behavior": "When memory is incomplete, users typically formulate searches by... (4-5 lines max)",
  "opportunities": "- Opportunity 1\n- Opportunity 2\n- Opportunity 3"
}
"""

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_groq_synthesis(client, aggregated_data_string, model="mixtral-8x7b-32768"):
    # Truncate string to avoid blowing up context window
    safe_data = aggregated_data_string[:25000] 
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": SYNTHESIS_PROMPT,
            },
            {
                "role": "user",
                "content": f"Synthesize the following user data to answer the 4 questions:\n\n{safe_data}",
            }
        ],
        model="mixtral-8x7b-32768",
        temperature=0.3,
    )
    
    content = chat_completion.choices[0].message.content
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
        return json.loads(content)
        return json.loads(content)
    except Exception as e:
        print(f"JSON parsing error: {e}")
        return {
            "struggles": "Data unavailable or parsing failed.",
            "remembered": "Data unavailable.",
            "forgotten": "Data unavailable.",
            "search_behavior": "Data unavailable.",
            "opportunities": "Data unavailable."
        }

def generate_global_report(insights_data):
    """
    Takes a list of dictionaries (the deep analytics) and generates the report.
    """
    client = get_groq_client()
    if not client:
        return {
            "struggles": "GROQ_API_KEY not found.",
            "remembered": "Data unavailable.",
            "forgotten": "Data unavailable.",
            "search_behavior": "Data unavailable.",
            "opportunities": "Data unavailable."
        }
        
    try:
        data_string = json.dumps(insights_data, indent=2)
        return call_groq_synthesis(client, data_string)
    except Exception as e:
        print(f"Failed to synthesize report: {e}")
        return {
            "struggles": "Error generating report.",
            "remembered": "Data unavailable.",
            "forgotten": "Data unavailable.",
            "search_behavior": "Data unavailable.",
            "opportunities": "Data unavailable."
        }

RAG_PROMPT = """You are an AI Discovery Engine Assistant for Google Photos Product Managers.
Your job is to answer a user's question by synthesizing the provided raw user feedback (evidence).

RULES:
1. Answer the question directly using ONLY the provided evidence.
2. If the evidence does not contain the answer, say "I don't have enough evidence to answer this."
3. Output exactly ONE single short paragraph. Do NOT use bullet points or newlines. Keep it punchy. Do NOT output JSON.
4. Keep the tone helpful, objective, and focused on user behavior and struggles.
"""

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def generate_rag_answer(query: str, documents: list):
    """
    Answers a query based on a list of document strings.
    Returns plain text string.
    """
    client = get_groq_client()
    if not client:
        return "GROQ_API_KEY not found. LLM synthesis skipped."
        
    context = "\n\n---\n\n".join(documents)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": RAG_PROMPT,
                },
                {
                    "role": "user",
                    "content": f"Context Evidence:\n{context}\n\nQuestion: {query}",
                }
            ],
            model="mixtral-8x7b-32768",
            temperature=0.2,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Failed to generate RAG answer: {e}")
        return f"Failed to generate AI answer: {str(e)}"
