"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function StartPartyForm() {
  const router = useRouter();
  const [partyName, setPartyName] = useState("");
  const [userName, setUserName] = useState("");

  const handleCreateParty = () => {
    // Generate a random 6-character party code
    const partyCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Navigate to PartyCreated page with query params
    router.push(
      `/party-created?partyName=${encodeURIComponent(
        partyName
      )}&userName=${encodeURIComponent(userName)}&partyCode=${partyCode}`
    );
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
            Start a Watch Party 🎬
          </h1>
          <p className="text-muted">Let's get started with your movie night</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="space-y-6">
            {/* Party Name */}
            <div className="space-y-2">
              <Label
                htmlFor="partyName"
                className="text-card-foreground font-medium"
              >
                Name Your Watch Party
              </Label>
              <Input
                id="partyName"
                placeholder="e.g., Friday Night Movies 🍿"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="h-12 bg-background/50 border-border"
              />
              <p className="text-xs text-muted">Make it memorable!</p>
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
                So your friends know who's hosting
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full h-12">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Button
                onClick={handleCreateParty}
                disabled={!partyName.trim() || !userName.trim()}
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Party
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
