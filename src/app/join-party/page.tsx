"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import WaitingForHost from "@/components/WaitingForHost";

export default function JoinPartyForm() {
  const router = useRouter();
  const [partyCode, setPartyCode] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinParty = async () => {
    if (!partyCode.trim() || !userName.trim()) return;
    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch("/api/join-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyCode, userName }),
      });

      if (!response.ok) {
        // Try to parse the error message, but have a fallback.
        let errorMessage =
          "Hmm, that party code doesn't look right. Please try again! 🤔";
        try {
          const { error } = await response.json();
          if (error) errorMessage = error;
        } catch (e) {
          // The response was not JSON, so we'll stick with the default error.
          console.error("Could not parse error response as JSON:", e);
        }
        throw new Error(errorMessage);
      }

      // On success, redirect to the waiting page
      router.push(`/join-party/${partyCode}/waiting`);
    } catch (err: any) {
      setError(err.message);
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              MovieMatch
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join a Watch Party 🎉
          </h1>
          <p className="text-muted">
            Enter the party code to join your friends
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="space-y-6">
            {/* Party Code */}
            <div className="space-y-2">
              <Label
                htmlFor="partyCode"
                className="text-card-foreground font-medium"
              >
                Enter Party Code
              </Label>
              <Input
                id="partyCode"
                placeholder="e.g., ABC123 🔑"
                value={partyCode}
                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                className="h-12 bg-background/50 border-border"
                maxLength={6}
              />
              <p className="text-xs text-muted">Ask your host for the code</p>
            </div>

            {/* User Name */}
            <div className="space-y-2">
              <Label
                htmlFor="userName"
                className="text-card-foreground font-medium"
              >
                What's Your Name?
              </Label>
              <Input
                id="userName"
                placeholder="Your name ✨"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="h-12 bg-background/50 border-border"
              />
              <p className="text-xs text-muted">
                Let everyone know you've arrived
              </p>
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive text-center">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleJoinParty}
                disabled={!partyCode.trim() || !userName.trim() || isJoining}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isJoining ? "Joining..." : "Join Party"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
