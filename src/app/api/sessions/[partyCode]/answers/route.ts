import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ partyCode: string }> }
) {
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
    const { sessionUserId, answers } = await req.json();
    const { partyCode } = await params;

    if (!sessionUserId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("session_users")
      .update({ answers, is_done: true })
      .eq("user_id", sessionUserId);

    if (error) throw error;

    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("party_code", partyCode)
      .single();

    if (!session) throw new Error("Session not found");

    const { data: allUsers, error: usersError } = await supabase
      .from("session_users")
      .select("user_name, answers, is_done")
      .eq("session_id", session.id);

    if (usersError) throw usersError;

    const allDone = allUsers.every((user) => user.is_done);

    if (allDone) {
      const aiPayload = allUsers.reduce((acc, user) => {
        acc[user.user_name] = user.answers;
        return acc;
      }, {} as Record<string, any>);

      const host = req.headers.get("host") || "localhost:3000";
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const aiResponse = await fetch(`${protocol}://${host}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: aiPayload }),
      });

      if (!aiResponse.ok) throw new Error(await aiResponse.text());

      const aiData = await aiResponse.json();

      const { error: updateError } = await supabase
        .from("sessions")
        .update({ status: "complete", results: aiData.recommendations })
        .eq("id", session.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, allDone: true, recommendations: aiData.recommendations });
    }

    return NextResponse.json({ success: true, allDone: allDone });
  } catch (error) {
    console.error("Error submitting answers:", error);
    return NextResponse.json(
      { error: "Failed to submit answers" },
      { status: 500 }
    );
  }
}
