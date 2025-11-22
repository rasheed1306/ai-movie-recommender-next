import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface WaitingForHostProps {
  open: boolean;
  onClose: () => void;
}

const WaitingForHost = ({ open, onClose }: WaitingForHostProps) => {
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
