import os
import json
from sklearn.cluster import KMeans
from src.database.db_manager import SessionLocal
from src.database.models import Insight, Conversation, ProblemCluster, Opportunity
from sklearn.feature_extraction.text import TfidfVectorizer
from src.processing.groq_synthesizer import get_groq_client, call_groq_synthesis
from tenacity import retry, stop_after_attempt, wait_exponential

CLUSTER_SYNTHESIS_PROMPT = """You are a Principal Product Manager leading research for Google Photos.
You have been given a set of user insights that have been grouped together by a semantic clustering algorithm.
Your job is to analyze these grouped insights and define the overarching 'Problem Cluster' they represent.

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must have exactly these keys: "title", "statement", "situation", "remembered_info", "missing_info", "typical_attempt", "typical_failure", "affected_content".
3. Provide concise, objective summaries for each field based ONLY on the provided evidence.

EXAMPLE OUTPUT:
{
  "title": "Forgotten Specific Date of Event",
  "statement": "Users cannot retrieve photos when they remember the event but not the exact date.",
  "situation": "Trying to find photos from a past trip or event without knowing the year or month.",
  "remembered_info": "The location, the people present, or the visual contents.",
  "missing_info": "The exact date or time period.",
  "typical_attempt": "Scrolling endlessly through the timeline.",
  "typical_failure": "Giving up after scrolling too far.",
  "affected_content": "Travel photos, events, old memories."
}
"""

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def synthesize_cluster_with_groq(client, cluster_data_list):
    # Only send a sample of max 30 insights to avoid context limits
    safe_data = json.dumps(cluster_data_list[:30])
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": CLUSTER_SYNTHESIS_PROMPT,
            },
            {
                "role": "user",
                "content": f"Synthesize the following grouped insights into a Problem Cluster definition:\n\n{safe_data}",
            }
        ],
        model="openai/gpt-oss-120b",
        temperature=0.3,
    )
    
    # Manually parse out the json since we removed response_format to avoid API limits
    content = chat_completion.choices[0].message.content
    try:
        # Simple extraction if LLM wrapped in markdown blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
        return json.loads(content)
    except:
        return json.loads(content)

OPPORTUNITY_SYNTHESIS_PROMPT = """You are a Principal Product Manager leading research for Google Photos.
You have been given a Problem Cluster that summarizes a specific user retrieval struggle.
Your job is to generate a high-level product opportunity hypothesis based on this problem.

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must have exactly these keys: "opportunity_area", "affected_users", "prevalence", "retrieval_relevance".
3. Provide concise, objective summaries based ONLY on the provided problem.

EXAMPLE OUTPUT:
{
  "opportunity_area": "Natural Language Search for Time Periods",
  "affected_users": "Users who remember the event but not the specific year.",
  "prevalence": "Common among users looking for old travel photos.",
  "retrieval_relevance": "HIGH"
}
"""

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def synthesize_opportunity_with_groq(client, problem_statement, problem_title):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": OPPORTUNITY_SYNTHESIS_PROMPT,
            },
            {
                "role": "user",
                "content": f"Problem Title: {problem_title}\\nProblem Statement: {problem_statement}",
            }
        ],
        model="openai/gpt-oss-120b",
        temperature=0.3,
    )
    content = chat_completion.choices[0].message.content
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
        return json.loads(content)
    except:
        return json.loads(content)

def run_clustering(n_clusters=5):
    print("Starting Semantic Clustering Engine...")
    session = SessionLocal()
    try:
        # Pull all valid Insight records with their Conversations
        results = session.query(Insight, Conversation).join(
            Conversation, Insight.conversation_id == Conversation.id
        ).all()
        
        if not results:
            print("No insights found in the database.")
            return

        print(f"Fetched {len(results)} insights for clustering.")
        
        # Prepare text for embedding
        texts = []
        for insight, _ in results:
            text = f"{insight.retrieval_struggle} {insight.remembered_info} {insight.forgotten_info}"
            texts.append(text)
            
        print("Generating embeddings (using TF-IDF)...")
        vectorizer = TfidfVectorizer(max_features=384, stop_words='english')
        vectors = vectorizer.fit_transform(texts).toarray()
        
        print(f"Running KMeans clustering (k={n_clusters})...")
        kmeans = KMeans(n_clusters=min(n_clusters, len(results)), random_state=42, n_init=10)
        labels = kmeans.fit_predict(vectors)
        
        # Group insights by cluster
        clusters = {}
        for idx, label in enumerate(labels):
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(results[idx])
            
        client = get_groq_client()
        if not client:
            print("GROQ_API_KEY not found. Cannot synthesize clusters.")
            return

        # Clear existing clusters for a fresh run
        session.query(ProblemCluster).delete()
        
        for cluster_id, grouped_results in clusters.items():
            print(f"Synthesizing Cluster {cluster_id} with {len(grouped_results)} insights...")
            
            # Prepare data for LLM
            cluster_data = []
            sources = set()
            for insight, conv in grouped_results:
                sources.add(conv.source)
                cluster_data.append({
                    "struggle": insight.retrieval_struggle,
                    "remembered": insight.remembered_info,
                    "forgotten": insight.forgotten_info,
                    "search": insight.search_formulation
                })
                
            evidence_count = len(grouped_results)
            independent_source_count = len(sources)
            
            try:
                cluster_def = synthesize_cluster_with_groq(client, cluster_data)
                
                new_cluster = ProblemCluster(
                    title=cluster_def.get("title", f"Cluster {cluster_id}"),
                    statement=cluster_def.get("statement", ""),
                    situation=cluster_def.get("situation", ""),
                    remembered_info=cluster_def.get("remembered_info", ""),
                    missing_info=cluster_def.get("missing_info", ""),
                    typical_attempt=cluster_def.get("typical_attempt", ""),
                    typical_failure=cluster_def.get("typical_failure", ""),
                    affected_content=cluster_def.get("affected_content", ""),
                    evidence_count=evidence_count,
                    independent_source_count=independent_source_count,
                    confidence_score="HIGH" if independent_source_count > 1 and evidence_count > 3 else "MEDIUM"
                )
                session.add(new_cluster)
            except Exception as e:
                print(f"Failed to synthesize cluster {cluster_id}: {e}")
                
        session.commit()
        print("Clustering completed and saved to database.")
        
        print("Generating Opportunity Hypotheses...")
        session.query(Opportunity).delete()
        clusters_db = session.query(ProblemCluster).all()
        for cluster in clusters_db:
            try:
                opp_def = synthesize_opportunity_with_groq(client, cluster.statement, cluster.title)
                new_opp = Opportunity(
                    cluster_id=cluster.id,
                    opportunity_area=opp_def.get("opportunity_area", f"Opportunity for {cluster.title}"),
                    affected_users=opp_def.get("affected_users", ""),
                    evidence_strength=cluster.confidence_score,
                    prevalence=opp_def.get("prevalence", ""),
                    retrieval_relevance=opp_def.get("retrieval_relevance", "HIGH")
                )
                session.add(new_opp)
            except Exception as e:
                print(f"Failed to synthesize opportunity for cluster {cluster.id}: {e}")
        
        session.commit()
        print("Opportunities generated and saved to database.")
        
    finally:
        session.close()

if __name__ == '__main__':
    run_clustering()
