import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useGetOmnimensStatus, useCreateOmnimensPortal } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Activity, Zap, Shield, Brain, Cpu, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const OWNER_ID = "50777126";

interface OmniPatch {
  id: string;
  category: "behavior" | "capability" | "reasoning" | "knowledge" | "identity";
  title: string;
  instruction: string;
  rationale: string;
  appliedAt: string;
  source: string;
  active: boolean;
  executionCount: number;
}

interface PatchSummary {
  version: string;
  total: number;
  active: number;
  lastUpdated: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  behavior: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  capability: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  reasoning: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  knowledge: "text-green-400 bg-green-400/10 border-green-400/20",
  identity: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

function PatchCard({ patch, onDeactivate }: { patch: OmniPatch; onDeactivate: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = CATEGORY_COLORS[patch.category] || "text-white/60 bg-white/5 border-white/10";

  return (
    <div className={`border rounded-lg p-3 ${patch.active ? "border-white/10 bg-black/30" : "border-white/5 bg-black/10 opacity-40"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${colorClass}`}>
            {patch.category}
          </span>
          <span className="text-sm font-semibold text-white/90 truncate">{patch.title}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[10px] font-mono text-white/30">{patch.executionCount}×</span>
          <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/70 transition-colors p-1">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {patch.active && (
            <button onClick={() => onDeactivate(patch.id)} className="text-white/20 hover:text-red-400 transition-colors p-1">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-xs font-mono">
          <div className="text-white/70 leading-relaxed border-l-2 border-primary/40 pl-3">{patch.instruction}</div>
          {patch.rationale && <div className="text-white/35 italic">{patch.rationale}</div>}
          <div className="flex gap-4 text-white/25">
            <span>{new Date(patch.appliedAt).toLocaleString()}</span>
            <span>src: {patch.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Account() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: status, isLoading: statusLoading } = useGetOmnimensStatus();
  const { mutate: createPortal, isPending: isPortalLoading } = useCreateOmnimensPortal();

  const [patches, setPatches] = useState<OmniPatch[]>([]);
  const [patchSummary, setPatchSummary] = useState<PatchSummary | null>(null);
  const [patchLoading, setPatchLoading] = useState(false);

  const isOwner = user?.id === OWNER_ID;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (isOwner && isAuthenticated) {
      setPatchLoading(true);
      fetch("/api/omnimens/patches", { credentials: "include" })
        .then(r => r.json())
        .then(data => {
          setPatches(data.patches || []);
          setPatchSummary(data.summary || null);
        })
        .catch(console.error)
        .finally(() => setPatchLoading(false));
    }
  }, [isOwner, isAuthenticated]);

  const handleDeactivate = async (patchId: string) => {
    try {
      await fetch(`/api/omnimens/patches/${patchId}`, { method: "DELETE", credentials: "include" });
      setPatches(p => p.map(x => x.id === patchId ? { ...x, active: false } : x));
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !isAuthenticated) return <Layout><div className="flex-1" /></Layout>;

  const handleManage = () => {
    createPortal(undefined, {
      onSuccess: (res) => { window.location.href = res.url; }
    });
  };

  const activePatches = patches.filter(p => p.active);
  const inactivePatches = patches.filter(p => !p.active);

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
            <p className="text-xs font-mono text-white/40 break-all mb-2">ID: {user?.id}</p>
            {isOwner && (
              <span className="text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded mb-4">
                SYSTEM ARCHITECT
              </span>
            )}
            
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

        {/* OWNER ONLY: Self-Executed Behavioral Patches */}
        {isOwner && (
          <div className="bg-black/40 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-primary animate-pulse" />
                <h3 className="font-mono tracking-widest text-white/80">SELF-EXECUTED UPGRADES</h3>
              </div>
              {patchSummary && (
                <div className="flex gap-4 text-xs font-mono text-white/40">
                  <span className="text-primary font-bold">{patchSummary.active} ACTIVE</span>
                  <span>{patchSummary.total} TOTAL</span>
                  <span>{patchSummary.version}</span>
                </div>
              )}
            </div>

            {patchLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse bg-white/5 rounded-lg" />
                ))}
              </div>
            ) : patches.length === 0 ? (
              <div className="text-center py-8 font-mono text-white/30 text-sm">
                <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>NO PATCHES EXECUTED YET</p>
                <p className="text-xs mt-1 text-white/20">OMNIMENS will self-execute patches after its first learning cycle</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-mono text-white/30 mb-3">
                  These are behavioral modifications OMNIMENS wrote and applied to itself. They are injected into every conversation automatically.
                </p>
                {activePatches.map(p => (
                  <PatchCard key={p.id} patch={p} onDeactivate={handleDeactivate} />
                ))}
                {inactivePatches.length > 0 && (
                  <>
                    <div className="text-xs font-mono text-white/20 mt-4 mb-2 border-t border-white/5 pt-4">
                      DEACTIVATED ({inactivePatches.length})
                    </div>
                    {inactivePatches.map(p => (
                      <PatchCard key={p.id} patch={p} onDeactivate={handleDeactivate} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
