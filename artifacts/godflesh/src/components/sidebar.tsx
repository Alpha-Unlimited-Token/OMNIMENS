import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useState, useEffect } from "react";
import {
  Home, FolderOpen, CreditCard,
  ChevronLeft, ChevronRight,
  User, Zap, BookOpen,
  Layers, Key, Rocket,
  Plus, Mic, X, Terminal, MoreHorizontal
} from "lucide-react";
import { OmnimensIcon } from "./omnimens-icon";
import { NotificationBell } from "./notification-center";
import { SearchTrigger } from "./global-search";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
};

const MAIN_NAV: NavItem[] = [
  { icon: <Home className="w-[18px] h-[18px]" />, label: "Home", href: "/" },
  { icon: <FolderOpen className="w-[18px] h-[18px]" />, label: "My Projects", href: "/projects" },
  { icon: <Layers className="w-[18px] h-[18px]" />, label: "Templates", href: "/templates" },
  { icon: <Rocket className="w-[18px] h-[18px]" />, label: "Deployments", href: "/deploy" },
];

const TOOLS_NAV: NavItem[] = [
  { icon: <Mic className="w-[18px] h-[18px]" />, label: "Connect", href: "/connect" },
  { icon: <BookOpen className="w-[18px] h-[18px]" />, label: "Memory", href: "/memory" },
  { icon: <Key className="w-[18px] h-[18px]" />, label: "Developer", href: "/developer" },
  { icon: <CreditCard className="w-[18px] h-[18px]" />, label: "Pricing", href: "/pricing" },
];

