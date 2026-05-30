# Antigravity — Implementation Plan

A premium AI-powered product visualisation app built on Next.js 15 + Supabase + Gemini 2.5 Flash.

---

## User Review Required

> [!IMPORTANT]
> **Credentials / Services you need to supply before the app is fully functional:**
> - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` — create a free Supabase project at supabase.com
> - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — create a free Upstash Redis database at upstash.com
> - `NEXT_PUBLIC_POSTHOG_KEY` — optional, PostHog cloud
> - `NEXT_PUBLIC_SENTRY_DSN` — optional, Sentry cloud
> - The `GEMINI_API_KEY` shown in the prompt will be placed in `.env.local.example` only; **you must copy it to `.env.local`** to run locally.

> [!WARNING]
> **Gemini image generation** (`responseModalities: ["IMAGE"]`) is a preview feature. The current SDK approach using `@google/generative-ai` may require the REST API directly for multimodal image output. I will implement both the SDK path and a direct REST fallback and flag which one is active.

> [!CAUTION]
> The **BullMQ worker** (`workers/generation.worker.ts`) runs as a **separate Node process** (`npm run worker`). It cannot run inside Vercel serverless functions. For full production use you need a persistent server (Railway, Fly.io, or a VPS). For local dev both processes run together. I will document this clearly in the README.

---

## Open Questions

> [!IMPORTANT]
> 1. **Background removal timing** — The prompt says to run `@imgly/background-removal` in the browser immediately on drop. This is a ~20 MB WASM download on first load. Should I show a one-time "Loading AI model…" banner, or do you prefer to skip client-side BG removal and always use the `/api/remove-bg` server path instead?
> 2. **Supabase OAuth redirect URIs** — For Google/GitHub OAuth you must configure the redirect URL `http://localhost:3000/auth/callback` (and your production domain) inside the Supabase dashboard. I'll add setup instructions to the README but cannot do this programmatically.
> 3. **Phase 1 scope** — Build the **complete codebase** all at once, or should I focus first on the core generator flow (upload → classify → generate → result) and leave auth/queue/billing to Phase 2?

---

## Proposed Changes

### Phase 0 — Project Bootstrap

#### [NEW] `package.json` / Next.js 15 scaffold via `create-next-app`
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, ESLint
- Add all dependencies in one `npm install` pass

**Key dependencies:**
```
@google/generative-ai        # Gemini SDK
@supabase/supabase-js        # Supabase client
@supabase/ssr                # Supabase SSR helpers
framer-motion                # Animations
bullmq                       # Job queue
ioredis                      # Redis client (BullMQ peer dep)
@upstash/redis               # Upstash REST client
sharp                        # Server-side image processing
@imgly/background-removal    # WASM BG removal (client)
langchain                    # LangChain JS (orchestration wrapper)
@langchain/google-genai      # LangChain Gemini integration
posthog-js                   # Analytics
@sentry/nextjs               # Error tracking
tsx                          # TypeScript runner for worker
```

**Shadcn UI:** initialise with `npx shadcn@latest init` (dark theme, slate base)
Add components: button, card, badge, dialog, dropdown-menu, progress, separator, tabs, textarea, tooltip, scroll-area, skeleton

---

### Phase 1 — Core Library

#### [NEW] `types/index.ts`
All shared TypeScript types: `Generation`, `UploadedImage`, `Profile`, `ClassificationResult`, `PromptParams`, resolution/aspect-ratio constants.

#### [NEW] `lib/prompt-collection.ts`
Exact `PROMPT_COLLECTION` object from spec — all 11 groups, all subgroups.

#### [NEW] `lib/prompt-builder.ts`
`buildFinalPrompt(params)` — assembles master prefix + subgroup directive + logo rules + text rules + common block.

#### [NEW] `lib/gemini.ts`
- `analyzeImages(base64Images, prompt)` → text response via Gemini vision
- `generateProductImage(productImgs, refImg, logo, prompt)` → PNG `Buffer`
- Uses `@google/generative-ai` SDK; falls back to direct REST for image generation mode

#### [NEW] `lib/classifier.ts`
`classifyProduct(base64Array)` — calls `analyzeImages` with strict-JSON classification prompt; returns `{ productType, group, description }`.

#### [NEW] `lib/queue.ts`
BullMQ producer: `enqueueGeneration(generationId)` — pushes to `generation-queue`.

#### [NEW] `lib/supabase/client.ts` + `server.ts` + `middleware.ts`
Standard Supabase SSR helpers using `@supabase/ssr`.

#### [NEW] `lib/utils.ts`
`cn()` (clsx + tailwind-merge), `fileToBase64()`, `downloadBuffer()`, etc.

---

### Phase 2 — Database & Storage

#### [NEW] `supabase/migrations/001_init.sql`
Exact schema from spec: `profiles`, `projects`, `generations`, `uploaded_images` + RLS policies.

#### [NEW] `supabase/migrations/002_rpc.sql`
`decrement_credits(user_id UUID)` RPC function — atomically decrements credits, checks for zero.

---

### Phase 3 — API Routes

#### [NEW] `app/api/classify/route.ts`
`POST` — accepts `multipart/form-data` with up to 4 images; returns `{ productType, group, description }`.

