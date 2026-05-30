"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

// Inline GitHub icon (not available in this lucide-react version)
const GitHubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
import GravityBackground from "@/components/antigravity/GravityBackground";

export default function LoginPage() {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleGitHubLogin = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setEmailSent(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center" style={{ zIndex: 2 }}>
      <GravityBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="glass-card p-8 space-y-8">
          {/* Logo + Tagline */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-500/40"
            >
              {/* Simple SVG logo mark */}
              <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9">
                <path
                  d="M16 4L28 24H4L16 4Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <circle cx="16" cy="20" r="5" fill="rgba(192,132,252,0.5)" />
              </svg>
            </motion.div>
            <div>
              <h1 className="font-syne text-3xl font-bold gradient-text">
                Antigravity
              </h1>
              <p className="text-sm text-white/40 mt-1">
                Elevate your product. Beyond gravity.
              </p>
            </div>
          </div>

          {/* Auth Options */}
          {!emailMode ? (
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                id="login-google-btn"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.08] hover:border-white/20 hover:text-white active:scale-98"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                onClick={handleGitHubLogin}
                id="login-github-btn"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
              >
                <GitHubIcon />
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-white/8" />
                <span className="text-xs text-white/20">or</span>
                <div className="flex-1 border-t border-white/8" />
              </div>

              {/* Email */}
              <button
                onClick={() => setEmailMode(true)}
                id="login-email-btn"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 px-5 py-3.5 text-sm font-medium text-violet-300 transition-all hover:bg-violet-500/10 hover:border-violet-500/40"
              >
                <Mail className="h-5 w-5" />
                Continue with Email
              </button>
            </div>
          ) : emailSent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3 py-4"
            >
              <div className="text-4xl">✉️</div>
              <h3 className="font-syne font-semibold text-white">
                Check your inbox
              </h3>
              <p className="text-sm text-white/50">
                We sent a magic link to <strong className="text-white">{email}</strong>.
                Click the link to sign in.
              </p>
              <button
                onClick={() => { setEmailMode(false); setEmailSent(false); }}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Try a different method
              </button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleMagicLink}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium uppercase tracking-widest text-white/40 mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  id="magic-link-email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                id="magic-link-submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send Magic Link"}
              </button>
              <button
                type="button"
                onClick={() => setEmailMode(false)}
                className="w-full text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                ← Back
              </button>
            </motion.form>
          )}

          <p className="text-center text-xs text-white/20">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
