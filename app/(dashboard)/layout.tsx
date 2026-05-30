"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, History, Settings, CreditCard, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/generate", label: "Generate", icon: Zap },
  { href: "/", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen" style={{ position: "relative", zIndex: 2 }}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/5 bg-[#0c0e13]/95 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
            <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5">
              <path d="M16 4L28 24H4L16 4Z" fill="white" fillOpacity="0.9" />
              <circle cx="16" cy="20" r="5" fill="rgba(192,132,252,0.5)" />
            </svg>
          </div>
          <span className="font-syne text-lg font-bold text-white">Antigravity</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`
                    relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors
                    ${active
                      ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-violet-500/15"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 ${active ? "text-violet-400" : ""}`} />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Credits + Logout */}
        <div className="border-t border-white/5 px-4 py-4 space-y-3">
          <div className="rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/40">Credits</span>
              <span className="text-xs font-semibold text-violet-300">Free Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>
              <span className="text-xs font-mono text-white/50">8/10</span>
            </div>
          </div>

          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            id="sidebar-logout-btn"
            onClick={async () => {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
