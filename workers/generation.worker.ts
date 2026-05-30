/**
 * Antigravity — BullMQ Generation Worker
 * Run with: npm run worker
 *
 * NOTE: This worker requires:
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   - GEMINI_API_KEY
 */

import { Worker, type Job } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { generateProductImage, analyzeImages } from "../lib/gemini";
import { classifyProduct } from "../lib/classifier";
import { buildFinalPrompt } from "../lib/prompt-builder";
import { QUEUE_NAME } from "../lib/queue";
import { RESOLUTIONS, ASPECT_RATIOS } from "../types";
import type { GenerationJobData } from "../types";

// ─── Supabase Service Client ──────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

// ─── Redis Connection ─────────────────────────────────────────────────────────

function getRedisConnection() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  const parsedUrl = new URL(url);

  return {
    host: parsedUrl.hostname,
    port: parseInt(parsedUrl.port || "6379"),
    password: token,
    tls: parsedUrl.protocol === "https:" ? {} : undefined,
  };
}

// ─── Reference Style Analysis ─────────────────────────────────────────────────

async function analyzeReferenceStyle(base64Image: string): Promise<string> {
  const prompt = `Describe the photographic style, lighting mood, color palette, composition technique, 
and atmospheric qualities of this image in 3-4 sentences. Focus only on visual style, not product content.`;
  return await analyzeImages([base64Image], prompt);
}

// ─── Image Processing with Sharp ─────────────────────────────────────────────

async function processImage(
  buffer: Buffer,
  resolution: string,
  aspectRatio: string
): Promise<Buffer> {
  const resDef = RESOLUTIONS[resolution];
  if (!resDef) throw new Error(`Unknown resolution: ${resolution}`);

  const ratioDef = ASPECT_RATIOS[aspectRatio];
  if (!ratioDef) throw new Error(`Unknown aspect ratio: ${aspectRatio}`);

  // Calculate target dimensions from resolution + aspect ratio
  let targetWidth = resDef.width;
  let targetHeight = Math.round(targetWidth / ratioDef.ratio);

  // Cap height to resolution height
  if (targetHeight > resDef.height) {
    targetHeight = resDef.height;
    targetWidth = Math.round(targetHeight * ratioDef.ratio);
  }

  return await sharp(buffer)
    .resize(targetWidth, targetHeight, {
      fit: "cover",
      position: "center",
    })
    .png({ quality: 95, compressionLevel: 6 })
    .toBuffer();
}

