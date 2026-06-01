"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GravityBackground from "@/components/antigravity/GravityBackground";
import ImageUploadZone from "@/components/antigravity/ImageUploadZone";
import ProductClassificationCard from "@/components/antigravity/ProductClassificationCard";
import StyleSelector from "@/components/antigravity/StyleSelector";
import SettingsPanel from "@/components/antigravity/SettingsPanel";
import GenerateButton from "@/components/antigravity/GenerateButton";
import GravityProgressBar from "@/components/antigravity/GravityProgressBar";
import ResultViewer from "@/components/antigravity/ResultViewer";
import { PROMPT_COLLECTION, GROUPS } from "@/lib/prompt-collection";
import type { ClassificationResult } from "@/types";

type AppState = "idle" | "generating" | "done" | "error";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

export default function GeneratePage() {
  // ─── Upload & Classification ─────────────────────────────────────────────────
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [classifying, setClassifying] = useState(false);

  // ─── Style Selection ─────────────────────────────────────────────────────────
  const [group, setGroup] = useState<string>("");
  const [subgroup, setSubgroup] = useState<string>("");

  // ─── Settings ────────────────────────────────────────────────────────────────
  const [resolution, setResolution] = useState("1080p");
  const [aspectRatio, setAspectRatio] = useState("Landscape (16:9)");
  const [userPreferences, setUserPreferences] = useState("");
  const [shortOverlayText, setShortOverlayText] = useState("");
  const [detailedMarketingText, setDetailedMarketingText] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState("bottom-right");
  const [refStyleNotes, setRefStyleNotes] = useState("");

  // ─── Generation State ────────────────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>("idle");
  const [generationId, setGenerationId] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [genDurationMs, setGenDurationMs] = useState(0);
  const [genStartTime, setGenStartTime] = useState(0);

  // ─── Classification callback ─────────────────────────────────────────────────
  const handleClassification = useCallback((result: ClassificationResult) => {
    setClassification(result);
    setClassifying(false);

    // Auto-set group from classification
    const validGroup = GROUPS.find((g) => g === result.group);
    if (validGroup) {
      setGroup(validGroup);
      const firstSub = Object.keys(
        PROMPT_COLLECTION[validGroup] ?? {}
      )[0];
      if (firstSub) setSubgroup(firstSub);
    }
  }, []);

  const handleFilesChange = useCallback((newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) setClassifying(true);
    if (newFiles.length === 0) {
      setClassification(null);
      setClassifying(false);
    }
  }, []);

  // ─── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (files.length === 0 || !group || !subgroup) return;

    setAppState("generating");
    setGenStartTime(Date.now());

    try {
      // In demo mode (no Supabase): generate a mock ID and call API
      const mockId = crypto.randomUUID();
      setGenerationId(mockId);

      const body = {
        generationId: mockId,
        group,
        subgroup,
        productType: classification?.productType ?? "product",
        resolution,
        aspectRatio,
        shortOverlayText: shortOverlayText || undefined,
        detailedMarketingText: detailedMarketingText || undefined,
        userPreferences: userPreferences || undefined,
        logoPosition: logoBase64 ? logoPosition : undefined,
        referenceStyleNotes: refStyleNotes || undefined,
      };

      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      setAppState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to start generation.");
    }
  };

  const handleComplete = useCallback(
    (url: string) => {
      setOutputUrl(url);
      setGenDurationMs(Date.now() - genStartTime);
      setAppState("done");
    },
    [genStartTime]
  );

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setAppState("error");
  }, []);

  const handleGenerateAnother = useCallback(() => {
    setAppState("idle");
    setOutputUrl("");
    setErrorMsg("");
    setGenerationId("");
  }, []);

  const canGenerate = files.length > 0 && !!group && !!subgroup;

  return (
    <div className="relative min-h-screen">
      <GravityBackground />

      {/* Page content */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-0 min-h-screen">
        {/* ─── Left Sidebar: Settings ─── */}
        <aside className="w-full lg:w-[380px] lg:min-h-screen border-r border-white/5 bg-[#0c0e13]/80 backdrop-blur-xl flex-shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto p-6 space-y-8">
            <div>
              <h2 className="font-syne text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                Style
              </h2>
              <StyleSelector
                selectedGroup={group}
                selectedSubgroup={subgroup}
                onGroupChange={setGroup}
                onSubgroupChange={setSubgroup}
              />
            </div>

            <div className="border-t border-white/5" />

            <div>
              <h2 className="font-syne text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
                Settings
              </h2>
              <SettingsPanel
                resolution={resolution}
                aspectRatio={aspectRatio}
                onResolutionChange={setResolution}
                onAspectRatioChange={setAspectRatio}
                userPreferences={userPreferences}
                onUserPreferencesChange={setUserPreferences}
                shortOverlayText={shortOverlayText}
                onShortOverlayTextChange={setShortOverlayText}
                detailedMarketingText={detailedMarketingText}
                onDetailedMarketingTextChange={setDetailedMarketingText}
                logoBase64={logoBase64}
                logoPosition={logoPosition}
                onLogoChange={(b64, pos) => {
                  setLogoBase64(b64);
                  setLogoPosition(pos);
                }}
                onReferenceAnalysed={(notes) => setRefStyleNotes(notes)}
              />
            </div>
          </div>
        </aside>

        {/* ─── Main Area ─── */}
        <main className="flex-1 p-6 lg:p-8 space-y-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-syne text-3xl font-bold text-white">
              Generate Visual
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Upload your product · select a style · generate a commercial visual
            </p>
          </motion.div>

          {/* Upload Zone */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-5"
          >
            <h2 className="font-syne text-sm font-semibold uppercase tracking-widest text-white/30">
              Product Images
            </h2>
            <ImageUploadZone
              onClassification={handleClassification}
              onFilesChange={handleFilesChange}
            />
            <ProductClassificationCard
              result={classification}
              loading={classifying}
            />
          </motion.section>

          {/* Model Info Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3"
          >
            {/* NVIDIA logo placeholder */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <span className="text-[10px] font-bold text-white">N</span>
            </div>
            <span className="text-sm font-mono text-white/40">
              black-forest-labs/flux.1-schnell
            </span>
            <span className="ml-auto rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-xs text-green-400 font-mono">
              nvidia-nim
            </span>
          </motion.div>

          {/* Generate / Progress / Result */}
          <AnimatePresence mode="wait">
            {appState === "idle" || appState === "error" ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <GenerateButton
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                />
                {appState === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                  >
                    {errorMsg}
                  </motion.div>
                )}
                {!canGenerate && files.length > 0 && (
                  <p className="text-center text-xs text-white/30">
                    Select a style group and variant to continue
                  </p>
                )}
              </motion.div>
            ) : appState === "generating" ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GravityProgressBar
                  generationId={generationId}
                  onComplete={handleComplete}
                  onError={handleError}
                />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ResultViewer
                  outputUrl={outputUrl}
                  group={group}
                  subgroup={subgroup}
                  resolution={resolution}
                  aspectRatio={aspectRatio}
                  durationMs={genDurationMs}
                  onGenerateAnother={handleGenerateAnother}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
