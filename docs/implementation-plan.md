# AI-Powered Discovery Engine — Implementation Plan

This document outlines the phase-wise implementation plan for building the AI-Powered Discovery Engine for Google Photos. The plan translates the requirements from [context.md](./context.md) and the structural design from [architecture.md](./architecture.md) into actionable development phases.

---

## Phase 1: Foundation & Data Ingestion Setup
**Goal:** Establish the infrastructure to gather raw, multi-source user conversations regarding photo retrieval.

1. **Environment & Infrastructure Setup:**
   - Initialize project repositories and cloud infrastructure.
   - Provision initial database instances (Relational DB & Vector DB).
2. **API Integrations:**
   - Integrate Reddit API to scrape subreddits (e.g., `r/googlephotos`).
   - Integrate Google Play Store and Apple App Store APIs for reviews.
3. **Custom Scrapers & Automation:**
   - Build custom Python scripts/crawlers for Google Photos Help Communities and public forums.
   - Configure workflow automation (e.g., n8n, Zapier) to run ingestion jobs periodically.
4. **Data Normalization:**
   - Standardize ingested data into a unified schema (Source, URL, Timestamp, Raw Text, Source Type).

## Phase 2: Processing & Storage Pipeline
**Goal:** Clean the ingested data, prevent skewed metrics through deduplication, and prepare data for semantic search.

1. **Deduplication Engine Development:**
   - Implement exact-match and fuzzy-match deduplication to identify reposts and syndicated content.
   - Establish the separation between *Raw Mention Count* and *Independent Evidence Count*.
2. **Relational Storage:**
   - Store cleaned conversations and metadata in the Relational/Document DB (PostgreSQL/MongoDB).
3. **Vector Embeddings Pipeline:**
   - Generate embeddings for user quotes using an embedding model.
   - Store embeddings in the Vector DB (Pinecone/Milvus) for semantic clustering.

## Phase 3: AI Inference & Extraction Core
**Goal:** Deploy the LLM logic to transform unstructured text into the 4-layer interpretation model (Evidence → Pattern → Problem → Opportunity).

1. **LLM Integration (Groq):**
   - Setup API connections and prompting frameworks for the Groq LLM.
2. **Memory Extraction Module:**
   - Build prompts to extract *What the user remembers* vs. *What is forgotten/missing*.
3. **Journey Mapping Module:**
   - Classify the failure point in the retrieval journey (e.g., Search Formulation, Result Overload, Abandonment).
4. **Problem Clustering Engine:**
   - Group extracted insights into "Candidate Problems" (e.g., *Forgotten Date*, *Context-Heavy Memory*).
5. **Opportunity Generation:**
   - Formulate initial product opportunity hypotheses based on the problem clusters.

## Phase 4: Verification & Anti-Hallucination Guardrails
**Goal:** Implement strict verification checks to ensure no claims, quotes, or numbers are hallucinated.

1. **RAG Grounding Implementation:**
   - Ensure the LLM generates problem definitions and answers *strictly* based on retrieved evidence from the Vector DB.
2. **Quote Integrity Checker:**
   - Build a string-matching function to verify that any LLM-generated quote appears *verbatim* in the raw source text.
3. **Citation & Source Linker:**
   - Force all generated insights to include a mandatory, verifiable Database ID / Source URL.
4. **Confidence Scoring & Quantification Validator:**
   - Implement thresholds: downgrade claims with low independent evidence counts to "Insufficient Evidence."
   - Block the generation of estimated percentages (e.g., "60% of users") unless backed by a deterministic count.

## Phase 5: Presentation & Dashboard Development
**Goal:** Build the Discovery Dashboard (UI) for the Product Manager to query, explore, and trace insights.

1. **Search & Query Interface:**
   - Build natural language query capabilities for PMs to ask questions about retrieval failures.
2. **Opportunity Matrix View:**
   - Create a dashboard tab comparing Opportunity areas by *Evidence Volume*, *Impact*, and *Confidence*.
3. **Traceability UI:**
   - Build the drill-down interaction: Click Opportunity → View Problem Cluster → View Raw Evidence → Click Original URL.
4. **Segment Analysis Dashboard:**
   - Implement filters to view data by user segments or content types (e.g., Travel Memories vs. Documents).

## Phase 6: Testing, Refinement & Delivery
**Goal:** Validate the end-to-end system accuracy and hand over the structured deliverables.

1. **End-to-End Pipeline Testing:**
   - Ingest a controlled sample of synthetic & real reviews. Verify that guardrails catch intentional LLM hallucinations.
2. **Insight Validation Run:**
   - Execute a full run over the real dataset to generate the initial Problem Taxonomy and Opportunity Landscape.
3. **Validation Backlog Generation:**
   - Compile a list of hypotheses that require further external validation (surveys, behavioral data).
4. **Final Handover:**
   - Deliver the Discovery Dashboard, Evidence Repository, and technical documentation to the PM team.
