import { NextRequest, NextResponse } from "next/server";
import { classifyProduct } from "@/lib/classifier";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided." },
        { status: 400 }
      );
    }

    if (files.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 images allowed." },
        { status: 400 }
      );
    }

    // Convert files to base64
    const base64Array: string[] = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return `data:${file.type};base64,${base64}`;
      })
    );

    const result = await classifyProduct(base64Array);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/classify]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Classification failed.",
      },
      { status: 500 }
    );
  }
}
