import { analyzeImages } from "./gemini";
import { GROUPS } from "./prompt-collection";
import type { ClassificationResult } from "@/types";

const CLASSIFICATION_PROMPT = `
You are a product classification AI. Analyse the uploaded product image(s) carefully.

Return ONLY valid JSON with exactly this structure (no markdown, no code fences, no extra text):
{
  "productType": "<short product type, e.g. 'perfume bottle', 'running shoe', 'ceramic mug'>",
  "group": "<one of the exact group names listed below>",
  "description": "<2-3 sentence product description focusing on appearance, materials, and key features>"
}

Available groups (choose the single most appropriate one):
${GROUPS.map((g) => `- "${g}"`).join("\n")}

Rules:
- productType must be concise (2-5 words max).
- group must be one of the exact strings above.
- description must be 2-3 sentences, focused on visual and commercial aspects.
- Respond ONLY with the JSON object. Nothing else.
`.trim();

export async function classifyProduct(
  imageBase64Array: string[]
): Promise<ClassificationResult> {
  const raw = await analyzeImages(imageBase64Array, CLASSIFICATION_PROMPT);

  // Strip any accidental markdown fencing
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: ClassificationResult;
  try {
    parsed = JSON.parse(cleaned) as ClassificationResult;
  } catch {
    console.error("[classifier] Failed to parse JSON:", cleaned);
    // Return a safe fallback so the UI doesn't break
    return {
      productType: "Unknown product",
      group: "Studio & Minimalist",
      description:
        "A commercial product suitable for professional product photography.",
    };
  }

  // Validate group is one of the known groups
  const validGroup = GROUPS.find((g) => g === parsed.group);
  if (!validGroup) {
    parsed.group = "Studio & Minimalist";
  }

  return {
    productType: parsed.productType || "Unknown product",
    group: parsed.group || "Studio & Minimalist",
    description: parsed.description || "",
  };
}
