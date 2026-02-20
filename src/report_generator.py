import os
import json

def generate_final_report(draft_content, evaluation=None, output_path=os.path.join('outputs', 'final_research_report.md')):
    """
    Combines the paper draft and optional quality evaluation into a final report.
    """
    report_content = "# Final Research Synthesis Report\n\n"
    
    if evaluation:
        report_content += "## Quality Evaluation\n\n"
        report_content += f"**Quality Score:** {evaluation.get('score', 'N/A')}/10\n\n"
        report_content += "### Suggestions for Improvement\n"
        for suggestion in evaluation.get('suggestions', []):
            report_content += f"- {suggestion}\n"
        report_content += "\n---\n\n"
    
    report_content += draft_content
    
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        print(f"Final report generated successfully at {output_path}")
        return output_path
    except Exception as e:
        print(f"Error generating final report: {e}")
        return None

if __name__ == "__main__":

    dummy_draft = "# Test Draft Content"
    dummy_eval = {"score": 8, "suggestions": ["Add more diagrams", "Clarify results"]}
    generate_final_report(dummy_draft, dummy_eval)
