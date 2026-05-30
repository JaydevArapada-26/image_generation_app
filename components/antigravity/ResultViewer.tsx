"use client";

import { motion } from "framer-motion";
import { Download, RefreshCw, Clock, Layers, Image as ImageIcon } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface ResultViewerProps {
  outputUrl: string;
  group: string;
  subgroup: string;
  resolution: string;
  aspectRatio: string;
  durationMs: number;
  onGenerateAnother: () => void;
}

export default function ResultViewer({
  outputUrl,
  group,
  subgroup,
  resolution,
  aspectRatio,
  durationMs,
  onGenerateAnother,
}: ResultViewerProps) {
  const handleDownload = async () => {
    try {
      const res = await fetch(outputUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `antigravity-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(outputUrl, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Image reveal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl shadow-violet-500/10"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={outputUrl}
          alt="Generated product visual"
          className="w-full object-contain"
          style={{ maxHeight: "600px" }}
        />

        {/* Metadata overlay badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1 text-xs text-white/70">
            <Layers className="h-3 w-3 text-violet-400" />
            {group}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1 text-xs text-white/70">
            <ImageIcon className="h-3 w-3 text-violet-400" />
            {subgroup}
          </span>
        </div>

        {/* Top-right: duration + resolution */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1 text-xs text-white/60">
            <Clock className="h-3 w-3" />
            {formatDuration(durationMs)}
          </span>
          <span className="rounded-full bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1 text-xs text-white/60">
            {resolution} · {aspectRatio}
          </span>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3"
      >
        {/* Download */}
        <button
          onClick={handleDownload}
          id="download-result-button"
          className="relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-100"
        >
          <span className="flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </span>
        </button>

        {/* Generate Another */}
        <button
          onClick={onGenerateAnother}
          id="generate-another-button"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
          New Visual
        </button>
      </motion.div>
    </motion.div>
  );
}
