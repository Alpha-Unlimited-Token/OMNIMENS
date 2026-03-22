/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0E1525] px-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="text-2xl font-display font-black tracking-widest text-white uppercase mb-3">404</h1>
      <p className="text-sm font-mono text-white/60 tracking-wider mb-8">This page doesn't exist.</p>
      <button
        onClick={() => setLocation("/")}
        className="px-8 py-3 rounded-full bg-primary/10 border border-primary/25 text-sm font-mono text-white/80 tracking-widest hover:bg-primary/20 transition-all"
      >
        GO HOME
      </button>
    </div>
  );
}
