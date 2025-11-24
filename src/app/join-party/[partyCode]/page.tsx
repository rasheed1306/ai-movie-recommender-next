"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/integrations/supabase/client";

type Props = {
  params: { partyCode: string };
};

export default function JoinPartyPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const partyCode = params.partyCode.toUpperCase();
  const userName = searchParams.get("userName");

  useEffect(() => {
    if (!session || !session.user || !userName) {
      setError("Invalid code");
      return;
    }

    const supabase = createClient();

    const joinParty = async () => {
      try {
        // Fetch session
        const { data: sessionData, error: fetchError } = await supabase
          .from("sessions")
          .select("*")
          .eq("party_code", partyCode)
          .single();

        if (fetchError || !sessionData || sessionData.status !== "waiting") {
          throw new Error("Invalid session");
        }

        // Insert user
        const { error: insertError } = await supabase
          .from("session_users")
          .upsert(
            {
              session_id: sessionData.id,
              user_id: session.user.id,
              user_name: userName,
              is_done: false,
            },
            { onConflict: "session_id,user_id" }
          );

        if (insertError) {
          throw insertError;
        }

        // Success: redirect
        router.push(`/join-party/${partyCode}/waiting`);
      } catch (err) {
        console.error("Join party error:", err);
        setError("Invalid code");
      }
    };

    joinParty();
  }, [session, partyCode, userName, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state or nothing (redirects on success)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-muted">Joining party...</p>
      </div>
    </div>
  );
}