#### [NEW] `app/api/generate/route.ts`
`POST` — verifies Supabase JWT, checks credits, updates generation status, enqueues BullMQ job, returns `{ jobId, generationId }`. Rate-limited via Upstash Redis (5 req/min per IP).

#### [NEW] `app/api/job-status/[id]/route.ts`
`GET` — returns generation row from DB; used as polling fallback.

#### [NEW] `app/api/remove-bg/route.ts`
`POST` — proxy to `rembg` Python microservice (fallback when WASM fails). Returns PNG buffer.

---

### Phase 4 — BullMQ Worker

#### [NEW] `workers/generation.worker.ts`
Full processing pipeline per spec: fetch → download → classify → analyse ref → build prompt → generate → Sharp resize → upload → update DB.

---

### Phase 5 — Components

#### [NEW] `components/antigravity/GravityBackground.tsx`
Canvas particle gravity field — 400 particles, mouse interaction, 60 fps, violet palette.

#### [NEW] `components/antigravity/ImageUploadZone.tsx`
Drag-and-drop, 4-image max, 8 MB limit, thumbnail strip, WASM BG removal per image with inline progress, calls `/api/classify` on change.

#### [NEW] `components/antigravity/ProductClassificationCard.tsx`
Displays `{ productType, group, description }` with animated reveal; skeleton during loading.

#### [NEW] `components/antigravity/StyleSelector.tsx`
Group badge (auto-selected, overridable dropdown) + Subgroup rich-option dropdown (name + 80-char preview).

#### [NEW] `components/antigravity/SettingsPanel.tsx`
Resolution tab group + Aspect ratio visual card grid + collapsible optional fields (preferences, overlay text, marketing text, logo upload + position, reference upload + auto-style-analysis).

#### [NEW] `components/antigravity/GenerateButton.tsx`
Full-width gradient violet button with glow pulse; disabled state logic.

#### [NEW] `components/antigravity/GravityProgressBar.tsx`
Canvas WebGL-style particle singularity animation + live stopwatch; subscribes to Supabase Realtime; triggers result transition on `status === 'done'`.

#### [NEW] `components/antigravity/ResultViewer.tsx`
Fade-scale reveal, download button, "Generate Another", save to project, metadata badges.

#### [NEW] `components/antigravity/LogoUploader.tsx`
Single image upload + position dropdown; returns base64 to parent.

---

### Phase 6 — Pages & Layouts

#### [NEW] `app/layout.tsx`
Root layout: Google Fonts (`Syne` + `DM Sans`), PostHog provider, Sentry init, global CSS.

#### [NEW] `app/globals.css`
Full design system: CSS custom properties for all colours, grain overlay texture, glassmorphism utilities, custom scrollbar.

#### [NEW] `app/(auth)/login/page.tsx`
Full-screen dark luxury login: `GravityBackground`, Antigravity logo, 3 OAuth buttons with Supabase Auth triggers, magic-link email flow.

#### [NEW] `app/(auth)/callback/route.ts`
Supabase OAuth callback handler (code exchange).

#### [NEW] `app/(dashboard)/layout.tsx`
Auth guard (redirect to `/login` if no session) + sidebar nav (Generate / History / Settings / Billing).

#### [NEW] `app/(dashboard)/page.tsx`
Generation history grid: thumbnails, status badges, date, group/subgroup. Click → result modal. Credits counter in sidebar.

#### [NEW] `app/(dashboard)/generate/page.tsx`
Main generator page: sections A–F assembled from components (described in spec §9).

#### [NEW] `app/(dashboard)/billing/page.tsx`
Three plan cards with "Coming Soon" overlays. No Stripe calls wired.

---

### Phase 7 — Config & Assets

#### [NEW] `next.config.ts`
Image domains for Supabase Storage, experimental `serverActions`, Sentry webpack plugin.

#### [NEW] `tailwind.config.ts`
Extended colour palette (`space-black`, `obsidian`, `electric-violet`, `neon-lavender`), custom font families (`syne`, `dm-sans`), animation keyframes (`gravity-pulse`, `particle-float`, `glow-ring`).

#### [NEW] `vercel.json`
Function max durations per spec.

#### [NEW] `.env.local.example`
All env vars with comments.

#### [NEW] `public/antigravity-logo.svg`
Custom SVG logo.

#### [NEW] `public/gemini-logo.svg`
Google Gemini logo SVG.

#### [NEW] `middleware.ts`
Supabase session refresh on every request.

---

## Verification Plan

### Automated Tests
- `npm run build` — must pass with zero TypeScript errors
- `npm run dev` — app starts, login page renders with particle background
- Navigate to `/generate` — upload zone, style selector, settings panel all render

### Manual Verification
1. Drop a product image → background removal animation → classification card appears
2. Select group/subgroup → settings panel → click Generate → progress bar with stopwatch appears
3. (Requires valid API keys) Generation completes → result viewer shows image → download works
4. Login page: OAuth buttons render, email magic link form works
5. Dashboard: history grid loads, credits counter shows
6. Billing: plan cards show with "Coming Soon" badges
