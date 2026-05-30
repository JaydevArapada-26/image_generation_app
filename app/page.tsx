"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, UploadCloud, ShieldCheck, Zap } from "lucide-react";
import GravityBackground from "@/components/antigravity/GravityBackground";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#08090B] text-white">
      {/* Immersive gravitational particle system background */}
      <GravityBackground />

      {/* SVG Grain / Noise Overlay for premium texture */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015] mix-blend-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Glowing Ambient Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />

      {/* Navigation Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/20">
            <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6">
              <path d="M16 4L28 24H4L16 4Z" fill="white" fillOpacity="0.9" />
              <circle cx="16" cy="20" r="5" fill="rgba(192,132,252,0.5)" />
            </svg>
          </div>
          <span className="font-syne text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Antigravity
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="text-sm font-medium text-white/75 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
          </Link>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-white/5 border border-white/10 hover:border-white/20 px-5 py-2 text-sm font-semibold text-white shadow-lg transition-all"
            >
              Launch App
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs text-violet-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Product Visualisation Engine</span>
          </div>

          {/* Majestic Hero Typography */}
          <h1 className="font-syne text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="block text-white">Elevate your product.</span>
            <span className="block gradient-text">Beyond gravity.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-white/50 leading-relaxed font-sans">
            Instantly transform raw product photos into high-converting, studio-grade commercial visuals using Google Gemini and our custom AI composition layers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50"
              >
                Start Generating Free <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-24"
        >
          {/* Card 1 */}
          <div className="glass-card p-6 text-left space-y-4 hover:border-violet-500/20 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <UploadCloud className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="font-syne font-semibold text-lg">1. Upload Product</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Upload any image of your item. We support automatic background removal and subject classification.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 text-left space-y-4 hover:border-violet-500/20 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="font-syne font-semibold text-lg">2. Compose & Direct</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Choose your theme, resolution, branding text, and let our pipeline generate the perfect context.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 text-left space-y-4 hover:border-violet-500/20 transition-all duration-300">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="font-syne font-semibold text-lg">3. Grab the Spotlight</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Download premium, studio-grade visual assets tailored for social media ads and marketing campaigns.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center text-xs text-white/30 font-sans">
        <p>© {new Date().getFullYear()} Antigravity. Built with Next.js & Google Gemini.</p>
      </footer>
    </div>
  );
}
