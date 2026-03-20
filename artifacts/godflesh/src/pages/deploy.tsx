import { useState } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Rocket, Globe, Link, CheckCircle, Clock, AlertCircle,
  ExternalLink, Copy, Check, RefreshCw, Plus, ChevronRight,
  Server, Shield, Zap, BarChart3, ArrowRight, Settings,
  XCircle, Loader2
} from "lucide-react";

type DeployedProject = {
  id: number;
  name: string;
  slug: string;
  type: string;
  published: boolean;
  publishedAt: string | null;
  customDomain: string | null;
  domainStatus: string;
  status: string;
};

const STATUS_COLORS: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  active: { color: "text-green-400 bg-green-400/10", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Live" },
  pending: { color: "text-yellow-400 bg-yellow-400/10", icon: <Clock className="w-3.5 h-3.5" />, label: "Deploying" },
  error: { color: "text-red-400 bg-red-400/10", icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Error" },
  none: { color: "text-white/40 bg-white/5", icon: <Clock className="w-3.5 h-3.5" />, label: "Not deployed" },
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 text-white/50 hover:text-white transition-colors">
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function Deploy() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/omnimens/projects"],
    queryFn: async () => {
      const r = await fetch("/api/omnimens/projects", { credentials: "include" });
      if (!r.ok) return [];
      return r.json() as Promise<DeployedProject[]>;
    },
    retry: false,
  });

  const deployedProjects = (projects || []).filter((p: DeployedProject) => p.published);
  const readyProjects = (projects || []).filter((p: DeployedProject) => !p.published && p.status === "ready");

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white mb-1">DEPLOYMENTS</h1>
              <p className="text-sm font-mono text-white/50">Manage your live projects and custom domains</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-green-400">{deployedProjects.length} LIVE</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <StatCard icon={<Rocket className="w-5 h-5 text-primary" />} label="Deployed" value={deployedProjects.length.toString()} color="bg-primary/8 border-primary/15" />
            <StatCard icon={<Globe className="w-5 h-5 text-blue-400" />} label="Custom Domains" value={deployedProjects.filter((p: DeployedProject) => p.customDomain).length.toString()} color="bg-blue-400/8 border-blue-400/15" />
            <StatCard icon={<Shield className="w-5 h-5 text-green-400" />} label="SSL Active" value={deployedProjects.length.toString()} color="bg-green-400/8 border-green-400/15" />
          </div>

          {deployedProjects.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-mono font-bold text-white tracking-widest">LIVE DEPLOYMENTS</h2>
              </div>
              <div className="space-y-3">
                {deployedProjects.map((p: DeployedProject) => (
                  <DeploymentCard key={p.id} project={p} onManage={() => setLocation("/projects")} />
                ))}
              </div>
            </section>
          )}

          {readyProjects.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-mono font-bold text-white tracking-widest">READY TO DEPLOY</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {readyProjects.map((p: DeployedProject) => (
                  <button
                    key={p.id}
                    onClick={() => setLocation("/projects")}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                  >
                    <Rocket className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-mono font-bold text-white/85">{p.name}</div>
                      <div className="text-[10px] font-mono text-white/40">Ready to deploy</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : deployedProjects.length === 0 && readyProjects.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <Rocket className="w-12 h-12 text-white/15 mb-4" />
              <h3 className="text-sm font-mono font-bold text-white/50 mb-1">No deployments yet</h3>
              <p className="text-xs font-mono text-white/30 mb-6 text-center max-w-xs">
                Build a project first, then deploy it here to make it live.
              </p>
              <button
                onClick={() => setLocation("/projects")}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest hover:bg-primary/15 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> GO TO PROJECTS
              </button>
            </div>
          )}

          <section className="mt-10 p-6 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="text-sm font-mono font-bold text-white mb-4 tracking-widest">DEPLOYMENT FEATURES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FeatureItem icon={<Globe className="w-4 h-4 text-blue-400" />} title="Custom Domains" desc="Connect your own domain with automatic SSL" />
              <FeatureItem icon={<Shield className="w-4 h-4 text-green-400" />} title="SSL/TLS" desc="Free auto-renewed SSL certificates" />
              <FeatureItem icon={<Zap className="w-4 h-4 text-amber-400" />} title="Edge CDN" desc="Global content delivery network" />
              <FeatureItem icon={<BarChart3 className="w-4 h-4 text-violet-400" />} title="Analytics" desc="Traffic and performance metrics" />
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${color}`}>
      {icon}
      <div>
        <div className="text-lg font-mono font-bold text-white">{value}</div>
        <div className="text-[10px] font-mono text-white/50 tracking-widest">{label.toUpperCase()}</div>
      </div>
    </div>
  );
}

function DeploymentCard({ project, onManage }: { project: DeployedProject; onManage: () => void }) {
  const url = project.slug ? `${window.location.origin}/godflesh/p/${project.slug}` : null;
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h3 className="text-sm font-mono font-bold text-white">{project.name}</h3>
          <span className="text-[9px] font-mono text-white/40 uppercase">{project.type}</span>
        </div>
        <button onClick={onManage} className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
          Manage <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {url && (
          <div className="flex items-center gap-1.5 bg-black/30 border border-white/5 rounded-lg px-3 py-1.5">
            <Globe className="w-3 h-3 text-white/40" />
            <span className="text-[10px] font-mono text-white/60 truncate max-w-[200px]">{url}</span>
            <CopyBtn text={url} />
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {project.customDomain && (
          <div className="flex items-center gap-1.5 bg-blue-400/5 border border-blue-400/15 rounded-lg px-3 py-1.5">
            <Link className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-mono text-blue-400/80">{project.customDomain}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${project.domainStatus === "active" ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
          </div>
        )}
        {project.publishedAt && (
          <span className="text-[9px] font-mono text-white/25">
            Deployed {new Date(project.publishedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-mono font-bold text-white/80">{title}</div>
        <div className="text-[10px] font-mono text-white/40">{desc}</div>
      </div>
    </div>
  );
}
