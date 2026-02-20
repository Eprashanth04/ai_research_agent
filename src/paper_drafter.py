import os
import json
from .llm_client import call_gemini
from .logger import logger

def format_apa_citation(paper):
    """Simple APA citation formatter for Semantic Scholar paper data."""
    authors_list = paper.get("authors", [])
    if not authors_list:
        authors_str = "Unknown Author"
    else:
        
        formatted_authors = []
        for a in authors_list[:5]: 
            names = a["name"].split()
            if len(names) > 1:
                last_name = names[-1]
                initials = "".join([n[0] + "." for n in names[:-1]])
                formatted_authors.append(f"{last_name}, {initials}")
            else:
                formatted_authors.append(a["name"])
        
        if len(authors_list) > 5:
            authors_str = ", ".join(formatted_authors) + ", et al."
        else:
            authors_str = ", ".join(formatted_authors)

    year = paper.get("year", "n.d.")
    title = paper.get("title", "No Title")
    url = paper.get("url", "")
    
    citation = f"{authors_str} ({year}). {title}."
    if url:
        citation += f" Retrieved from {url}"
    return citation

def generate_paper_drafts(synthesis_file=os.path.join('outputs', 'synthesis.json'), 
                          papers_data_file=os.path.join('data', 'papers.json'),
                          papers_list=None):
    print("\nGenerating automated section drafts...")
    
    if not os.path.exists(synthesis_file):
        logger.error(f"Synthesis file {synthesis_file} not found. Run synthesis first.")
        return
        
    try:
        with open(synthesis_file, 'r', encoding='utf-8') as f:
            synthesis = json.load(f)
            
        if papers_list is None:
            with open(papers_data_file, 'r', encoding='utf-8') as f:
                papers_data = json.load(f)
                
                if isinstance(papers_data, dict):

                    last_topic = list(papers_data.keys())[-1]
                    papers_list = papers_data.get(last_topic, [])
                else:
                    papers_list = papers_data

        prompt = f"""
Write a highly professional research summary based on the following synthesized findings from {len(papers_list)} papers.
The summary must be structured into three sections:
1. Abstract: A concise summary of the topic and main findings.
2. Methods: A description of the common methodologies, datasets, and algorithms used.
3. Results: A synthesis of the key outcomes and performance achievements.

SYTHESIZED DATA:
Common Datasets: {json.dumps(synthesis['common_datasets'])}
Common Methods: {json.dumps(synthesis['common_methods'])}
Key Findings by Paper: {json.dumps(synthesis['key_findings'])}

Use a formal academic tone. Do not use placeholders. If data is sparse, synthesize logically.
"""

        print("Calling Gemini API for drafting...")
        draft_content = call_gemini(prompt)
        
        if not draft_content:
            print("Failed to generate draft content via LLM.")
            return

       
        citations = []
        for paper in papers_list:
            citations.append(format_apa_citation(paper))
            
        full_draft = draft_content + "\n\nREFERENCES (APA Style)\n" + "="*30 + "\n"
        full_draft += "\n".join([f"{i+1}. {c}" for i, c in enumerate(citations)])

       
        output_file = os.path.join('outputs', 'paper_draft.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(full_draft)
            
        print(f"Draft generated successfully. Saved to {output_file}")
        print("\n--- DRAFT PREVIEW ---")
        print(full_draft[:500] + "...")
        print("---------------------")
        
    except Exception as e:
        print(f"Error during drafting: {str(e)}")

def revise_paper_draft(current_draft, user_instructions, synthesis_file=os.path.join('outputs', 'synthesis.json')):
    """Revise an existing draft based on user feedback."""
    print("\nRevising draft based on user instructions...")
    
    if not os.path.exists(synthesis_file):
        print(f"Synthesis file {synthesis_file} not found.")
        return None
        
    try:
        with open(synthesis_file, 'r', encoding='utf-8') as f:
            synthesis = json.load(f)

        prompt = f"""
You are an expert research assistant. REVISE the following research draft based on the USER INSTRUCTIONS provided below.
Maintain the professional academic tone and the three-section structure (Abstract, Methods, Results).
Keep the references section intact.

CURRENT DRAFT:
{current_draft}

USER INSTRUCTIONS FOR REVISION:
"{user_instructions}"

SYTHESIZED BACKGROUND DATA (if needed for context):
Common Datasets: {json.dumps(synthesis['common_datasets'])}
Common Methods: {json.dumps(synthesis['common_methods'])}
Key Findings by Paper: {json.dumps(synthesis['key_findings'])}

Output the FULL REVISED DRAFT.
"""

        print("Calling Gemini API for revision...")
        revised_content = call_gemini(prompt)
        
        if not revised_content:
            logger.error("Failed to generate revised content via LLM.")
            return None


        output_file = os.path.join('outputs', 'paper_draft.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(revised_content)
            
        logger.info(f"Draft revised successfully. Saved to {output_file}")
        return revised_content
        
    except Exception as e:
        logger.error(f"Error during revision: {str(e)}")
        return None

if __name__ == "__main__":
    generate_paper_drafts()
