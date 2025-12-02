"use client";

import { useRouter, useParams } from "next/navigation";
import WaitingForHost from "@/components/WaitingForHost";

export default function InterceptedWaitingPage() {
  const router = useRouter();
  const { partyCode } = useParams();
  // When the modal is closed, go back to the previous page (the form)
  const handleClose = () => {
    router.back();
  };

  return <WaitingForHost open={true} onClose={handleClose} partyCode={partyCode as string} />;
}
