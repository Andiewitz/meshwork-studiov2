import React, { Suspense } from "react";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HelmetProvider } from "react-helmet-async";

// Route-level code splitting via React.lazy
const NotFound = React.lazy(() => import("@/pages/not-found"));
const Home = React.lazy(() => import("@/pages/Home"));
const Landing = React.lazy(() => import("@/pages/Landing"));
const Login = React.lazy(() => import("@/pages/auth/Login"));
const Register = React.lazy(() => import("@/pages/auth/Register"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Workspace = React.lazy(() => import("@/pages/Workspace"));
const Dev = React.lazy(() => import("@/pages/Dev"));
const Team = React.lazy(() => import("@/pages/Team"));
const Templates = React.lazy(() => import("@/pages/Templates"));

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
            <Route path="/team">
              <ProtectedRoute component={Team} />
            </Route>
            <Route path="/dev">
              <ProtectedRoute component={Dev} />
            </Route>
            <Route path="/templates">
              <ProtectedRoute component={Templates} />
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
              <Suspense fallback={<RedirectingScreen />}>
                <Router />
              </Suspense>
            </TooltipProvider>
          </WouterRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
