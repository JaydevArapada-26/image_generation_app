import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fallback background removal proxy.
 * Expects multipart/form-data with a single "image" file field.
 * Forwards to a local rembg microservice at REMBG_URL (default: http://localhost:7000/api/remove).
 */
export async function POST(request: NextRequest) {
  const rembgUrl =
    process.env.REMBG_URL ?? "http://localhost:7000/api/remove";

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Forward to rembg service
    const forwardForm = new FormData();
    forwardForm.append("file", imageFile);

    const res = await fetch(rembgUrl, {
      method: "POST",
      body: forwardForm,
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `rembg service error: ${text}` },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[/api/remove-bg]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Background removal failed.",
      },
      { status: 500 }
    );
  }
}
