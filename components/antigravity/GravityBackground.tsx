"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  opacity: number;
  radius: number;
}

export default function GravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const attractorRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COUNT = 400;
    const CONNECT_DIST = 120;
    const REPEL_RADIUS = 80;
    const GRAVITY = 0.3;
    const DAMPING = 0.98;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      attractorRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
      };
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse tracker
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Attractor slowly drifts toward cursor
      attractorRef.current.x += (e.clientX - attractorRef.current.x) * 0.02;
      attractorRef.current.y += (e.clientY - attractorRef.current.y) * 0.02;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Init particles
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      mass: 0.5 + Math.random() * 1.5,
      opacity: 0.2 + Math.random() * 0.4,
      radius: 0.8 + Math.random() * 1.5,
    }));

    // Animation loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const attractor = attractorRef.current;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gravity toward attractor
        const dx = attractor.x - p.x;
        const dy = attractor.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const force = (GRAVITY * p.mass) / (dist * 0.8);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Repulsion from mouse cursor
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < REPEL_RADIUS && mdist > 0) {
          const repelForce = ((REPEL_RADIUS - mdist) / REPEL_RADIUS) * 2;
          p.vx -= (mdx / mdist) * repelForce;
          p.vy -= (mdy / mdist) * repelForce;
        }

        // Speed cap + damping
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) {
          p.vx = (p.vx / speed) * 3;
          p.vy = (p.vy / speed) * 3;
        }
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        gradient.addColorStop(0, `rgba(192, 132, 252, ${p.opacity})`);
        gradient.addColorStop(1, "rgba(123, 94, 167, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const cdx = p.x - q.x;
          const cdy = p.y - q.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < CONNECT_DIST) {
            const lineOpacity = (1 - cdist / CONNECT_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(123, 94, 167, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
