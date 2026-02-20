import os
import json
from .llm_client import call_gemini

def evaluate_quality(draft_content):
    """
    Evaluates the quality of a research paper draft using Gemini.
    Returns a score (1-10) and specific revision suggestions.
    """
    prompt = f"""
    Evaluate the following research paper draft for quality, academic tone, and completeness.
    Provide a quality score between 1 and 10 (where 10 is excellent).
    Also, provide 3-5 specific, actionable suggestions for improvement.

    DRAFT CONTENT:
    {draft_content}

    Format your response as a JSON object with the following structure:
    {{
        "score": number,
        "suggestions": ["suggestion 1", "suggestion 2", ...]
    }}
    """

    print("Calling Gemini API for quality evaluation...")
    response_text = call_gemini(prompt)
    
    if not response_text:
        print("Failed to evaluate quality via LLM.")
        return {"score": 0, "suggestions": ["Failed to get evaluation from LLM."]}



    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    try:
        evaluation = json.loads(response_text)
        return evaluation
    except Exception as e:
        print(f"Error parsing quality evaluation JSON: {e}")
        return {"score": 0, "suggestions": ["Error parsing evaluation results."]}

if __name__ == "__main__":

    dummy_draft = "This is a test draft about AI. It is short and not very good."
    result = evaluate_quality(dummy_draft)
    print(json.dumps(result, indent=2))
