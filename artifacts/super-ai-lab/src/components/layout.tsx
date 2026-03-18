import { Link, useLocation } from "wouter";
import { useListSuperAISessions } from "@workspace/api-client-react";
import { Plus, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: sessions } = useListSuperAISessions();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* Sidebar Navigation */}
      <aside className="w-72 md:w-80 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 mb-8 group cursor-pointer w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_var(--color-primary)] group-hover:shadow-[0_0_25px_var(--color-accent)] transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">SUPER AI</span>
          </Link>
          
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all font-display text-sm tracking-widest text-white/80 hover:text-white shadow-lg">
            <Plus className="w-4 h-4" /> NEW SESSION
          </Link>

          <Link href="/command-center" className={cn(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl border transition-all font-display text-xs tracking-widest shadow-lg mt-3",
            location === "/command-center"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_-3px_rgb(16,185,129)]"
              : "border-white/10 bg-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/20 text-white/60 hover:text-emerald-400"
          )}>
            <Activity className="w-4 h-4" /> COMMAND CENTER
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          <div className="text-xs font-display tracking-widest text-white/30 mb-4 px-2 uppercase">Recent Experiments</div>
          
          {(!sessions || sessions.length === 0) && (
            <div className="text-center px-4 py-8 text-white/20 text-sm font-mono border border-dashed border-white/5 rounded-xl">
              No active sessions found.
            </div>
          )}

          {sessions?.map(s => {
            const isActive = location.includes(`/session/${s.id}`) || location.includes(`/blueprint/${s.id}`);
            return (
              <Link 
                key={s.id} 
                href={`/session/${s.id}`}
                className={cn(
                  "block p-4 rounded-xl border transition-all duration-300 group",
                  isActive 
                    ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_-3px_hsl(var(--primary))]" 
                    : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className="font-display font-medium text-sm truncate text-white/90 mb-2 group-hover:text-white transition-colors">{s.topic}</div>
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
                   <span className={cn(
                     "px-2 py-0.5 rounded-full border",
                     s.status === 'completed' ? 'bg-accent/10 border-accent/30 text-accent' : 
                     s.status === 'running' ? 'bg-primary/10 border-primary/30 text-primary animate-pulse' : 
                     'bg-white/5 border-white/10 text-white/40'
                   )}>
                     {s.status.toUpperCase()}
                   </span>
                   <span className="text-white/30">
                     {format(new Date(s.createdAt), 'MMM dd')}
                   </span>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 pointer-events-none z-0">
           <img 
             src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
             alt="Neural Network Matrix"
             className="w-full h-full object-cover opacity-[0.03] mix-blend-screen"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
        </div>
        <div className="relative z-10 p-6 md:p-10 lg:p-12 h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
