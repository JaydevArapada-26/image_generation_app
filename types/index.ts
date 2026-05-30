// ─── Supabase DB Row Types ────────────────────────────────────────────────────

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: "free" | "pro" | "business";
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export type GenerationStatus = "queued" | "processing" | "done" | "failed";

export interface Generation {
  id: string;
  project_id: string | null;
  user_id: string;
  status: GenerationStatus;
  product_group: string | null;
  product_subgroup: string | null;
  product_type: string | null;
  resolution: string | null;
  aspect_ratio: string | null;
  short_overlay_text: string | null;
  detailed_marketing_text: string | null;
  logo_position: string | null;
  user_preferences: string | null;
  output_url: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface UploadedImage {
  id: string;
  generation_id: string;
  storage_path: string;
  type: "product" | "reference" | "logo";
  created_at: string;
}

// ─── AI / Classification ──────────────────────────────────────────────────────

export interface ClassificationResult {
  productType: string;
  group: string;
  description: string;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

export interface PromptParams {
  group: string;
  subgroup: string;
  productType: string;
  referenceStyleNotes: string;
  userPreferences: string;
  logoFileStatus: string;
  logoPosition: string;
  shortOverlayText: string;
  detailedMarketingText: string;
  resolution: string;
  aspectRatio: string;
}

// ─── Resolution & Aspect Ratio ────────────────────────────────────────────────

export interface ResolutionDef {
  width: number;
  height: number;
}

export interface AspectRatioDef {
  ratio: number;
  label: string;
}

export const RESOLUTIONS: Record<string, ResolutionDef> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
  "2160p": { width: 3840, height: 2160 },
};

export const ASPECT_RATIOS: Record<string, AspectRatioDef> = {
  "Square (1:1)": { ratio: 1 / 1, label: "Instagram post, Facebook ad" },
  "Standard (4:3)": { ratio: 4 / 3, label: "Photo, presentation slide" },
  "Portrait (3:4)": { ratio: 3 / 4, label: "Mobile photo, Pinterest" },
  "Landscape (16:9)": { ratio: 16 / 9, label: "YouTube video, presentation" },
  "Story (9:16)": { ratio: 9 / 16, label: "Instagram Reel, Story, TikTok" },
  "Ultrawide (21:9)": { ratio: 21 / 9, label: "Cinematic video" },
  "Classic (3:2)": { ratio: 3 / 2, label: "DSLR photo, blog" },
  "Portrait (2:3)": { ratio: 2 / 3, label: "Portrait photo" },
  "Portrait (4:5)": { ratio: 4 / 5, label: "Instagram post" },
  "Classic (5:4)": { ratio: 5 / 4, label: "Print, photo" },
};

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface GenerateRequestBody {
  generationId: string;
  group: string;
  subgroup: string;
  productType: string;
  resolution: string;
  aspectRatio: string;
  shortOverlayText?: string;
  detailedMarketingText?: string;
  userPreferences?: string;
  logoPosition?: string;
  referenceStyleNotes?: string;
}

export interface JobStatusResponse {
  status: GenerationStatus;
  output_url?: string | null;
  error_message?: string | null;
  duration_ms?: number | null;
}

// ─── BullMQ Job Data ──────────────────────────────────────────────────────────

export interface GenerationJobData {
  generationId: string;
}
