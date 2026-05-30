"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Sparkles, AlertCircle } from "lucide-react";
import { fileToBase64 } from "@/lib/utils";
import type { ClassificationResult } from "@/types";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
  bgRemovedBase64?: string;
  bgRemoving?: boolean;
}

interface ImageUploadZoneProps {
  onClassification: (result: ClassificationResult) => void;
  onFilesChange: (files: UploadedFile[]) => void;
}

export default function ImageUploadZone({
  onClassification,
  onFilesChange,
}: ImageUploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 4;
  const MAX_SIZE_MB = 8;

  const classify = useCallback(
    async (uploadedFiles: UploadedFile[]) => {
      if (uploadedFiles.length === 0) return;
      setClassifying(true);
      setClassifyError(null);

      try {
        const formData = new FormData();
        uploadedFiles.forEach((f) => formData.append("images", f.file));

        const res = await fetch("/api/classify", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Classification failed.");
        }

        const result: ClassificationResult = await res.json();
        onClassification(result);
      } catch (err) {
        setClassifyError(
          err instanceof Error ? err.message : "Classification failed."
        );
      } finally {
        setClassifying(false);
      }
    },
    [onClassification]
  );

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const valid = arr.filter((f) => {
        if (!f.type.match(/^image\/(jpeg|png|webp)$/)) return false;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
        return true;
      });

      const remaining = MAX_FILES - files.length;
      const toAdd = valid.slice(0, remaining);

      const processed: UploadedFile[] = await Promise.all(
        toAdd.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            base64,
          };
        })
      );

      const updated = [...files, ...processed];
      setFiles(updated);
      onFilesChange(updated);

      // Trigger classification
      await classify(updated);
    },
    [files, classify, onFilesChange]
  );

  const removeFile = useCallback(
    (id: string) => {
      const updated = files.filter((f) => f.id !== id);
      setFiles(updated);
      onFilesChange(updated);
      if (updated.length > 0) classify(updated);
    },
    [files, classify, onFilesChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.005 }}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
          p-10 cursor-pointer transition-all duration-300
          ${isDragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/10 bg-white/[0.02] hover:border-violet-500/50 hover:bg-violet-500/5"
          }
        `}
      >
        <motion.div
          animate={isDragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="rounded-full bg-violet-500/10 p-4"
        >
          <Upload className="h-8 w-8 text-violet-400" />
        </motion.div>
        <div className="text-center">
          <p className="font-semibold text-white">
            Drop your product images here
          </p>
          <p className="text-sm text-white/40 mt-1">
            JPEG, PNG, WEBP · Max 4 images · Max 8 MB each
          </p>
        </div>
        {files.length > 0 && (
          <span className="absolute top-3 right-3 text-xs text-white/30">
            {files.length} / {MAX_FILES}
          </span>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          id="product-image-upload"
        />
      </motion.div>

      {/* Thumbnails */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-4 gap-3"
          >
            {files.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group rounded-xl overflow-hidden aspect-square bg-white/5 border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.bgRemovedBase64 ?? f.preview}
                  alt="product"
                  className="w-full h-full object-contain"
                />
                {f.bgRemoving && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-4 w-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
                      <span className="text-[10px] text-white/60">BG…</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classification loading state */}
      <AnimatePresence>
        {classifying && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-3 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3"
          >
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
            <span className="text-sm text-violet-300">
              AI is classifying your product…
            </span>
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {classifyError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {classifyError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
