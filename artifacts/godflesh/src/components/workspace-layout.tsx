/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Sidebar } from "./sidebar";
import { GlobalSearch } from "./global-search";
import { ProprietaryBeacon } from "./copyright-footer";
import { useEffect, useState } from "react";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-[#0E1525]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden [&_h1]:font-sans [&_h1]:tracking-normal [&_h2]:font-sans [&_h2]:tracking-normal [&_h3]:font-sans [&_h3]:tracking-normal">
        <div className={isMobile ? "pb-16" : ""}>
          {children}
        </div>
      </main>
      <GlobalSearch />
      <ProprietaryBeacon tech="OMNIMENS Workspace" />
    </div>
  );
}
