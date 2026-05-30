"use client";

import { motion } from "framer-motion";
import { Clock, ImageIcon, Layers } from "lucide-react";
import GravityBackground from "@/components/antigravity/GravityBackground";
import Link from "next/link";

// Mock history data for demo
const MOCK_HISTORY = [
  { id: "1", group: "Studio & Minimalist", subgroup: "Dark Luxury Studio", status: "done", date: "2025-05-28", thumb: null },
  { id: "2", group: "Tech & Futuristic", subgroup: "Neon Glow", status: "done", date: "2025-05-27", thumb: null },
  { id: "3", group: "Food & Beverage", subgroup: "Overhead Flat-Lay", status: "processing", date: "2025-05-27", thumb: null },
];

const STATUS_STYLES: Record<string, string> = {
  done: "bg-green-500/10 text-green-400 border border-green-500/20",
  processing: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  queued: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <GravityBackground />
      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-syne text-3xl font-bold text-white">
              Generation History
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Your past product visuals
            </p>
          </div>
          <Link href="/generate">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30"
              id="new-generation-btn"
            >
              + New Visual
            </motion.button>
          </Link>
        </motion.div>

        {/* Grid */}
        {MOCK_HISTORY.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="rounded-full bg-violet-500/10 p-6 mb-4">
              <ImageIcon className="h-10 w-10 text-violet-400" />
            </div>
            <h3 className="font-syne text-xl font-semibold text-white mb-2">
              No visuals yet
            </h3>
            <p className="text-sm text-white/40 max-w-xs">
              Upload a product image and generate your first commercial visual.
            </p>
            <Link href="/generate">
              <button className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white">
                Start Generating
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {MOCK_HISTORY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card overflow-hidden cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-violet-500/10 to-indigo-500/5 flex items-center justify-center group-hover:from-violet-500/20 transition-colors">
                  {item.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-violet-400/30" />
                  )}
                </div>

                {/* Meta */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.subgroup}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Layers className="h-3 w-3 text-white/30 shrink-0" />
                        <span className="text-xs text-white/30 truncate">{item.group}</span>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${STATUS_STYLES[item.status]}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-white/20">
                    <Clock className="h-3 w-3" />
                    {item.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
