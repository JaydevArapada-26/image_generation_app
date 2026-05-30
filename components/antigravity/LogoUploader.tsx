"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import { fileToBase64 } from "@/lib/utils";

interface LogoUploaderProps {
  logoBase64: string | null;
  position: string;
  onChange: (base64: string | null, position: string) => void;
}

const POSITIONS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center watermark",
];

export default function LogoUploader({ logoBase64, position, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    onChange(base64, position || "bottom-right");
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium uppercase tracking-widest text-white/40">
        Brand Logo
      </label>

      {/* Upload trigger */}
      {!logoBase64 ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
        >
          <Upload className="h-5 w-5 text-white/30" />
          <p className="text-sm text-white/50">Upload company logo (PNG with transparency)</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3"
          >
            {/* Preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoBase64} alt="logo" className="h-10 w-10 object-contain rounded" />
            <span className="text-sm text-white/60 flex-1">Logo uploaded</span>
            <button
              onClick={() => onChange(null, position)}
              className="rounded-lg p-1 hover:bg-white/10 transition-colors"
              aria-label="Remove logo"
            >
              <X className="h-4 w-4 text-white/40" />
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFile}
        id="logo-upload-input"
      />

      {/* Position selector */}
      {logoBase64 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <label className="text-xs font-medium uppercase tracking-widest text-white/40">
            Logo Position
          </label>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => onChange(logoBase64, pos)}
                id={`logo-pos-${pos.replace(/\s+/g, "-")}`}
                className={`
                  rounded-lg border px-3 py-1.5 text-xs transition-colors capitalize
                  ${position === pos
                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                    : "border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70"
                  }
                `}
              >
                {pos}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
