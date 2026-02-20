import time
import requests
import random
from .logger import logger

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def fetch_papers(topic, limit=3, retries=3, wait_seconds=5):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"

    params = {
        "query": topic,
        "limit": limit,
        "fields": "paperId,title,authors,year,abstract,url,isOpenAccess,openAccessPdf"
    }

    for attempt in range(retries):
        try:
            logger.info(f"Calling Semantic Scholar API: {url} with params {params} (Attempt {attempt + 1})")
            response = requests.get(url, params=params, headers=HEADERS, timeout=120)

            if response.status_code == 200:
                data = response.json().get("data", [])
                logger.info(f"Successfully fetched {len(data)} papers for '{topic}'")
                return data

            elif response.status_code == 429:
                # Exponential backoff with jitter
                sleep_time = (2 ** attempt) + random.uniform(0, 1)
                logger.warning(f"Rate limit hit (429). Retry {attempt + 1}/{retries}. Waiting {sleep_time:.2f}s...")
                time.sleep(sleep_time)

            else:
                logger.error(f"Semantic Scholar API Error: HTTP {response.status_code}")
                logger.error(f"Response Content: {response.text}")
                return []
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Connection error to Semantic Scholar: {e}")
            if attempt < retries - 1:
                sleep_time = (2 ** attempt) + random.uniform(0, 1)
                logger.info(f"Retrying in {sleep_time:.2f}s...")
                time.sleep(sleep_time)

    logger.error("Failed to fetch papers after multiple attempts.")
    return []


def show_papers(papers):
    if not papers:
        print("No papers found.")
        return

    for i, paper in enumerate(papers, start=1):
        authors = ", ".join(a["name"] for a in paper.get("authors", []))
        print(f"\nPaper {i}")
        print("Title:", paper.get("title"))
        print("Authors:", authors)
        print("Year:", paper.get("year"))
        print("Abstract:", paper.get("abstract"))
        print("Link:", paper.get("url"))
        print("-" * 60)
