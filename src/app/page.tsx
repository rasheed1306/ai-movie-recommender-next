import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoviePosterCarousel } from "@/components/MoviePosterCarousel";
import { Film } from "lucide-react";

export const metadata: Metadata = {
  title: "MovieMatch - Stop Arguing, Start Watching",
  description: "Answer 5 questions with friends and get matched with movies you'll all love. The easiest way to decide what to watch together.",
  openGraph: {
    title: "MovieMatch - Stop Arguing, Start Watching",
    description: "Answer 5 questions with friends and get matched with movies you'll all love.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">MovieMatch</span>
          </div>
        </div>
      </nav>

      {/* Movie Poster Carousel */}
      <MoviePosterCarousel />

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="mb-6 animate-fade-in text-6xl font-bold leading-tight text-foreground md:text-7xl lg:text-8xl">
            Stop Arguing.
            <br />
            Start Watching.
          </h1>
          
          <p className="mb-12 max-w-2xl animate-slide-up text-xl text-muted md:text-2xl">
            Answer 5 questions with friends and get matched with movies you'll all love
          </p>

          <div className="flex flex-col gap-4 animate-slide-up sm:flex-row">
            <Link href="/start-party">
              <Button 
                variant="hero" 
                size="lg"
                className="text-lg px-10 py-6 h-auto rounded-full"
              >
                Start a Watch Party
              </Button>
            </Link>
            <Link href="/join-party">
              <Button 
                variant="heroOutline" 
                size="lg"
                className="text-lg px-10 py-6 h-auto rounded-full"
              >
                Join a Watch Party
              </Button>
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <h2 className="mb-12 text-center text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Create or Join
              </h3>
              <p className="text-muted">
                Start a new watch party or join your friends using their party code
              </p>
            </div>

            <div className="rounded-xl bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Answer Questions
              </h3>
              <p className="text-muted">
                Each person answers 5 quick questions about their movie preferences
              </p>
            </div>

            <div className="rounded-xl bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                Get Matches
              </h3>
              <p className="text-muted">
                Our AI recommends movies that everyone in your group will enjoy
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center">
          <p className="text-sm text-muted">
            Powered by AI • Movie data from TMDB
          </p>
        </footer>
      </main>
    </div>
  );
}
