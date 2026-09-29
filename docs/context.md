# Google Photos — AI-Powered Discovery Engine Context

## 1. Project Context & Background
- **Role:** Product Manager on the Core Experience team at Google Photos.
- **Situation:** Users accumulate vast amounts of diverse visual records (photos, screenshots, documents, etc.) over years.
- **The Core Problem:** While finding items is easy when exact metadata is known, retrieval becomes significantly harder when a user's memory is incomplete. Users often remember the *experience*, *context*, *people*, *object*, or *purpose* without remembering precise metadata (e.g., exact date, location, text).
- **The Gap:** There is a fundamental gap between human memory representations and machine retrieval systems.

## 2. Business Objective
- **Goal:** Increase the percentage of users who successfully retrieve a photo they remember but cannot precisely describe.
- **Focus:** Specifically on *memory-driven retrieval*, not general search improvement.
- **Immediate Next Step:** Problem discovery. The team must deeply understand where retrieval breaks down before building any product solutions.

## 3. The Proposed Solution: AI-Powered Discovery Engine
- **What is it?** An AI-native system built to analyze publicly available user conversations (e.g., App Store reviews, Reddit, forums) at scale to map out retrieval problems and opportunity areas.
- **Primary Requirement:** Produce trustworthy, evidence-backed discovery insights. No inventing, assuming, or overstating evidence.

## 4. Key Research Questions to Answer
- **A. What are users trying to retrieve?** (e.g., travel memories, documents, utility info).
- **B. What do users actually remember?** (e.g., person, event, context, object).
- **C. How do users express their memory?** (e.g., "the photo with the red car", "that document I scanned").
- **D. What information is missing?** (e.g., remembered the trip, forgot the exact date).
- **E. Where does retrieval break down?** (e.g., search formulation, result evaluation, navigation).
- **F. What happens after a failed search?** (e.g., browse chronologically, search externally, abandon).
- **G. What are the distinct retrieval problems?** (e.g., Forgotten Date, Forgotten Entity Name, Context-Heavy Memory, Result Overload).

## 5. Strict Constraints & Philosophy
- **Evidence-First Architecture:** Every generated insight MUST be traceable to real user evidence.
- **Anti-Hallucination:** The system must NEVER invent quotes, statistics, behavior, or sources.
- **No Evidence = No Claim:** If evidence is lacking, the system must explicitly state it rather than guessing.
- **No Fabricated Quantification:** Do not produce statistics like "63% of users..." without a documented methodology based on actual data.
- **Quote Integrity:** Any displayed user quotes must be verbatim from the source.
- **Problem Clustering:** Group evidence into structured clusters with explicitly defined confidence levels and failure points.

## 6. Expected Final Deliverables
1. **Evidence Repository:** Structured relevant user conversations.
2. **Memory Model:** What users remember vs. what they forget.
3. **Retrieval Journey Model:** Breakdown of how users attempt retrieval and where it fails.
4. **Problem Taxonomy:** Distinct retrieval problems derived from evidence.
5. **Segment Analysis:** Problems categorized by user/content segments.
6. **Opportunity Landscape:** Comparison of potential opportunity areas with evidence strength and impact.
7. **Evidence Traceability:** Complete linkage of insights to original sources.
8. **Validation Backlog:** Hypotheses needing further real-world validation.

## 7. Definition of Success
The engine is successful when a PM can select any discovered problem and comprehensively answer who experiences it, what they remember/forgot, how they fail to retrieve it, and trace every factual claim directly back to authentic user evidence. 

**Core Pipeline:** Discover → Structure → Quantify → Compare → Prioritize
**Guiding Principles:** Evidence → Traceability → Uncertainty → Verification
