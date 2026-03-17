import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState, lazy, Suspense } from "react";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/home"));
const SessionPage = lazy(() => import("@/pages/session"));
const BlueprintPage = lazy(() => import("@/pages/blueprint"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

// ── Double-lock gate ──────────────────────────────────────────────────────────
// Lock 1: The request path must contain the secret token.
// Lock 2: The authenticated session must belong to the platform owner.
// Either lock failing silently sends the visitor to OMNIMENS with no hint given.

const _k = "/dLdFrQJk4IwoKwlPi8O_JPls";

function LabGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    // Lock 1 — path must begin with the secret segment
    const hasToken = window.location.pathname.startsWith(_k);
    if (!hasToken) {
      setStatus("denied");
      return;
    }

    // Lock 2 — session must be the owner
    fetch("/api/omnimens/status", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.isOwner === true) {
          setStatus("granted");
        } else {
          setStatus("denied");
        }
      })
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
      </div>
    );
  }

  if (status === "denied") {
    window.location.replace("/godflesh/");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/session/:id" component={SessionPage} />
          <Route path="/blueprint/:id" component={BlueprintPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LabGate>
          <WouterRouter base={_k}>
            <Router />
          </WouterRouter>
        </LabGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
