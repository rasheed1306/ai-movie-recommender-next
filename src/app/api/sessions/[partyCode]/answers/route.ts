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

    // Update the session_users table for current user
    const { error } = await supabase
      .from("session_users")
      .update({
        answers: answers,
        is_done: true,
      })
      .eq("id", sessionUserId); // Identify user by their specific session_user ID

    if (error) throw error;

    // 2. Check if ALL users in this session are done
    // First, get the session ID
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("party_code", partyCode)
      .single();

    if (!session) throw new Error("Session not found");

    // Fetch all users for this session
    const { data: allUsers, error: usersError } = await supabase
      .from("session_users")
      .select("user_name, answers, is_done")
      .eq("session_id", session.id);

    if (usersError) throw usersError;

    // Check if everyone is done
    const allDone = allUsers.every((user) => user.is_done);

    if (allDone) {
      console.log("🎉 All users finished! Triggering AI...");

      // 3. Prepare the JSON Payload for Python
      // Format: { "Rasheed": { ...answers }, "Abba": { ...answers } }
      const aiPayload = allUsers.reduce((acc, user) => {
        acc[user.user_name] = user.answers;
        return acc;
      }, {} as Record<string, any>);

      console.log("Payload for AI:", JSON.stringify(aiPayload, null, 2));

      // TODO: Call the Python AI service with aiPayload

      // TODO: Update Session Status to 'complete'
      const {error: statusError} = await supabase
        .from("sessions")
        .update({status: 'complete'})
        .eq("id", session.id);

        if (statusError) throw statusError;

      // TODO: Save AI Recommendations to DB

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
