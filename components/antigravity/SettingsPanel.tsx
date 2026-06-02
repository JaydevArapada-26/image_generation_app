"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Wand2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { RESOLUTIONS, ASPECT_RATIOS } from "@/types";
import { fileToBase64 } from "@/lib/utils";
import LogoUploader from "./LogoUploader";

interface SettingsPanelProps {
  resolution: string;
  aspectRatio: string;
  onResolutionChange: (r: string) => void;
  onAspectRatioChange: (a: string) => void;
  userPreferences: string;
  onUserPreferencesChange: (v: string) => void;
  shortOverlayText: string;
  onShortOverlayTextChange: (v: string) => void;
  detailedMarketingText: string;
  onDetailedMarketingTextChange: (v: string) => void;
  logoBase64: string | null;
  logoPosition: string;
  onLogoChange: (base64: string | null, position: string) => void;
  onReferenceAnalysed: (notes: string, preview: string) => void;
}

export default function SettingsPanel({
  resolution,
  aspectRatio,
  onResolutionChange,
  onAspectRatioChange,
  userPreferences,
  onUserPreferencesChange,
  shortOverlayText,
  onShortOverlayTextChange,
  detailedMarketingText,
  onDetailedMarketingTextChange,
  logoBase64,
  logoPosition,
  onLogoChange,
  onReferenceAnalysed,
}: SettingsPanelProps) {
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [refAnalysed, setRefAnalysed] = useState<string | null>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const handleReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysing(true);
    try {
      const base64 = await fileToBase64(file);
      const preview = URL.createObjectURL(file);

      const formData = new FormData();
      formData.append("images", file);

      const res = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      let styleNotes = "Elegant, premium photographic style.";
      if (res.ok) {
        const data = await res.json();
        styleNotes = data.description ?? styleNotes;
      }

      setRefAnalysed(styleNotes.slice(0, 80) + "…");
      onReferenceAnalysed(styleNotes, preview);
    } catch {
      setRefAnalysed("Style analysed.");
    } finally {
      setAnalysing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Resolution */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          Resolution
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.keys(RESOLUTIONS).map((res) => (
            <button
              key={res}
              onClick={() => onResolutionChange(res)}
              id={`resolution-${res}`}
              className={`
                rounded-xl border px-3 py-3 text-center text-sm transition-all duration-300 cursor-pointer
                ${resolution === res
                  ? "border-violet-500 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-500/5"
                  : "border-white/5 bg-white/[0.01] text-white/40 hover:border-white/10 hover:text-white/60"
                }
              `}
            >
              <div className="font-semibold font-outfit">{res}</div>
              <div className="text-[9px] text-white/20 mt-1 font-mono">
                {RESOLUTIONS[res].width}×{RESOLUTIONS[res].height}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(ASPECT_RATIOS).map(([key, def]) => {
            const ratio = def.ratio;
            const maxW = 28;
            const w = ratio >= 1 ? maxW : Math.round(maxW * ratio);
            const h = ratio >= 1 ? Math.round(maxW / ratio) : maxW;

            return (
              <button
                key={key}
                onClick={() => onAspectRatioChange(key)}
                id={`aspect-${key.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
                className={`
                  flex flex-col items-center gap-2.5 rounded-xl border px-3 py-3.5 text-center transition-all duration-300 cursor-pointer
                  ${aspectRatio === key
                    ? "border-violet-500 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-500/5"
                    : "border-white/5 bg-white/[0.01] text-white/40 hover:border-white/10 hover:text-white/60"
                  }
                `}
              >
                {/* Visual Ratio Indicator */}
                <div
                  className={`rounded border transition-all ${
                    aspectRatio === key ? "border-violet-400 bg-violet-400/20" : "border-white/10 bg-white/5"
                  }`}
                  style={{ width: w, height: h }}
                />
                <div>
                  <div className="text-xs font-semibold leading-tight font-outfit">{key}</div>
                  <div className="text-[9px] text-white/20 mt-1 leading-tight font-mono">
                    {def.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Settings Toggle */}
      <button
        onClick={() => setOptionalOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 text-sm text-white/50 hover:text-white/70 hover:border-white/10 transition-all cursor-pointer"
        id="optional-settings-toggle"
      >
        <span className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-violet-400" />
          <span className="font-medium font-outfit">Optional Settings</span>
        </span>
        {optionalOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {optionalOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 overflow-hidden"
          >
            {/* User Preferences */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Additional Preferences
              </label>
              <textarea
                value={userPreferences}
                onChange={(e) => onUserPreferencesChange(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Describe any additional preferences… (e.g. warm lighting, product tilted 30°)"
                id="user-preferences-textarea"
                className="w-full rounded-xl border border-white/10 bg-white/[0.01] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20 resize-none font-outfit"
              />
              <p className="text-right text-[10px] text-white/20 font-mono">
                {userPreferences.length} / 300
              </p>
            </div>

            {/* Short Overlay Text */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Short Overlay Text
              </label>
              <input
                type="text"
                value={shortOverlayText}
                onChange={(e) => onShortOverlayTextChange(e.target.value)}
                placeholder="50% OFF · SALE · NEW ARRIVAL"
                id="short-overlay-text"
                className="w-full rounded-xl border border-white/10 bg-white/[0.01] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20 font-outfit"
              />
            </div>

            {/* Detailed Marketing Text */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Detailed Marketing Text
              </label>
              <textarea
                value={detailedMarketingText}
                onChange={(e) => onDetailedMarketingTextChange(e.target.value)}
                rows={3}
                placeholder="Handcrafted with sustainable materials, designed for the modern professional…"
                id="detailed-marketing-text"
                className="w-full rounded-xl border border-white/10 bg-white/[0.01] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20 resize-none font-outfit"
              />
            </div>

            {/* Logo Upload */}
            <LogoUploader
              logoBase64={logoBase64}
              position={logoPosition}
              onChange={onLogoChange}
            />

            {/* Reference Post Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Reference Post
              </label>
              <div
                onClick={() => refInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              >
                <ImageIcon className="h-5 w-5 text-white/30" />
                <div className="flex-1">
                  <p className="text-xs text-white/40 leading-relaxed font-outfit">
                    Upload a reference post for style inspiration
                  </p>
                  {analysing && (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
                      <span className="text-[10px] text-violet-400 font-mono">
                        Analysing style…
                      </span>
                    </div>
                  )}
                  {refAnalysed && !analysing && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      <span className="text-[10px] text-green-400 font-mono">
                        Style analysed: {refAnalysed}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={refInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleReferenceUpload}
                id="reference-image-upload"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
