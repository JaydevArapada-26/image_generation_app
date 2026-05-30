# Antigravity — Build Walkthrough

## What Was Built

A complete, production-structured **Next.js 16 (App Router, TypeScript strict)** application for AI-powered product visualisation using Google Gemini 2.5 Flash.

## Build Results

| Check | Result |
|---|---|
| `npm run build` | ✅ Compiled successfully (zero TS errors) |
| Dev server | ✅ Running at `http://localhost:3000` |
| All routes generated | ✅ 11 routes (static + dynamic) |

## Routes Scaffolded

| Route | Type | Purpose |
|---|---|---|
| `/login` | Static | Login page with gravity particle background |
| `/` | Static | Generation history dashboard |
| `/generate` | Static | Main generator (upload → classify → generate → result) |
| `/billing` | Static | Plan cards with Coming Soon overlays |
| `/api/classify` | Dynamic | Product image classification via Gemini |
| `/api/generate` | Dynamic | Enqueue BullMQ generation job |
| `/api/job-status/[id]` | Dynamic | Poll generation status |
| `/api/remove-bg` | Dynamic | Proxy to rembg fallback service |
| `/callback` | Dynamic | Supabase OAuth callback |

## Key Files Created

### Core Library
- [prompt-collection.ts](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/lib/prompt-collection.ts) — All 11 groups × all subgroups with full visual direction strings
- [prompt-builder.ts](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/lib/prompt-builder.ts) — Assembles master prefix + subgroup directive + logo/text rules
- [gemini.ts](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/lib/gemini.ts) — SDK wrapper with REST fallback for image generation
- [classifier.ts](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/lib/classifier.ts) — Strict-JSON classification via Gemini vision
- [queue.ts](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/lib/queue.ts) — BullMQ producer with graceful no-op when Redis absent

### Components
- [GravityBackground.tsx](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/components/antigravity/GravityBackground.tsx) — 400-particle gravity canvas, mouse repulsion, 60fps
- [ImageUploadZone.tsx](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/components/antigravity/ImageUploadZone.tsx) — Drag-drop, 4 images, auto-classify on change
- [StyleSelector.tsx](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/components/antigravity/StyleSelector.tsx) — Group + subgroup dropdowns with rich 80-char preview
- [SettingsPanel.tsx](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/components/antigravity/SettingsPanel.tsx) — Resolution tabs + aspect ratio visual cards + collapsible optionals
- [GravityProgressBar.tsx](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/components/antigravity/GravityProgressBar.tsx) — Singularity particle canvas + live stopwatch + polling
- [ResultViewer.tsx](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/components/antigravity/ResultViewer.tsx) — Spring-reveal image + download + generate-another

### Worker
- [generation.worker.ts](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/workers/generation.worker.ts) — Full BullMQ pipeline: classify → analyse ref → build prompt → Gemini → Sharp → Supabase upload

## Design System

All design tokens defined in [globals.css](file:///J:/AnthX/Image_Gen/Image_Gen(v0.1)/app/globals.css):
- `--space-black: #08090B` — page background
- `--obsidian: #111318` — card background  
- `--electric-violet: #7B5EA7` → `--neon-lavender: #C084FC` — accent gradient
- `.glass-card` — glassmorphism with violet border-on-hover
- Grain overlay via SVG filter pseudo-element
- Animated gradient text utility
- Custom violet scrollbar

## What Needs Your Credentials to Fully Work

> [!IMPORTANT]
> The app runs and the UI is fully visible right now. However, for **real AI generation** you need to fill `.env.local`:

| Variable | Get it from |
|---|---|
| `GEMINI_API_KEY` | Already set from your prompt ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → New Project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same Supabase project → Settings → API |
| `UPSTASH_REDIS_REST_URL` | [upstash.com](https://upstash.com) → New Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Same Upstash database |

After adding Supabase credentials, run the SQL migrations in `supabase/migrations/` via the Supabase SQL editor.

## Running the Worker (for real generation)

The worker runs as a separate process:

```bash
# Terminal 1 — Web server
npm run dev

# Terminal 2 — BullMQ worker (needs Redis + Supabase)
npm run worker
```

## Next Steps

1. **Add Supabase credentials** → run migrations → test OAuth login
2. **Add Upstash credentials** → start the worker → test real generation
3. **Deploy to Vercel** → push to GitHub → connect repo in Vercel dashboard
4. **Optional:** Wire PostHog and Sentry for analytics/error tracking
