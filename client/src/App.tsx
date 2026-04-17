import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useTheme, ThemeProvider } from "@/hooks/use-theme";
import { useCsrfTokenInitializer } from "@/lib/csrf-init";
import { RedirectingScreen } from "@/components/ui/loading-screen";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Settings from "@/pages/Settings";
import Workspace from "@/pages/Workspace";
import Dev from "@/pages/Dev";
import Docs from "@/pages/Docs"; // Redesign route
import Team from "@/pages/Team"; // Redesign route
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HelmetProvider } from "react-helmet-async";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isRedirecting } = useAuth();

  if (isLoading || isRedirecting) {
    return <RedirectingScreen />;
  }

  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  return <Component />;
}

const PageTransition = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.98 }}
    transition={{ 
      duration: 0.3, 
      ease: [0.25, 0.1, 0.25, 1],
      opacity: { duration: 0.2 }
    }}
    className={cn("flex-1", className)}
    style={{ willChange: "opacity, transform" }}
  >
    {children}
  </motion.div>
);

function Router() {
  const [location] = useLocation();
  const { user, isLoading, isRedirecting } = useAuth();

  // Auth routes
  if (location.startsWith("/auth/")) {
    if (isRedirecting) {
      return <RedirectingScreen />;
    }
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ 
            duration: 0.35, 
            ease: [0.25, 0.1, 0.25, 1],
            opacity: { duration: 0.25 }
          }}
          className="min-h-screen"
          style={{ willChange: "opacity, transform" }}
        >
          <Switch location={location} key={location}>
            <Route path="/auth/login">
              <Login />
            </Route>
            <Route path="/auth/register">
              <Register />
            </Route>
            <Route>
              <Redirect to="/auth/login" />
            </Route>
          </Switch>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show redirecting screen during auth transitions for protected routes
  if (isLoading || isRedirecting) {
    return <RedirectingScreen />;
  }

  // Public Landing Page Setup
  if (location === "/") {
    if (user) {
      return <Redirect to="/home" />;
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          <Landing />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Workspace routes - scale animation from card
  if (location.startsWith("/workspace/")) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ 
            duration: 0.35, 
            ease: [0.25, 0.1, 0.25, 1],
            opacity: { duration: 0.25 }
          }}
          className="h-full"
          style={{ willChange: "opacity, transform" }}
        >
          <Switch location={location} key={location}>
            <Route path="/workspace/:id">
              <ProtectedRoute component={Workspace} />
            </Route>
          </Switch>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Dashboard routes with layout
  return (
    <DashboardLayout>
      <div className="flex-1">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Switch location={location}>
            <Route path="/home">
              <ProtectedRoute component={Home} />
            </Route>
            <Route path="/workspaces">
              <ProtectedRoute component={Home} />
            </Route>
            <Route path="/settings">
              <ProtectedRoute component={Settings} />
            </Route>
            <Route path="/docs">
              <ProtectedRoute component={Docs} />
            </Route>
            <Route path="/team">
              <ProtectedRoute component={Team} />
            </Route>
            <Route path="/dev">
              <ProtectedRoute component={Dev} />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function App() {
  // Initialize CSRF token on app load
  useCsrfTokenInitializer();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <WouterRouter>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WouterRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
