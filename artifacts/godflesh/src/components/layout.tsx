import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "./ui/button";
import { User, Layers } from "lucide-react";
import { OmnimensIcon } from "./omnimens-icon";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, login, isLoading } = useAuth();
  const [location] = useLocation();
  const isChat = location === "/chat";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/4 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-accent/3 blur-[130px] rounded-full" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="group-hover:drop-shadow-[0_0_10px_rgba(124,58,237,0.7)] transition-all duration-300">
              <OmnimensIcon size={36} />
            </div>
            <span className="font-display font-black text-xl tracking-[0.2em] text-white group-hover:text-primary transition-colors">
              OMNIMENS
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {!isChat && (
              <Link href="/pricing" className="text-sm font-mono text-muted-foreground hover:text-white transition-colors tracking-widest">
                PRICING
              </Link>
            )}

            {isLoading ? (
              <div className="w-20 h-8 bg-white/5 animate-pulse rounded" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/projects" className="flex items-center gap-1.5 text-sm font-mono text-white/50 hover:text-white transition-colors hidden sm:flex tracking-widest">
                  <Layers className="w-3.5 h-3.5" />
                  PROJECTS
                </Link>
                <Link href="/chat" className="text-sm font-mono text-primary hover:text-primary/80 transition-colors hidden sm:block tracking-widest">
                  CHAT
                </Link>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <Link href="/account" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.username || "Account"}</span>
                </Link>
              </div>
            ) : (
              <Button onClick={login} variant="outline" size="sm" className="font-mono tracking-widest border-primary/30 text-white hover:border-primary/60 hover:bg-primary/8">
                CONNECT
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
