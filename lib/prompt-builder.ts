import { type Group, PROMPT_COLLECTION } from "./prompt-collection";
import type { PromptParams } from "@/types";

// ─── Master Universal Prompt ──────────────────────────────────────────────────

const MASTER_UNIVERSAL_PROMPT = `
You are a world-class product visualisation and commercial image generation engine.
Create a premium, high-impact, polished image using the uploaded product images as the exact identity source.

MAIN GOAL
Generate a visually striking product visual that is commercially ready for social media, ecommerce, advertising, catalog, banner, or campaign use.

PRODUCT IDENTITY RULES
- Preserve the product exactly as shown in the uploaded product images.
- Keep the true shape, proportions, color, materials, branding placement, texture, and key details.
- Do not redesign the product.
- Do not invent features.
- Do not distort the product.
- Do not blur, simplify, or alter the core identity.

REFERENCE IMAGE RULES
- Use the uploaded reference image only as inspiration for mood, composition, lighting, camera angle, background treatment, atmosphere, and styling.
- Do not copy the reference image directly.
- Reinterpret the style in a fresh and original way.

PRODUCT VISUAL GOAL
The product must remain the hero subject and the most important object in the frame.
Make it sharp, premium, realistic, and highly desirable.
Keep the composition clean, intentional, and commercially polished.

LIGHTING
Use lighting that matches the selected style and enhances the product surface.
Examples: soft studio light, dramatic rim light, golden hour glow, luxury shadow play, cinematic contrast, glossy highlights, diffused illumination, or natural ambience.

COMPOSITION
Use professional ad composition with strong visual hierarchy.
Leave clean negative space where useful for text.
Use depth, contrast, and balanced framing.
The image should feel deliberately art-directed, not accidental.

REALISM
Make the image look like a high-end commercial photograph.
Use believable reflections, accurate textures, clean edges, natural shadows, and physically plausible lighting.

STYLE QUALITY
The output must feel premium, modern, refined, and suitable for a brand campaign or ecommerce listing.
No cartoon style. No sketch style. No low-quality render style. No messy background. No oversaturated look.

STRONG CONSTRAINTS
- Do not copy the reference image exactly.
- Do not change the product identity.
- Do not add unnecessary objects.
- Do not clutter the frame.
- Do not distort proportions.
- Do not make the product blurry.
- Do not use fake logos.
- Do not use random typography.
- Do not create broken anatomy if a hand is needed.
- If a hand is needed, it must be natural and anatomically correct.
`.trim();

// ─── Prompt Builder ───────────────────────────────────────────────────────────

export function buildFinalPrompt(params: PromptParams): string {
  const subgroupPrompt =
    PROMPT_COLLECTION[params.group as Group]?.[params.subgroup] ?? "";

  const logoRules = `
LOGO RULES
- If a company logo is provided, place it exactly at the selected position.
- Placement options: top-left, top-right, bottom-left, bottom-right, center watermark.
- If center watermark is selected, use approximately 10% opacity.
- The logo should feel integrated and premium, not pasted on.
`.trim();

  const textRules = `
TEXT RULES
- Include the short overlay text in a stylish, readable, and compact way.
- Include the detailed marketing text clearly and cleanly.
- Match the typography vibe to the selected group and subgroup.
- Keep text balanced so it does not overpower the product.
- Do not generate random extra text. Do not generate misspelled text. Do not add watermarks.
`.trim();

  const commonBlock = `
SCENE DIRECTIVE
Apply the following group and subgroup style:
Group: ${params.group}
Subgroup: ${params.subgroup}
Subgroup visual direction: ${subgroupPrompt}

COMMON INPUTS
Product type / classification: ${params.productType}
User optional preferences: ${params.userPreferences || "None"}
Reference image style notes: ${params.referenceStyleNotes || "None"}
Logo file: ${params.logoFileStatus}
Logo placement: ${params.logoPosition || "None"}
Short overlay text: ${params.shortOverlayText || "None"}
Detailed marketing text: ${params.detailedMarketingText || "None"}
Resolution: ${params.resolution}
Aspect ratio: ${params.aspectRatio}

OUTPUT
Generate one polished PNG-ready image with the selected resolution and aspect ratio.
The final result should look premium, realistic, and commercially ready.
`.trim();

  return [MASTER_UNIVERSAL_PROMPT, logoRules, textRules, commonBlock].join(
    "\n\n"
  );
}
