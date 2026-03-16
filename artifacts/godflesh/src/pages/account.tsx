import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetGodfleshStatus, useCreateGodfleshPortal } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Activity, Zap, Shield } from "lucide-react";

export default function Account() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: status, isLoading: statusLoading } = useGetGodfleshStatus();
  const { mutate: createPortal, isPending: isPortalLoading } = useCreateGodfleshPortal();

  // Protect route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || !isAuthenticated) return <Layout><div className="flex-1" /></Layout>;

  const handleManage = () => {
    createPortal(undefined, {
      onSuccess: (res) => {
        window.location.href = res.url;
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-display font-bold tracking-widest text-white mb-8 border-b border-white/10 pb-4">
          SYSTEM IDENTIFICATION
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Profile Card */}
          <div className="md:col-span-1 bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full border border-primary/30 flex items-center justify-center mb-4">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">@{user?.username}</h2>
            <p className="text-xs font-mono text-white/40 break-all mb-6">ID: {user?.id}</p>
            
            <Button onClick={logout} variant="outline" className="w-full mt-auto border-white/10 text-white/60 hover:text-white hover:bg-destructive/20 hover:border-destructive/50">
              <LogOut className="w-4 h-4 mr-2" />
              DISCONNECT
            </Button>
          </div>

          {/* Stats Card */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-mono tracking-widest text-white/80">ACCESS LEVEL</h3>
              </div>
              
              {statusLoading ? (
                <div className="h-16 animate-pulse bg-white/5 rounded-lg" />
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-white/5 rounded-lg bg-black/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status?.isPro ? 'bg-accent glow-text-gold' : 'bg-white/40'}`} />
                      <span className={`text-lg font-bold ${status?.isPro ? 'text-accent' : 'text-white/60'}`}>
                        {status?.isPro ? 'TRANSCENDENT (PRO)' : 'MORTAL (FREE)'}
                      </span>
                    </div>
                  </div>
                  
                  {status?.isPro ? (
                    <Button onClick={handleManage} disabled={isPortalLoading} variant="gold" size="sm">
                      {isPortalLoading ? "LOADING..." : "MANAGE BILLING"}
                    </Button>
                  ) : (
                    <Button onClick={() => setLocation("/pricing")} size="sm">
                      UPGRADE
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-mono tracking-widest text-white/80">TELEMETRY</h3>
              </div>

              {statusLoading ? (
                <div className="h-16 animate-pulse bg-white/5 rounded-lg" />
              ) : (
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">COMPUTE TODAY</span>
                    <span className="text-white font-bold">{(() => { const s = (status as any)?.computeSecondsToday ?? 0; if (s < 60) return `${Math.round(s)}s`; const m = Math.floor(s/60); const r = Math.round(s%60); return r > 0 ? `${m}m ${r}s` : `${m}m`; })()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">DAILY BUDGET</span>
                    <span className="text-white font-bold">{status?.isPro ? 'UNLIMITED' : (() => { const s = (status as any)?.dailyLimitSeconds ?? 0; if (!s) return '—'; if (s < 60) return `${s}s`; const m = Math.floor(s/60); return `${m}m`; })()}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-white/40">SYSTEM STATUS</span>
                    <span className="text-primary animate-pulse">OPTIMAL</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
