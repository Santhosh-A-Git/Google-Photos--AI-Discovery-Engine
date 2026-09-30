# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class Conversation(Base):
    """
    Unified schema representing a user conversation/review scraped from any source.
    """
    __tablename__ = 'conversations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(100), nullable=False)  # e.g., "Google Play", "App Store", "Reddit"
    source_type = Column(String(50), nullable=False)  # e.g., "Review", "Post", "Comment"
    url = Column(String(500), nullable=True)  # URL to the specific post/review, if applicable
    timestamp = Column(DateTime, nullable=False)  # When the post/review was created
    raw_text = Column(Text, nullable=False)  # The actual user complaint or text
    ingested_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_processed = Column(Integer, default=0) # 0 for False, 1 for True

    def __repr__(self):
        return f"<Conversation(source='{self.source}', source_type='{self.source_type}')>"

class Insight(Base):
    """
    Schema for storing the strictly extracted Core Evidence Schema from Groq.
    """
    __tablename__ = 'insights'

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, nullable=False) # FK to Conversation.id

    # SCOPE
    scope_status = Column(String(50), nullable=True) # IN_SCOPE, ADJACENT, OUT_OF_SCOPE
    scope_reason = Column(Text, nullable=True)
    scope_confidence = Column(String(50), nullable=True)

    # RETRIEVAL SCENARIO
    retrieval_scenario = Column(Text, nullable=True)
    photo_type = Column(String(200), nullable=True)
    context_type = Column(String(200), nullable=True)

    # MEMORY MODEL (What they remember vs forget)
    remembered_clues = Column(Text, nullable=True)
    forgotten_clues = Column(Text, nullable=True)
    approximate_time = Column(String(200), nullable=True)
    remembered_place = Column(String(200), nullable=True)
    remembered_people = Column(String(200), nullable=True)
    remembered_event = Column(String(200), nullable=True)
    remembered_object = Column(String(200), nullable=True)
    remembered_visual_attributes = Column(String(200), nullable=True)
    remembered_text = Column(String(200), nullable=True)
    remembered_relationship = Column(String(200), nullable=True)

    # SEARCH BEHAVIOUR
    initial_search_query = Column(Text, nullable=True)
    search_mode = Column(String(100), nullable=True)
    search_strategy = Column(Text, nullable=True)
    search_attempt_number = Column(String(50), nullable=True)
    refinement_attempt = Column(Text, nullable=True)
    clues_added = Column(Text, nullable=True)
    clues_removed = Column(Text, nullable=True)

    # RETRIEVAL RESULT
    result_status = Column(String(100), nullable=True) # FOUND, NOT_FOUND, ABANDONED, etc.
    result_relevance = Column(String(100), nullable=True)
    recognition_difficulty = Column(String(100), nullable=True)
    retrieval_outcome = Column(String(100), nullable=True)

    # FAILURE ANALYSIS
    failure_point = Column(String(200), nullable=True)
    failure_reason = Column(Text, nullable=True)
    failure_type = Column(String(200), nullable=True) # Type 1-6 Taxonomy
    uncertainty = Column(String(100), nullable=True)
    user_frustration = Column(String(100), nullable=True)

    # WORKAROUND
    workaround = Column(Text, nullable=True)
    external_tool_used = Column(String(200), nullable=True)
    external_platform = Column(String(200), nullable=True)
    manual_action = Column(Text, nullable=True)

    # ANALYTICAL
    evidence_strength = Column(String(50), nullable=True) # HIGH, MEDIUM, LOW
    theme = Column(String(200), nullable=True)
    opportunity_area = Column(String(200), nullable=True)
    affected_segment = Column(String(200), nullable=True)
    validation_status = Column(String(50), nullable=True)
    
    exact_quote = Column(Text, nullable=False) # For traceability
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<Insight(scope='{self.scope_status}', failure_type='{self.failure_type}')>"

class ProblemCluster(Base):
    """
    Schema for discovered problem clusters formed from grouped Insights.
    """
    __tablename__ = 'problem_clusters'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    statement = Column(Text, nullable=False)
    situation = Column(Text, nullable=True)
    remembered_info = Column(Text, nullable=True)
    missing_info = Column(Text, nullable=True)
    typical_attempt = Column(Text, nullable=True)
    typical_failure = Column(Text, nullable=True)
    affected_content = Column(Text, nullable=True)
    
    evidence_count = Column(Integer, default=0)
    independent_source_count = Column(Integer, default=0)
    confidence_score = Column(String(50), default="MEDIUM") # "HIGH", "MEDIUM", "LOW"

    def __repr__(self):
        return f"<ProblemCluster(title='{self.title}')>"

class Opportunity(Base):
    """
    Schema for opportunities identified from problem clusters.
    """
    __tablename__ = 'opportunities'

    id = Column(Integer, primary_key=True, autoincrement=True)
    cluster_id = Column(Integer, nullable=False)
    opportunity_area = Column(String(200), nullable=False)
    affected_users = Column(Text, nullable=True)
    evidence_strength = Column(String(50), default="MEDIUM")
    prevalence = Column(String(100), nullable=True)
    retrieval_relevance = Column(String(50), default="HIGH")

    def __repr__(self):
        return f"<Opportunity(area='{self.opportunity_area}')>"
