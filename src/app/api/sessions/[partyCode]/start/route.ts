import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";

export async function POST(
  req: Request,
  { params }: { params: { partyCode: string } }
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
    // Get authenticated user
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing User ID" }, { status: 401 });
    }

    const {partyCode} = await params;
    const partyCodeUpper = partyCode.toUpperCase();

    // Fetch session and verify host
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("host_id, status")
      .eq("party_code", partyCodeUpper)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.host_id !== userId) {
      return NextResponse.json(
        { error: "Only the host can start the quiz" },
        { status: 403 }
      );
    }

    if (session.status !== "waiting") {
      return NextResponse.json(
        { error: "Quiz already started" },
        { status: 400 }
      );
    }

    // Update status to 'in_progress'
    const { error: updateError } = await supabase
      .from("sessions")
      .update({ status: "in_progress" })
      .eq("party_code", partyCodeUpper);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Start quiz error:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}
