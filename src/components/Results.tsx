"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Film, PlayCircle, RefreshCw } from "lucide-react";

// Placeholder data - this would come from your AI backend
const recommendedMovie = {
  title: "Inception",
  poster: "/movies/inception.jpg",
  description:
    "Based on your group's love for mind-bending plots and action, 'Inception' is a perfect match. Its complex narrative will keep you guessing, while the stunning visuals and high-stakes action will have everyone on the edge of their seats.",
  genre: "Sci-Fi / Action",
  runtime: "148 min",
  rating: "8.8/10",
  trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
};

export function Results() {
  const router = useRouter();

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
                src={recommendedMovie.poster}
                alt={`Poster for ${recommendedMovie.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r md:from-card md:to-transparent"></div>
            </div>

            {/* Movie Details */}
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-card-foreground mb-4">
                {recommendedMovie.title}
              </h2>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{recommendedMovie.genre}</Badge>
                <Badge variant="secondary">{recommendedMovie.runtime}</Badge>
                <Badge variant="secondary">⭐ {recommendedMovie.rating}</Badge>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Why you'll love it
                </h3>
                <p className="text-muted">{recommendedMovie.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={recommendedMovie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="lg" className="w-full h-12">
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Watch Trailer
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/")}
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