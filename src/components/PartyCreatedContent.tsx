"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Film, Copy, Check } from "lucide-react";

export function PartyCreatedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Get party details from query params (adapted from Vite's location.state)
  const partyName = searchParams.get("partyName") || "Friday Night Movies";
  const userName = searchParams.get("userName") || "Host";
  const partyCode = searchParams.get("partyCode") || "WB9NZU";
  const shareLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/join-party?code=${partyCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      // Removed toast for minimal changes; add back if you implement useToast
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Removed toast for minimal changes; add back if you implement useToast
    }
  };

  const handleStartQuiz = () => {
    router.push("/quiz");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Film className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Header */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Party Created! 🎉
          </h1>
          <p className="text-muted mb-8">
            Welcome, {userName}! Share this code with your friends.
          </p>

          {/* Party Code */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              Your Party Code
            </p>
            <div className="bg-background/50 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold font-mono text-foreground tracking-wider">
                {partyCode}
              </p>
            </div>

            {/* Share Link */}
            <p className="text-sm text-muted-foreground mb-2">Share Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-3 text-left overflow-hidden">
                <p className="text-sm text-muted truncate font-mono break-all">
                  {shareLink}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="h-12 w-12 flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Waiting Message */}
          <div className="mb-6">
            <p className="text-muted animate-pulse">
              Waiting for friends to join... ⏳
            </p>
          </div>

          {/* Start Quiz Button */}
          <Button
            onClick={handleStartQuiz}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold"
            size="lg"
          >
            Start Quiz 🎬
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            You can start the quiz once everyone has joined
          </p>
        </div>
      </div>
    </div>
  );
}