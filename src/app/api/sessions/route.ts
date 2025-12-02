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
    // console.log("Starting session creation...");
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("User fetched:", user);

    if (!user) {
      console.log("No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partyName, userName } = await req.json();
    console.log("Request data:", { partyName, userName });

    if (!partyName || !userName) {
      return NextResponse.json(
        { error: "Missing partyName or userName" },
        { status: 400 }
      );
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
    // console.log("Session insert result:", sessionData, sessionError);

    if (sessionError || !sessionData) {
      console.error("Session creation error:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Add the host to the session_users table
    const { data: hostUser, error: userError } = await supabase.from("session_users").insert({
      session_id: sessionData.id,
      user_id: user.id,
      user_name: userName,
      is_done: false,
    })
    .select("id")
    .single();
    
    // console.log("User insert result:", userError); // Add this after insert

    if (userError) {
      console.error("Session user creation error:", userError);
      // Optional: Attempt to clean up the created session if user insert fails
      await supabase.from("sessions").delete().eq("id", sessionData.id);
      return NextResponse.json(
        { error: "Failed to add host to session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, partyCode: sessionData.party_code, sessionUserId: hostUser.id });
  } catch (e) {
    console.error("Unexpected error:", e);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
