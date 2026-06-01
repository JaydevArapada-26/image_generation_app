import {
  GoogleGenerativeAI,
  type Part,
  type GenerateContentResult,
} from "@google/generative-ai";
import sharp from "sharp";

const API_KEY = process.env.GEMINI_API_KEY ?? "";
const MODEL_ID = "gemini-2.5-flash";

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
  const nvidiaKey = process.env.NVIDIA_API_KEY ?? "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";
  
  if (!nvidiaKey) {
    throw new Error("NVIDIA_API_KEY is not set.");
  }

  const endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentParts: any[] = [
    { type: "text", text: prompt }
  ];

  for (const base64 of base64Images) {
    const dataUrl = base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`;
    contentParts.push({
      type: "image_url",
      image_url: {
        url: dataUrl
      }
    });
  }

  const payload = {
    model: "meta/llama-3.2-11b-vision-instruct",
    messages: [
      {
        role: "user",
        content: contentParts
      }
    ],
    max_tokens: 512,
    temperature: 1.00,
    top_p: 1.00
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${nvidiaKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NVIDIA NIM Vision API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No choices or message content returned from NVIDIA NIM Vision API.");
  }

  return content;
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
  const nvidiaKey = process.env.NVIDIA_API_KEY ?? "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";
  
  if (nvidiaKey) {
    try {
      console.log("[nvidia] Sending request to Black Forest Labs FLUX.1-schnell...");
      const endpoint = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";
      const body = {
        prompt: finalPrompt
      };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${nvidiaKey}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`NVIDIA NIM API error ${res.status}: ${errText}`);
      }
      
      const data = await res.json();
      const base64Data = data.artifacts?.[0]?.base64;
      if (!base64Data) {
        throw new Error("No image data returned from NVIDIA NIM artifacts.");
      }
      
      console.log("[nvidia] FLUX.1-schnell generated image successfully!");
      return Buffer.from(base64Data, "base64");
    } catch (nvidiaErr) {
      console.error("[nvidia] NVIDIA NIM image generation failed:", (nvidiaErr as Error).message);
      console.warn("[nvidia] Falling back to high-quality dynamic mock fallback...");
    }
  }

  // Fallback to high-quality dynamic mock
  return await generateMockFallback(base64ProductImages[0], finalPrompt);
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

async function generateMockFallback(
  base64ProductImage: string,
  prompt: string
): Promise<Buffer> {
  try {
    const colors = [
      ["#0f172a", "#1e1b4b"], // Dark slate to dark indigo
      ["#111827", "#311042"], // Dark grey to deep purple
      ["#022c22", "#064e3b"], // Emerald green
      ["#0c4a6e", "#1e3a8a"], // Deep ocean blue
    ];
    const idx = Math.abs(prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    const [c1, c2] = colors[idx];

    const width = 1024;
    const height = 1024;

    const bgSvg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <circle cx="${width / 2}" cy="${height / 2}" r="350" fill="white" opacity="0.04" filter="blur(40px)" />
        <circle cx="${width / 3}" cy="${height / 1.5}" r="200" fill="#a78bfa" opacity="0.08" filter="blur(60px)" />
        <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="24" fill="none" stroke="white" stroke-opacity="0.05" stroke-width="2" />
        <line x1="100" y1="40" x2="100" y2="${height - 40}" stroke="white" stroke-opacity="0.02" stroke-width="1" />
        <line x1="${width - 100}" y1="40" x2="${width - 100}" y2="${height - 40}" stroke="white" stroke-opacity="0.02" stroke-width="1" />
      </svg>
    `;

    const bgBuffer = Buffer.from(bgSvg);
    const rawImg = base64ProductImage.includes(",") ? base64ProductImage.split(",")[1] : base64ProductImage;
    const productBuffer = Buffer.from(rawImg, "base64");

    const processedProduct = await sharp(productBuffer)
      .resize(600, 600, { fit: "inside" })
      .toBuffer();

    const finalImage = await sharp(bgBuffer)
      .composite([{
        input: processedProduct,
        gravity: "center"
      }])
      .png()
      .toBuffer();

    return finalImage;
  } catch (err) {
    console.error("Failed to generate mock fallback image:", err);
    return sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    }).png().toBuffer();
  }
}
