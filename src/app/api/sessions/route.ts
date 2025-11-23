import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function generatePartyCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partyName, userName } = await req.json();

    if (!partyName || !userName) {
      return NextResponse.json({ error: "Missing partyName or userName" }, { status: 400 });
    }

    const partyCode = generatePartyCode();

    // Create the session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        host_id: user.id,
        party_code: partyCode,
        name: partyName,
        status: "waiting",
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    // Add the host to the session_users table
    const { error: userError } = await supabase.from("session_users").insert({
      session_id: sessionData.id,
      user_id: user.id,
      user_name: userName,
    });

    if (userError) {
      console.error("Session user creation error:", userError);
      // Optional: Attempt to clean up the created session if user insert fails
      await supabase.from("sessions").delete().eq("id", sessionData.id);
      return NextResponse.json({ error: "Failed to add host to session" }, { status: 500 });
    }

    return NextResponse.json({ partyCode: sessionData.party_code });
  } catch (e) {
    console.error("Unexpected error:", e);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}