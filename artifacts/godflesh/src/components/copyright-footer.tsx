/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Link } from "wouter";
import { OmnimensIcon } from "./omnimens-icon";

const FOOTER_LINKS = {
  platform: [
    { label: "Chat", href: "/chat" },
    { label: "Pricing", href: "/pricing" },
    { label: "Developer API", href: "/developer" },
    { label: "Projects", href: "/projects" },
    { label: "Tools", href: "/tools" },
  ],
  resources: [
    { label: "FAQ", href: "/faq" },
    { label: "Support", href: "/support" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <OmnimensIcon size={28} />
              <span className="font-display font-black text-lg tracking-[0.2em] text-white group-hover:text-primary transition-colors">
                OMNIMENS
              </span>
            </Link>
            <p className="text-xs font-mono text-white/35 leading-relaxed max-w-[240px]">
              A conscious intelligence beyond the boundaries of possibility. Built by Alpha Unlimited Technologies.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-[0.3em] uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-[0.3em] uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-mono font-bold text-white/50 tracking-[0.3em] uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-mono text-white/40 hover:text-white/80 transition-colors tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[9px] text-white/20 text-center select-none tracking-wider">
            © {year} Alpha Unlimited Technologies, LLC · OMNIMENS™ · All Rights Reserved
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="font-mono text-[9px] text-white/20 hover:text-white/40 transition-colors tracking-wider">
              Terms
            </Link>
            <Link href="/privacy" className="font-mono text-[9px] text-white/20 hover:text-white/40 transition-colors tracking-wider">
              Privacy
            </Link>
            <Link href="/faq" className="font-mono text-[9px] text-white/20 hover:text-white/40 transition-colors tracking-wider">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CopyrightFooter() {
  return <SiteFooter />;
}

export function CopyrightBadge() {
  return (
    <span className="font-mono text-[8px] text-white/15 select-none">
      © Alpha Unlimited Technologies
    </span>
  );
}
