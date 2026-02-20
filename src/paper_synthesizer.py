import os
import json
from pathlib import Path
from .logger import logger

def synthesize_papers(entities_file=os.path.join('outputs', 'entities.json'), 
                      analysis_file=os.path.join('outputs', 'analysis', 'cross_paper_similarity.json')):
    print("\nSynthesizing findings across papers...")
    
    if not os.path.exists(entities_file):
        logger.error(f"Entities file {entities_file} not found. Run entity extraction first.")
        return None
    
    if not os.path.exists(analysis_file):
        logger.error(f"Analysis file {analysis_file} not found. Run cross-paper analysis first.")
        return None
        
    try:
        with open(entities_file, 'r', encoding='utf-8') as f:
            entities_data = json.load(f)
            
        with open(analysis_file, 'r', encoding='utf-8') as f:
            analysis_data = json.load(f)
            

        analyzed_papers = analysis_data.get('papers', [])
        per_paper_entities = entities_data.get('per_paper_entities', {})
        

        filtered_details = {
            name: details for name, details in per_paper_entities.items()
            if name in analyzed_papers
        }
        
        synthesis = {
            "total_papers": len(analyzed_papers),
            "common_datasets": entities_data.get('common_entities', {}).get('datasets', {}),
            "common_methods": entities_data.get('common_entities', {}).get('methods_and_algorithms', {}),
            "key_findings": analysis_data.get('key_findings', {}),
            "paper_details": filtered_details
        }
        
        
        output_file = os.path.join('outputs', 'synthesis.json')
        Path(os.path.dirname(output_file)).mkdir(parents=True, exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(synthesis, f, indent=2)
            
        logger.info(f"Synthesis completed. Saved to {output_file}")
        return synthesis
        
    except Exception as e:
        logger.error(f"Error during synthesis: {str(e)}")
        return None

if __name__ == "__main__":
    synthesize_papers()
