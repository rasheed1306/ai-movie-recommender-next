import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
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

  try {
    const { partyCode, userName } = await req.json();

    if (!partyCode || !userName) {
      return NextResponse.json(
        { error: "Party code and name are required" },
        { status: 400 }
      );
    }

    // 2. Find the session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("id, status")
      .eq("party_code", partyCode.toUpperCase())
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: "Invalid party code" },
        { status: 404 }
      );
    }

    if (sessionData.status !== "waiting") {
      return NextResponse.json(
        { error: "Party has already started" },
        { status: 400 }
      );
    }

    // Optional: Get authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    const userId = randomUUID();

    // 3. Add user to the session
    const { data: newUser,  error: insertError } = await supabase.from("session_users").insert(
      {
        session_id: sessionData.id,
        user_id: userId,
        auth_user_id: authUser?.id || null,
        user_name: userName,
        is_done: false,
      },
    )
    .select("user_id")
    .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, sessionUserId: newUser.user_id});
  } catch (error) {
    console.error("Join API Error:", error);
    return NextResponse.json(
      { error: "Failed to join party" },
      { status: 500 }
    );
  }
}
