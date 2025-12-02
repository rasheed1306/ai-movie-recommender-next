import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
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

  useEffect(() => {
    // Only subscribe when dialog is open
    if (!open) return;

    console.log("Subscribing to session updates for partyCode:", partyCode); // Added: Debug subscription start

    const channel = supabase.channel(`session:${partyCode}`);

    // Listen for session status update to "in_progress"
    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `party_code=eq.${partyCode}`,
        },
        (payload) => {
          console.log("Received payload:", payload); // Added: Debug payload

          if (payload.new.status === "in_progress") {
            console.log("Redirecting to quiz..."); // Added: Debug redirect

            // Redirect on status change
            router.push(`/quiz?partyCode=${partyCode}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Cleanup on unmount
    };
  }, [open, partyCode, router, supabase]); // Dependencies

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
