import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/integrations/supabase/client";

interface WaitingForHostProps {
  open: boolean;
  onClose: () => void;
  partyCode: string;
}

const WaitingForHost = ({ open, onClose, partyCode }: WaitingForHostProps) => {
  const router = useRouter();
  const supabase = createClient();
  const isRedirecting = useRef(false);

  useEffect(() => {
    // Only subscribe when dialog is open and partyCode is available
    if (!open || !partyCode) return;

    console.log("Subscribing to session updates for partyCode:", partyCode); // Added: Debug subscription start

    const channel = supabase.channel(`session:${partyCode}`);

    // Realtime subscription to session status updates
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
          console.log("Received payload:", payload); // Added: Debug payload

          if (payload.new.status === "in_progress") {
            // preventing double redirect
            if (isRedirecting.current) return;
            isRedirecting.current = true;

            console.log("Realtime detected, Redirecting to quiz..."); // Added: Debug redirect

            // Redirect on status change
            window.location.href = `/quiz?partyCode=${partyCode}`;

          }
        }
      )
      .subscribe();

    // Polling fallback in case real-time subscription fails
    const intervalId = setInterval(async () => {
      // Stop polling if we are already redirecting
      if (isRedirecting.current) return;

      const { data } = await supabase
        .from("sessions")
        .select("status")
        .eq("party_code", partyCode.toUpperCase())
        .single();

      if (data?.status === "in_progress") {
        // prevent double redirect
        if (isRedirecting.current) return;
        isRedirecting.current = true;
        console.log("Polling detected, forcing redirect..."); // Added: Debug polling redirect
        window.location.href = `/quiz?partyCode=${partyCode}`;
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel); 
      clearInterval(intervalId); 
    };
  }, [open, partyCode, router, supabase]); 

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md border-2 border-primary/20"
        onInteractOutside={onClose}
      >
        <div className="text-center py-8">
          <DialogTitle className="text-2xl font-bold text-foreground mb-8">
            Waiting for host 🎬
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
            Hang tight! The host will start the quiz soon ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitingForHost;
