"use client";

import { useRouter } from "next/navigation";
import WaitingForHost from "@/components/WaitingForHost";

export default function InterceptedWaitingPage() {
  const router = useRouter();

  // When the modal is closed, go back to the previous page (the form)
  const handleClose = () => {
    router.back();
  };

  return <WaitingForHost open={true} onClose={handleClose} />;
}
