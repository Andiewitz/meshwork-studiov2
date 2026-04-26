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
  Heart,
  Sparkles,
  ExternalLink,
  Coffee,
  Github
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { MeshworkLogo } from "@/components/MeshworkLogo";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// -- Animation Variants --
const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const WELCOME_NOTIF = {
  id: 1,
  title: "Welcome to Meshwork Studio Beta 👋",
  time: "Now",
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, updatePreferences } = useAuth();
  const [location] = useLocation();

  const isOverview = location === "/home";
  const isProjects = location === "/workspaces";
  const isDocs = location === "/docs" || location === "/dev";
  const isTeam = location === "/team";

  // Notification state
  const readIds = (user?.readNotificationIds as number[]) || [];
  const isUnread = !readIds.includes(WELCOME_NOTIF.id);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [flyStart, setFlyStart] = useState({ x: 0, y: 0 });
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const bellRef = useRef<HTMLButtonElement>(null);

  const markRead = () => {
    updatePreferences({ readNotificationIds: [WELCOME_NOTIF.id] });
  };

  // Global fly notification effect
  useEffect(() => {
    const handleFlyNotification = () => {
      if (isNotifying || user?.hasNotifiedTeam) return;
      setFlyStart({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      if (bellRef.current) {
        const r = bellRef.current.getBoundingClientRect();
        setFlyTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      } else {
        setFlyTarget({ x: window.innerWidth - 100, y: 40 });
      }
      setIsNotifying(true);
      setTimeout(() => setIsRinging(true), 800);
      setTimeout(() => setIsRinging(false), 1200);
      setTimeout(() => setIsNotifying(false), 1000);
    };
    window.addEventListener("trigger-fly-notification", handleFlyNotification);
    return () => window.removeEventListener("trigger-fly-notification", handleFlyNotification);
  }, [isNotifying, user?.hasNotifiedTeam]);

  // Smooth scroll
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
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen antialiased flex cursor-figma">

      {/* ── Left Sidebar ── */}
      <motion.aside
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="fixed left-0 top-0 h-full w-20 z-50 bg-[#000000] flex flex-col items-center py-8 gap-8 border-r border-[#494847]/15 font-body text-xs tracking-tight"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <div className="flex items-center justify-center">
            <MeshworkLogo className="text-white w-8 h-8" />
          </div>
        </motion.div>

        <nav className="flex flex-col items-center gap-6 flex-1">
          <Link href="/home">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isOverview ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Overview">
              <LayoutDashboard className={`w-5 h-5 ${isOverview ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
          <Link href="/workspaces">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isProjects ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Projects">
              <Package className={`w-5 h-5 ${isProjects ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
          <Link href="/docs">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isDocs ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Docs">
              <BookOpen className={`w-5 h-5 ${isDocs ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
          <Link href="/team">
            <motion.button variants={itemVariants} className={`transition-colors duration-150 cursor-figma-pointer ${isTeam ? 'text-[#FF5500] drop-shadow-[0_0_4px_rgba(255,85,0,0.4)]' : 'text-[#777575] hover:bg-[#131313] hover:text-white p-2 rounded'}`} title="Team">
              <Users className={`w-5 h-5 ${isTeam ? 'fill-current' : ''}`} />
            </motion.button>
          </Link>
        </nav>

        <div className="flex flex-col items-center gap-6 mt-auto">
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors cursor-figma-pointer" title="Help">
            <HelpCircle className="w-5 h-5" />
          </motion.a>
          <motion.a variants={itemVariants} href="#" className="text-[#777575] hover:text-white transition-colors cursor-figma-pointer" title="Radio">
            <Radio className="w-5 h-5" />
          </motion.a>
          <div className="relative group">
            <motion.div variants={itemVariants} className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/20 cursor-figma-pointer flex items-center justify-center font-headline font-bold text-xs text-white">
              {user?.profileImageUrl ? (
                <img alt="User profile" className="w-full h-full object-cover" src={user.profileImageUrl} />
              ) : (
                user?.firstName?.[0] || user?.email?.[0] || "U"
              )}
            </motion.div>
            <div className="absolute left-full bottom-0 ml-4 px-3 py-2 bg-surface-container-highest border border-outline-variant/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
              <button onClick={() => logout()} className="text-sm font-body text-white flex items-center gap-2 hover:text-primary transition-colors cursor-figma-pointer">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* ── Top Navigation Bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-0 left-20 right-0 z-40 bg-neutral-950/60 backdrop-blur-xl flex justify-between items-center px-10 py-4"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tighter text-white font-headline">Meshwork Studio</h1>
          <span className="bg-black text-white text-[10px] font-headline font-bold px-3 py-1 rounded-full border border-white tracking-widest uppercase">Beta</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.button
                ref={bellRef}
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); }}
                animate={isRinging ? { rotate: [0, -20, 20, -20, 20, 0] } : { rotate: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative flex items-center justify-center w-8 h-8 transition-colors duration-300 cursor-figma-pointer ${isRinging || isNotificationsOpen ? 'text-primary' : 'text-[#E5E2E1] hover:text-white'}`}
              >
                <Bell className="w-5 h-5" />
                {isUnread && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-black" />
                )}
              </motion.button>
            </div>
            <Link href="/settings">
              <button className="flex items-center justify-center w-8 h-8 text-[#E5E2E1] hover:text-white transition-colors duration-300 cursor-figma-pointer">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Notifications Side Panel + Backdrop ── */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              key="notif-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm cursor-figma-pointer"
            />

            {/* Slide-in panel */}
            <motion.aside
              key="notif-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-[420px] z-[70] bg-[#0A0A0A] border-l border-white/[0.06] flex flex-col overflow-hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-white/40" />
                  <span className="text-[13px] font-bold uppercase tracking-[0.15em] text-white/70">Notifications</span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Single notification: Welcome to Beta */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <div className={`rounded-2xl border p-5 transition-all ${isUnread ? 'border-[#FF5500]/20 bg-[#FF5500]/[0.04]' : 'border-white/[0.05] bg-white/[0.02]'}`}>
                  {/* Notification header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-[#FF5500]" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-white/90">{WELCOME_NOTIF.title}</div>
                        <div className="text-[10px] text-white/25 uppercase tracking-wider mt-0.5">{WELCOME_NOTIF.time}</div>
                      </div>
                    </div>
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-[#FF5500] flex-shrink-0 mt-1.5" />
                    )}
                  </div>

                  {/* Message body */}
                  <div className="space-y-3 text-[13px] text-white/50 leading-relaxed">
                    <p>
                      Hey{user?.firstName ? ` ${user.firstName}` : ''} — thanks for being here. Meshwork Studio is in active beta and I'm building it as a serious tool for developers to design and document distributed systems visually.
                    </p>
                    <p>
                      Right now you can diagram full architectures, nest internal services inside Docker/VPC containers, use real tech stack nodes, and keep everything organized in workspaces.
                    </p>
                    <p className="text-white/40">
                      What's coming next — Monaco-powered code annotations, AI-assisted diagram generation, export to infrastructure-as-code, and team collaboration.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/[0.05] my-4" />

                  {/* Support section */}
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/20 mb-3">
                      Support the project
                    </div>
                    <a
                      href="https://github.com/Andiewitz/Meshwork-Studio_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                    >
                      <Github className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-white/70 group-hover:text-white/90 transition-colors">Star on GitHub</div>
                        <div className="text-[10px] text-white/25">Help others find the project</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors" />
                    </a>
                    <a
                      href="https://buymeacoffee.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FF5500]/[0.05] border border-[#FF5500]/[0.12] hover:bg-[#FF5500]/[0.09] hover:border-[#FF5500]/20 transition-all group"
                    >
                      <Coffee className="w-4 h-4 text-[#FF5500]/60 group-hover:text-[#FF5500] transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-[#FF5500]/80 group-hover:text-[#FF5500] transition-colors">Buy me a coffee</div>
                        <div className="text-[10px] text-white/25">Keep the servers running</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#FF5500]/20 group-hover:text-[#FF5500]/50 transition-colors" />
                    </a>
                  </div>

                  {/* Dismiss */}
                  {isUnread && (
                    <button
                      onClick={markRead}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
                    >
                      <Heart className="w-3 h-3" />
                      Got it
                    </button>
                  )}
                </div>
              </div>

              {/* Panel footer */}
              <div className="px-6 py-4 border-t border-white/[0.05]">
                <p className="text-[10px] text-white/15 text-center">
                  Built with ♥ — Meshwork Studio is open source
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Flying Notification Animation ── */}
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

      {/* ── Main Content ── */}
      <main className="pl-20 pt-16 min-h-screen technical-gradient w-full">
        <div className="w-full h-full p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
