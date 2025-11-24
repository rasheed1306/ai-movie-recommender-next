"use client";

import { useRouter } from "next/navigation";
import WaitingForHost from "@/components/WaitingForHost";

export default function WaitingPage() {
  const router = useRouter();

  // If the modal is closed, redirect to the main join page
  const handleClose = () => {
    router.push("/join-party");
  };

  return (
    // This div provides the simple, non-interactive background
    <div className="min-h-screen bg-background">
      <WaitingForHost open={true} onClose={handleClose} />
    </div>
  );
}
