import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PartyLobby } from "@/components/PartyLobby";
import { Database } from "@/lib/database.types";

type Props = {
  params: { partyCode: string };
};

async function getSession(partyCode: string) {
  if (!partyCode) {
    console.error("Invalid partyCode:", partyCode);
    return null;
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
        },
      }
    );

    const { data, error } = await supabase
      .from("sessions")
      .select(`*, session_users(user_name, is_done)`)
      .eq("party_code", partyCode.toUpperCase())
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error fetching session:", err);
    return null;
  }
}
export async function generateMetadata({ params }: Props) {
  const session = await getSession(params.partyCode);
  const partyName = session?.name || "MovieMatch Party";
  return {
    title: `Join ${partyName} - MovieMatch`,
    description: `You've been invited to a watch party! Join now with code ${params.partyCode}.`,
  };
}

export default async function PartyPage({ params }: Props) {
  const session = await getSession(params.partyCode);

  if (!session) {
    notFound();
  }

  return <PartyLobby initialSession={session} />;
}
