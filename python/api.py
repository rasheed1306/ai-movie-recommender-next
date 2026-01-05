from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path
from main import search_movies_for_group

# Load .env.local from the parent directory
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

app = FastAPI()

class GroupPreferences(BaseModel):
    preferences: Dict[str, Dict[str, str]]

@app.post("/recommend")
async def recommend_movies(data: GroupPreferences):
    try:
        print(f"Received preferences for {len(data.preferences)} users")
        
        # Use the existing search logic from main.py
        results = await search_movies_for_group(data.preferences, threshold=0, count=3)
        
        print("Recommendations generated:", results)
        return {"recommendations": results}
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
