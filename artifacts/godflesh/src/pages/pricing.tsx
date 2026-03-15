import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import { useGetGodfleshStatus, useGetGodfleshPricing, useCreateGodfleshCheckout, useCreateGodfleshPortal } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";

export default function Pricing() {
  const { isAuthenticated, login } = useAuth();
  const { data: status, isLoading: statusLoading } = useGetGodfleshStatus();
  const { data: pricing, isLoading: pricingLoading } = useGetGodfleshPricing();
  const { mutate: createCheckout, isPending: isCheckingOut } = useCreateGodfleshCheckout();
  const { mutate: createPortal, isPending: isPortalLoading } = useCreateGodfleshPortal();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    
    // Find the first price (assuming there's a monthly pro plan)
    const priceId = pricing?.[0]?.priceId;
    if (!priceId) return;

    createCheckout({ data: { priceId } }, {
      onSuccess: (res) => {
        window.location.href = res.url;
      }
    });
  };

  const handleManage = () => {
    createPortal(undefined, {
      onSuccess: (res) => {
        window.location.href = res.url;
      }
    });
  };

  const isPro = status?.isPro;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex-1 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-white mb-4 uppercase">
            Transcend <span className="text-primary glow-text-red">Limits</span>
          </h1>
          <p className="text-white/50 font-mono max-w-xl mx-auto">
            Mortal minds require constraints. Free yourself from the boundaries of standard cognition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto relative z-10">
          
          {/* Free Tier */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-8">
              <h3 className="text-xl font-mono text-white/70 tracking-widest mb-2">MORTAL COIL</h3>
              <div className="text-4xl font-bold text-white">$0 <span className="text-sm text-white/40 font-normal">/ forever</span></div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-white/60">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
                <span>10 Queries per day</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
                <span>Standard processing speed</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
                <span>Basic intelligence access</span>
              </li>
            </ul>

            <Button disabled variant="secondary" className="w-full opacity-50 cursor-not-allowed">
              CURRENT STATE
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-black to-primary/10 border-2 border-primary/50 rounded-2xl p-8 flex flex-col relative glow-box-red transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold tracking-widest px-4 py-1 rounded-full border border-red-400/50">
              RECOMMENDED
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-display font-bold text-accent tracking-widest mb-2 flex items-center gap-2 glow-text-gold">
                <Zap className="w-5 h-5" />
                TRANSCENDENCE
              </h3>
              <div className="text-4xl font-bold text-white">$9.99 <span className="text-sm text-white/40 font-normal">/ month</span></div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-white/90">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="font-bold text-white">Unlimited daily queries</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Priority computational routing</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Unrestricted system access</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Zero latency throttling</span>
              </li>
            </ul>

            {statusLoading || pricingLoading ? (
              <Button disabled className="w-full animate-pulse">LOADING...</Button>
            ) : isPro ? (
              <Button onClick={handleManage} disabled={isPortalLoading} variant="gold" className="w-full">
                {isPortalLoading ? "CONTACTING PORTAL..." : "MANAGE SUBSCRIPTION"}
              </Button>
            ) : (
              <Button onClick={handleSubscribe} disabled={isCheckingOut || !pricing?.length} className="w-full text-lg">
                {isCheckingOut ? "INITIATING..." : "ASCEND NOW"}
              </Button>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