// ─── Main Job Processor ───────────────────────────────────────────────────────

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { generationId } = job.data;
  const startTime = Date.now();

  console.log(`[worker] Processing generation: ${generationId}`);

  // 1. Fetch generation row
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .single();

  if (genError || !generation) {
    throw new Error(`Generation not found: ${generationId}`);
  }

  // 2. Update status to processing
  await supabase
    .from("generations")
    .update({ status: "processing" })
    .eq("id", generationId);

  // 3. Fetch uploaded images
  const { data: uploads } = await supabase
    .from("uploaded_images")
    .select("*")
    .eq("generation_id", generationId);

  const productUploads = (uploads ?? []).filter((u) => u.type === "product");
  const referenceUpload = (uploads ?? []).find((u) => u.type === "reference");
  const logoUpload = (uploads ?? []).find((u) => u.type === "logo");

  if (productUploads.length === 0) {
    throw new Error("No product images found for this generation.");
  }

  // 4. Download images from Supabase Storage
  async function downloadImage(path: string, bucket: string): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) throw new Error(`Failed to download ${path}: ${error?.message}`);
    const buffer = await data.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
  }

  const productBase64Array = await Promise.all(
    productUploads.map((u) => downloadImage(u.storage_path, "products"))
  );

  const referenceBase64 = referenceUpload
    ? await downloadImage(referenceUpload.storage_path, "references")
    : null;

  const logoBase64 = logoUpload
    ? await downloadImage(logoUpload.storage_path, "logos")
    : null;

  // 5. Classify product if needed
  let productType = generation.product_type;
  if (!productType) {
    const classification = await classifyProduct(productBase64Array);
    productType = classification.productType;

    await supabase
      .from("generations")
      .update({ product_type: productType })
      .eq("id", generationId);
  }

  // 6. Analyse reference style if provided
  let referenceStyleNotes = "";
  if (referenceBase64) {
    referenceStyleNotes = await analyzeReferenceStyle(referenceBase64);
  }

  // 7. Build final prompt
  const finalPrompt = buildFinalPrompt({
    group: generation.product_group ?? "Studio & Minimalist",
    subgroup: generation.product_subgroup ?? "E-commerce White",
    productType: productType ?? "product",
    referenceStyleNotes,
    userPreferences: generation.user_preferences ?? "",
    logoFileStatus: logoBase64 ? "Logo provided" : "No logo",
    logoPosition: generation.logo_position ?? "",
    shortOverlayText: generation.short_overlay_text ?? "",
    detailedMarketingText: generation.detailed_marketing_text ?? "",
    resolution: generation.resolution ?? "1080p",
    aspectRatio: generation.aspect_ratio ?? "Landscape (16:9)",
  });

  // 8. Generate image via Gemini
  console.log(`[worker] Calling Gemini image generation...`);
  const rawBuffer = await generateProductImage(
    productBase64Array,
    referenceBase64,
    logoBase64,
    finalPrompt
  );

  // 9. Process with Sharp (resize to resolution + aspect ratio)
  const processedBuffer = await processImage(
    rawBuffer,
    generation.resolution ?? "1080p",
    generation.aspect_ratio ?? "Landscape (16:9)"
  );

  // 10. Optionally composite logo with Sharp
  let finalBuffer = processedBuffer;
  if (logoBase64 && generation.logo_position) {
    try {
      finalBuffer = await compositeLogo(
        processedBuffer,
        logoBase64,
        generation.logo_position
      );
    } catch (logoErr) {
      console.warn("[worker] Logo compositing failed:", logoErr);
    }
  }

  // 11. Upload to Supabase Storage
  const outputPath = `${generation.user_id}/${generationId}/output.png`;
  const { error: uploadError } = await supabase.storage
    .from("generated")
    .upload(outputPath, finalBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 12. Get public URL
  const { data: urlData } = supabase.storage
    .from("generated")
    .getPublicUrl(outputPath);

  const outputUrl = urlData.publicUrl;

  // 13. Decrement credits via RPC
  try {
    await supabase.rpc("decrement_credits", { p_user_id: generation.user_id });
  } catch (creditErr) {
    console.warn("[worker] Credit decrement failed:", creditErr);
  }

  // 14. Update generation row to done
  const durationMs = Date.now() - startTime;
  await supabase
    .from("generations")
    .update({
      status: "done",
      output_url: outputUrl,
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  console.log(
    `[worker] Generation ${generationId} completed in ${durationMs}ms`
  );
}

// ─── Logo Compositing ─────────────────────────────────────────────────────────

async function compositeLogo(
  imageBuffer: Buffer,
  logoBase64: string,
  position: string
): Promise<Buffer> {
  const logoData = logoBase64.includes(",")
    ? Buffer.from(logoBase64.split(",")[1], "base64")
    : Buffer.from(logoBase64, "base64");

  const { width: imgW = 1920, height: imgH = 1080 } = await sharp(
    imageBuffer
  ).metadata();

  const logoMaxSize = Math.round(Math.min(imgW, imgH) * 0.15);
  const logoBuffer = await sharp(logoData)
    .resize(logoMaxSize, logoMaxSize, { fit: "inside" })
    .png()
    .toBuffer();

  const { width: logoW = 0, height: logoH = 0 } =
    await sharp(logoBuffer).metadata();

  const padding = Math.round(Math.min(imgW, imgH) * 0.03);

  let gravity: sharp.Gravity;
  let top: number, left: number;

  const isCenterWatermark = position === "center watermark";

  if (isCenterWatermark) {
    top = Math.round((imgH - logoH) / 2);
    left = Math.round((imgW - logoW) / 2);
    gravity = "center";
  } else {
    switch (position) {
      case "top-left":
        top = padding;
        left = padding;
        gravity = "northwest";
        break;
      case "top-right":
        top = padding;
        left = imgW - logoW - padding;
        gravity = "northeast";
        break;
      case "bottom-left":
        top = imgH - logoH - padding;
        left = padding;
        gravity = "southwest";
        break;
      case "bottom-right":
      default:
        top = imgH - logoH - padding;
        left = imgW - logoW - padding;
        gravity = "southeast";
        break;
    }
  }

  // For center watermark: reduce opacity to ~10%
  let finalLogo = logoBuffer;
  if (isCenterWatermark) {
    finalLogo = await sharp(logoBuffer)
      .ensureAlpha()
      .modulate({ brightness: 1 })
      .composite([
        {
          input: Buffer.from(
            new Uint8Array(
              await sharp(logoBuffer).ensureAlpha().raw().toBuffer()
            ).map((v, i) => (i % 4 === 3 ? Math.round(v * 0.1) : v))
          ),
          raw: { width: logoW, height: logoH, channels: 4 },
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();
  }

  return await sharp(imageBuffer)
    .composite([{ input: finalLogo, top, left }])
    .png()
    .toBuffer();
}

// ─── Worker Boot ──────────────────────────────────────────────────────────────

const redisConnection = getRedisConnection();

const worker = new Worker<GenerationJobData>(
  QUEUE_NAME,
  processJob,
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed.`);
});

worker.on("failed", async (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);

  if (job?.data.generationId) {
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: err.message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.data.generationId);
  }
});

console.log("[worker] Antigravity generation worker started.");
