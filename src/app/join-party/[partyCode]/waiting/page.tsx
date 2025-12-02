"use client";

import { useRouter, useParams } from "next/navigation";
import WaitingForHost from "@/components/WaitingForHost";

export default function WaitingPage() {
  const router = useRouter();
  const {partyCode} = useParams();

  // If the modal is closed, redirect to the main join page
  const handleClose = () => {
    router.push("/join-party");
  };

  return (
    // This div provides the simple, non-interactive background
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <WaitingForHost open={true} onClose={handleClose} partyCode={partyCode as string} />
    </div>
  );
}
