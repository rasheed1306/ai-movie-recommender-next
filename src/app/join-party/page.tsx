"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film } from "lucide-react";

function JoinPartyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [partyCode, setPartyCode] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setPartyCode(code);
    }
  }, [searchParams]);

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

      const data = await response.json();

      if (!response.ok) {
        let errorMessage =
          "Hmm, that code doesn't look right. Please try again! 🤔";
        try {
          const { error } = await response.json();
          if (error) errorMessage = error;
        } catch (e) {
          console.error("Could not parse error response as JSON:", e);
        }
        throw new Error(errorMessage);
      }

      // Save session user ID to local storage
      if (data.sessionUserId) {
        sessionStorage.setItem("sessionUserID", data.sessionUserId);
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                MovieMatch
              </span>
            </div>
            <h1 className="text-4xl font-bold">Join a Watch Party 🎉</h1>
            <p className="text-muted-foreground mt-2">
              Enter the party code to join your friends
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="party-code" className="font-medium">
                  Enter Party Code
                </label>
                <Input
                  id="party-code"
                  placeholder="e.g., ABC123 🔑"
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && partyCode.trim() && userName.trim()) {
                      handleJoinParty();
                    }
                  }}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Ask your host for the code
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="user-name" className="font-medium">
                  What's Your Name?
                </label>
                <Input
                  id="user-name"
                  placeholder="Your name ✨"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && partyCode.trim() && userName.trim()) {
                      handleJoinParty();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Let everyone know you've arrived
                </p>
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive text-center">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  type="button"
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

export default function JoinPartyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinPartyContent />
    </Suspense>
  );
}
