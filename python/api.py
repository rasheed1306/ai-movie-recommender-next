from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn
import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client
from openai import AsyncOpenAI
import asyncio

# Load environment
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

# Initialize clients
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

class GroupPreferences(BaseModel):
    preferences: Dict[str, Dict[str, str]]

# Prompt template for clean AI recommendations
CONVERSATIONAL_PROMPT = """Generate a 2-3 sentence movie recommendation explanation.

Movie: {movie_title}
Description: {movie_description}
Group preferences: {group_text}

Write a compelling explanation of why this movie matches the group's preferences. Be specific, engaging, and conversational. Do not include greetings or meta-commentary. Start directly with the recommendation.

Explanation:"""

def format_group_preferences(group_preferences: Dict[str, Dict[str, str]]) -> str:
    """Format group preferences into readable text."""
    group_summary = []
    for user, answers in group_preferences.items():
        user_prefs = ", ".join([f"{q.split('?')[0].lower()}: {a.lower()}" for q, a in answers.items()])
        group_summary.append(f"{user} ({user_prefs})")
    return "; ".join(group_summary)

async def get_embedding(text: str) -> list[float]:
    """Get embedding for text."""
    response = await openai.embeddings.create(
        input=text, 
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

async def search_movies_for_group(group_preferences: Dict[str, Dict[str, str]], threshold: float = 0.7, count: int = 3) -> List[Dict[str, Any]]:
    """Search for movies based on group preferences."""
    queries = []
    for user, answers in group_preferences.items():
        user_query = ". ".join(answers.values())
        queries.append(user_query)

    query_embeddings = await asyncio.gather(*[get_embedding(query) for query in queries])
    embeddings = [emb for emb in query_embeddings]
    avg_embedding = [sum(dim) / len(embeddings) for dim in zip(*embeddings)]
    
    response = supabase.rpc('match_documents', {
        'query_embedding': avg_embedding,
        'similarity_threshold': threshold,
        'match_count': count
    }).execute()
    
    return response.data

async def generate_explanation(movie_data: Dict[str, Any], group_preferences: Dict[str, Dict[str, str]]) -> str:
    """Generate AI explanation for why the group will love this movie."""
    movie_title = movie_data.get('title', 'this movie')
    movie_description = movie_data.get('description', movie_data.get('content', ''))
    group_text = format_group_preferences(group_preferences)
    
    prompt = CONVERSATIONAL_PROMPT.format(
        movie_title=movie_title,
        movie_description=movie_description,
        group_text=group_text
    )

    response = await openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=150
    )
    
    return response.choices[0].message.content.strip() if response.choices[0].message.content else ""

@app.post("/recommend")
async def recommend_movies(data: GroupPreferences):
    try:
        print(f"Received preferences for {len(data.preferences)} users")
        
        # Search for movies
        results = await search_movies_for_group(data.preferences, threshold=0, count=3)
        
        # Generate AI explanation for top recommendation
        if results:
            top_movie = results[0]
            explanation = await generate_explanation(top_movie, data.preferences)
            top_movie['ai_explanation'] = explanation
            print(f"Generated explanation: {explanation}")
        
        return {"recommendations": results}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
