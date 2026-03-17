import { Switch, Route, Router as WouterRouter } from "wouter";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initTheme } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Chat = lazy(() => import("@/pages/chat"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Account = lazy(() => import("@/pages/account"));
const Projects = lazy(() => import("@/pages/projects"));
const Memory = lazy(() => import("@/pages/memory"));
const Tools = lazy(() => import("@/pages/tools"));
const FAQ = lazy(() => import("@/pages/faq"));
const Developer = lazy(() => import("@/pages/developer"));
const Support = lazy(() => import("@/pages/support"));

initTheme();

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

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/chat" component={Chat} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/account" component={Account} />
        <Route path="/projects" component={Projects} />
        <Route path="/memory" component={Memory} />
        <Route path="/tools" component={Tools} />
        <Route path="/faq" component={FAQ} />
        <Route path="/dev" component={Developer} />
        <Route path="/support" component={Support} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
