import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enqueueGeneration } from "@/lib/queue";
import type { GenerateRequestBody } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Simple in-memory rate limiter (per IP, 5 req/min) ───────────────────────
// For production, replace with Upstash Redis rate limiter.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Allow unauthenticated requests in demo mode (no Supabase configured)
    const isDemo =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "";

    if (!isDemo && (authError || !user)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body: GenerateRequestBody = await request.json();

    const {
      generationId,
      group,
      subgroup,
      productType,
      resolution,
      aspectRatio,
      shortOverlayText,
      detailedMarketingText,
      userPreferences,
      logoPosition,
      referenceStyleNotes,
    } = body;

    if (!generationId || !group || !subgroup || !resolution || !aspectRatio) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isDemo && user) {
      // Check credits
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (!profile || profile.credits <= 0) {
        return NextResponse.json(
          { error: "No credits remaining." },
          { status: 402 }
        );
      }

      // Update generation row with parameters
      await supabase
        .from("generations")
        .update({
          status: "queued",
          product_group: group,
          product_subgroup: subgroup,
          product_type: productType,
          resolution,
          aspect_ratio: aspectRatio,
          short_overlay_text: shortOverlayText ?? null,
          detailed_marketing_text: detailedMarketingText ?? null,
          user_preferences: userPreferences ?? null,
          logo_position: logoPosition ?? null,
        })
        .eq("id", generationId);
    }

    // Enqueue BullMQ job
    const jobId = await enqueueGeneration(generationId);

    return NextResponse.json({ jobId, generationId });
  } catch (error) {
    console.error("[/api/generate]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to enqueue generation.",
      },
      { status: 500 }
    );
  }
}
