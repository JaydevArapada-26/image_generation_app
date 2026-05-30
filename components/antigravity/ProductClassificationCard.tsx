"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tag, Box, Sparkles } from "lucide-react";
import type { ClassificationResult } from "@/types";

interface ProductClassificationCardProps {
  result: ClassificationResult | null;
  loading?: boolean;
}

export default function ProductClassificationCard({
  result,
  loading,
}: ProductClassificationCardProps) {
  if (!loading && !result) return null;

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3"
        >
          {/* Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-violet-500/20 animate-pulse" />
            <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
            <div className="h-6 w-32 rounded-full bg-white/10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-white/5 animate-pulse" />
          </div>
        </motion.div>
      ) : result ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-5 space-y-3"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20"
            >
              <Sparkles className="h-5 w-5 text-violet-400" />
            </motion.div>
            <h3 className="font-syne font-semibold text-white">
              Product Classified
            </h3>
          </div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300 border border-violet-500/30">
              <Box className="h-3 w-3" />
              {result.productType}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60 border border-white/10">
              <Tag className="h-3 w-3" />
              {result.group}
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/50 leading-relaxed"
          >
            {result.description}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
