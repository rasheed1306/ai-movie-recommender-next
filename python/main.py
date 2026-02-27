import os 
from supabase import create_client, Client
from openai import AsyncOpenAI
from dotenv import load_dotenv
import asyncio
from content import get_movies
from prompts import get_prompt, DEFAULT_TEMPLATE
from typing import Any, List, Dict, cast
from pathlib import Path

# Load .env.local from the parent directory
env_path = Path(__file__).resolve().parent.parent / '.env.local'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL: str  = os.getenv("SUPABASE_URL") or ""
SUPABASE_KEY: str = os.getenv("SUPABASE_API_KEY") or ""
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_embedding(text: str) -> dict[str, str | list[float]]:
    response = await openai.embeddings.create(
        input=text, 
        model="text-embedding-3-small"
    )
    return {"content": text, "embedding": response.data[0].embedding}


async def search_movies(query: str, threshold: float = 0.7, count: int = 5) -> List[Dict[str, Any]]:
    query_embedding_response = await get_embedding(query)
    response = supabase.rpc('match_documents', {
        'query_embedding': query_embedding_response['embedding'],
        'similarity_threshold': threshold,
        'match_count': count
    }).execute()
    return cast(List[Dict[str,  Any]], response.data)

async def generate_explanation(
    movie_data: Dict[str, Any], 
    group_preferences: Dict[str, Dict[str, str]],
    template_name: str = DEFAULT_TEMPLATE
) -> str:
    """Generate a personalized explanation for why the group will love this movie."""
    movie_title = movie_data.get('title', 'this movie')
    movie_description = movie_data.get('description', movie_data.get('content', ''))
    
    prompt = get_prompt(template_name, movie_title, movie_description, group_preferences)

    response = await openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=150
    )
    
    return response.choices[0].message.content.strip() if response.choices[0].message.content else ""


async def search_movies_for_group(group_preferences: Dict[str, Dict[str, str]], threshold: float = 0.7, count: int = 5) -> List[Dict[str, Any]]:
    queries = []
    for user, answers in group_preferences.items():
        # Combine all answers into a single descriptive string for the user
        user_query = ". ".join(answers.values())
        queries.append(user_query)

    query_embeddings = await asyncio.gather(*[get_embedding(query) for query in queries])
    # Calculate average embedding
    embeddings = [emb['embedding'] for emb in query_embeddings]
    avg_embedding = [sum(dim) / len(embeddings) for dim in zip(*embeddings)]
    response = supabase.rpc('match_documents', {
        'query_embedding': avg_embedding,
        'similarity_threshold': threshold,
        'match_count': count
    }).execute()
    return cast(List[Dict[str, Any]], response.data)

async def main(input: List[Dict[str, str]]) -> None: 
    data: list[dict[str, str | list[float]]] = await asyncio.gather(
        *[get_embedding(movie['content']) for movie in input]
    )
    
    # Add title and description to data
    for i, movie in enumerate(input): 
        data[i]['title'] = movie['title']
        data[i]['description'] = movie['description']

    supabase.table("documents").upsert(data, on_conflict='title').execute()
    
    # Test search
    test_results = await search_movies("A wholesome kid friendly movie about adventure and friendship, fantasy is preferred", threshold=0, count=3)
    print("Test search results:", test_results)

    group_queries_test = {
        "Ahmed": {
            "What's your mood for tonight?": "Light & uplifting",
            "What's your ideal movie length?": "Under 90 minutes",
            "What's your favorite movie genre?": "Action & Adventure",
            "How do you feel about plot twists?": "Love unexpected surprises",
            "Do you prefer movies that make you think or feel?": "Thought-provoking & complex"
        },
        "Ammu": {
            "What's your mood for tonight?": "Dark & intense",
            "What's your ideal movie length?": "90-120 minutes",
            "What's your favorite movie genre?": "Comedy & Romance",
            "How do you feel about plot twists?": "Prefer straightforward stories",
            "Do you prefer movies that make you think or feel?": "Emotionally moving"
        }
    }
    group_results = await search_movies_for_group(group_queries_test, threshold=0, count=3)
    print("Group search results:", group_results)

if __name__ == "__main__":
    asyncio.run(main(get_movies()))