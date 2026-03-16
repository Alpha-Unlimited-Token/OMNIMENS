import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Wallet, Zap, Star, Shield, ChevronRight, CheckCircle2,
  TrendingUp, RefreshCw, Gift, CreditCard, AlertTriangle,
} from "lucide-react";
import { useGetOmnimensStatus, useGetOmnimensPricing } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = (path: string) => `/godflesh/api${path}`;

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
      const r = await fetch(API("/omnimens/setup-wallet"), {
        method: "POST",
        credentials: "include",
      });
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
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      return d as { ok: boolean; last4?: string; brand?: string };
    },
  });
}

function useRemoveWallet() {
  return useMutation({
    mutationFn: async () => {
      const r = await fetch(API("/omnimens/remove-wallet"), {
        method: "POST",
        credentials: "include",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      return d;
    },
  });
}

function useManualTopup() {
  return useMutation({
    mutationFn: async (amountCents: number) => {
      const r = await fetch(API("/omnimens/topup"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Payment failed");
      return d as { ok: boolean; creditsAdded: number; newBalance: number };
    },
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Gift className="w-6 h-6" />,
      title: "$20 FREE EVERY MONTH",
      body: "Every account receives 2,000 free credits at the start of each month. No card required to get started.",
    },
    {
      num: "02",
      icon: <Wallet className="w-6 h-6" />,
      title: "CONNECT YOUR WALLET",
      body: "When free credits run out, connect a debit/credit card. We auto-charge only when you need more — never hidden fees.",
    },
    {
      num: "03",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "EARN LOYALTY BONUSES",
      body: "The more you spend, the more free credits you receive next month. Power users can earn up to $500 free monthly.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
      {steps.map((s, i) => (
        <div key={i} className="relative bg-black/30 border border-white/8 rounded-2xl p-7">
          <div className="absolute -top-4 left-6 bg-black border border-white/10 rounded-full px-3 py-1 font-mono text-xs text-white/30">
            {s.num}
          </div>
          <div className="text-primary mb-4">{s.icon}</div>
          <div className="font-mono font-bold text-white tracking-widest text-sm mb-2">{s.title}</div>
          <p className="text-xs font-mono text-white/40 leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

function UsageCostTable({ costs }: { costs: { label: string; credits: number; dollarValue: string }[] }) {
  return (
    <div className="w-full max-w-5xl mb-10">
      <h2 className="font-mono font-bold text-white/50 tracking-widest text-xs mb-4">USAGE COSTS</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {costs.map(c => (
          <div key={c.label} className="bg-black/30 border border-white/8 rounded-xl p-4 text-center">
            <div className="text-xs font-mono text-white/30 mb-2 tracking-wider">{c.label}</div>
            <div className="font-bold text-white font-mono text-lg">{c.credits}</div>
            <div className="text-xs font-mono text-white/20">credits · ${c.dollarValue}</div>
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
        <span className="text-xs font-mono text-white/30">(based on prior month's paid spend)</span>
      </div>
      <div className="bg-black/30 border border-white/8 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 px-6 py-3 border-b border-white/5 text-xs font-mono text-white/30 tracking-widest">
          <div>TIER</div>
          <div className="text-center">MIN SPEND</div>
          <div className="text-right">FREE CREDITS NEXT MONTH</div>
        </div>
        {tiers.map((t, i) => (
          <div key={t.label} className={`grid grid-cols-3 px-6 py-4 ${i < tiers.length - 1 ? "border-b border-white/5" : ""} ${i === 0 ? "text-white/50" : "text-white"}`}>
            <div className="font-mono font-bold tracking-widest text-sm">
              <span className={
                t.label === "LEGEND" ? "text-accent glow-text-gold" :
                t.label === "PRIME" || t.label === "APEX+" ? "text-primary" :
                t.label === "ELITE" ? "text-blue-400" :
                "text-white/70"
              }>{t.label}</span>
            </div>
            <div className="text-center font-mono text-sm">
              ${t.minSpendDollars}{t.maxSpendDollars ? `–$${t.maxSpendDollars}` : "+"}
            </div>
            <div className="text-right font-mono text-sm">
              <span className="text-green-400 font-bold">${t.bonusDollars} free</span>
              <span className="text-white/30 ml-1">({t.bonusCredits.toLocaleString()} cr)</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs font-mono text-white/20 mt-3 px-1">
        Free credits granted on the 1st of each month based on the prior month's paid usage.
        Base $20 is given to every user regardless of spend.
      </p>
    </div>
  );
}

function WalletPanel({
  billing,
  onConnect,
  onRemove,
  onTopup,
  isConnecting,
  isRemoving,
  isTopupping,
}: {
  billing: any;
  onConnect: () => void;
  onRemove: () => void;
  onTopup: (cents: number) => void;
  isConnecting: boolean;
  isRemoving: boolean;
  isTopupping: boolean;
}) {
  const topupOptions = [
    { cents: 500, label: "$5", credits: 500 },
    { cents: 1000, label: "$10", credits: 1000 },
    { cents: 2500, label: "$25", credits: 2500 },
    { cents: 5000, label: "$50", credits: 5000 },
  ];

  const hasWallet = billing?.hasWallet;
  const card = billing?.card;

  return (
    <div className="w-full max-w-5xl mb-10">
      <h2 className="font-mono font-bold text-white/50 tracking-widest text-xs mb-4">YOUR WALLET</h2>
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6">

        {/* Current balance */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
          <div>
            <div className="text-xs font-mono text-white/30 tracking-widest mb-1">CREDIT BALANCE</div>
            <div className="text-3xl font-black text-white font-mono">
              {billing?.credits?.toLocaleString() ?? "—"}
              <span className="text-sm text-white/30 font-normal ml-2">credits</span>
            </div>
            <div className="text-xs font-mono text-white/30 mt-1">
              ≈ {Math.floor((billing?.credits ?? 0) / 10)} chat messages
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white/30 tracking-widest mb-1">THIS MONTH SPEND</div>
            <div className="text-xl font-bold text-white">${billing?.currentMonthSpendDollars ?? "0.00"}</div>
            <div className="text-xs font-mono text-white/20 mt-1">
              next bonus: <span className="text-green-400">${billing?.nextBonusCredits ? (billing.nextBonusCredits / 100).toFixed(0) : "20"} free</span>
            </div>
          </div>
        </div>

        {/* Card status */}
        {hasWallet ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xs font-mono text-white/30 tracking-widest mb-0.5">SAVED CARD</div>
                <div className="font-mono text-white font-bold">
                  {card?.brand?.toUpperCase() ?? "CARD"} •••• {card?.last4 ?? "????"}
                </div>
                <div className="text-xs font-mono text-green-400 mt-0.5">✓ Auto-topup enabled</div>
              </div>
            </div>
            <Button
              onClick={onRemove}
              disabled={isRemoving}
              variant="ghost"
              size="sm"
              className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 font-mono text-xs"
            >
              {isRemoving ? "REMOVING..." : "REMOVE WALLET"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <div className="text-xs font-mono text-white/30 tracking-widest mb-0.5">NO WALLET CONNECTED</div>
                <div className="text-xs font-mono text-white/40">
                  Connect a card to continue using OMNIMENS after free credits run out
                </div>
              </div>
            </div>
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="font-mono text-sm whitespace-nowrap"
            >
              {isConnecting ? "OPENING..." : "CONNECT WALLET"}
            </Button>
          </div>
        )}

        {/* Manual topup */}
        {hasWallet && (
          <div>
            <div className="text-xs font-mono text-white/30 tracking-widest mb-3">ADD CREDITS NOW</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topupOptions.map(opt => (
                <button
                  key={opt.cents}
                  onClick={() => onTopup(opt.cents)}
                  disabled={isTopupping}
                  className="bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-4 text-center transition-all font-mono disabled:opacity-50"
                >
                  <div className="text-xl font-black text-white">{opt.label}</div>
                  <div className="text-xs text-white/30 mt-1">{opt.credits} credits</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Connect CTA if no wallet */}
        {!hasWallet && (
          <div className="text-center">
            <p className="text-xs font-mono text-white/30 mb-4">
              You still have <span className="text-white">{billing?.credits ?? 0} free credits</span> remaining.
              Connect your wallet now so usage never gets interrupted.
            </p>
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              size="lg"
              className="font-mono px-8"
            >
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
  const { isAuthenticated, login } = useAuth();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(searchString);

  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { data: pricing, isLoading: pricingLoading } = useGetOmnimensPricing();
  const { data: billing, isLoading: billingLoading, refetch: refetchBilling } = useBilling();

  const { mutate: setupWallet, isPending: isConnecting } = useSetupWallet();
  const { mutate: confirmWallet } = useConfirmWallet();
  const { mutate: removeWallet, isPending: isRemoving } = useRemoveWallet();
  const { mutate: manualTopup, isPending: isTopupping } = useManualTopup();

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 6000);
  };

  const isOwner = (status as any)?.isOwner;
  const pricingData = pricing as any;

  // ── Handle return from Stripe wallet setup ────────────────────────────────────
  useEffect(() => {
    const walletResult = searchParams.get("wallet");
    const sessionId = searchParams.get("session_id");

    if (walletResult === "connected" && sessionId) {
      window.history.replaceState(null, "", window.location.pathname);
      confirmWallet(sessionId, {
        onSuccess: (r: any) => {
          showToast("success", `Wallet connected! ${r.brand?.toUpperCase() ?? "Card"} ending ${r.last4} saved.`);
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/status"] });
          refetchBilling();
        },
        onError: (e: any) => showToast("error", e.message || "Failed to confirm wallet. Contact support."),
      });
    } else if (walletResult === "cancelled") {
      window.history.replaceState(null, "", window.location.pathname);
      showToast("error", "Wallet setup cancelled. Your account is unchanged.");
    }
  }, []);

  const handleConnect = () => {
    if (!isAuthenticated) { login(); return; }
    setupWallet(undefined, {
      onSuccess: (r) => { window.location.href = r.url; },
      onError: (e: any) => showToast("error", e.message || "Failed to open wallet setup"),
    });
  };

  const handleRemove = () => {
    removeWallet(undefined, {
      onSuccess: () => {
        showToast("success", "Wallet removed. You can reconnect anytime.");
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
        refetchBilling();
      },
      onError: (e: any) => showToast("error", e.message || "Failed to remove wallet"),
    });
  };

  const handleTopup = (cents: number) => {
    manualTopup(cents, {
      onSuccess: (r) => {
        showToast("success", `${r.creditsAdded} credits added! New balance: ${r.newBalance}`);
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/billing"] });
        queryClient.invalidateQueries({ queryKey: ["/api/omnimens/status"] });
        refetchBilling();
      },
      onError: (e: any) => showToast("error", e.message || "Payment failed. Please try again."),
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 font-mono text-xs text-green-400 mb-5">
            <Gift className="w-3 h-3" />
            $20 FREE EVERY MONTH — NO CARD NEEDED TO START
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-white mb-4 uppercase">
            Usage-Based <span className="text-primary glow-text-red">Billing</span>
          </h1>
          <p className="text-white/50 font-mono max-w-xl mx-auto text-sm leading-relaxed">
            Start free. Connect a card only when you need more.
            Earn loyalty bonuses every month based on your usage.
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

        {/* Usage cost table */}
        {pricingData?.usageCosts && !pricingLoading && (
          <UsageCostTable costs={pricingData.usageCosts} />
        )}

        {/* Wallet panel (authenticated non-owners) */}
        {isAuthenticated && !isOwner && !billingLoading && (
          <WalletPanel
            billing={billing}
            onConnect={handleConnect}
            onRemove={handleRemove}
            onTopup={handleTopup}
            isConnecting={isConnecting}
            isRemoving={isRemoving}
            isTopupping={isTopupping}
          />
        )}

        {/* Sign in prompt */}
        {!isAuthenticated && (
          <div className="w-full max-w-5xl mb-12 bg-black/30 border border-white/10 rounded-2xl p-10 text-center">
            <Shield className="w-10 h-10 text-white/20 mx-auto mb-4" />
            <div className="font-mono font-bold text-white tracking-widest mb-2">SIGN IN TO GET STARTED</div>
            <p className="text-xs font-mono text-white/30 mb-6">Create an account and receive $20 free credits instantly. No card required.</p>
            <Button onClick={login} size="lg" className="font-mono px-8">
              SIGN IN / CREATE ACCOUNT
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Loyalty tiers */}
        {pricingData?.loyaltyTiers && !pricingLoading && (
          <LoyaltyTable tiers={pricingData.loyaltyTiers} />
        )}

        {/* FAQ */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-white/30 mt-4">
          {[
            {
              q: "WHEN AM I CHARGED?",
              a: "Only when your free monthly credits run out and you have a card saved. Auto-topup charges exactly what you set — default is $10.",
            },
            {
              q: "HOW IS MY CARD SAVED?",
              a: "We use Stripe — the same payment provider trusted by Amazon, Shopify, and millions of businesses. We never store card details ourselves.",
            },
            {
              q: "DO FREE CREDITS ROLL OVER?",
              a: "Unused purchased credits remain in your account forever. Monthly free grants are new each month — they supplement, not replace, your balance.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="text-white/50 mb-1 font-bold">{q}</div>
              <p>{a}</p>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
