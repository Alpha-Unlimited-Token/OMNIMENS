/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { Switch, Route, Router as WouterRouter } from "wouter";
import { lazy, Suspense, Component, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initTheme } from "@/hooks/use-theme";
import { useAuth } from "@workspace/replit-auth-web";
import { WorkspaceLayout } from "@/components/workspace-layout";
import NotFound from "@/pages/not-found";

function retryLazy(factory: () => Promise<any>, retries = 2): ReturnType<typeof lazy> {
  return lazy(() =>
    factory().catch((err: any) => {
      if (retries > 0) {
        return new Promise<any>((resolve) => setTimeout(resolve, 800)).then(() =>
          retryLazy(factory, retries - 1) as any
        );
      }
      const isChunkError =
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("Loading chunk") ||
        err?.message?.includes("dynamically imported module") ||
        err?.name === "ChunkLoadError";
      if (isChunkError && !sessionStorage.getItem("chunk_reload")) {
        sessionStorage.setItem("chunk_reload", "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw err;
    })
  );
}

const Home = retryLazy(() => import("@/pages/home"));
const Login = retryLazy(() => import("@/pages/login"));
const Chat = retryLazy(() => import("@/pages/chat"));
const Pricing = retryLazy(() => import("@/pages/pricing"));
const Account = retryLazy(() => import("@/pages/account"));
const Projects = retryLazy(() => import("@/pages/projects"));
const Dashboard = retryLazy(() => import("@/pages/dashboard"));
const Memory = retryLazy(() => import("@/pages/memory"));
const Tools = retryLazy(() => import("@/pages/tools"));
const FAQ = retryLazy(() => import("@/pages/faq"));
const Developer = retryLazy(() => import("@/pages/developer"));
const Support = retryLazy(() => import("@/pages/support"));
const Terms = retryLazy(() => import("@/pages/terms"));
const Privacy = retryLazy(() => import("@/pages/privacy"));
const About = retryLazy(() => import("@/pages/about"));
const Contact = retryLazy(() => import("@/pages/contact"));
const FooterLinks = retryLazy(() => import("@/pages/footer-links"));
const LipSync = retryLazy(() => import("@/pages/lip-sync"));
const Templates = retryLazy(() => import("@/pages/templates"));
const Deploy = retryLazy(() => import("@/pages/deploy"));

initTheme();
try { sessionStorage.removeItem("chunk_reload"); } catch {}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}

class ChunkErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[OMNIMENS ERROR BOUNDARY]", error?.message, error?.stack);
    console.error("[OMNIMENS ERROR BOUNDARY] Component stack:", errorInfo?.componentStack);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const r of regs) r.unregister();
      });
      caches.keys().then((keys) => {
        for (const k of keys) caches.delete(k);
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4 text-white">
          <p className="font-mono text-sm text-white/60 tracking-widest">OMNIMENS could not load. Please refresh.</p>
          <button
            onClick={() => {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then((regs) => {
                  for (const r of regs) r.unregister();
                });
                caches.keys().then((keys) => {
                  for (const k of keys) caches.delete(k);
                });
              }
              window.location.reload();
            }}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-mono tracking-widest rounded-lg transition-colors"
          >
            RELOAD
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function WS({ children }: { children: ReactNode }) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageFallback />;
  if (isAuthenticated) return <WS><Dashboard /></WS>;
  return <Home />;
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={Login} />
        <Route path="/chat" component={Chat} />

        <Route path="/projects">{() => <WS><Projects /></WS>}</Route>
        <Route path="/account">{() => <WS><Account /></WS>}</Route>
        <Route path="/pricing">{() => <WS><Pricing /></WS>}</Route>
        <Route path="/memory">{() => <WS><Memory /></WS>}</Route>
        <Route path="/developer">{() => <WS><Developer /></WS>}</Route>
        <Route path="/dev">{() => <WS><Developer /></WS>}</Route>
        <Route path="/tools">{() => <WS><Tools /></WS>}</Route>
        <Route path="/templates">{() => <WS><Templates /></WS>}</Route>
        <Route path="/deploy">{() => <WS><Deploy /></WS>}</Route>

        <Route path="/faq" component={FAQ} />
        <Route path="/support" component={Support} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/footer-links" component={FooterLinks} />
        <Route path="/lip-sync" component={LipSync} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ChunkErrorBoundary>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </ChunkErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
