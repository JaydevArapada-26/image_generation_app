"use client";

import { motion } from "framer-motion";
import { Check, Zap, Building2 } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for trying out Antigravity",
    credits: "10 generations",
    features: [
      "10 product visuals",
      "All style groups",
      "1080p resolution",
      "PNG download",
      "Basic support",
    ],
    icon: Zap,
    gradient: "from-slate-600 to-slate-700",
    active: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For creators and small brands",
    credits: "500 generations/month",
    features: [
      "500 product visuals/month",
      "All style groups & variants",
      "Up to 4K resolution",
      "Priority processing",
      "Logo compositing",
      "Reference style analysis",
      "Priority support",
    ],
    icon: Zap,
    gradient: "from-violet-600 to-purple-600",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$79",
    period: "/month",
    description: "For agencies and power users",
    credits: "Unlimited generations",
    features: [
      "Unlimited product visuals",
      "All features in Pro",
      "API access",
      "Custom style presets",
      "Team collaboration",
      "Dedicated support",
      "White-label option",
    ],
    icon: Building2,
    gradient: "from-fuchsia-600 to-violet-600",
  },
];

export default function BillingPage() {
  return (
    <div className="relative min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="font-syne text-4xl font-bold text-white mb-3">
          Choose Your Plan
        </h1>
        <p className="text-white/40 max-w-md mx-auto">
          Scale your product visualisation with Antigravity
        </p>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid gap-6 max-w-5xl mx-auto lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-card p-7 flex flex-col ${
                plan.popular ? "ring-2 ring-violet-500/40" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} mb-4`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-syne text-2xl font-bold text-white">
                  {plan.name}
                </h2>
                <p className="text-sm text-white/40 mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-syne text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
                <p className="text-xs text-violet-400 mt-1">{plan.credits}</p>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA with Coming Soon overlay */}
              <div className="relative">
                <button
                  disabled
                  className={`
                    w-full rounded-xl py-3 text-sm font-semibold transition-all
                    ${plan.popular
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                      : plan.active
                      ? "border border-white/10 bg-white/[0.03] text-white/50"
                      : "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white"
                    }
                  `}
                  id={`plan-${plan.id}-btn`}
                >
                  {plan.active ? "Current Plan" : `Get ${plan.name}`}
                </button>

                {/* Coming Soon overlay */}
                {!plan.active && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#111318]/80 backdrop-blur-sm"
                  >
                    <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-300">
                      Coming Soon
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-white/20 mt-10"
      >
        Payments powered by Stripe · Secure & encrypted · Cancel anytime
      </motion.p>
    </div>
  );
}
