"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

interface GravityProgressBarProps {
  generationId: string;
  onComplete: (outputUrl: string) => void;
  onError: (message: string) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hue: number;
}

export default function GravityProgressBar({
  generationId,
  onComplete,
  onError,
}: GravityProgressBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());
  const doneRef = useRef(false);
  const explosingRef = useRef(false);

  // ─── Polling fallback (Supabase Realtime optional) ───────────────────────────
  const poll = useCallback(async () => {
    if (doneRef.current) return;

    try {
      const res = await fetch(`/api/job-status/${generationId}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.status === "done") {
        doneRef.current = true;
        explosingRef.current = true;
        setTimeout(() => onComplete(data.output_url ?? ""), 1200);
      } else if (data.status === "failed") {
        doneRef.current = true;
        onError(data.error_message ?? "Generation failed.");
      }
    } catch {
      // Ignore polling errors
    }
  }, [generationId, onComplete, onError]);

  // Poll every 2 seconds
  useEffect(() => {
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [poll]);

  // Stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Canvas Particle Singularity ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const SINGULARITY_RADIUS = 8;

    const spawnParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 120;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: 80 + Math.random() * 60,
        radius: 1 + Math.random() * 2.5,
        hue: 260 + Math.random() * 60, // violet to fuchsia
      };
    };

    particlesRef.current = Array.from({ length: 80 }, spawnParticle);

    const draw = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw singularity core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, SINGULARITY_RADIUS * 3);
      if (!explosingRef.current) {
        coreGrad.addColorStop(0, "rgba(192,132,252,0.9)");
        coreGrad.addColorStop(0.4, "rgba(123,94,167,0.5)");
        coreGrad.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        coreGrad.addColorStop(0, "rgba(255,255,255,1)");
        coreGrad.addColorStop(0.3, "rgba(192,132,252,0.8)");
        coreGrad.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.beginPath();
      ctx.arc(cx, cy, SINGULARITY_RADIUS * (explosingRef.current ? 6 : 1), 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Pulsing ring
      const time = Date.now() / 1000;
      const ringRadius = SINGULARITY_RADIUS + 6 + Math.sin(time * 3) * 3;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(192,132,252,${0.2 + Math.sin(time * 3) * 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Spawn new particles
      if (!explosingRef.current && particlesRef.current.length < 120) {
        particlesRef.current.push(spawnParticle());
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        if (p.life > p.maxLife) return false;

        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!explosingRef.current) {
          // Pull toward singularity
          const force = 0.4 / (dist * 0.1);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        } else {
          // Explode outward
          p.vx -= (dx / dist) * 2;
          p.vy -= (dy / dist) * 2;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.8;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        grad.addColorStop(0, `hsla(${p.hue},80%,70%,${alpha})`);
        grad.addColorStop(1, "hsla(270,80%,50%,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        return true;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6"
    >
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl"
        style={{ height: 200 }}
      />
      {/* Stopwatch */}
      <div className="text-center">
        <div className="font-mono text-3xl font-bold text-violet-300 tabular-nums">
          {formatDuration(elapsed)}
        </div>
        <p className="text-sm text-white/40 mt-1">
          {explosingRef.current
            ? "Almost ready…"
            : "AI generating your product visual…"}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-violet-400"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
