"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, PlayCircle, RefreshCw, Loader2 } from "lucide-react";
import { createClient } from "@/integrations/supabase/client";

interface MovieRecommendation {
  title: string;
  description: string;
  content: string;
  ai_explanation?: string;
  poster_url?: string;
  trailer_url?: string;
  genre?: string;
  runtime?: string;
  rating?: string;
}

export function Results({ partyCode }: { partyCode: string }) {
  const navigate = useRouter();
  const [movie, setMovie] = useState<MovieRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!partyCode) {
      setError("No party code provided");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("sessions")
          .select("results")
          .eq("party_code", partyCode.toUpperCase())
          .single();

        if (fetchError) throw fetchError;

        if (!data?.results || data.results.length === 0) {
          throw new Error("No recommendations found");
        }

        // Get the top recommendation
        const topMovie = data.results[0];
        setMovie(topMovie);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [partyCode, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg text-muted">Loading your recommendation...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Film className="h-16 w-16 text-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-muted mb-6">
            {error || "Unable to load your movie recommendation"}
          </p>
          <Button onClick={() => navigate.push("/")}>
            Start New Party
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              MovieMatch
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your AI-Picked Movie! 🍿
          </h1>
          <p className="text-muted">
            Here's the top recommendation for your group.
          </p>
        </div>

        {/* Results Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Movie Poster */}
            <div className="relative">
              <img
                src={movie.poster_url || "/movies/placeholder.jpg"}
                alt={`Poster for ${movie.title}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/movies/placeholder.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r md:from-card md:to-transparent"></div>
            </div>

            {/* Movie Details */}
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-card-foreground mb-4">
                {movie.title}
              </h2>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre && <Badge variant="secondary">{movie.genre}</Badge>}
                {movie.runtime && <Badge variant="secondary">{movie.runtime}</Badge>}
                {movie.rating && <Badge variant="secondary">⭐ {movie.rating}</Badge>}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Why you'll love it
                </h3>
                <p className="text-muted">
                  {movie.ai_explanation || movie.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="lg" className="w-full h-12">
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Watch Trailer
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate.push("/")}
                  className="flex-1 h-12"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Start New Party
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}