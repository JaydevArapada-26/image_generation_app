"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, History, Settings, CreditCard, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/generate", label: "Generate", icon: Zap },
  { href: "/", label: "History", icon: History },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#050608]" style={{ position: "relative", zIndex: 2 }}>
      {/* Mobile Header */}
      <header className="flex lg:hidden items-center justify-between border-b border-white/5 bg-[#0a0b10]/90 px-4 py-3.5 sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg">
            <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
              <path d="M16 4L28 24H4L16 4Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="font-syne text-md font-bold text-white">Antigravity</span>
        </div>
        <div className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`p-2 rounded-lg transition-colors ${active ? "text-violet-400 bg-violet-500/10 border border-violet-500/15" : "text-white/40 hover:text-white/60"}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Sidebar (Desktop only) */}
      <aside className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-white/5 bg-[#08090d]/95 backdrop-blur-3xl transition-all duration-300 ${isCollapsed ? "w-[72px]" : "w-64"}`}>
        
        {/* Retractable floating toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-7 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0c0e14] text-white/50 hover:text-white transition-colors cursor-pointer shadow-md"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Logo */}
        <div className={`flex items-center border-b border-white/5 py-6 transition-all duration-300 overflow-hidden ${isCollapsed ? "justify-center px-4" : "gap-3 px-6"}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30 flex-shrink-0">
            <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5">
              <path d="M16 4L28 24H4L16 4Z" fill="white" fillOpacity="0.9" />
              <circle cx="16" cy="20" r="5" fill="rgba(192,132,252,0.5)" />
            </svg>
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-syne text-lg font-bold text-white tracking-tight"
            >
              Antigravity
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 space-y-1.5 py-6 transition-all duration-300 overflow-hidden ${isCollapsed ? "px-2" : "px-4"}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: isCollapsed ? 0 : 3 }}
                  className={`
                    relative flex items-center rounded-xl transition-all cursor-pointer
                    ${isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3 text-sm"}
                    ${active
                      ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                    }
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-violet-500/5"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4.5 w-4.5 relative z-10 ${active ? "text-violet-400" : "text-white/40"}`} />
                  {!isCollapsed && (
                    <span className="relative z-10 font-medium font-outfit">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Credits + Logout */}
        <div className={`border-t border-white/5 py-6 space-y-4 transition-all duration-300 overflow-hidden ${isCollapsed ? "px-2" : "px-5"}`}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-white/[0.02] border border-white/5 px-4 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40 font-medium">Credits</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">Free</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </div>
                <span className="text-xs font-mono text-white/50 font-medium">8/10</span>
              </div>
            </motion.div>
          )}

          <button
            className={`flex w-full items-center rounded-xl text-sm text-white/30 hover:text-white/60 transition-colors cursor-pointer ${isCollapsed ? "justify-center p-3" : "gap-2.5 px-4 py-2.5"}`}
            id="sidebar-logout-btn"
            onClick={async () => {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && (
              <span className="font-medium font-outfit">Sign out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? "lg:ml-[72px]" : "lg:ml-64"}`}>
        {children}
      </main>
    </div>
  );
}
