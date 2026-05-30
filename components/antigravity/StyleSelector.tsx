"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { GROUPS, PROMPT_COLLECTION } from "@/lib/prompt-collection";
import { truncate } from "@/lib/utils";

interface StyleSelectorProps {
  selectedGroup: string;
  selectedSubgroup: string;
  onGroupChange: (group: string) => void;
  onSubgroupChange: (subgroup: string) => void;
}

export default function StyleSelector({
  selectedGroup,
  selectedSubgroup,
  onGroupChange,
  onSubgroupChange,
}: StyleSelectorProps) {
  const [groupOpen, setGroupOpen] = useState(false);
  const [subgroupOpen, setSubgroupOpen] = useState(false);

  const subgroups = selectedGroup
    ? Object.keys(PROMPT_COLLECTION[selectedGroup as (typeof GROUPS)[number]] ?? {})
    : [];

  const handleGroupSelect = useCallback(
    (group: string) => {
      onGroupChange(group);
      // Auto-select first subgroup
      const firstSub = Object.keys(
        PROMPT_COLLECTION[group as (typeof GROUPS)[number]] ?? {}
      )[0];
      if (firstSub) onSubgroupChange(firstSub);
      setGroupOpen(false);
    },
    [onGroupChange, onSubgroupChange]
  );

  const handleSubgroupSelect = useCallback(
    (sub: string) => {
      onSubgroupChange(sub);
      setSubgroupOpen(false);
    },
    [onSubgroupChange]
  );

  return (
    <div className="space-y-4">
      {/* Group Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-widest text-white/40">
          Style Group
        </label>
        <div className="relative">
          <button
            onClick={() => {
              setGroupOpen((v) => !v);
              setSubgroupOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
            id="style-group-selector"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" />
              <span className={selectedGroup ? "text-white" : "text-white/30"}>
                {selectedGroup || "Select a style group…"}
              </span>
            </div>
            {groupOpen ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </button>

          <AnimatePresence>
            {groupOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto py-1">
                  {GROUPS.map((group) => (
                    <button
                      key={group}
                      onClick={() => handleGroupSelect(group)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm transition-colors
                        ${group === selectedGroup
                          ? "bg-violet-500/20 text-violet-300"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subgroup Selector */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="text-xs font-medium uppercase tracking-widest text-white/40">
              Style Variant
            </label>
            <div className="relative">
              <button
                onClick={() => {
                  setSubgroupOpen((v) => !v);
                  setGroupOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
                id="style-subgroup-selector"
              >
                <span className={selectedSubgroup ? "text-white" : "text-white/30"}>
                  {selectedSubgroup || "Select a style variant…"}
                </span>
                {subgroupOpen ? (
                  <ChevronUp className="h-4 w-4 text-white/40" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white/40" />
                )}
              </button>

              <AnimatePresence>
                {subgroupOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    <div className="max-h-72 overflow-y-auto py-1">
                      {subgroups.map((sub) => {
                        const preview =
                          PROMPT_COLLECTION[
                            selectedGroup as (typeof GROUPS)[number]
                          ]?.[sub] ?? "";
                        return (
                          <button
                            key={sub}
                            onClick={() => handleSubgroupSelect(sub)}
                            className={`
                              w-full px-4 py-3 text-left transition-colors
                              ${sub === selectedSubgroup
                                ? "bg-violet-500/20"
                                : "hover:bg-white/5"
                              }
                            `}
                          >
                            <div
                              className={`text-sm font-medium ${
                                sub === selectedSubgroup
                                  ? "text-violet-300"
                                  : "text-white/80"
                              }`}
                            >
                              {sub}
                            </div>
                            <div className="text-xs text-white/30 mt-0.5 leading-relaxed">
                              {truncate(preview, 80)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
