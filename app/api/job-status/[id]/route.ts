import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing generation id." }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("generations")
      .select("status, output_url, error_message, duration_ms")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Generation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/job-status]", error);
    return NextResponse.json(
      { error: "Failed to fetch job status." },
      { status: 500 }
    );
  }
}
