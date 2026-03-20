import { Sidebar } from "./sidebar";
import { GlobalSearch } from "./global-search";
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
    <div className="h-screen flex overflow-hidden bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={isMobile ? "pb-16" : ""}>
          {children}
        </div>
      </main>
      <GlobalSearch />
    </div>
  );
}
