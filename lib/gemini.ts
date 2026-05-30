import {
  GoogleGenerativeAI,
  type Part,
  type GenerateContentResult,
} from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY ?? "";
const MODEL_ID = "gemini-2.5-flash-preview-05-20";

function getClient() {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenerativeAI(API_KEY);
}

// ─── Helper: base64 data URL → Part ──────────────────────────────────────────

function base64ToPart(base64: string, mimeType = "image/png"): Part {
  // Accept full data URL or raw base64
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;
  return {
    inlineData: {
      mimeType,
      data: raw,
    },
  };
}

// ─── Text / Vision Analysis ───────────────────────────────────────────────────

/**
 * Analyse one or more images with Gemini vision and return a text response.
 * Used for classification and reference-style analysis.
 */
export async function analyzeImages(
  base64Images: string[],
  prompt: string
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const parts: Part[] = [
    ...base64Images.map((img) => base64ToPart(img)),
    { text: prompt },
  ];

  const result: GenerateContentResult = await model.generateContent({
    contents: [{ role: "user", parts }],
  });

  return result.response.text();
}

// ─── Image Generation ─────────────────────────────────────────────────────────

/**
 * Generate a commercial product image using Gemini image generation.
 * Falls back to direct REST API if SDK does not support responseModalities.
 */
export async function generateProductImage(
  base64ProductImages: string[],
  base64ReferenceImage: string | null,
  base64Logo: string | null,
  finalPrompt: string
): Promise<Buffer> {
  // Attempt 1: SDK with responseModalities (may not be supported in all SDK versions)
  try {
    return await generateViaSDK(
      base64ProductImages,
      base64ReferenceImage,
      base64Logo,
      finalPrompt
    );
  } catch (sdkErr) {
    console.warn(
      "[gemini] SDK image generation failed, falling back to REST:",
      (sdkErr as Error).message
    );
  }

  // Attempt 2: Direct REST API
  return await generateViaREST(
    base64ProductImages,
    base64ReferenceImage,
    base64Logo,
    finalPrompt
  );
}

async function generateViaSDK(
  base64ProductImages: string[],
  base64ReferenceImage: string | null,
  base64Logo: string | null,
  finalPrompt: string
): Promise<Buffer> {
  const genAI = getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = genAI.getGenerativeModel({ model: MODEL_ID } as any);

  const parts: Part[] = [
    ...base64ProductImages.map((img) => base64ToPart(img)),
    ...(base64ReferenceImage ? [base64ToPart(base64ReferenceImage)] : []),
    ...(base64Logo ? [base64ToPart(base64Logo)] : []),
    { text: finalPrompt },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await (model as any).generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  });

  const candidate = result.response.candidates?.[0];
  if (!candidate) throw new Error("No candidates returned from Gemini.");

  for (const part of candidate.content.parts ?? []) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image part found in Gemini response.");
}

async function generateViaREST(
  base64ProductImages: string[],
  base64ReferenceImage: string | null,
  base64Logo: string | null,
  finalPrompt: string
): Promise<Buffer> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

  const parts: object[] = [
    ...base64ProductImages.map((img) => ({
      inlineData: {
        mimeType: "image/png",
        data: img.includes(",") ? img.split(",")[1] : img,
      },
    })),
    ...(base64ReferenceImage
      ? [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64ReferenceImage.includes(",")
                ? base64ReferenceImage.split(",")[1]
                : base64ReferenceImage,
            },
          },
        ]
      : []),
    ...(base64Logo
      ? [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Logo.includes(",")
                ? base64Logo.split(",")[1]
                : base64Logo,
            },
          },
        ]
      : []),
    { text: finalPrompt },
  ];

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini REST API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const candidate = json.candidates?.[0];
  if (!candidate) throw new Error("No candidates in REST response.");

  for (const part of candidate.content?.parts ?? []) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image data in Gemini REST response.");
}
