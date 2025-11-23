"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/integrations/supabase/client";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

type AuthContextType = {
  supabase: SupabaseClient;
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session); // Add this log

      setSession(session);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session); // Add this log

      //   if (!session) {
      //     supabase.auth.signInAnonymously();
      //   } else {
      //     setSession(session);
      //   }
      // });
      if (!session) {
        console.log("No session found, attempting anonymous sign-in..."); // Add this log
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          console.log("Anonymous sign-in result:", data, error); // Add this log
          if (error) {
            console.error("Anonymous sign-in failed:", error); // Add this log
          }
        });
      } else {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ supabase, session }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
