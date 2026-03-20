import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useState, useEffect } from "react";
import {
  Home, MessageSquare, FolderOpen, Settings, CreditCard,
  Code2, HelpCircle, ChevronLeft, ChevronRight, LogOut,
  User, Zap, BookOpen, Shield, FileText, Mail, Info,
  Layers, ExternalLink, Key, LifeBuoy
} from "lucide-react";
import { OmnimensIcon } from "./omnimens-icon";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string;
};

const MAIN_NAV: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: "Home", href: "/" },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Create", href: "/chat" },
  { icon: <FolderOpen className="w-5 h-5" />, label: "Projects", href: "/projects" },
];

const TOOLS_NAV: NavItem[] = [
  { icon: <CreditCard className="w-5 h-5" />, label: "Pricing", href: "/pricing" },
  { icon: <Key className="w-5 h-5" />, label: "Developer", href: "/developer" },
  { icon: <BookOpen className="w-5 h-5" />, label: "Memory", href: "/memory" },
];

const SUPPORT_NAV: NavItem[] = [
  { icon: <HelpCircle className="w-5 h-5" />, label: "FAQ", href: "/faq" },
  { icon: <LifeBuoy className="w-5 h-5" />, label: "Support", href: "/support" },
  { icon: <Info className="w-5 h-5" />, label: "About", href: "/about" },
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
      className={`h-screen flex flex-col bg-[#0c0c14] border-r border-white/5 transition-all duration-200 ease-out z-40 shrink-0 ${
        expanded ? "w-56" : "w-16"
      }`}
    >
      <div className="flex items-center h-14 px-3 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.6)] transition-all">
            <OmnimensIcon size={28} />
          </div>
          {expanded && (
            <span className="font-display font-black text-sm tracking-[0.15em] text-white truncate">
              OMNIMENS
            </span>
          )}
        </Link>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`p-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-all ${
            expanded ? "ml-auto" : "hidden"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center h-8 text-white/30 hover:text-white/50 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <NavSection items={MAIN_NAV} location={location} expanded={expanded} />

        <div className="h-px bg-white/5 my-2 mx-1" />

        {isAuthenticated && (
          <>
            <NavSection items={TOOLS_NAV} location={location} expanded={expanded} />
            <div className="h-px bg-white/5 my-2 mx-1" />
          </>
        )}

        <NavSection items={SUPPORT_NAV} location={location} expanded={expanded} />
      </nav>

      <div className="border-t border-white/5 px-2 py-2">
        {isAuthenticated ? (
          <Link
            href="/account"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all group ${
              location === "/account"
                ? "bg-primary/10 text-primary"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            {expanded && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono font-bold truncate">
                  {(user as any)?.username || "Account"}
                </div>
                <div className="text-[10px] font-mono text-white/40 tracking-wider">ACCOUNT</div>
              </div>
            )}
          </Link>
        ) : (
          <button
            onClick={() => setLocation("/login")}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-primary hover:bg-primary/10 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            {expanded && (
              <span className="text-xs font-mono font-bold tracking-widest">CONNECT</span>
            )}
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
            className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="shrink-0 flex items-center justify-center w-5">
              {item.icon}
            </div>
            {expanded ? (
              <span className="text-xs font-mono font-medium tracking-wider truncate">
                {item.label.toUpperCase()}
              </span>
            ) : (
              <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#1a1a2e] border border-white/10 text-xs font-mono text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                {item.label}
              </div>
            )}
            {item.badge && expanded && (
              <span className="ml-auto text-[9px] font-mono font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
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
  const tabs = [
    { icon: <Home className="w-5 h-5" />, label: "Home", href: "/" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Create", href: "/chat" },
    { icon: <FolderOpen className="w-5 h-5" />, label: "Projects", href: "/projects" },
    { icon: <User className="w-5 h-5" />, label: "Account", href: isAuthenticated ? "/account" : "/login" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c14]/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = tab.href === "/"
            ? location === "/"
            : location.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                isActive ? "text-primary" : "text-white/50"
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-mono tracking-wider">{tab.label.toUpperCase()}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
