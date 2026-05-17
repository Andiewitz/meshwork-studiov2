import { ReactNode, useState, useRef, useEffect, Suspense } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  Bell,
  LogOut,
  X,
  Github,
  ArrowUpRight,
  Newspaper
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { MeshworkLogo } from "@/components/MeshworkLogo";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { OnboardingFlow, useOnboardingComplete } from "@/components/ui/onboarding-modal";

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, updatePreferences } = useAuth();
  const [location] = useLocation();

  const isOverview  = location === "/home";
  const isProjects  = location === "/workspaces";
  const isDev       = location === "/dev";
  const isTeam      = location === "/team";

  const readIds   = (user?.readNotificationIds as number[]) || [];
  const isUnread  = !readIds.includes(1);

  const [panelOpen,    setPanelOpen]    = useState(false);
  const [isRinging,    setIsRinging]    = useState(false);
  const [isNotifying,  setIsNotifying]  = useState(false);
  const [flyStart,     setFlyStart]     = useState({ x: 0, y: 0 });
  const [flyTarget,    setFlyTarget]    = useState({ x: 0, y: 0 });
  const bellRef = useRef<HTMLButtonElement>(null);

  // Onboarding gate
  const [onboardingComplete, setOnboardingComplete] = useState(() => useOnboardingComplete(user));
  useEffect(() => {
    const handler = () => setOnboardingComplete(true);
    window.addEventListener("onboarding-complete", handler);
    return () => window.removeEventListener("onboarding-complete", handler);
  }, []);

  const dismiss = () => updatePreferences({ readNotificationIds: [1] });

  useEffect(() => {
    const handler = () => {
      if (isNotifying || user?.hasNotifiedTeam) return;
      setFlyStart({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const r = bellRef.current?.getBoundingClientRect();
      setFlyTarget(r
        ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        : { x: window.innerWidth - 100, y: 40 });
      setIsNotifying(true);
      setTimeout(() => setIsRinging(true),  800);
      setTimeout(() => setIsRinging(false), 1200);
      setTimeout(() => setIsNotifying(false), 1000);
    };
    window.addEventListener("trigger-fly-notification", handler);
    return () => window.removeEventListener("trigger-fly-notification", handler);
  }, [isNotifying, user?.hasNotifiedTeam]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen antialiased flex cursor-figma">

      {/* ── Left sidebar ── */}
      <motion.aside
        initial="hidden" animate="visible" variants={sidebarVariants}
        className="fixed left-0 top-0 h-full w-20 z-50 bg-black/40 backdrop-blur-xl flex flex-col items-center py-8 gap-8 border-r border-white/[0.05]"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <MeshworkLogo className="text-white w-8 h-8" />
        </motion.div>

        <nav className="flex flex-col items-center gap-6 flex-1">
          {([
            ["/home",       isOverview, LayoutDashboard, "Overview"],
            ["/workspaces", isProjects, Package,          "Projects"],
            ["/dev",        isDev,      Newspaper,        "Blog"],
            ["/team",       isTeam,     Users,            "Team"],
          ] as const).map(([href, active, Icon, label]) => (
            <Link href={href} key={href}>
              <motion.button
                variants={itemVariants}
                title={label}
                className={`transition-all duration-300 cursor-figma-pointer ${
                  active
                    ? "text-primary drop-shadow-[0_0_8px_rgba(255,102,0,0.5)] scale-110"
                    : "text-white/30 hover:bg-white/[0.05] hover:text-white p-2 rounded-xl"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "fill-current" : ""}`} />
              </motion.button>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-6 mt-auto">
          <motion.a variants={itemVariants} href="https://github.com/Andiewitz/Meshwork-Studio_" target="_blank" rel="noopener noreferrer" className="text-[#777575] hover:text-white transition-colors" title="Help">
            <HelpCircle className="w-5 h-5" />
          </motion.a>
          <Link href="/dev">
            <motion.span variants={itemVariants} className="text-[#777575] hover:text-white transition-colors block" title="Blog">
              <Newspaper className="w-5 h-5" />
            </motion.span>
          </Link>
          <div className="relative group">
            <motion.div variants={itemVariants} className="w-8 h-8 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              {user?.profileImageUrl
                ? <img alt="" className="w-full h-full object-cover" src={user.profileImageUrl} />
                : (user?.firstName?.[0] || user?.email?.[0] || "U")}
            </motion.div>
            <div className="absolute left-full bottom-0 ml-4 px-3 py-2 bg-[#141414] border border-white/[0.06] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
              <button onClick={() => logout()} className="text-[12px] text-white/60 flex items-center gap-2 hover:text-white transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-20 right-0 z-40 bg-black/40 backdrop-blur-xl flex justify-between items-center px-10 py-4 border-b border-white/[0.05]"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-headline)' }}>
            Meshwork Studio
          </h1>
          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            ref={bellRef}
            onClick={() => setPanelOpen(v => !v)}
            animate={isRinging ? { rotate: [0, -18, 18, -18, 18, 0] } : { rotate: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative w-8 h-8 flex items-center justify-center transition-all ${panelOpen || isRinging ? "text-primary scale-110" : "text-white/30 hover:text-white/80"}`}
          >
            <Bell className="w-4 h-4" />
            {isUnread && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,102,0,0.8)]" />}
          </motion.button>

          <Link href="/settings">
            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.header>

      {/* ── Notification side panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <motion.aside
              key="panel"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-[380px] z-[70] bg-[#0e0e0e]/95 backdrop-blur-2xl border-l border-white/[0.06] flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.6)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-headline)' }}>
                    Notifications
                  </span>
                  {isUnread && (
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isUnread && (
                    <button
                      onClick={dismiss}
                      className="text-[11px] text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded hover:bg-white/[0.04]"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto">
                {/* Notification item */}
                <div
                  className={`px-5 py-4 border-b border-white/[0.04] transition-colors ${
                    isUnread ? "bg-white/[0.015]" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Indicator */}
                    <div className="pt-0.5 shrink-0">
                      {isUnread ? (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/10 mt-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white/70" style={{ fontFamily: 'var(--font-headline)' }}>
                          Welcome to Meshwork Studio
                        </span>
                        <span className="text-[10px] text-white/20 shrink-0 ml-3">Today</span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-white/35 mb-3">
                        This is an early beta. The core canvas is functional — design architectures, nest services inside containers, and keep everything organized across workspaces.
                      </p>
                      <a
                        href="https://github.com/Andiewitz/Meshwork-Studio_"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
                      >
                        <Github className="w-3 h-3" />
                        Star on GitHub
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/[0.04]">
                <p className="text-[10px] text-white/15 text-center" style={{ fontFamily: 'var(--font-headline)' }}>
                  Meshwork Studio · Open Source
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Flying bell animation */}
      <AnimatePresence>
        {isNotifying && (
          <motion.div
            initial={{ x: flyStart.x - 12, y: flyStart.y - 12, scale: 1, opacity: 1 }}
            animate={{ x: flyTarget.x - 12, y: flyTarget.y - 12, scale: 0.2, opacity: [1, 1, 0] }}
            transition={{ duration: 0.8, ease: "easeInOut", times: [0, 0.8, 1] }}
            className="fixed z-[100] pointer-events-none text-primary"
          >
            <Bell className="w-6 h-6 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="pl-20 pt-16 min-h-screen technical-gradient w-full">
        <div className="w-full h-full p-12">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="w-8 h-8">
                  <MeshworkLogo />
                </div>
                <div className="w-24 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>

      {/* Onboarding — blocks entire layout until complete */}
      {!onboardingComplete && <OnboardingFlow />}
    </div>
  );
}
