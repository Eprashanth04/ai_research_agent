import os
import json
from .llm_client import call_gemini

def refine_paper(draft_content, suggestions):
    """
    Refines a research paper draft based on specific suggestions using Gemini.
    """
    suggestions_str = "\n".join([f"- {s}" for s in suggestions])
    
    prompt = f"""
    Refine and improve the following research paper draft based on the provided revision suggestions.
    Maintain a highly professional academic tone. Ensure the structure (Abstract, Methods, Results) remains clear.

    ORIGINAL DRAFT:
    {draft_content}

    REVISION SUGGESTIONS:
    {suggestions_str}

    Return the FULL refined paper draft. Do not include any preamble or commentary, just the refined draft content.
    """

    print("Calling Gemini API for paper refinement...")
    refined_content = call_gemini(prompt)
    
    if not refined_content:
        print("Failed to refine paper via LLM.")
        return draft_content

    return refined_content

if __name__ == "__main__":

    dummy_draft = "This is a test draft about AI. It is short and not very good."
    dummy_suggestions = ["Make it longer", "Add more technical details", "Improve the abstract"]
    result = refine_paper(dummy_draft, dummy_suggestions)
    print("\n--- REFINED DRAFT ---")
    print(result)