export function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setExpanded(false);
  }, [location, isMobile]);

  if (isMobile) {
    return <MobileBottomBar location={location} isAuthenticated={!!isAuthenticated} />;
  }

  return (
    <aside
      className={`h-screen flex flex-col bg-[#1C2333] border-r border-[#2B3245] transition-all duration-200 ease-out z-40 shrink-0 ${
        expanded ? "w-[220px]" : "w-[52px]"
      }`}
    >
      <div className={`flex items-center h-12 ${expanded ? "px-3 justify-between" : "justify-center"} border-b border-[#2B3245]`}>
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <div className="shrink-0 group-hover:drop-shadow-[0_0_6px_rgba(124,58,237,0.5)] transition-all">
            <OmnimensIcon size={24} />
          </div>
          {expanded && (
            <span className="font-semibold text-[13px] tracking-wide text-white/90 truncate">
              OMNIMENS
            </span>
          )}
        </Link>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="p-1 rounded text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center h-7 text-white/25 hover:text-white/45 transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      <div className={`${expanded ? "px-2 pt-2" : "px-1.5 pt-2"}`}>
        <button
          onClick={() => setLocation("/chat")}
          className={`w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all ${
            expanded ? "px-3 py-2" : "p-2"
          }`}
        >
          <Plus className="w-4 h-4" />
          {expanded && <span className="text-[12px] font-mono font-medium tracking-wide">Create</span>}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-1.5 pt-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <SearchTrigger expanded={expanded} />

        <div className="h-px bg-[#2B3245] my-1.5 mx-1" />

        <NavSection items={MAIN_NAV} location={location} expanded={expanded} />

        {isAuthenticated && (
          <>
            <div className="h-px bg-[#2B3245] my-1.5 mx-1" />
            <NavSection items={TOOLS_NAV} location={location} expanded={expanded} />
          </>
        )}
      </nav>

      <div className="border-t border-[#2B3245] px-1.5 py-1.5 space-y-0.5">
        {isAuthenticated && (
          <NotificationBell expanded={expanded} />
        )}
        {isAuthenticated ? (
          <Link
            href="/account"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
              location === "/account"
                ? "bg-primary/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-blue-500/30 flex items-center justify-center shrink-0 text-[10px] font-semibold text-white">
              {((user as any)?.username || "U")[0].toUpperCase()}
            </div>
            {expanded && (
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-white/90 truncate">
                  {(user as any)?.username || "Account"}
                </div>
              </div>
            )}
          </Link>
        ) : (
          <button
            onClick={() => setLocation("/login")}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all ${
              expanded ? "" : "justify-center"
            }`}
          >
            <Zap className="w-[18px] h-[18px]" />
            {expanded && <span className="text-[13px] font-medium">Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

function NavSection({
  items,
  location,
  expanded,
}: {
  items: NavItem[];
  location: string;
  expanded: boolean;
}) {
  return (
    <>
      {items.map((item) => {
        const isActive = item.href === "/"
          ? location === "/"
          : location.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all ${
              isActive
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <div className="shrink-0 flex items-center justify-center w-[18px]">
              {item.icon}
            </div>
            {expanded ? (
              <span className="text-[12px] font-mono font-medium tracking-wide truncate">
                {item.label}
              </span>
            ) : (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[#2B3245] border border-[#3D4659] text-[11px] font-mono text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                {item.label}
              </div>
            )}
            {item.badge && expanded && (
              <span className="ml-auto text-[10px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function MobileBottomBar({
  location,
  isAuthenticated,
}: {
  location: string;
  isAuthenticated: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && moreOpen) setMoreOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [moreOpen]);

  const primaryTabs = [
    { icon: <Home className="w-[18px] h-[18px]" />, label: "Home", href: "/" },
    { icon: <Terminal className="w-[18px] h-[18px]" />, label: "Create", href: "/chat" },
    { icon: <FolderOpen className="w-[18px] h-[18px]" />, label: "Projects", href: "/projects" },
  ];

  const moreItems: { icon: React.ReactNode; label: string; href: string; accent?: boolean }[] = [
    { icon: <Mic className="w-[18px] h-[18px]" />, label: "Talk to OMNIMENS", href: "/connect", accent: true },
    { icon: <Layers className="w-[18px] h-[18px]" />, label: "Templates", href: "/templates" },
    { icon: <Rocket className="w-[18px] h-[18px]" />, label: "Deployments", href: "/deploy" },
    ...(isAuthenticated ? [
      { icon: <BookOpen className="w-[18px] h-[18px]" />, label: "Memory", href: "/memory" },
      { icon: <Key className="w-[18px] h-[18px]" />, label: "Developer", href: "/developer" },
      { icon: <CreditCard className="w-[18px] h-[18px]" />, label: "Pricing", href: "/pricing" },
    ] : []),
    { icon: <User className="w-[18px] h-[18px]" />, label: isAuthenticated ? "Account" : "Sign In", href: isAuthenticated ? "/account" : "/login" },
  ];

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setMoreOpen(false)}>
          <div
            id="mobile-more-menu"
            role="menu"
            aria-label="Additional navigation"
            className="absolute bottom-[56px] left-0 right-0 bg-[#141922] border-t border-[#2B3245] rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.4)] safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-white/15" />
            </div>
            <div className="px-3 pb-3 grid grid-cols-3 gap-1">
              {moreItems.map((item) => {
                const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : item.accent
                          ? "text-primary/70 hover:bg-primary/10"
                          : "text-white/55 hover:bg-white/5"
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    {item.icon}
                    <span className="text-[10px] font-mono font-medium tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#141922]/98 backdrop-blur-xl border-t border-[#2B3245]/80 safe-area-bottom">
        <div className="flex items-center justify-around h-[52px] px-1">
          {primaryTabs.map((tab) => {
            const isActive = tab.href === "/" ? location === "/" : location.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${
                  isActive ? "text-primary" : "text-white/40 active:text-white/60"
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-mono font-medium tracking-wider">{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(o => !o)}
            aria-expanded={moreOpen}
            aria-controls="mobile-more-menu"
            aria-label="More navigation options"
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all ${
              moreOpen ? "text-primary" : "text-white/40 active:text-white/60"
            }`}
          >
            {moreOpen ? <X className="w-[18px] h-[18px]" /> : <MoreHorizontal className="w-[18px] h-[18px]" />}
            <span className="text-[9px] font-mono font-medium tracking-wider">More</span>
            {moreOpen && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
          </button>
        </div>
      </nav>
    </>
  );
}
