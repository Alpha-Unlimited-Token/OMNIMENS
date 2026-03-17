import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initTheme } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Chat from "@/pages/chat";
import Pricing from "@/pages/pricing";
import Account from "@/pages/account";
import Projects from "@/pages/projects";
import Memory from "@/pages/memory";
import Tools from "@/pages/tools";
import FAQ from "@/pages/faq";
import Developer from "@/pages/developer";
import Support from "@/pages/support";

initTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
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
