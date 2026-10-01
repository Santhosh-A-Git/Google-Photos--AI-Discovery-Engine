from src.database.db_manager import SessionLocal
from src.database.models import ProblemCluster, Opportunity
import json

session = SessionLocal()

# Clear existing just in case
session.query(Opportunity).delete()
session.query(ProblemCluster).delete()

# Create 5 realistic Problem Clusters
c1 = ProblemCluster(
    title="Semantic Disconnect in Query Translation",
    statement="Users remember abstract concepts (e.g., 'dog on beach') but the search engine relies strictly on exact tags, causing failure when translating human memory to search syntax.",
    situation="Trying to find an old vacation photo using descriptive elements rather than exact locations or dates.",
    remembered_info="Visual objects, weather, emotions, rough themes.",
    missing_info="Exact dates, precise album names, tagged locations.",
    typical_attempt="Searching 'dog running in sand' or 'happy beach trip'.",
    typical_failure="Search engine looks for the literal string 'happy' or fails to combine 'dog' and 'sand' contextually.",
    affected_content="Vacation photos, casual snapshots, pet photos.",
    evidence_count=124,
    independent_source_count=45,
    confidence_score="HIGH"
)

c2 = ProblemCluster(
    title="Screenshot & Document Retrieval Failure",
    statement="Users heavily rely on screenshots for temporary memory (receipts, memes, notes) but struggle to retrieve them because they lack visual 'photo' metadata and OCR is underutilized.",
    situation="Looking up a previously screenshotted receipt, ticket, or funny meme.",
    remembered_info="The general topic of the text, or the app it was screenshotted from.",
    missing_info="When it was taken, the exact text string.",
    typical_attempt="Scrolling endlessly through the 'Screenshots' folder.",
    typical_failure="Fatigue from scrolling hundreds of visually similar text blocks.",
    affected_content="Screenshots, downloaded memes, WhatsApp documents.",
    evidence_count=85,
    independent_source_count=30,
    confidence_score="HIGH"
)

c3 = ProblemCluster(
    title="Temporal Ambiguity & Timeline Fatigue",
    statement="Users know roughly when an event happened (e.g., 'college years' or 'last winter') but lack exact dates, making the timeline scrubber frustrating to use.",
    situation="Retrieving photos from a specific era or season in the past.",
    remembered_info="The season, life phase, or rough year.",
    missing_info="The exact month and day.",
    typical_attempt="Using the side scrubber to guess the year and then scrolling manually.",
    typical_failure="Overshooting the date or giving up due to the sheer volume of photos in that year.",
    affected_content="Events from 3+ years ago, childhood photos.",
    evidence_count=52,
    independent_source_count=22,
    confidence_score="MEDIUM"
)

c4 = ProblemCluster(
    title="Facial Recognition Edge Cases",
    statement="The engine correctly groups faces in standard lighting but fails when retrieving photos where faces are partially obscured, side-profile, or aged.",
    situation="Searching for pictures of a specific friend during a camping trip or Halloween.",
    remembered_info="The person's identity and the event.",
    missing_info="Whether the face was clearly visible to the AI.",
    typical_attempt="Searching the person's name + 'camping'.",
    typical_failure="The photo exists but wasn't tagged with the person's identity due to poor lighting.",
    affected_content="Night photos, group shots, costumes, old photos.",
    evidence_count=28,
    independent_source_count=15,
    confidence_score="MEDIUM"
)

c5 = ProblemCluster(
    title="Cross-Platform Context Loss",
    statement="Photos downloaded from other apps (WhatsApp, Instagram) lose original creation metadata and are buried in the timeline on the date they were downloaded, not taken.",
    situation="Finding a photo a friend sent them months ago.",
    remembered_info="Who sent it and what platform it was on.",
    missing_info="When they actually hit 'save to device'.",
    typical_attempt="Searching for the person's name or looking around the date of the event.",
    typical_failure="The photo is buried under the download date, which the user doesn't remember.",
    affected_content="WhatsApp images, Instagram saves, shared albums.",
    evidence_count=13,
    independent_source_count=8,
    confidence_score="LOW"
)

session.add_all([c1, c2, c3, c4, c5])
session.flush() # Get IDs

# Create 3 Opportunities
o1 = Opportunity(
    cluster_id=c1.id,
    opportunity_area="Natural Language & Contextual Search",
    affected_users="Mainstream users who search conversationally based on visual memory rather than metadata.",
    prevalence="Extremely common",
    retrieval_relevance="HIGH"
)

o2 = Opportunity(
    cluster_id=c2.id,
    opportunity_area="Smart Screenshot & Document Hub",
    affected_users="Power users, students, and professionals who use the gallery as a temporary knowledge base.",
    prevalence="Highly prevalent",
    retrieval_relevance="HIGH"
)

o3 = Opportunity(
    cluster_id=c3.id,
    opportunity_area="Fuzzy Temporal Navigation",
    affected_users="Users with 5+ years of photo history trying to find older memories without exact dates.",
    prevalence="Common",
    retrieval_relevance="MEDIUM"
)

session.add_all([o1, o2, o3])
session.commit()
print("Successfully injected 5 Problem Clusters and 3 Opportunity Hypotheses!")
session.close()
