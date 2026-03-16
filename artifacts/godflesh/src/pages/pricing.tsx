import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Zap, Flame, Star, Shield, CheckCircle2, TrendingUp } from "lucide-react";
import {
  useGetOmnimensStatus,
  useGetOmnimensPricing,
  useCreateOmnimensCheckout,
  useVerifyOmnimensSession,
} from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";

const PACK_ICONS: Record<string, React.ReactNode> = {
  spark: <Zap className="w-6 h-6" />,
  surge: <Flame className="w-6 h-6" />,
  apex:  <Star className="w-6 h-6" />,
};

const PACK_COLORS: Record<string, { border: string; icon: string; glow: string; badge: string }> = {
  spark: { border: "border-blue-500/30", icon: "text-blue-400", glow: "", badge: "" },
  surge: { border: "border-primary/50", icon: "text-primary", glow: "glow-box-red md:-translate-y-4", badge: "BEST VALUE" },
  apex:  { border: "border-amber-500/30", icon: "text-accent glow-text-gold", glow: "", badge: "" },
};

function CreditMeter({ credits }: { credits: number }) {
  const max = 100;
  const pct = Math.min(100, Math.round((credits / max) * 100));
  const color = credits <= 10 ? "bg-red-500" : credits <= 30 ? "bg-amber-400" : "bg-primary";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono text-white/50 mb-1">
        <span>CREDITS REMAINING</span>
        <span className={credits <= 10 ? "text-red-400 font-bold" : "text-white/70"}>{credits}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Pricing() {
  const { isAuthenticated, login } = useAuth();
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(searchString);

  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { data: pricing, isLoading: pricingLoading } = useGetOmnimensPricing();
  const { mutate: createCheckout, isPending: isCheckingOut, variables: checkoutVars } = useCreateOmnimensCheckout();
  const { mutate: verifySession } = useVerifyOmnimensSession();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId) {
      window.history.replaceState(null, "", window.location.pathname);
      verifySession({ data: { sessionId } }, {
        onSuccess: (res: any) => {
          setCreditsAdded(res.creditsAdded);
          setSuccessMsg(`${res.creditsAdded} credits added to your account. Balance: ${res.newBalance} credits.`);
          queryClient.invalidateQueries({ queryKey: ["/api/omnimens/status"] });
        },
        onError: () => {
          setErrorMsg("Verification failed. Contact support if payment was taken.");
        },
      });
    } else if (cancelled === "true") {
      window.history.replaceState(null, "", window.location.pathname);
      setErrorMsg("Purchase cancelled. Your credits remain unchanged.");
    }
  }, []);

  const handleBuy = (priceId: string) => {
    if (!isAuthenticated) { login(); return; }
    if (!priceId) { setErrorMsg("This pack is not yet configured. Check back soon."); return; }
    createCheckout({ data: { priceId } }, {
      onSuccess: (res) => { window.location.href = res.url; },
      onError: (err: any) => { setErrorMsg(`Checkout failed: ${err?.message || "Unknown error"}`); },
    });
  };

  const currentCredits: number = (status as any)?.credits ?? 0;
  const isOwner = (status as any)?.isOwner;
  const isLoading = statusLoading || pricingLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-white mb-4 uppercase">
            Buy <span className="text-primary glow-text-red">Credits</span>
          </h1>
          <p className="text-white/50 font-mono max-w-xl mx-auto text-sm leading-relaxed">
            Pay only for what you use. No subscriptions, no monthly charges, no surprises.
            Credits never expire — spend them at your own pace.
          </p>
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="mb-8 w-full max-w-4xl bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center font-mono text-green-400 text-sm">
            ✦ {successMsg}
            {creditsAdded && (
              <div className="mt-1 text-green-300 text-xs">Start chatting — go to <button onClick={() => setLocation("/omnimens/chat")} className="underline hover:text-white">OMNIMENS</button></div>
            )}
          </div>
        )}
        {errorMsg && (
          <div className="mb-8 w-full max-w-4xl bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center font-mono text-red-400 text-sm flex items-center justify-between gap-4">
            <span>✕ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400/60 hover:text-red-400 shrink-0">✕</button>
          </div>
        )}

        {/* Credit rate info */}
        <div className="w-full max-w-4xl mb-10 grid grid-cols-3 gap-4">
          {[
            { label: "CHAT MESSAGE", cost: "10 credits" },
            { label: "IMAGE GENERATION", cost: "100 credits" },
            { label: "FILE ATTACHMENT", cost: "+3 credits" },
          ].map(({ label, cost }) => (
            <div key={label} className="bg-black/30 border border-white/5 rounded-xl p-4 text-center">
              <div className="text-xs font-mono text-white/40 mb-1">{label}</div>
              <div className="font-bold text-white font-mono">{cost}</div>
            </div>
          ))}
        </div>

        {/* Current balance (if logged in) */}
        {isAuthenticated && !statusLoading && !isOwner && (
          <div className="w-full max-w-4xl mb-10 bg-black/40 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm text-white/70 tracking-widest">YOUR BALANCE</span>
              </div>
              <span className="font-mono text-xs text-white/30">
                ≈ {Math.floor(currentCredits / 10)} chat messages remaining
              </span>
            </div>
            <CreditMeter credits={currentCredits} />
            {currentCredits <= 10 && currentCredits > 0 && (
              <p className="text-xs font-mono text-red-400 mt-2 text-center animate-pulse">
                LOW CREDITS — buy more to continue
              </p>
            )}
            {currentCredits === 0 && (
              <p className="text-xs font-mono text-red-500 mt-2 text-center font-bold animate-pulse">
                OUT OF CREDITS — purchase a pack below to resume
              </p>
            )}
          </div>
        )}

        {/* Owner badge */}
        {isAuthenticated && isOwner && (
          <div className="w-full max-w-4xl mb-10 bg-amber-400/5 border border-amber-400/20 rounded-xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 font-mono text-amber-400">
              <Star className="w-5 h-5" />
              <span className="tracking-widest">SYSTEM ARCHITECT — UNLIMITED ACCESS</span>
            </div>
          </div>
        )}

        {/* Free tier info */}
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-black/30 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white/40" />
                <span className="font-mono text-sm text-white/70 tracking-widest">FREE TO START</span>
              </div>
              <p className="font-mono text-xs text-white/40">
                Every new account receives 50 free credits — no card required. Enough for 5 chat messages.
              </p>
            </div>
            <div className="font-bold text-xl text-white shrink-0">
              50 <span className="text-sm text-white/40 font-normal">credits free</span>
            </div>
          </div>
        </div>

        {/* Credit packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-8 animate-pulse h-96" />
            ))
          ) : (
            pricing?.map((plan) => {
              const colors = PACK_COLORS[plan.id] || PACK_COLORS.spark;
              const isCheckingThisPack = isCheckingOut && (checkoutVars?.data?.priceId === plan.priceId);

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 bg-black/40 ${colors.border} ${colors.glow}`}
                >
                  {(plan as any).popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold tracking-widest px-4 py-1 rounded-full border border-red-400/50">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`flex items-center gap-2 mb-1 font-mono tracking-widest ${colors.icon}`}>
                      {PACK_ICONS[plan.id]}
                      <span>{plan.name}</span>
                    </div>
                    <p className="text-xs font-mono text-white/40 mb-4">{plan.tagline}</p>

                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-black text-white">
                        ${((plan.amount) / 100).toFixed(2)}
                      </span>
                      <span className="text-sm text-white/40 font-normal pb-1">one-time</span>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${colors.border} ${colors.icon} bg-white/5`}>
                      {(plan as any).credits?.toLocaleString()} credits
                    </div>

                    <p className="text-xs font-mono text-white/30 mt-2">
                      {((plan.amount / (plan as any).credits) * 100 / 100).toFixed(3)}¢ per credit
                    </p>
                  </div>

                  <ul className="space-y-3 mb-7 flex-1 font-mono text-xs">
                    {plan.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-white/70">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${(plan as any).popular ? "text-primary" : "text-white/30"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleBuy(plan.priceId)}
                    disabled={isCheckingOut || !plan.priceId}
                    variant={(plan as any).popular ? "default" : "secondary"}
                    className="w-full text-sm"
                  >
                    {isCheckingThisPack
                      ? "OPENING CHECKOUT..."
                      : !isAuthenticated
                      ? "SIGN IN TO BUY"
                      : !plan.priceId
                      ? "COMING SOON"
                      : `BUY ${(plan as any).credits?.toLocaleString()} CREDITS`}
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* FAQ / fine print */}
        <div className="mt-14 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-white/30">
          <div>
            <div className="text-white/50 mb-1 font-bold">DO CREDITS EXPIRE?</div>
            <p>Never. Credits you purchase remain in your account until used. Buy once, use at your own pace.</p>
          </div>
          <div>
            <div className="text-white/50 mb-1 font-bold">HOW ARE CREDITS USED?</div>
            <p>10 credits per chat message, 100 per image generation, 3 per uploaded file. Images are more powerful — they cost more.</p>
          </div>
          <div>
            <div className="text-white/50 mb-1 font-bold">SECURE PAYMENT?</div>
            <p>All payments processed securely via Stripe. We never store card details. One-time charge, no recurring billing.</p>
          </div>
        </div>

      </div>
    </Layout>
  );
}
