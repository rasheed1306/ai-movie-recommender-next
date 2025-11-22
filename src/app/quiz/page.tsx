import { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Movie Quiz - MovieMatch",
  description: "Answer a few questions to get your movie recommendations.",
};

export default function QuizPage() {
  return <Quiz />;
}