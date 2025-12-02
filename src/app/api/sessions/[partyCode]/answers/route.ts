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

    // Update the session_users table
    const { error } = await supabase
      .from("session_users")
      .update({
        answers: answers,
        is_done: true,
      })
      .eq("id", sessionUserId); // Identify user by their specific session_user ID

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting answers:", error);
    return NextResponse.json(
      { error: "Failed to submit answers" },
      { status: 500 }
    );
  }
}
