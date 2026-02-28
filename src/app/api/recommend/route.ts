import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Initialize clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_API_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Prompt template for clean AI recommendations
const CONVERSATIONAL_PROMPT = `You are a movie recommendation expert. Generate a compelling 2-3 sentence explanation for why this movie matches the group's preferences.

Movie: {movie_title}
Description: {movie_description}
Group preferences: {group_text}

Write a natural, engaging explanation. Be specific about how the movie matches their preferences. Do not use quotation marks, greetings, or meta-commentary. Start directly with the explanation.

Explanation:`;

interface GroupPreferences {
  [userName: string]: {
    [question: string]: string;
  };
}

interface MovieData {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  similarity?: number;
  [key: string]: any;
}

/**
 * Format group preferences into readable text
 */
function formatGroupPreferences(
  groupPreferences: GroupPreferences
): string {
  const groupSummary: string[] = [];
  
  for (const [user, answers] of Object.entries(groupPreferences)) {
    const userPrefs = Object.entries(answers)
      .map(([q, a]) => {
        const questionPart = q.split("?")[0].toLowerCase();
        return `${questionPart}: ${a.toLowerCase()}`;
      })
      .join(", ");
    
    groupSummary.push(`${user} (${userPrefs})`);
  }
  
  return groupSummary.join("; ");
}

/**
 * Get embedding for text using OpenAI
 */
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-3-small",
  });
  
  return response.data[0].embedding;
}

/**
 * Search for movies based on group preferences
 */
async function searchMoviesForGroup(
  groupPreferences: GroupPreferences,
  threshold: number = 0.7,
  count: number = 3
): Promise<MovieData[]> {
  // Build queries for each user
  const queries: string[] = [];
  for (const [_user, answers] of Object.entries(groupPreferences)) {
    const userQuery = Object.values(answers).join(". ");
    queries.push(userQuery);
  }

  // Get embeddings for all queries in parallel
  const queryEmbeddings = await Promise.all(
    queries.map((query) => getEmbedding(query))
  );

  // Calculate average embedding
  const embeddingDimension = queryEmbeddings[0].length;
  const avgEmbedding = new Array(embeddingDimension).fill(0);

  for (const embedding of queryEmbeddings) {
    for (let i = 0; i < embeddingDimension; i++) {
      avgEmbedding[i] += embedding[i];
    }
  }

  for (let i = 0; i < embeddingDimension; i++) {
    avgEmbedding[i] /= queryEmbeddings.length;
  }

  // Get matches with similarity scores
  const { data: matchData, error: matchError } = await supabase.rpc(
    "match_documents",
    {
      query_embedding: avgEmbedding,
      similarity_threshold: threshold,
      match_count: count,
    }
  );

  if (matchError || !matchData || !Array.isArray(matchData)) {
    console.error("Match error:", matchError);
    return [];
  }

  // Extract movie IDs
  const movieIds = matchData
    .filter((movie) => movie && typeof movie === "object" && "id" in movie)
    .map((movie) => movie.id);

  if (movieIds.length === 0) {
    return [];
  }

  // Fetch complete movie data from documents table
  const { data: moviesData, error: moviesError } = await supabase
    .from("documents")
    .select("*")
    .in("id", movieIds);

  if (moviesError || !moviesData || !Array.isArray(moviesData)) {
    console.error("Movies error:", moviesError);
    return [];
  }

  // Create a map of id to similarity score
  const similarityMap = new Map<string, number>();
  for (const movie of matchData) {
    if (movie && typeof movie === "object" && "id" in movie) {
      similarityMap.set(movie.id, movie.similarity || 0);
    }
  }

  // Add similarity scores to complete movie data
  const movies: MovieData[] = moviesData.map((movie) => ({
    ...movie,
    similarity: similarityMap.get(movie.id) || 0,
  }));

  // Sort by similarity (highest first)
  movies.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

  return movies;
}

/**
 * Generate AI explanation for why the group will love this movie
 */
async function generateExplanation(
  movieData: MovieData,
  groupPreferences: GroupPreferences
): Promise<string> {
  const movieTitle = movieData.title || "this movie";
  const movieDescription =
    movieData.description || movieData.content || "";
  const groupText = formatGroupPreferences(groupPreferences);

  const prompt = CONVERSATIONAL_PROMPT.replace("{movie_title}", movieTitle)
    .replace("{movie_description}", movieDescription)
    .replace("{group_text}", groupText);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content?.trim() || "";
}

/**
 * POST /api/recommend
 * Recommend movies based on group preferences
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { preferences } = body as { preferences: GroupPreferences };

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      );
    }

    console.log(
      `Received preferences for ${Object.keys(preferences).length} users`
    );

    // Search for movies
    const results = await searchMoviesForGroup(preferences, 0, 3);

    // Generate AI explanation for top recommendation
    if (results.length > 0) {
      const topMovie = results[0];
      const explanation = await generateExplanation(topMovie, preferences);
      topMovie.ai_explanation = explanation;
      console.log(`Generated explanation: ${explanation}`);
    }

    return NextResponse.json({ recommendations: results });
  } catch (error) {
    console.error("Error in recommend endpoint:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
