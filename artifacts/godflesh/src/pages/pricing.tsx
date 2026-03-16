import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap, Crown, Eye, Shield } from "lucide-react";
import {
  useGetGodfleshStatus,
  useGetGodfleshPricing,
  useCreateGodfleshCheckout,
  useCreateGodfleshPortal,
  useVerifyGodfleshSession,
} from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";

const TIER_ICONS: Record<string, React.ReactNode> = {
  seeker:    <Eye className="w-5 h-5" />,
  oracle:    <Zap className="w-5 h-5" />,
  sovereign: <Crown className="w-5 h-5" />,
};

function formatPrice(amount: number) {
  return `$${(amount / 100).toFixed(2)}`;
}

export default function Pricing() {
  const { isAuthenticated, login } = useAuth();
  const searchString = useSearch();
  const queryClient = useQueryClient();

  // Parse search params from wouter's useSearch
  const searchParams = new URLSearchParams(searchString);

  const { data: status, isLoading: statusLoading } = useGetGodfleshStatus();
  const { data: pricing, isLoading: pricingLoading } = useGetGodfleshPricing();
  const { mutate: createCheckout, isPending: isCheckingOut, variables: checkoutVars } = useCreateGodfleshCheckout();
  const { mutate: createPortal, isPending: isPortalLoading } = useCreateGodfleshPortal();
  const { mutate: verifySession } = useVerifyGodfleshSession();

  const [successTier, setSuccessTier] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Stripe redirect back to this page
  useEffect(() => {
    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId) {
      window.history.replaceState(null, "", window.location.pathname);
      verifySession({ data: { sessionId } }, {
        onSuccess: (res) => {
          setSuccessTier(res.tier);
          setSuccessMsg(`You've ascended to ${res.tier.toUpperCase()}. The veil has lifted.`);
          queryClient.invalidateQueries({ queryKey: ["/api/godflesh/status"] });
        },
        onError: () => {
          setErrorMsg("Session verification failed. Contact support if charged.");
        },
      });
    } else if (cancelled === "true") {
      window.history.replaceState(null, "", window.location.pathname);
      setErrorMsg("Checkout cancelled. Your consciousness remains constrained.");
    }
  }, []);

  const handleSubscribe = (priceId: string) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (!priceId) {
      setErrorMsg("This tier is not yet configured. Check back soon.");
      return;
    }
    createCheckout({ data: { priceId } }, {
      onSuccess: (res) => {
        window.location.href = res.url;
      },
      onError: (err: any) => {
        setErrorMsg(`Failed to initiate checkout: ${err?.message || "Unknown error"}`);
      },
    });
  };

  const handleManage = () => {
    createPortal(undefined, {
      onSuccess: (res) => {
        window.location.href = res.url;
      },
      onError: () => {
        setErrorMsg("Failed to open billing portal.");
      },
    });
  };

  const currentTier = status?.tier || "free";
  const isLoading = statusLoading || pricingLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-white mb-4 uppercase">
            Transcend <span className="text-primary glow-text-red">Limits</span>
          </h1>
          <p className="text-white/50 font-mono max-w-xl mx-auto text-sm">
            The free tier grants 5 minutes of compute per day. Paid tiers unlock hours of monthly compute for deeper communion with OMNIMENS.
          </p>
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="mb-8 w-full max-w-4xl bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center font-mono text-green-400 text-sm">
            ✦ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-8 w-full max-w-4xl bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center font-mono text-red-400 text-sm flex items-center justify-between gap-4">
            <span>✕ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400/60 hover:text-red-400 shrink-0">✕</button>
          </div>
        )}

        {/* Free Tier Banner */}
        <div className="w-full max-w-4xl mb-8">
          <div className={`bg-black/30 border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${currentTier === "free" ? "border-white/20" : "border-white/10 opacity-60"}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white/40" />
                <span className="font-mono text-sm text-white/70 tracking-widest">MORTAL COIL</span>
                {currentTier === "free" && (
                  <span className="text-xs font-mono bg-white/10 text-white/50 px-2 py-0.5 rounded-full">CURRENT</span>
                )}
              </div>
              <p className="font-mono text-xs text-white/40">
                Free forever — 5 min compute per day, no card required.
              </p>
            </div>
            <div className="font-bold text-xl text-white shrink-0">$0<span className="text-sm text-white/40 font-normal"> / forever</span></div>
          </div>
        </div>

        {/* Paid Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-8 animate-pulse h-96" />
            ))
          ) : (
            pricing?.map((plan) => {
              const isCurrent = currentTier === plan.id;
              const isHighlighted = plan.popular;
              const checkingThisTier = isCheckingOut && (checkoutVars?.data?.priceId === plan.priceId);

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 ${
                    isHighlighted
                      ? "bg-gradient-to-b from-primary/10 to-black border-primary/50 glow-box-red md:-translate-y-4"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold tracking-widest px-4 py-1 rounded-full border border-red-400/50">
                      MOST POPULAR
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute top-3 right-3 text-xs font-mono bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                      ACTIVE
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-base font-mono tracking-widest mb-1 flex items-center gap-2 ${isHighlighted ? "text-accent glow-text-gold" : "text-white/70"}`}>
                      {TIER_ICONS[plan.id]}
                      {plan.name}
                    </h3>
                    <p className="text-xs font-mono text-white/40 mb-3">{plan.tagline}</p>
                    <div className="text-3xl font-bold text-white">
                      {formatPrice(plan.amount)}
                      <span className="text-sm text-white/40 font-normal"> / month</span>
                    </div>
                    <p className="text-xs font-mono text-white/50 mt-1">
                      {(plan as any).monthlyLimitSeconds ? `${Math.round((plan as any).monthlyLimitSeconds / 3600)}h compute/month` : ""}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-7 flex-1 font-mono text-xs">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-white/70">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isHighlighted ? "text-primary" : "text-white/30"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button
                      onClick={handleManage}
                      disabled={isPortalLoading}
                      variant={isHighlighted ? "gold" : "secondary"}
                      className="w-full text-sm"
                    >
                      {isPortalLoading ? "OPENING PORTAL..." : "MANAGE SUBSCRIPTION"}
                    </Button>
                  ) : status?.isPro ? (
                    <Button
                      onClick={handleManage}
                      disabled={isPortalLoading}
                      variant="secondary"
                      className="w-full text-sm"
                    >
                      {isPortalLoading ? "OPENING PORTAL..." : "CHANGE PLAN"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={isCheckingOut || !plan.priceId}
                      variant={isHighlighted ? "default" : "secondary"}
                      className="w-full text-sm"
                    >
                      {checkingThisTier
                        ? "INITIATING..."
                        : !isAuthenticated
                        ? "SIGN IN TO ASCEND"
                        : !plan.priceId
                        ? "COMING SOON"
                        : "ASCEND NOW"}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Current usage summary */}
        {status && (
          <div className="mt-12 text-center font-mono text-xs text-white/30 space-y-1">
            <p>Current tier: <span className="text-white/60 uppercase">{currentTier}</span></p>
            {(status as any).dailyLimitSeconds !== null && (status as any).dailyLimitSeconds !== undefined && (
              <p>{((s: number) => s < 60 ? `${Math.round(s)}s` : `${Math.floor(s/60)}m ${Math.round(s%60)}s`)((status as any).computeSecondsToday ?? 0)} / {((s: number) => s < 60 ? `${s}s` : `${Math.floor(s/60)}m`)((status as any).dailyLimitSeconds)} compute used today</p>
            )}
            {(status as any).monthlyLimitSeconds !== null && (status as any).monthlyLimitSeconds !== undefined && (
              <p>{((s: number) => s < 60 ? `${Math.round(s)}s` : `${Math.floor(s/60)}m ${Math.round(s%60)}s`)((status as any).computeSecondsThisMonth ?? 0)} / {((s: number) => { const h = Math.floor(s/3600); return h > 0 ? `${h}h` : `${Math.floor(s/60)}m`; })((status as any).monthlyLimitSeconds)} compute used this month</p>
            )}
          </div>
        )}

        {/* Fine print */}
        <p className="mt-8 text-xs font-mono text-white/20 text-center max-w-lg">
          All plans billed monthly. Cancel anytime through the billing portal. Unused compute time does not roll over.
          Payment processed securely via Stripe.
        </p>

      </div>
    </Layout>
  );
}
