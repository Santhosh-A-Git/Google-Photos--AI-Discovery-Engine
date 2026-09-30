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
You are synthesizing qualitative data to understand "VAGUE-MEMORY PHOTO RETRIEVAL".

Your job is to synthesize the provided JSON evidence into a structured global report.

EVIDENCE INTEGRITY RULES (CRITICAL):
1. Every synthesized claim MUST be strictly traceable to the provided evidence.
2. NEVER use a positive retrieval-success statement as evidence for retrieval failure.
3. NEVER reverse the polarity of evidence.
4. If evidence is missing for a section, state "UNKNOWN". Do not hallucinate.

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must have exactly these keys: "in_scope_scenarios", "remembered_landscape", "forgotten_landscape", "search_behaviors", "retrieval_failures", "opportunities".
3. Each section should concisely synthesize the evidence, explicitly citing source IDs where possible.

EXAMPLE OUTPUT:
{
  "in_scope_scenarios": "Users primarily try to retrieve photos based on context (e.g., travel, events) rather than exact dates. [IDs: 1, 4]",
  "remembered_landscape": "Users strongly remember place (Goa) and people, but not time.",
  "forgotten_landscape": "Exact dates, file names, and album names are almost universally forgotten.",
  "search_behaviors": "Users attempt broad keyword searches first, then resort to timeline scrolling.",
  "retrieval_failures": "Retrieval primarily breaks at 'Memory -> Query Translation'. Users cannot find the right words to describe the image context. [IDs: 2, 5]",
  "opportunities": "- AI Query Refinement\n- Semantic Context Recognition"
}
"""

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_groq_synthesis(client, aggregated_data_string, model="openai/gpt-oss-20b"):
    safe_data = aggregated_data_string[:25000] 
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": SYNTHESIS_PROMPT,
            },
            {
                "role": "user",
                "content": f"Synthesize the following evidence:\n\n{safe_data}",
            }
        ],
        model=model,
        temperature=0.2,
    )
    
    content = chat_completion.choices[0].message.content
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
        return json.loads(content)
    except Exception as e:
        print(f"JSON parsing error: {e}")
        return {
            "in_scope_scenarios": "Data unavailable or parsing failed.",
            "remembered_landscape": "Data unavailable.",
            "forgotten_landscape": "Data unavailable.",
            "search_behaviors": "Data unavailable.",
            "retrieval_failures": "Data unavailable.",
            "opportunities": "Data unavailable."
        }

def generate_global_report(insights_data):
    client = get_groq_client()
    if not client:
        return {
            "in_scope_scenarios": "GROQ_API_KEY not found.",
            "remembered_landscape": "Data unavailable.",
            "forgotten_landscape": "Data unavailable.",
            "search_behaviors": "Data unavailable.",
            "retrieval_failures": "Data unavailable.",
            "opportunities": "Data unavailable."
        }
        
    try:
        data_string = json.dumps(insights_data, indent=2)
        return call_groq_synthesis(client, data_string)
    except Exception as e:
        print(f"Failed to synthesize report: {e}")
        return {
            "in_scope_scenarios": "Error generating report.",
            "remembered_landscape": "Data unavailable.",
            "forgotten_landscape": "Data unavailable.",
            "search_behaviors": "Data unavailable.",
            "retrieval_failures": "Data unavailable.",
            "opportunities": "Data unavailable."
        }

RAG_PROMPT = """You are an AI Discovery Engine Assistant for Google Photos Product Managers.
Your job is to answer the user's question by synthesizing the provided raw user feedback (evidence).

EVIDENCE INTEGRITY RULE (CRITICAL):
1. Every claim MUST be traceable to the provided evidence.
2. NEVER use a positive retrieval-success statement as evidence for failure.
3. NEVER reverse the polarity of evidence.

OUTPUT FORMAT:
You MUST structure your response exactly like this (use Markdown):

### PRIMARY RETRIEVAL PATTERN
**Failure Type:** [e.g., Memory -> Query Translation]
**Evidence Count:** [Number of observations]
**Confidence:** [HIGH/MEDIUM/LOW]

**What Users Remember:**
- [item 1]

**What Users Forget:**
- [item 1]

**Typical Search Attempt:**
"[Quote or strategy]"

**Typical Failure:**
[Why it failed]

**Common Workaround:**
[Workaround used]

**Retrieval Outcome:**
[FOUND / NOT_FOUND / ABANDONED]

---
### OBSERVATION vs HYPOTHESIS

**Observation (Direct Evidence):**
[What the evidence explicitly says]

**Interpretation:**
[What this implies about user behavior]

**PM Hypothesis:**
[What we should test in primary research interviews]

**Supporting Evidence IDs:**
[ID 1, ID 2, etc.]
"""

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def generate_rag_answer(query: str, documents: list):
    client = get_groq_client()
    if not client:
        return "GROQ_API_KEY not found. LLM synthesis skipped."
        
    context = "\n\n---\n\n".join([json.dumps(d) for d in documents])
    
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
            model="openai/gpt-oss-20b",
            temperature=0.2,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Failed to generate RAG answer: {e}")
        return f"Failed to generate AI answer: {str(e)}"
