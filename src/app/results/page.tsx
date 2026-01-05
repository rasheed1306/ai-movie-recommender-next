"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Results } from "@/components/Results";
import { WaitingForResults } from "@/components/WaitingForResults";
import { createClient } from "@/integrations/supabase/client";

function ResultsContent() {
  const searchParams = useSearchParams();
  const partyCode = searchParams.get("partyCode");
  const [status, setStatus] = useState<"loading" | "waiting" | "complete">(
    "loading"
  );
  const supabase = createClient();

  useEffect(() => {
    if (!partyCode) return;

    const checkInitialStatus = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("status")
        .eq("party_code", partyCode.toUpperCase())
        .single();

      if (data?.status === "complete") {
        setStatus("complete");
      } else {
        setStatus("waiting");
      }
    };

    checkInitialStatus();
  }, [partyCode, supabase]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <WaitingForResults
        open={true}
        partyCode={partyCode || ""}
        onComplete={() => setStatus("complete")}
      />
    );
  }

  return <Results />;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
