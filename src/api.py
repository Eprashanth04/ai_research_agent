import os
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid

from .paper_drafter import generate_paper_drafts
from .quality_evaluator import evaluate_quality
from .paper_refiner import refine_paper
from .report_generator import generate_final_report
from .logger import logger

app = FastAPI(title="AI Research Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DRAFT_FILE = os.path.join('outputs', 'paper_draft.txt')
SYNTHESIS_FILE = os.path.join('outputs', 'synthesis.json')
PAPERS_FILE = os.path.join('data', 'papers.json')
ENTITIES_FILE = os.path.join('outputs', 'entities.json')
SIMILARITY_FILE = os.path.join('outputs', 'analysis', 'cross_paper_similarity.json')
PDF_DIR = 'pdf'

# Global state for background jobs
research_jobs: Dict[str, Dict] = {}

class ResearchRequest(BaseModel):
    topic: str
    num_papers: int = 5
    download_pdfs: bool = False

class ReviseRequest(BaseModel):
    instructions: str

class RefineRequest(BaseModel):
    suggestions: List[str]

async def run_research_pipeline(job_id: str, topic: str, num_papers: int, download_pdfs: bool):
    """Actual background worker for the research pipeline"""
    try:
        research_jobs[job_id]["status"] = "processing"
        research_jobs[job_id]["message"] = "Fetching papers from Semantic Scholar..."
        
        from .paper_retrieval import fetch_papers
        from .database import create_table, insert_paper
        from .json_store import save_to_json
        from .pdf_downloader import download_all_pdfs
        from .pdf_text_extractor import extract_all_pdfs_text
        from .key_phrase_extractor import process_all_extracted_texts
        from .cross_paper_analysis import create_cross_paper_analysis
        from .entity_extractor import extract_and_save_entities
        from .paper_synthesizer import synthesize_papers
        from .paper_drafter import generate_paper_drafts

        papers = fetch_papers(topic, limit=num_papers)
        
        if not papers:
            research_jobs[job_id]["status"] = "failed"
            research_jobs[job_id]["message"] = "No papers found for the topic."
            return

        research_jobs[job_id]["message"] = "Saving metadata and downloading PDFs..."
        save_to_json(topic, papers)

        if download_pdfs:
            download_all_pdfs(papers)
            research_jobs[job_id]["message"] = "Extracting text and analyzing..."
            extract_all_pdfs_text()
            process_all_extracted_texts()

        create_table()
        for paper in papers:
            title = paper.get("title")
            authors_list = paper.get("authors", [])
            authors = ", ".join(a.get("name", "Unknown") for a in authors_list if isinstance(a, dict))
            year = paper.get("year")
            url = paper.get("url")
            insert_paper(topic, title, authors, year, url)

        research_jobs[job_id]["message"] = "Performing cross-paper analysis..."
        create_cross_paper_analysis(current_papers=papers)
        extract_and_save_entities(current_papers=papers)
        
        research_jobs[job_id]["message"] = "Synthesizing and drafting paper..."
        synthesize_papers()
        generate_paper_drafts(papers_list=papers)

        research_jobs[job_id]["status"] = "completed"
        research_jobs[job_id]["message"] = "Research completed successfully."
        logger.info(f"Job {job_id} completed successfully for topic: {topic}")

    except Exception as e:
        import traceback
        error_msg = str(e)
        research_jobs[job_id]["status"] = "failed"
        research_jobs[job_id]["message"] = f"Error: {error_msg}"
        logger.error(f"Job {job_id} failed: {error_msg}")
        logger.error(traceback.format_exc())

@app.post("/api/research")
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """Start a new research pipeline in the background"""
    job_id = str(uuid.uuid4())
    research_jobs[job_id] = {
        "id": job_id,
        "topic": request.topic,
        "status": "pending",
        "message": "Initializing research job...",
        "timestamp": json.dumps(os.times()) # Placeholder for duration tracking
    }
    
    background_tasks.add_task(
        run_research_pipeline, 
        job_id, 
        request.topic, 
        request.num_papers, 
        request.download_pdfs
    )
    
    logger.info(f"Started research job {job_id} for topic: {request.topic}")
    return {"status": "success", "job_id": job_id, "message": "Research job started in background"}

@app.get("/api/research/status/{job_id}")
async def get_research_status(job_id: str):
    """Get the status of a specific research job"""
    if job_id not in research_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return research_jobs[job_id]

@app.get("/api/papers")
async def get_papers():
    """Get papers from the most recent research topic"""
    if not os.path.exists(PAPERS_FILE):
        return []
    
    try:
        with open(PAPERS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            


            if not data:
                return []
            

            last_topic = list(data.keys())[-1]
            papers = data.get(last_topic, [])
            
            return papers if isinstance(papers, list) else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading papers: {str(e)}")

@app.get("/api/entities")
async def get_entities():
    """Get extracted entities (datasets and methods)"""
    if not os.path.exists(ENTITIES_FILE):
        return None
    
    try:
        with open(ENTITIES_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            common = data.get('common_entities', {})
            

            return {
                'common_datasets': [
                    {'name': k, 'count': v} 
                    for k, v in sorted(common.get('datasets', {}).items(), key=lambda x: x[1], reverse=True)
                ],
                'common_methods': [
                    {'name': k, 'count': v} 
                    for k, v in sorted(common.get('methods_and_algorithms', {}).items(), key=lambda x: x[1], reverse=True)
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading entities: {str(e)}")

@app.get("/api/synthesis")
async def get_synthesis():
    """Get synthesis results""" 
    if not os.path.exists(SYNTHESIS_FILE):
        return None
    
    try:
        with open(SYNTHESIS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            

            findings_list = []
            for paper, findings in data.get('key_findings', {}).items():
                findings_list.append({
                    'paper': paper,
                    'findings': findings if findings else [],
                    'text': 'None found from predefined phrases' if not findings else None
                })
            
            return {
                'total_papers': data.get('total_papers', 0),
                'key_findings': findings_list,
                'synthesis': data.get('summary', ''),
                'common_datasets': data.get('common_datasets', {}),
                'common_methods': data.get('common_methods', {})
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading synthesis: {str(e)}")

@app.get("/api/similarity")
async def get_similarity():
    """Get cross-paper similarity analysis"""
    if not os.path.exists(SIMILARITY_FILE):
        return None
    
    try:
        with open(SIMILARITY_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            

            paper_names = data.get('paper_names', [])
            matrix = data.get('similarity_matrix', [])
            

            similarities = []
            for i in range(len(matrix)):
                for j in range(i + 1, len(matrix)):
                    if i < len(paper_names) and j < len(paper_names):
                        similarities.append({
                            'paper1': paper_names[i],
                            'paper2': paper_names[j],
                            'score': matrix[i][j] if i < len(matrix) and j < len(matrix[i]) else 0
                        })
            

            similarities.sort(key=lambda x: x.get('score', 0), reverse=True)
            
            return {
                'total_papers': data.get('total_papers', 0),
                'similarities': similarities,
                'key_findings': data.get('key_findings', {})
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading similarity: {str(e)}")

@app.get("/api/pdfs")
async def get_pdfs():
    """List all downloaded PDFs"""
    if not os.path.exists(PDF_DIR):
        return []
    
    try:
        pdfs = [f for f in os.listdir(PDF_DIR) if f.endswith('.pdf')]
        return pdfs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing PDFs: {str(e)}")

@app.get("/api/draft")
async def get_draft():
    if not os.path.exists(DRAFT_FILE):

        return ""
    
    try:
        with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except Exception as e:
        logger.error(f"Error reading draft: {e}")
        return ""

@app.post("/api/revise")
async def revise_draft(request: ReviseRequest):
    if not os.path.exists(DRAFT_FILE):
        raise HTTPException(status_code=404, detail="Draft not found. Please run the research pipeline first.")
    
    try:
        from .paper_drafter import revise_paper_draft
        
        with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
            current_draft = f.read()
            
        revised_content = revise_paper_draft(current_draft, request.instructions)
        
        if revised_content:
            return {"status": "success", "message": "Draft revised successfully", "content": revised_content}
        else:
            raise HTTPException(status_code=500, detail="Failed to revise draft")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error revising draft: {str(e)}")

@app.post("/api/critique")
async def critique_draft():
    if not os.path.exists(DRAFT_FILE):
        raise HTTPException(status_code=404, detail="Draft not found.")
    
    with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    evaluation = evaluate_quality(content)
    return evaluation

@app.post("/api/refine")
async def refine_draft(request: RefineRequest):
    if not os.path.exists(DRAFT_FILE):
        raise HTTPException(status_code=404, detail="Draft not found.")
    
    with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    refined_content = refine_paper(content, request.suggestions)
    
    with open(DRAFT_FILE, 'w', encoding='utf-8') as f:
        f.write(refined_content)
        
    return {"message": "Draft refined successfully", "content": refined_content}

@app.post("/api/generate-report")
async def generate_report():
    if not os.path.exists(DRAFT_FILE):
        raise HTTPException(status_code=404, detail="Draft not found.")
    
    with open(DRAFT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        
    evaluation = evaluate_quality(content) 
    
    report_path = generate_final_report(content, evaluation)
    return {"message": "Report generated", "path": report_path}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
