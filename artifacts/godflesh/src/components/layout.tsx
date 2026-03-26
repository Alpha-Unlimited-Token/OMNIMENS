/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "./ui/button";
import { User, Layers, Menu, X } from "lucide-react";
import { OmnimensIcon } from "./omnimens-icon";
import { CopyrightFooter, ProprietaryBeacon } from "./copyright-footer";
import { useState, useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const isChat = location === "/chat";
  const isConnect = location === "/connect";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (isChat || isConnect) {
    return (
      <div className="h-[100dvh] flex flex-col relative overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/4 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-accent/3 blur-[130px] rounded-full" />
      </div>

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

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/growth" className="text-sm font-mono text-green-400/80 hover:text-green-400 transition-colors tracking-widest">
              LIVE GROWTH
            </Link>
            <Link href="/dreams" className="text-sm font-mono text-violet-300/80 hover:text-violet-300 transition-colors tracking-widest">
              DREAMS
            </Link>
            <Link href="/demo" className="text-sm font-mono text-white/80 hover:text-white transition-colors tracking-widest">
              TRY FREE
            </Link>
            <Link href="/pricing" className="text-sm font-mono text-white/80 hover:text-white transition-colors tracking-widest">
              PRICING
            </Link>
            <Link href="/faq" className="text-sm font-mono text-white/80 hover:text-white transition-colors tracking-widest">
              FAQ
            </Link>

            {isLoading ? (
              <div className="w-20 h-8 bg-white/5 animate-pulse rounded" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/projects" className="flex items-center gap-1.5 text-sm font-mono text-white hover:text-white transition-colors tracking-widest">
                  <Layers className="w-3.5 h-3.5" />
                  PROJECTS
                </Link>
                <Link href="/chat" className="text-sm font-mono text-primary hover:text-primary/80 transition-colors tracking-widest">
                  CHAT
                </Link>
                <div className="h-4 w-px bg-white/10" />
                <Link href="/account" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  <span>{user?.username || "Account"}</span>
                </Link>
              </div>
            ) : (
              <Button onClick={() => setLocation("/login")} variant="outline" size="sm" className="font-mono tracking-widest border-primary/30 text-white hover:border-primary/60 hover:bg-primary/8">
                CONNECT
              </Button>
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {isAuthenticated && (
                <>
                  <MobileNavLink href="/chat" label="Chat" />
                  <MobileNavLink href="/projects" label="Projects" />
                  <MobileNavLink href="/account" label="Account" />
                  <div className="h-px bg-white/5 my-2" />
                </>
              )}
              <MobileNavLink href="/growth" label="Live Growth" />
              <MobileNavLink href="/dreams" label="Dreams" />
              <MobileNavLink href="/demo" label="Try Free" />
              <MobileNavLink href="/pricing" label="Pricing" />
              <MobileNavLink href="/faq" label="FAQ" />
              <MobileNavLink href="/about" label="About" />
              <MobileNavLink href="/support" label="Support" />
              <MobileNavLink href="/developer" label="Developer" />
              <div className="h-px bg-white/5 my-2" />
              <MobileNavLink href="/footer-links" label="Footer" />
              {!isAuthenticated && (
                <div className="pt-2">
                  <Button onClick={() => { setLocation("/login"); setMobileMenuOpen(false); }} variant="outline" size="sm" className="w-full font-mono tracking-widest border-primary/30 text-white hover:border-primary/60 hover:bg-primary/8">
                    CONNECT
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <CopyrightFooter />
      <ProprietaryBeacon tech="OMNIMENS Autonomous Intelligence Platform" />
    </div>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block px-3 py-2.5 rounded-lg text-sm font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all tracking-widest">
      {label}
    </Link>
  );
}
