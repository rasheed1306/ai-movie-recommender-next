from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
from dotenv import load_dotenv
from pathlib import Path
from main import search_movies_for_group, generate_explanation
from prompts import PROMPT_TEMPLATES, DEFAULT_TEMPLATE

# Load .env.local from the parent directory
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

app = FastAPI()

class GroupPreferences(BaseModel):
    preferences: Dict[str, Dict[str, str]]
    template: Optional[str] = DEFAULT_TEMPLATE

@app.post("/recommend")
async def recommend_movies(data: GroupPreferences):
    try:
        print(f"Received preferences for {len(data.preferences)} users")
        print(f"Using template: {data.template}")
        
        # Use the existing search logic from main.py
        results = await search_movies_for_group(data.preferences, threshold=0, count=3)
        
        # Generate AI explanation for the top recommendation
        if results:
            top_movie = results[0]
            explanation = await generate_explanation(
                top_movie, 
                data.preferences,
                template_name=data.template or DEFAULT_TEMPLATE
            )
            top_movie['ai_explanation'] = explanation
            print(f"Generated explanation: {explanation}")
        
        print("Recommendations generated:", results)
        return {"recommendations": results}
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/templates")
async def get_templates():
    """Return available prompt templates."""
    return {
        "templates": list(PROMPT_TEMPLATES.keys()),
        "default": DEFAULT_TEMPLATE
    }

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
