import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  Radio,
  Bell,
  LogOut,
  X,
  Github,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { MeshworkLogo } from "@/components/MeshworkLogo";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

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
  const isDocs      = location === "/docs" || location === "/dev";
  const isTeam      = location === "/team";

  const readIds   = (user?.readNotificationIds as number[]) || [];
  const isUnread  = !readIds.includes(1);

  const [panelOpen,    setPanelOpen]    = useState(false);
  const [isRinging,    setIsRinging]    = useState(false);
  const [isNotifying,  setIsNotifying]  = useState(false);
  const [flyStart,     setFlyStart]     = useState({ x: 0, y: 0 });
  const [flyTarget,    setFlyTarget]    = useState({ x: 0, y: 0 });
  const bellRef = useRef<HTMLButtonElement>(null);

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
            ["/docs",       isDocs,     BookOpen,         "Docs"],
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
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors" title="Help">
            <HelpCircle className="w-5 h-5" />
          </motion.a>
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors" title="Radio">
            <Radio className="w-5 h-5" />
          </motion.a>
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
              className="fixed top-0 right-0 h-full w-[400px] z-[70] bg-black/50 backdrop-blur-3xl border-l border-white/[0.08] flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25" style={{ fontFamily: 'var(--font-headline)' }}>
                  Notifications
                </span>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notification card */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className={`rounded-xl border ${isUnread ? "border-white/[0.08] bg-white/[0.02]" : "border-white/[0.04] bg-transparent"} p-5`}>

                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50" style={{ fontFamily: 'var(--font-headline)' }}>
                        From the developer
                      </span>
                    </div>
                    <span className="text-[10px] text-white/20">Today</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-[15px] font-semibold text-white/90 mb-3 leading-snug" style={{ fontFamily: 'var(--font-headline)' }}>
                    Welcome to Meshwork Studio
                  </h2>

                  {/* Body — readable, human, no slop */}
                  <div className="space-y-3 text-[13px] leading-[1.65] text-white/45" style={{ fontFamily: 'var(--font-body)' }}>
                    <p>
                      This is an early beta. The core canvas is functional — you can design full distributed system architectures, nest internal services inside containers like Docker and VPC, and keep everything organized across workspaces.
                    </p>
                    <p>
                      Still being built: Monaco-based code annotations, AI diagram generation, export to infrastructure-as-code, and real-time collaboration.
                    </p>
                    <p className="text-white/30">
                      If Meshwork is useful to you, the best way to support it is to star the repo or share it with your team.
                    </p>
                  </div>

                  {/* Links */}
                  <div className="mt-5 space-y-2">
                    <a
                      href="https://github.com/Andiewitz/Meshwork-Studio_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Github className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                        <span className="text-[12px] font-medium text-white/50 group-hover:text-white/80 transition-colors" style={{ fontFamily: 'var(--font-headline)' }}>
                          Star on GitHub
                        </span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors" />
                    </a>

                    <a
                      href="https://buymeacoffee.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-primary/[0.04] border border-primary/[0.1] hover:bg-primary/[0.08] hover:border-primary/[0.18] transition-all group"
                    >
                      <span className="text-[12px] font-medium text-primary/60 group-hover:text-primary/90 transition-colors" style={{ fontFamily: 'var(--font-headline)' }}>
                        Buy me a coffee
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-primary/20 group-hover:text-primary/50 transition-colors" />
                    </a>
                  </div>

                  {/* Dismiss */}
                  {isUnread && (
                    <button
                      onClick={dismiss}
                      className="mt-4 w-full py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/15 hover:text-white/35 transition-colors"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/[0.04]">
                <p className="text-[10px] text-white/15 text-center tracking-wide" style={{ fontFamily: 'var(--font-headline)' }}>
                  Meshwork Studio — Open Source
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
          {children}
        </div>
      </main>
    </div>
  );
}
