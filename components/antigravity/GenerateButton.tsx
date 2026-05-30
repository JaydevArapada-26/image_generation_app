"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function GenerateButton({
  onClick,
  disabled,
  loading,
}: GenerateButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      id="generate-button"
      className={`
        relative w-full overflow-hidden rounded-2xl px-8 py-5 text-base font-semibold
        transition-all duration-300 font-syne tracking-wide
        ${
          disabled || loading
            ? "cursor-not-allowed bg-white/5 text-white/20 border border-white/5"
            : "cursor-pointer text-white shadow-2xl shadow-violet-500/30"
        }
      `}
    >
      {/* Gradient background (active state) */}
      {!disabled && !loading && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          />
          {/* Glow ring on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 ring-2 ring-violet-400"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            animate={{ translateX: ["−100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          />
        </>
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
            Generating…
          </>
        ) : disabled ? (
          <>
            <Sparkles className="h-5 w-5" />
            Upload product images to generate
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate Visual
          </>
        )}
      </span>
    </motion.button>
  );
}
