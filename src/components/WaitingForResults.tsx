"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface WaitingForResultsProps {
  open: boolean; // Added to control visibility
  partyCode: string;
  onComplete: () => void;
}

export function WaitingForResults({
  open,
  partyCode,
  onComplete,
}: WaitingForResultsProps) {
  const supabase = createClient();
  const isCompleting = useRef(false);

  useEffect(() => {
    // Only run logic if the modal is open
    if (!open || !partyCode) return;

    console.log("Waiting for others... Subscribing to:", partyCode);

    const channel = supabase.channel(`results:${partyCode}`);

    // 1. Realtime Subscription
    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `party_code=eq.${partyCode.toUpperCase()}`,
        },
        (payload) => {
          if (payload.new.status === "complete") {
            if (isCompleting.current) return;
            isCompleting.current = true;
            console.log("Realtime detected completion!");
            onComplete();
          }
        }
      )
      .subscribe();

    // 2. Polling Fallback (Every 3000ms)
    const intervalId = setInterval(async () => {
      if (isCompleting.current) return;

      const { data } = await supabase
        .from("sessions")
        .select("status")
        .eq("party_code", partyCode.toUpperCase())
        .single();

      if (data?.status === "complete") {
        if (isCompleting.current) return;
        isCompleting.current = true;
        console.log("Polling detected completion!");
        onComplete();
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [open, partyCode, onComplete, supabase]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md border-2 border-primary/20"
        // Prevent closing by clicking outside
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-foreground mb-8">
            Waiting for friends... 🍿
          </DialogTitle>

          {/* Loading Dots */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full bg-primary/20 animate-pulse"
              style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
            />
            <div
              className="w-16 h-16 rounded-full bg-primary/30 animate-pulse"
              style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
            />
            <div
              className="w-16 h-16 rounded-full bg-primary/20 animate-pulse"
              style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
            />
          </div>

          <p className="text-muted-foreground">
            As soon as everyone’s finished the quiz, your AI powered movie
            recommendation will appear here.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
