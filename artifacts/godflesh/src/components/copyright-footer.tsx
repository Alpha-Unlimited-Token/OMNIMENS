/**
 * ============================================================
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 * ============================================================
 */

export function CopyrightFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="w-full flex items-center justify-center py-2 px-4 border-t border-white/5 bg-black/60">
      <p className="font-mono text-[9px] text-white/20 text-center select-none">
        © {year} Alpha Unlimited Technologies · OMNIMENS™ · All Rights Reserved · Proprietary &amp; Confidential
      </p>
    </div>
  );
}

export function CopyrightBadge() {
  return (
    <span className="font-mono text-[8px] text-white/15 select-none">
      © Alpha Unlimited Technologies
    </span>
  );
}
