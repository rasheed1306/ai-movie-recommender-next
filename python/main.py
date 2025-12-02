import os 
from supabase import create_client, Client
from openai import OpenAI, AsyncOpenAI
from dotenv import load_dotenv
import asyncio
from content import get_movies
from typing import Any, List, Dict, cast

load_dotenv()

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

async def search_movies_for_group(queries: list[str], threshold: float = 0.7, count: int = 5) -> List[Dict[str, Any]]:
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

    group_queries_test = [
        "A thrilling action movie with lots of suspense and excitement.",
        "A dramatic story with deep emotional moments and character development.",
        "A light-hearted comedy that will make me laugh and feel good."
    ]
    group_results = await search_movies_for_group(group_queries_test, threshold=0, count=3)
    print("Group search results:", group_results)

if __name__ == "__main__":
    asyncio.run(main(get_movies()))