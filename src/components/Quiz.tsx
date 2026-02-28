"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { WaitingForResults } from "@/components/WaitingForResults";

const quizQuestions = [
  {
    question: "What's your favorite movie genre?",
    options: [
      "Action & Adventure",
      "Comedy & Romance",
      "Drama & Mystery",
      "Horror & Thriller",
    ],
  },
  {
    question: "How do you feel about plot twists?",
    options: [
      "Love unexpected surprises",
      "Prefer straightforward stories",
      "Twists keep me engaged",
      "Depends on execution",
    ],
  },
  {
    question: "What's your ideal movie length?",
    options: [
      "Under 90 minutes",
      "90-120 minutes",
      "120-150 minutes",
      "Over 150 minutes",
    ],
  },
  {
    question: "Do you prefer movies that make you think or feel?",
    options: [
      "Thought-provoking & complex",
      "Emotionally moving",
      "Balanced both",
      "Just entertaining fun",
    ],
  },
  {
    question: "What's your mood for tonight?",
    options: [
      "Light & uplifting",
      "Dark & intense",
      "Mind-bending",
      "Feel-good comfort",
    ],
  },
];

export function Quiz() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partyCode = searchParams.get("partyCode") || "";
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

  // Handle Enter key to advance to next question
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && answers[currentQuestionIndex] && !isSubmitting) {
        e.preventDefault();
        if (isLastQuestion) {
          handleFinish();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentQuestionIndex, answers, isLastQuestion, isSubmitting]);

  const handleAnswerSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    // Transform answers to use question text as keys
    const formattedAnswers = Object.keys(answers).reduce((acc, key) => {
      const index = Number(key);
      const question = quizQuestions[index]?.question;
      if (question) {
        acc[question] = answers[index];
      }
      return acc;
    }, {} as Record<string, string>);

    console.log("Quiz finished, answers:", formattedAnswers);

    // Save answers to database
    const sessionUserId = sessionStorage.getItem("sessionUserID");

    if (!sessionUserId || !partyCode) {
      toast.error("Session information missing. Please rejoin.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${partyCode}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionUserId,
          answers: formattedAnswers,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      // Navigate to results/waiting page
      // router.push(`/results?partyCode=${partyCode}`);
      setShowWaiting(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit answers. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              MovieMatch
            </span>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>
          </div>

          {/* Question */}
          <h2 className="text-3xl font-bold text-center text-card-foreground mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <RadioGroup
            value={answers[currentQuestionIndex]}
            onValueChange={handleAnswerSelect}
            className="space-y-4 mb-10"
          >
            {currentQuestion.options.map((option, index) => {
              const optionId = `q${currentQuestionIndex}-option${index}`;
              return (
                <Label
                  key={optionId}
                  htmlFor={optionId}
                  className={cn(
                    "flex items-center p-4 rounded-xl border bg-background/50 cursor-pointer transition-all",
                    "hover:bg-accent hover:border-primary/50",
                    "has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:border-primary"
                  )}
                >
                  <RadioGroupItem value={option} id={optionId} />
                  <span className="ml-4 font-medium text-card-foreground">
                    {option}
                  </span>
                </Label>
              );
            })}
          </RadioGroup>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              onClick={isLastQuestion ? handleFinish : handleNext}
              disabled={!answers[currentQuestionIndex] || isSubmitting}
              size="lg"
              className="px-8"
            >
              {isLastQuestion ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add the Waiting Component at the end */}
      <WaitingForResults
        open={showWaiting}
        partyCode={partyCode}
        onComplete={() => router.push(`/results?partyCode=${partyCode}`)}
      />
    </div>
  );
}
