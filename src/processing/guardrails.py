def verify_exact_match(original_text: str, extracted_quote: str) -> bool:
    """
    Core anti-hallucination guardrail.
    Verifies that the extracted quote exists EXACTLY as a substring in the original text,
    ignoring leading/trailing whitespace.
    """
    if not extracted_quote or not original_text:
        return False
        
    quote = extracted_quote.strip()
    text = original_text.strip()
    
    # Simple, strict substring match. 
    # If the LLM changed a word, added punctuation, or summarized, this fails.
    if quote in text:
        return True
        
    # Sometimes LLMs fix newlines or double spaces. 
    # Let's do a slightly more forgiving space-normalization match, 
    # but still require EXACT word and punctuation sequence.
    normalized_quote = " ".join(quote.split())
    normalized_text = " ".join(text.split())
    
    return normalized_quote in normalized_text

def validate_insight(insight_json: dict, original_conversation) -> bool:
    """
    Validates a single JSON insight returned by Groq.
    Returns True if valid (zero hallucination), False if invalid.
    """
    quote = insight_json.get("exact_quote", "")
    
    # 1. Enforce Exact Quote Hallucination check
    if not verify_exact_match(original_conversation.raw_text, quote):
        print(f"[GUARDRAIL ALERT] Hallucination detected. Rejected quote: '{quote}'")
        return False
        
    # 2. Enforce schema presence for at least one new deep metric
    if not insight_json.get("opportunity_area") and not insight_json.get("retrieval_struggle"):
        print("[GUARDRAIL ALERT] Missing deep analytics fields in LLM output.")
        return False
        
    return True

if __name__ == "__main__":
    # Test the guardrail
    mock_text = "I really hate how hard it is to find old screenshots in Google Photos. The search is terrible."
    
    # Valid
    valid_quote = "how hard it is to find old screenshots"
    print(f"Valid quote check: {verify_exact_match(mock_text, valid_quote)} (Expected: True)")
    
    # Hallucinated (Summarized)
    invalid_quote = "Google Photos search is terrible for screenshots"
    print(f"Invalid quote check: {verify_exact_match(mock_text, invalid_quote)} (Expected: False)")
