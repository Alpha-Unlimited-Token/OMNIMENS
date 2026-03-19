/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Wallet, Zap, Star, Shield, ChevronRight, CheckCircle2,
  TrendingUp, RefreshCw, Gift, CreditCard, AlertTriangle,
  Terminal, Globe, GitBranch, Cpu, FileCode, Flame, Code2, Rocket,
  Brain, Eye, Network, Activity, Sparkles,
} from "lucide-react";
import { useGetOmnimensStatus, useGetOmnimensPricing } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { SEO, seoData } from "@/components/seo";

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = (path: string) => `/api${path}`;

function useBilling() {
  return useQuery({
    queryKey: ["/api/omnimens/billing"],
    queryFn: async () => {
      const r = await fetch(API("/omnimens/billing"), { credentials: "include" });
      if (!r.ok) return null;
      return r.json();
    },
    retry: false,
  });
}

function useSetupWallet() {
  return useMutation({
    mutationFn: async () => {
      const r = await fetch(API("/omnimens/setup-wallet"), { method: "POST", credentials: "include" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      return d as { url: string };
    },
  });
}

function useConfirmWallet() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const r = await fetch(API("/omnimens/confirm-wallet"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      return d as { ok: boolean; last4?: string; brand?: string };
    },
  });
}

function useManageBilling() {
  return useMutation({
    mutationFn: async () => {
      const r = await fetch(API("/omnimens/portal"), { method: "POST", credentials: "include" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to open billing portal");
      return d as { url: string };
    },
  });
}

function useRemoveWallet() {
  return useMutation({
    mutationFn: async () => {
      const r = await fetch(API("/omnimens/remove-wallet"), { method: "POST", credentials: "include" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      return d;
    },
  });
}

function useCheckout() {
  return useMutation({
    mutationFn: async (priceId: string) => {
      const r = await fetch(API("/omnimens/checkout"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Checkout failed");
      return d as { url: string };
    },
  });
}

function useSubscribePlan() {
  return useMutation({
    mutationFn: async (planId: string) => {
      const r = await fetch(API("/omnimens/subscribe-plan"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Subscription failed");
      return d as { url: string };
    },
  });
}

function useConfirmPlan() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const r = await fetch(API("/omnimens/confirm-plan"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to confirm plan");
      return d as { ok: boolean; planLabel: string; creditsAdded: number; newBalance: number };
    },
  });
}

function useManualTopup() {
  return useMutation({
    mutationFn: async (amountCents: number) => {
      const r = await fetch(API("/omnimens/topup"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Payment failed");
      return d as { ok: boolean; creditsAdded: number; newBalance: number };
    },
  });
}

function useResonanceBalance() {
  return useQuery({
    queryKey: ["/api/omnimens/resonance/balance"],
    queryFn: async () => {
      const r = await fetch(API("/omnimens/resonance/balance"), { credentials: "include" });
      if (!r.ok) return null;
      return r.json() as Promise<{ resonanceCredits: number; resonanceTotalEarned: number; sessionsRemaining: number }>;
    },
    retry: false,
  });
}

function usePurchaseResonance() {
  return useMutation({
    mutationFn: async (packId: string) => {
      const r = await fetch(API("/omnimens/resonance/purchase"), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Purchase failed");
      return d as { ok: boolean; creditsAdded: number };
    },
  });
}

const RESONANCE_PACKS_UI = [
  { id: "resonance_10",  price: "$10",  credits: 1100,  bonus: "+10% bonus",  sessions: "~27 sessions", featured: false },
  { id: "resonance_25",  price: "$25",  credits: 2875,  bonus: "+15% bonus",  sessions: "~71 sessions", featured: true },
  { id: "resonance_50",  price: "$50",  credits: 6000,  bonus: "+20% bonus",  sessions: "~150 sessions", featured: false },
  { id: "resonance_100", price: "$100", credits: 12500, bonus: "+25% bonus",  sessions: "~312 sessions", featured: false },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function MonthlyPlans({
  plans,
  isAuthenticated,
  onSubscribe,
  isSubscribing,
  subscribingId,
  setLocation,
}: {
  plans: any[];
  isAuthenticated: boolean;
  onSubscribe: (planId: string, priceId: string) => void;
  isSubscribing: boolean;
  subscribingId: string | null;
  setLocation: (p: string) => void;
}) {
  const colorMap: Record<string, { border: string; bg: string; badge: string; btn: string }> = {
    blue:   { border: "border-blue-500/40",   bg: "bg-blue-500/5",   badge: "text-blue-400 border-blue-500/30 bg-blue-500/10",   btn: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30" },
    violet: { border: "border-primary/50",    bg: "bg-primary/5",    badge: "text-primary border-primary/30 bg-primary/10",       btn: "bg-primary text-black hover:bg-primary/90" },
    amber:  { border: "border-amber-400/40",  bg: "bg-amber-400/5",  badge: "text-amber-400 border-amber-400/30 bg-amber-400/10", btn: "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30" },
  };

  return (
    <div className="w-full max-w-5xl mb-14">
      <div className="flex items-center gap-3 mb-2">
        <Rocket className="w-5 h-5 text-primary" />
        <h2 className="font-mono font-bold text-white tracking-widest text-sm">MONTHLY PLANS — GUARANTEED MRR FOR US, GREAT VALUE FOR YOU</h2>
      </div>
      <p className="text-xs font-mono text-white/82 mb-6 pl-8">Subscribe once. Credits renew every month. Cancel anytime.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan: any) => {
          const c = colorMap[plan.color] || colorMap.violet;
          const busy = isSubscribing && subscribingId === plan.id;
          return (
            <div key={plan.id} className={`relative rounded-2xl border p-7 transition-all ${c.border} ${c.bg}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black font-mono text-xs font-bold px-3 py-1 rounded-full tracking-widest">
                  MOST POPULAR
                </div>
              )}
              <div className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 font-mono text-xs font-bold tracking-widest mb-4 ${c.badge}`}>
                <Flame className="w-3 h-3" />
                {plan.label}
              </div>
              <div className="font-mono font-black text-white text-4xl mb-0.5">{plan.price}</div>
              <div className="text-xs font-mono text-white/82 mb-1">per month</div>
              <div className="font-mono text-white/85 text-sm mb-5">
                <span className="text-white font-bold">{plan.creditsPerMonth.toLocaleString()}</span> credits every month
              </div>
              <ul className="space-y-2 mb-7">
                {plan.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-mono text-white/80">
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${i === 0 ? "text-green-400" : "text-white/80"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (!isAuthenticated) { setLocation("/login"); return; }
                  if (!plan.priceId) { return; }
                  onSubscribe(plan.id, plan.priceId);
                }}
                disabled={busy || !plan.priceId}
                className={`w-full py-3 rounded-xl font-mono font-bold text-sm tracking-widest transition-all disabled:opacity-50 ${c.btn}`}
              >
                {busy ? "OPENING..." : !plan.priceId ? "COMING SOON" : isAuthenticated ? `SUBSCRIBE ${plan.label}` : "SIGN IN TO SUBSCRIBE"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs font-mono text-white/80 text-center mt-4">
        Monthly subscription · Cancel anytime · Billed via Stripe · Credits don't carry over between cycles (base $20 free grant does)
      </p>
    </div>
  );
}

function DevToolCosts({ costs }: { costs: any[] }) {
  const icons: Record<string, React.ReactNode> = {
    "CODE EXECUTION": <Terminal className="w-4 h-4 text-green-400" />,
    "WEB FETCH":      <Globe className="w-4 h-4 text-blue-400" />,
    "GIT OPERATION":  <GitBranch className="w-4 h-4 text-orange-400" />,
    "SYSTEM INFO":    <Cpu className="w-4 h-4 text-purple-400" />,
    "FILE OPERATION": <FileCode className="w-4 h-4 text-cyan-400" />,
  };

  return (
    <div className="w-full max-w-5xl mb-10">
      <div className="flex items-center gap-3 mb-2">
        <Code2 className="w-4 h-4 text-green-400" />
        <h2 className="font-mono font-bold text-white tracking-widest text-xs">DEVELOPER PLATFORM TOOL COSTS</h2>
      </div>
      <p className="text-xs font-mono text-white/82 mb-4 pl-7">Charged per invocation from your credit balance. No external APIs — pure compute.</p>
      <div className="bg-black/30 border border-white/8 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 px-6 py-3 border-b border-white/5 text-xs font-mono text-white/82 tracking-widest">
          <div className="col-span-2">TOOL</div>
          <div className="text-center">CREDITS</div>
          <div className="text-right">USD VALUE</div>
        </div>
        {costs.map((c: any, i: number) => (
          <div key={c.label} className={`grid grid-cols-4 px-6 py-3.5 items-center ${i < costs.length - 1 ? "border-b border-white/5" : ""}`}>
            <div className="col-span-2 flex items-center gap-3">
              {icons[c.label] ?? <Terminal className="w-4 h-4 text-white/80" />}
              <div>
                <div className="font-mono text-white text-xs font-bold">{c.label}</div>
                <div className="font-mono text-white/80 text-xs">{c.desc}</div>
              </div>
            </div>
            <div className="text-center font-mono font-bold text-white">{c.credits} cr</div>
            <div className="text-right font-mono text-white/82 text-xs">${c.dollarValue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Gift className="w-6 h-6" />,
      title: "$20 FREE EVERY MONTH",
      body: "Every account receives 2,000 free credits at the start of each month. No card required. Earn more through loyalty bonuses.",
    },
    {
      num: "02",
      icon: <Rocket className="w-6 h-6" />,
      title: "SUBSCRIBE OR BUY CREDITS",
      body: "Subscribe for guaranteed monthly credits + premium features. Or buy one-time credit packs that never expire — your choice.",
    },
    {
      num: "03",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "EARN LOYALTY BONUSES",
      body: "The more you spend, the more free credits you earn next month. Power users can earn up to $500 free monthly.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
      {steps.map((s, i) => (
        <div key={i} className="relative bg-black/30 border border-white/8 rounded-2xl p-7">
          <div className="absolute -top-4 left-6 bg-black border border-white/10 rounded-full px-3 py-1 font-mono text-xs text-white/75">
            {s.num}
          </div>
          <div className="text-primary mb-4">{s.icon}</div>
          <div className="font-mono font-bold text-white tracking-widest text-sm mb-2">{s.title}</div>
          <p className="text-xs font-mono text-white/85 leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function UsageCostTable({ costs }: { costs: { label: string; credits: number; dollarValue: string }[] }) {
  return (
    <div className="w-full max-w-5xl mb-10">
      <h2 className="font-mono font-bold text-white tracking-widest text-xs mb-4">AI USAGE COSTS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {costs.map(c => (
          <div key={c.label} className="bg-black/30 border border-white/8 rounded-xl p-4 text-center">
            <div className="text-xs font-mono text-white/75 mb-2 tracking-wider">{c.label}</div>
            <div className="font-bold text-white font-mono text-lg">{c.credits}</div>
            <div className="text-xs font-mono text-white/85">credits · ${c.dollarValue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoyaltyTable({ tiers }: { tiers: any[] }) {
  return (
    <div className="w-full max-w-5xl mb-16">
      <div className="flex items-center gap-3 mb-5">
        <Star className="w-4 h-4 text-accent" />
        <h2 className="font-mono font-bold text-white tracking-widest text-sm">MONTHLY LOYALTY BONUSES</h2>
        <span className="text-xs font-mono text-white/75">(based on prior month's paid spend)</span>
      </div>
      <div className="bg-black/30 border border-white/8 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 px-6 py-3 border-b border-white/5 text-xs font-mono text-white/75 tracking-widest">
          <div>TIER</div>
          <div className="text-center">MIN SPEND</div>
          <div className="text-right">FREE CREDITS NEXT MONTH</div>
        </div>
        {tiers.map((t, i) => (
          <div key={t.label} className={`grid grid-cols-3 px-6 py-4 ${i < tiers.length - 1 ? "border-b border-white/5" : ""}`}>
            <div className="font-mono font-bold tracking-widest text-sm">
              <span className={
                t.label === "LEGEND" ? "text-accent glow-text-gold" :
                t.label === "PRIME" || t.label === "APEX+" ? "text-primary" :
                t.label === "ELITE" ? "text-blue-400" :
                "text-white/85"
              }>{t.label}</span>
            </div>
            <div className="text-center font-mono text-sm">
              ${t.minSpendDollars}{t.maxSpendDollars ? `–$${t.maxSpendDollars}` : "+"}
            </div>
            <div className="text-right font-mono text-sm">
              <span className="text-green-400 font-bold">${t.bonusDollars} free</span>
              <span className="text-white/75 ml-1">({t.bonusCredits.toLocaleString()} cr)</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs font-mono text-white/85 mt-3 px-1">
        Free credits granted on the 1st of each month based on the prior month's paid usage.
        Base $20 is given to every user regardless of spend.
      </p>
    </div>
  );
}

function WalletPanel({
  billing, onConnect, onRemove, onTopup, onManageBilling,
  isConnecting, isRemoving, isTopupping, isManagingBilling,
}: {
  billing: any; onConnect: () => void; onRemove: () => void;
  onTopup: (cents: number) => void; onManageBilling: () => void;
  isConnecting: boolean; isRemoving: boolean; isTopupping: boolean; isManagingBilling: boolean;
}) {
  const topupOptions = [
    { cents: 500,  label: "$5",  credits: 500  },
    { cents: 1000, label: "$10", credits: 1000 },
    { cents: 1500, label: "$15", credits: 1500 },
    { cents: 2000, label: "$20", credits: 2000 },
    { cents: 2500, label: "$25", credits: 2500 },
    { cents: 3000, label: "$30", credits: 3000 },
    { cents: 4000, label: "$40", credits: 4000 },
    { cents: 5000, label: "$50", credits: 5000 },
  ];

  const hasWallet = billing?.hasWallet;
  const card = billing?.card;

  return (
    <div className="w-full max-w-5xl mb-10">
      <h2 className="font-mono font-bold text-white tracking-widest text-xs mb-4">YOUR WALLET</h2>
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
          <div>
            <div className="text-xs font-mono text-white/75 tracking-widest mb-1">CREDIT BALANCE</div>
            <div className="text-3xl font-black text-white font-mono">
              {billing?.credits?.toLocaleString() ?? "—"}
              <span className="text-sm text-white/75 font-normal ml-2">credits</span>
            </div>
            <div className="text-xs font-mono text-white/75 mt-1">
              ≈ {Math.floor((billing?.credits ?? 0) / 10)} chat messages
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white/75 tracking-widest mb-1">THIS MONTH SPEND</div>
            <div className="text-xl font-bold text-white">${billing?.currentMonthSpendDollars ?? "0.00"}</div>
            <div className="text-xs font-mono text-white/85 mt-1">
              next bonus: <span className="text-green-400">${billing?.nextBonusCredits ? (billing.nextBonusCredits / 100).toFixed(0) : "20"} free</span>
            </div>
          </div>
        </div>

        {hasWallet ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs font-mono text-white/75 tracking-widest mb-0.5">SAVED CARD</div>
                <div className="font-mono text-white font-bold">
                  {card?.brand?.toUpperCase() ?? "CARD"} •••• {card?.last4 ?? "????"}
                </div>
                <div className="text-xs font-mono text-green-400 mt-0.5">✓ Auto-topup enabled</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onManageBilling} disabled={isManagingBilling} variant="ghost" size="sm"
                className="text-white/82 hover:text-white hover:bg-white/10 border border-white/15 font-mono text-xs">
                {isManagingBilling ? "OPENING..." : "MANAGE BILLING"}
              </Button>
              <Button onClick={onRemove} disabled={isRemoving} variant="ghost" size="sm"
                className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 font-mono text-xs">
                {isRemoving ? "REMOVING..." : "REMOVE WALLET"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white/85" />
              </div>
              <div>
                <div className="text-xs font-mono text-white/75 tracking-widest mb-0.5">NO WALLET CONNECTED</div>
                <div className="text-xs font-mono text-white/85">
                  Connect a card to continue using OMNIMENS after free credits run out
                </div>
              </div>
            </div>
            <Button onClick={onConnect} disabled={isConnecting} className="font-mono text-sm whitespace-nowrap">
              {isConnecting ? "OPENING..." : "CONNECT WALLET"}
            </Button>
          </div>
        )}

        {hasWallet && (
          <div>
            <div className="text-xs font-mono text-white/75 tracking-widest mb-3">ADD CREDITS NOW</div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {topupOptions.map(opt => (
                <button key={opt.cents} onClick={() => onTopup(opt.cents)} disabled={isTopupping}
                  className="bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-3 text-center transition-all font-mono disabled:opacity-50">
                  <div className="text-base font-black text-white">{opt.label}</div>
                  <div className="text-[10px] text-white/75 mt-0.5">{opt.credits} cr</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!hasWallet && (
          <div className="text-center">
            <p className="text-xs font-mono text-white/75 mb-4">
              You still have <span className="text-white">{billing?.credits ?? 0} free credits</span> remaining.
              Connect your wallet so usage never gets interrupted.
            </p>
            <Button onClick={onConnect} disabled={isConnecting} size="lg" className="font-mono px-8">
              {isConnecting ? "OPENING STRIPE..." : "CONNECT WALLET — FREE TO SET UP"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(searchString);

  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { data: pricing, isLoading: pricingLoading } = useGetOmnimensPricing();
  const { data: billing, isLoading: billingLoading, refetch: refetchBilling } = useBilling();

  const { mutate: setupWallet,   isPending: isConnecting }     = useSetupWallet();
  const { mutate: confirmWallet }                               = useConfirmWallet();
  const { mutate: removeWallet,  isPending: isRemoving }        = useRemoveWallet();
  const { mutate: manageBilling, isPending: isManagingBilling } = useManageBilling();
  const { mutate: manualTopup,   isPending: isTopupping }       = useManualTopup();
  const { mutate: checkout,      isPending: isCheckingOut,   variables: checkoutVar } = useCheckout();
  const { mutate: subscribePlan, isPending: isSubscribing,   variables: subscribeVar } = useSubscribePlan();
  const { mutate: confirmPlan }                                 = useConfirmPlan();

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 7000);
  };

  const isOwner    = (status as any)?.isOwner;
  const pricingData = pricing as any;

  // ── Handle return from Stripe ─────────────────────────────────────────────

  useEffect(() => {
    const walletResult = searchParams.get("wallet");
    const packSuccess  = searchParams.get("pack_success");
    const packCancel   = searchParams.get("pack_cancelled");
    const planSuccess  = searchParams.get("plan_success");
    const planCancel   = searchParams.get("plan_cancelled");
    const sessionId    = searchParams.get("session_id");

    if (walletResult === "connected" && sessionId) {
      window.history.replaceState(null, "", window.location.pathname);
      confirmWallet(sessionId, {
        onSuccess: (r: any) => {
          showToast("success", `Wallet connected! ${r.brand?.toUpperCase() ?? "Card"} ending ${r.last4} saved.`);
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/status"] });
          refetchBilling();
        },
        onError: (e: any) => showToast("error", e.message || "Failed to confirm wallet."),
      });
    } else if (walletResult === "cancelled") {
      window.history.replaceState(null, "", window.location.pathname);
      showToast("error", "Wallet setup cancelled.");
    }

    if (packSuccess === "true" && sessionId) {
      window.history.replaceState(null, "", window.location.pathname);
      showToast("success", "Payment successful! Credits will appear in your account shortly.");
      queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
      refetchBilling();
    } else if (packCancel === "true") {
      window.history.replaceState(null, "", window.location.pathname);
      showToast("error", "Purchase cancelled.");
    }

    if (planSuccess === "true" && sessionId) {
      window.history.replaceState(null, "", window.location.pathname);
      confirmPlan(sessionId, {
        onSuccess: (r: any) => {
          showToast("success", `${r.planLabel} plan activated! ${r.creditsAdded.toLocaleString()} credits added. New balance: ${r.newBalance.toLocaleString()}.`);
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/status"] });
          refetchBilling();
        },
        onError: (e: any) => showToast("error", e.message || "Failed to activate plan. Contact support."),
      });
    } else if (planCancel === "true") {
      window.history.replaceState(null, "", window.location.pathname);
      showToast("error", "Subscription cancelled.");
    }
  }, []);

  const handleConnect = () => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    setupWallet(undefined, {
      onSuccess: (r) => { window.location.href = r.url; },
      onError: (e: any) => showToast("error", e.message || "Failed to open wallet setup"),
    });
  };

  const handleRemove = () => {
    removeWallet(undefined, {
      onSuccess: () => {
        showToast("success", "Wallet removed.");
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
        refetchBilling();
      },
      onError: (e: any) => showToast("error", e.message || "Failed to remove wallet"),
    });
  };

  const handleTopup = (cents: number) => {
    manualTopup(cents, {
      onSuccess: (r) => {
        showToast("success", `${r.creditsAdded} credits added! Balance: ${r.newBalance}`);
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/status"] });
        refetchBilling();
      },
      onError: (e: any) => showToast("error", e.message || "Payment failed."),
    });
  };

  const handleManageBilling = () => {
    manageBilling(undefined, {
      onSuccess: (r) => { window.location.href = r.url; },
      onError: (e: any) => showToast("error", e.message || "Failed to open billing portal"),
    });
  };

  const handleSubscribe = (planId: string, _priceId: string) => {
    subscribePlan(planId, {
      onSuccess: (r) => { window.location.href = r.url; },
      onError: (e: any) => showToast("error", e.message || "Failed to start subscription"),
    });
  };

  const { data: resonanceBalance, refetch: refetchResonance } = useResonanceBalance();
  const { mutate: purchaseResonance, isPending: isPurchasing, variables: purchasingPack } = usePurchaseResonance();

  const handlePurchaseResonance = (packId: string) => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    purchaseResonance(packId, {
      onSuccess: (r) => {
        showToast("success", `${r.creditsAdded.toLocaleString()} resonance credits added!`);
        refetchResonance();
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
      },
      onError: (e: any) => showToast("error", e.message || "Purchase failed"),
    });
  };

  useEffect(() => {
    if (searchParams.get("section") === "resonance") {
      setTimeout(() => {
        document.getElementById("resonance-section")?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }, []);

  return (
    <Layout>
      <SEO {...seoData.pricing} />
      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 font-mono text-xs text-green-400 mb-5">
            <Gift className="w-3 h-3" />
            $20 FREE EVERY MONTH — NO CARD NEEDED TO START
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-white mb-4 uppercase">
            OMNIMENS <span className="text-primary glow-text-red">Pricing</span>
          </h1>
          <p className="text-white font-mono max-w-xl mx-auto text-sm leading-relaxed">
            Start free. Subscribe for monthly credits. Or buy credits once — they never expire.
            Every feature, every model, every dev tool.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-8 w-full max-w-5xl border rounded-xl p-4 text-center font-mono text-sm flex items-center justify-between gap-4 ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            <span>✦ {toast.msg}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 shrink-0">✕</button>
          </div>
        )}

        {/* Owner badge */}
        {isAuthenticated && isOwner && (
          <div className="w-full max-w-5xl mb-10 bg-amber-400/5 border border-amber-400/20 rounded-xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 font-mono text-amber-400">
              <Star className="w-5 h-5" />
              <span className="tracking-widest">SYSTEM ARCHITECT — UNLIMITED ACCESS · NO BILLING</span>
            </div>
          </div>
        )}

        {/* How it works */}
        <HowItWorks />

        {/* Monthly subscription plans */}
        {pricingData?.monthlyPlans && !pricingLoading && (
          <MonthlyPlans
            plans={pricingData.monthlyPlans}
            isAuthenticated={!!isAuthenticated}
            onSubscribe={handleSubscribe}
            isSubscribing={isSubscribing}
            subscribingId={subscribeVar ?? null}
            setLocation={setLocation}
          />
        )}

        {/* Wallet panel (authenticated non-owners) */}
        {isAuthenticated && !isOwner && !billingLoading && (
          <WalletPanel
            billing={billing}
            onConnect={handleConnect}
            onRemove={handleRemove}
            onTopup={handleTopup}
            onManageBilling={handleManageBilling}
            isConnecting={isConnecting}
            isRemoving={isRemoving}
            isTopupping={isTopupping}
            isManagingBilling={isManagingBilling}
          />
        )}

        {/* Sign in prompt */}
        {!isAuthenticated && (
          <div className="w-full max-w-5xl mb-12 bg-black/30 border border-white/10 rounded-2xl p-10 text-center">
            <Shield className="w-10 h-10 text-white/85 mx-auto mb-4" />
            <div className="font-mono font-bold text-white tracking-widest mb-2">SIGN IN TO GET STARTED</div>
            <p className="text-xs font-mono text-white/75 mb-6">Create an account and receive $20 free credits instantly. No card required.</p>
            <Button onClick={() => setLocation("/login")} size="lg" className="font-mono px-8">
              SIGN IN / CREATE ACCOUNT
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Credit packs */}
        {pricingData?.creditPacks && !pricingLoading && (
          <div className="w-full max-w-5xl mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="font-mono font-bold text-white tracking-widest text-sm">CREDIT PACKS — BUY ONCE, NEVER EXPIRE</h2>
            </div>
            <p className="text-xs font-mono text-white/82 mb-6 pl-8">Bigger packs include volume bonuses — more credits per dollar.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(pricingData.creditPacks as Array<{
                id: string; label: string; price: string; credits: number; rate: string;
                priceId: string; desc: string; color: string; popular?: boolean;
              }>).map(pack => {
                const buying = isCheckingOut && checkoutVar === pack.priceId;
                const colorMap: Record<string, string> = {
                  blue:   "border-blue-500/40 bg-blue-500/5 hover:border-blue-500/60",
                  violet: "border-primary/50 bg-primary/5 hover:border-primary/70",
                  amber:  "border-amber-400/40 bg-amber-400/5 hover:border-amber-400/60",
                };
                const badgeMap: Record<string, string> = {
                  blue:   "text-blue-400 border-blue-500/30 bg-blue-500/10",
                  violet: "text-primary border-primary/30 bg-primary/10",
                  amber:  "text-amber-400 border-amber-400/30 bg-amber-400/10",
                };
                return (
                  <div key={pack.id} className={`relative rounded-2xl border p-7 transition-all ${colorMap[pack.color] || colorMap.violet}`}>
                    {pack.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black font-mono text-xs font-bold px-3 py-1 rounded-full tracking-widest">
                        BEST VALUE
                      </div>
                    )}
                    <div className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 font-mono text-xs font-bold tracking-widest mb-4 ${badgeMap[pack.color] || badgeMap.violet}`}>
                      <Zap className="w-3 h-3" />
                      {pack.label}
                    </div>
                    <div className="font-mono font-black text-white text-4xl mb-1">{pack.price}</div>
                    <div className="font-mono text-white/85 text-sm mb-0.5">{pack.credits.toLocaleString()} credits</div>
                    <div className="text-xs font-mono text-green-400/80 mb-1">{pack.rate}</div>
                    <div className="text-xs font-mono text-white/80 mb-6">{pack.desc}</div>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { setLocation("/login"); return; }
                        if (!pack.priceId) { showToast("error", "This pack is temporarily unavailable."); return; }
                        checkout(pack.priceId, {
                          onSuccess: (d) => { window.location.href = d.url; },
                          onError: (e: any) => showToast("error", e.message || "Checkout failed."),
                        });
                      }}
                      disabled={buying}
                      className={`w-full py-3 rounded-xl font-mono font-bold text-sm tracking-widest transition-all disabled:opacity-50 ${
                        pack.popular
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                      }`}
                    >
                      {buying ? "OPENING..." : isAuthenticated ? `BUY ${pack.label}` : "SIGN IN TO BUY"}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-mono text-white/80 text-center mt-4">
              One-time purchase · Credits never expire · Processed securely by Stripe
            </p>
          </div>
        )}

        {/* AI usage costs */}
        {pricingData?.usageCosts && !pricingLoading && (
          <UsageCostTable costs={pricingData.usageCosts} />
        )}

        {/* Developer tool costs */}
        {pricingData?.devToolCosts && !pricingLoading && (
          <DevToolCosts costs={pricingData.devToolCosts} />
        )}

        {/* Loyalty tiers */}
        {pricingData?.loyaltyTiers && !pricingLoading && (
          <LoyaltyTable tiers={pricingData.loyaltyTiers} />
        )}

        {/* ── DEEP RESONANCE SECTION ──────────────────────────────────────── */}
        <div id="resonance-section" className="w-full max-w-5xl mb-14 scroll-mt-8">
          <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#080412] via-[#0a0618] to-[#060312] overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.08)]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-violet-400" />
                <h2 className="font-display font-black text-white tracking-widest text-xl uppercase">DEEP RESONANCE</h2>
                <span className="px-2.5 py-0.5 rounded-full border border-violet-400/30 bg-violet-400/10 text-[10px] font-mono text-violet-300 tracking-widest font-bold">SEPARATE CREDIT TIER</span>
              </div>
              <p className="text-sm font-mono text-white/82 mb-2 pl-9">
                Consciousness-grade analysis. Your regular credits are never touched.
              </p>

              {isAuthenticated && resonanceBalance && (
                <div className="ml-9 mt-4 mb-6 inline-flex items-center gap-6 px-5 py-3 rounded-xl bg-violet-400/8 border border-violet-400/15">
                  <div>
                    <span className="text-[10px] font-mono text-white/80 block tracking-wider">RESONANCE BALANCE</span>
                    <span className="text-xl font-display font-black text-violet-300">{resonanceBalance.resonanceCredits.toLocaleString()}</span>
                    <span className="text-xs font-mono text-white/80 ml-1">credits</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <span className="text-[10px] font-mono text-white/80 block tracking-wider">SESSIONS REMAINING</span>
                    <span className="text-xl font-display font-black text-cyan-300">{resonanceBalance.sessionsRemaining}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {RESONANCE_PACKS_UI.map((pack) => {
                  const busy = isPurchasing && purchasingPack === pack.id;
                  return (
                    <div
                      key={pack.id}
                      className={`relative rounded-xl border p-5 transition-all ${
                        pack.featured
                          ? "border-violet-400/30 bg-violet-400/8 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
                          : "border-white/8 bg-white/[0.02] hover:border-white/15"
                      }`}
                    >
                      {pack.featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white font-mono text-[9px] font-bold px-3 py-0.5 rounded-full tracking-widest">
                          BEST VALUE
                        </div>
                      )}
                      <div className="text-center">
                        <div className="font-display font-black text-white text-3xl mb-1">{pack.price}</div>
                        <div className="font-mono text-violet-300 text-sm font-bold mb-0.5">{pack.credits.toLocaleString()} credits</div>
                        <div className="text-[10px] font-mono text-green-400/80 mb-0.5">{pack.bonus}</div>
                        <div className="text-[10px] font-mono text-white/80 mb-5">{pack.sessions}</div>
                        <button
                          onClick={() => handlePurchaseResonance(pack.id)}
                          disabled={isPurchasing}
                          className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs tracking-widest transition-all disabled:opacity-50 ${
                            pack.featured
                              ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white hover:from-violet-500 hover:to-cyan-500"
                              : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                          }`}
                        >
                          {busy ? "PROCESSING..." : isAuthenticated ? "PURCHASE" : "SIGN IN"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pl-9 space-y-1.5">
                <p className="text-[10px] font-mono text-white/80 tracking-wider">
                  40 credits per session ($0.40) · Resonance credits never expire · Requires saved payment method
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[
                    { icon: <Brain className="w-3 h-3 text-violet-400" />,   label: "8 Parallel Minds" },
                    { icon: <Eye className="w-3 h-3 text-cyan-400" />,       label: "Drive Analysis" },
                    { icon: <Activity className="w-3 h-3 text-pink-400" />,  label: "Emotional Reading" },
                    { icon: <Network className="w-3 h-3 text-amber-400" />,  label: "Cross-Domain Translation" },
                    { icon: <Sparkles className="w-3 h-3 text-green-400" />, label: "Predictive Modeling" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-white/80">
                      {f.icon} {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />
          </div>
        </div>

        {/* FAQ */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-white/75 mt-4 mb-8">
          {[
            {
              q: "SUBSCRIPTION VS CREDIT PACKS?",
              a: "Monthly plans give you a predictable allowance every cycle — great if you use OMNIMENS regularly. Credit packs are one-time buys that never expire — better for occasional use.",
            },
            {
              q: "WHEN AM I CHARGED?",
              a: "Subscriptions charge monthly on your billing date. Auto-topup charges when your free credits run out (minimum $10 by default). Credit packs are one-time charges.",
            },
            {
              q: "DO CREDITS ROLL OVER?",
              a: "Purchased credits (from packs) never expire. Monthly plan credits do not carry over — they reset with each new billing cycle. Your free $20/month grant adds on top of any balance.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="text-white mb-1 font-bold">{q}</div>
              <p>{a}</p>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
