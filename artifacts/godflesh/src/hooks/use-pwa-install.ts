/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ((window as any).__pwaPrompt) {
      const p = (window as any).__pwaPrompt as BeforeInstallPromptEvent;
      setPrompt(p);
      promptRef.current = p;
      (window as any).__pwaPrompt = null;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const p = e as BeforeInstallPromptEvent;
      setPrompt(p);
      promptRef.current = p;
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setInstalled(true);
      setPrompt(null);
      promptRef.current = null;
    };
    window.addEventListener("appinstalled", installedHandler);

    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    if (isInstalled) setInstalled(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    const p = promptRef.current || prompt;
    if (!p) {
      console.warn("[PWA] No install prompt available");
      return false;
    }
    try {
      await p.prompt();
      const { outcome } = await p.userChoice;
      if (outcome === "accepted") {
        setPrompt(null);
        promptRef.current = null;
        setInstalled(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Install prompt failed:", err);
      setPrompt(null);
      promptRef.current = null;
      return false;
    }
  }, [prompt]);

  return { canInstall: (!!prompt || !!promptRef.current) && !installed, installed, install };
}
