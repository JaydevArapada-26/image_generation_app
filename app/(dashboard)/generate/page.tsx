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
      const mockId = crypto.randomUUID();
      setGenerationId(mockId);

      // Upload images & insert reference rows to Supabase if not in demo mode
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const isDemo = !session;

      if (!isDemo && session.user) {
        console.log("[generate] Uploading product images to Supabase storage...");
        for (const f of files) {
          const fileExtension = f.file.name.split('.').pop() ?? 'png';
          const storagePath = `${session.user.id}/${mockId}/${f.id}.${fileExtension}`;
          
          // Upload file
          const { error: uploadErr } = await supabase.storage
            .from("products")
            .upload(storagePath, f.file, { contentType: f.file.type });
          if (uploadErr) throw uploadErr;

          // Record in DB
          const { error: dbErr } = await supabase
            .from("uploaded_images")
            .insert({
              generation_id: mockId,
              storage_path: `products/${storagePath}`,
              type: "product"
            });
          if (dbErr) throw dbErr;
        }

        // Upload logo if set
        if (logoBase64) {
          console.log("[generate] Uploading company logo to Supabase storage...");
          const logoBlob = await (await fetch(logoBase64)).blob();
          const storagePath = `${session.user.id}/${mockId}/logo.png`;

          const { error: uploadErr } = await supabase.storage
            .from("logos")
            .upload(storagePath, logoBlob, { contentType: "image/png" });
          if (uploadErr) throw uploadErr;

          const { error: dbErr } = await supabase
            .from("uploaded_images")
            .insert({
              generation_id: mockId,
              storage_path: `logos/${storagePath}`,
              type: "logo"
            });
          if (dbErr) throw dbErr;
        }
      }

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
        <aside className="w-full lg:w-[420px] lg:min-h-screen border-r border-white/5 bg-[#0c0e13]/80 backdrop-blur-xl flex-shrink-0">
          <div className="sticky top-0 max-h-screen overflow-y-auto p-8 lg:p-10 space-y-10">
            <div>
              <h2 className="font-syne text-[11px] font-bold uppercase tracking-widest text-white/30 mb-5">
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
              <h2 className="font-syne text-[11px] font-bold uppercase tracking-widest text-white/30 mb-5">
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
        <main className="flex-1 p-8 lg:p-12 space-y-10 lg:space-y-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-syne text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Generate Visual
            </h1>
            <p className="text-sm lg:text-base text-white/40 mt-2">
              Upload your product · select a style · generate a commercial visual
            </p>
          </motion.div>

          {/* Upload Zone */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 lg:p-10 space-y-6 lg:space-y-8"
          >
            <h2 className="font-syne text-xs lg:text-sm font-semibold uppercase tracking-widest text-white/30">
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
