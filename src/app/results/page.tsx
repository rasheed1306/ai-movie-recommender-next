import { Metadata } from "next";
import { Results } from "@/components/Results";

export const metadata: Metadata = {
  title: "Your Movie Match! - MovieMatch",
  description: "Here is the movie recommendation for your group, picked by AI.",
};

export default function ResultsPage() {
  return <Results />;
}