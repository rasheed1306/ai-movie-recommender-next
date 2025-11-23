"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Film, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/lib/database.types";
import { createClient } from "@/integrations/supabase/client";

type SessionWithUsers = Tables<"sessions"> & {
  session_users: Pick<Tables<"session_users">, "user_name" | "is_done">[];
};

interface PartyLobbyProps {
  initialSession: SessionWithUsers;
}

async function fetchSession(partyCode: string): Promise<SessionWithUsers | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`*, session_users(user_name, is_done)`)
    .eq("party_code", partyCode.toUpperCase())
    .single();
  
  if (error) throw new Error("Could not fetch session details.");
  return data;
}

export function PartyLobby({ initialSession }: PartyLobbyProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const partyCode = initialSession.party_code;

  const { data: session } = useQuery({
    queryKey: ["session", partyCode],
    queryFn: () => fetchSession(partyCode),
    initialData: initialSession,
    refetchInterval: 5000, // Poll for updates every 5 seconds
  });

  const shareLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/join-party?code=${partyCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const handleStartQuiz = () => {
    // TODO: Add logic to change session status to 'in_progress'
    router.push(`/quiz?partyCode=${partyCode}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Film className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {session.name || "Party Created!"} 🎉
          </h1>
          <p className="text-muted mb-8">
            Share this code with your friends to join.
          </p>

          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">Your Party Code</p>
            <div className="bg-background/50 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold font-mono text-foreground tracking-wider">
                {partyCode}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-2">Share Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-3 text-left overflow-hidden">
                <p className="text-sm text-muted truncate font-mono break-all">
                  {shareLink}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyLink} className="h-12 w-12 flex-shrink-0">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-muted animate-pulse">Waiting for friends to join... ⏳</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {session.session_users.map(p => (
                <div key={p.user_name} className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {p.user_name}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleStartQuiz} className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold" size="lg">
            Start Quiz 🎬
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            You can start the quiz once everyone has joined.
          </p>
        </div>
      </div>
    </div>
  );
}