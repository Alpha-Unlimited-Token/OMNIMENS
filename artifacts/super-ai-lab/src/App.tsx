import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import SessionPage from "@/pages/session";
import BlueprintPage from "@/pages/blueprint";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: false, 
      refetchOnWindowFocus: false 
    } 
  }
});

// ── Owner gate: only the platform owner can access this lab.
// Everyone else is silently sent to OMNIMENS.
function OwnerGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "owner" | "redirect">("checking");

  useEffect(() => {
    fetch("/api/omnimens/status", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.isOwner) {
          setStatus("owner");
        } else {
          setStatus("redirect");
        }
      })
      .catch(() => setStatus("redirect"));
  }, []);

  if (status === "checking") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
      </div>
    );
  }

  if (status === "redirect") {
    window.location.replace("/godflesh/");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/session/:id" component={SessionPage} />
        <Route path="/blueprint/:id" component={BlueprintPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OwnerGate>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </OwnerGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
