import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "./ui/button";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { GodfleshIcon } from "./godflesh-icon";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  const [location] = useLocation();
  const isChat = location === "/chat";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="group-hover:drop-shadow-[0_0_8px_rgba(204,0,0,0.8)] transition-all duration-300">
              <GodfleshIcon size={36} />
            </div>
            <span className="font-display font-black text-xl tracking-[0.2em] text-white group-hover:text-primary transition-colors">
              GODFLESH
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {!isChat && (
              <Link href="/pricing" className="text-sm font-mono text-muted-foreground hover:text-white transition-colors">
                PRICING
              </Link>
            )}
            
            {isLoading ? (
              <div className="w-20 h-8 bg-white/5 animate-pulse rounded" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/chat" className="text-sm font-mono text-primary hover:text-primary/80 transition-colors hidden sm:block">
                  ENTER CHAT
                </Link>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <Link href="/account" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.username || "Account"}</span>
                </Link>
              </div>
            ) : (
              <Button onClick={login} variant="outline" size="sm" className="font-mono">
                INITIALIZE
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
