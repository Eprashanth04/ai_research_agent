import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

def call_gemini(prompt):
    if not GEMINI_API_KEY:
        print("Error: GEMINI_API_KEY not found in environment.")
        return None
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            try:
                content = result['candidates'][0]['content']['parts'][0]['text']
                return content
            except (KeyError, IndexError):
                print("Error: Unexpected response format from Gemini API.")
                return None
        else:
            print(f"Error: Gemini API returned HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"Error calling Gemini API: {str(e)}")
        return None

if __name__ == "__main__":
   
    test_prompt = "Say hello!"
    print(f"Testing Gemini API with prompt: {test_prompt}")
    res = call_gemini(test_prompt)
    print(f"Response: {res}")
