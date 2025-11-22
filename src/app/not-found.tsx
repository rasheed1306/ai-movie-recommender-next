import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | MovieMatch",
  description: "Oops! This page doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Film className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
          Oops! Looks like this movie wasn't in our collection. Let's get you back to the main show.
        </p>
        <Link href="/">
          <Button size="lg" className="px-8">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
