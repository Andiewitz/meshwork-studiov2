import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionConfig } from "framer-motion";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  HardDrive, Cloud, FileCode2, Workflow,
  Zap, Layers, MousePointerClick, GitBranch,
} from "lucide-react";

// ─── Animation Presets ─────────────────────────────────────────
const landingContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const landingItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ─── Landing Page ──────────────────────────────────────────────
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Parallax ──────────────────────────────────────────────
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: showcaseScroll } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"],
  });
  const showcaseY = useTransform(showcaseScroll, [0, 1], [100, -100]);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const ctaRef = useRef<HTMLElement>(null);
  const { scrollYProgress: ctaScroll } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaWatermarkY = useTransform(ctaScroll, [0, 1], [160, -160]);

  const marqueeWords = [
    "LOCAL-FIRST", "OPEN SOURCE", "BLAZING FAST",
    "REAL-TIME SYNC", "DRAG & DROP", "AUTO-LAYOUT",
    "KUBERNETES READY", "INFRASTRUCTURE AS CODE",
  ];

  return (
    <>
      <Helmet>
        <title>Meshwork Studio</title>
        <meta name="description" content="Design, visualize, and auto-sync your cloud architecture with Meshwork Studio. Fast, local-first, and beautifully brutal." />
        <meta property="og:title" content="Meshwork Studio" />
        <meta property="og:description" content="The open-source, local-first canvas for visualizing cloud infrastructure." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Force dark mode on the entire landing page */}
      <div className="dark min-h-screen bg-background text-foreground relative flex flex-col font-sans">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="waves-landing" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10" fill="none" stroke="#FF3D00" strokeWidth="0.3" opacity="0.15" />
                <path d="M0 15 Q 12.5 5, 25 15 T 50 15 T 75 15 T 100 15" fill="none" stroke="#FF3D00" strokeWidth="0.2" opacity="0.1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#waves-landing)" transform="rotate(-15 50 50)" />
          </svg>
          <div className="meshwork-bg-text font-black select-none pointer-events-none">MESHWORK</div>
        </div>

        <MotionConfig reducedMotion="never">
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
            style={{ scaleX }}
          />

          {/* ═══ NAVBAR ═══ */}
          <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
              scrolled
                ? "bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                : "bg-transparent border-b border-transparent"
            }`}
          >
            {/* ... nav content ... */}
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 border-2 border-white/20 bg-[#1a1a1a] flex items-center justify-center transition-all group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(255,61,0,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
                    <rect width="32" height="32" fill="#1A1A1A"/>
                    <rect x="0" y="0" width="32" height="32" fill="none" stroke="#FF3D00" strokeWidth="2.5"/>
                    <line x1="8" y1="8" x2="24" y2="8" stroke="white" strokeWidth="2" strokeLinecap="square"/>
                    <line x1="8" y1="8" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="square"/>
                    <line x1="24" y1="8" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="square"/>
                    <rect x="4" y="4" width="8" height="8" fill="#FF3D00"/>
                    <rect x="20" y="4" width="8" height="8" fill="white"/>
                    <rect x="12" y="20" width="8" height="8" fill="white"/>
                  </svg>
                </div>
                <span className="text-lg font-black tracking-tighter uppercase hidden sm:block text-white">Meshwork</span>
              </Link>
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-bold uppercase tracking-wider text-white/50 hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-bold uppercase tracking-wider text-white/50 hover:text-primary transition-colors">How It Works</a>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <button className="font-bold uppercase text-sm text-white/60 hover:text-primary transition-colors tracking-wider px-3 py-2">Log In</button>
                </Link>
                <Link href="/auth/register">
                  <button className="bg-primary text-white border-2 border-white/10 py-2 px-5 text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,61,0,0.2)] hover:shadow-[0_0_30px_rgba(255,61,0,0.4)] hover:brightness-110 transition-all">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </nav>

          {/* ═══ HERO — Preserved ═══ */}
          <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 pt-24 pb-32">
            <motion.div
              className="max-w-4xl w-full text-center space-y-8"
              variants={landingContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={landingItem} className="inline-block border-2 border-foreground bg-primary/10 px-4 py-1 font-bold text-primary font-mono text-sm uppercase tracking-widest mb-4">
                v1.0 is Live
              </motion.div>
              <motion.h1 variants={landingItem} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                Design Cloud <br/>
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-primary bg-[length:200%_auto] drop-shadow-[4px_4px_0_rgba(26,26,26,1)]"
                >
                  Architecture.
                </motion.span>
                <br/>Faster.
              </motion.h1>
              <motion.p variants={landingItem} className="text-xl md:text-2xl font-medium text-foreground/80 max-w-2xl mx-auto tracking-tight">
                A local-first, blazing fast visual tool to map out your infrastructure. No more bloated legacy diagramming software.
              </motion.p>
              <motion.div variants={landingItem} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <Link href="/auth/register">
                  <button className="accent-btn py-4 px-8 text-lg w-full sm:w-auto text-center neo-shadow hover:translate-x-[4px] hover:translate-y-[4px]">
                    Start Building Free
                  </button>
                </Link>
                <Link href="/#features">
                  <button className="bg-card text-foreground neo-border py-4 px-8 font-bold uppercase tracking-wider neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-lg w-full sm:w-auto text-center">
                    See Features
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </main>
        </MotionConfig>

        {/* ═══ MARQUEE ═══ */}
        <div className="w-full bg-primary py-4 relative z-10 overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={i} className="text-white font-black text-lg md:text-xl uppercase tracking-wider mx-6 md:mx-10 flex items-center gap-6 md:gap-10 shrink-0">
                {word}
                <span className="text-white/40 text-sm">◆</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ═══ PRODUCT SHOWCASE ═══ */}
        <section ref={showcaseRef} className="w-full py-20 md:py-28 px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-center mb-14"
            >
              <span className="inline-block border border-white/15 bg-white/5 px-4 py-1 font-mono text-[11px] uppercase tracking-widest text-white/50 mb-6">
                Product Preview
              </span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
                Your infrastructure,{" "}
                <span className="text-primary">visualized.</span>
              </h2>
            </motion.div>

            <motion.div style={{ y: showcaseY }}>
              <motion.div
                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-10px" }}
                className="w-full bg-[#0e0e0e] border-2 border-white/15 shadow-[0_25px_80px_-12px_rgba(255,61,0,0.15)] aspect-[16/9] flex flex-col overflow-hidden"
              >
                {/* Chrome */}
                <div className="h-10 md:h-12 border-b-2 border-white/10 bg-[#161616] flex items-center px-4 gap-3 shrink-0">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 h-6 mx-3 border border-white/10 bg-white/5 rounded flex items-center px-3 max-w-md">
                    <span className="text-[10px] font-mono text-white/30 truncate">meshworkstudio.com/workspace/k8s-prod-cluster</span>
                  </div>
                </div>
                {/* Canvas */}
                <div className="flex-1 relative overflow-hidden bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]">
                  {/* Toolbar */}
                  <div className="absolute top-3 left-3 flex gap-1 z-20">
                    {["Select", "Node", "Edge"].map((tool, i) => (
                      <div key={tool} className={`px-2.5 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-white/10 transition-colors ${i === 1 ? "bg-primary text-white border-primary" : "bg-white/5 text-white/50"}`}>
                        {tool}
                      </div>
                    ))}
                  </div>

                  <motion.div
                    style={{ left: "10%", top: "18%" }}
                    className="absolute z-10"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      drag dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} dragElastic={0.2}
                      whileHover={{ scale: 1.05, cursor: "grab", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }} whileTap={{ cursor: "grabbing", scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.6, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.3, type: "spring", bounce: 0.4 }}
                      viewport={{ once: true }}
                      className="bg-[#1a1a1a] border border-white/15 p-2.5 md:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/15 flex items-center justify-center border border-primary/40"><Cloud className="text-primary w-4 h-4 md:w-5 md:h-5" /></div>
                      <div>
                        <div className="font-bold uppercase tracking-tight text-[11px] md:text-sm leading-none text-white">API Gateway</div>
                        <div className="text-[9px] md:text-[10px] font-mono text-white/40 mt-0.5">k8s-ingress-01</div>
                      </div>
                      <motion.div className="w-2 h-2 bg-green-500 ml-1" animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    </motion.div>
                  </motion.div>

                  {/* Paths */}
                  <svg className="absolute w-full h-full inset-0 pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ zIndex: 5 }}>
                    <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }} viewport={{ once: true }} d="M 230 160 L 230 320 L 340 320" fill="none" stroke="#FF3D00" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
                    <motion.path initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }} viewport={{ once: true }} d="M 230 160 L 230 240 L 470 240 L 470 390" fill="none" stroke="#FF3D00" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
                  </svg>

                  {/* Postgres — with float and drag */}
                  <motion.div
                    style={{ left: "28%", top: "48%" }}
                    className="absolute z-10"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <motion.div 
                      drag dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} dragElastic={0.2}
                      whileHover={{ scale: 1.05, cursor: "grab", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }} whileTap={{ cursor: "grabbing", scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.6, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6, type: "spring", bounce: 0.4 }} viewport={{ once: true }} className="bg-[#1a1a1a] border border-white/15 p-2.5 md:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/15 flex items-center justify-center border border-blue-500/40"><HardDrive className="text-blue-500 w-4 h-4 md:w-5 md:h-5" /></div>
                      <div>
                        <div className="font-bold uppercase tracking-tight text-[11px] md:text-sm leading-none text-white">Postgres DB</div>
                        <div className="text-[9px] md:text-[10px] font-mono text-white/40 mt-0.5">db-main-cluster</div>
                      </div>
                      <motion.div className="w-2 h-2 bg-green-500 ml-1" animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
                    </motion.div>
                  </motion.div>

                  {/* Redis — with float and drag */}
                  <motion.div
                    style={{ left: "42%", top: "65%" }}
                    className="absolute z-10"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <motion.div 
                      drag dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }} dragElastic={0.2}
                      whileHover={{ scale: 1.05, cursor: "grab", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }} whileTap={{ cursor: "grabbing", scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.6, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9, type: "spring", bounce: 0.4 }} viewport={{ once: true }} className="bg-[#1a1a1a] border border-white/15 p-2.5 md:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/15 flex items-center justify-center border border-emerald-500/40"><Layers className="text-emerald-500 w-4 h-4 md:w-5 md:h-5" /></div>
                      <div>
                        <div className="font-bold uppercase tracking-tight text-[11px] md:text-sm leading-none text-white">Redis Cache</div>
                        <div className="text-[9px] md:text-[10px] font-mono text-white/40 mt-0.5">cache-prod-01</div>
                      </div>
                      <motion.div className="w-2 h-2 bg-yellow-400 ml-1" animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
                    </motion.div>
                  </motion.div>

                  {/* Properties panel */}
                  <motion.div initial={{ x: "100%", opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }} viewport={{ once: true }} className="hidden md:flex absolute top-0 bottom-0 right-0 w-52 lg:w-60 bg-[#141414] border-l border-white/10 p-5 flex-col gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Properties</div>
                    <div className="space-y-3">
                      <div className="h-3 w-2/3 bg-white/5 rounded" />
                      <div className="h-7 w-full border border-white/10 bg-white/5 px-2 flex items-center rounded-sm"><span className="text-[10px] font-mono text-white/40">k8s-ingress-01</span></div>
                      <div className="h-3 w-1/2 bg-white/5 rounded mt-3" />
                      <div className="h-7 w-full border border-white/10 bg-white/5 rounded-sm" />
                      <div className="h-7 w-full border border-white/10 bg-white/5 rounded-sm" />
                    </div>
                    <div className="mt-auto h-16 w-full border border-primary/20 bg-primary/5 flex items-center justify-center rounded-sm">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-primary/60">Status: Healthy</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FEATURES — Alternating rows, dark, heavy animations
            ═══════════════════════════════════════════════════════ */}
        <section id="features" className="w-full py-24 md:py-32 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, amount: 0.1 }}
              className="mb-20 md:mb-28"
            >
              <span className="inline-block border border-white/15 bg-primary/10 px-4 py-1 font-bold text-primary text-sm uppercase tracking-widest mb-6">
                Why Meshwork
              </span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none max-w-4xl text-white">
                Your infra deserves<br /><span className="text-primary">more than a whiteboard.</span>
              </h2>
            </motion.div>

            {/* ── 01: See Your Entire Stack ── */}
            <div className="border-t border-white/10 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <div className="flex items-baseline gap-6 mb-6">
                    <span className="text-7xl md:text-[110px] font-black text-white/[0.06] leading-none select-none">01</span>
                    <div className="w-11 h-11 bg-white text-black flex items-center justify-center shrink-0"><Layers className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-5 leading-[0.95] text-white">See Your Entire<br />Stack. At Once.</h3>
                  <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md">
                    Drop Kubernetes pods, databases, APIs, and load balancers onto an infinite canvas. See every dependency and data flow at a glance — not buried in YAML files or stale wiki pages.
                  </p>
                </motion.div>

                {/* Visual: live infra notation */}
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="font-mono text-sm space-y-3 pl-6 border-l-2 border-primary/40"
                >
                  {["k8s/ingress-gateway", "rds/postgres-main", "elasticache/redis-sessions", "lambda/auth-handler", "s3/static-assets"].map((node, i) => (
                    <motion.div
                      key={node}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 10, color: "#FF3D00" }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 cursor-default"
                    >
                      <motion.div
                        className="w-2 h-2 bg-green-500 shrink-0"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <span className="text-white/60"><span className="text-primary">&gt;</span> {node}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 1.2, duration: 0.3 }}
                    viewport={{ once: true }}
                    className="h-1 bg-gradient-to-r from-primary to-orange-400 origin-left mt-2 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 2 }}
                    />
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.4 }} viewport={{ once: true }} className="text-white/25 text-xs">
                    5 nodes mapped • 8 connections • 0 orphans
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* ── 02: Not Another Diagramming Tool (reversed) ── */}
            <div className="border-t border-white/10 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                {/* Visual: tool comparison */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="order-2 md:order-1 flex flex-col gap-3"
                >
                  {[
                    { tool: "Lucidchart", verdict: "Generic shapes. No infra context.", bad: true },
                    { tool: "Draw.io", verdict: "Free but fragile. Zero collaboration.", bad: true },
                    { tool: "Confluence", verdict: "Where diagrams go to die.", bad: true },
                    { tool: "Meshwork", verdict: "Built for infrastructure. Period.", bad: false },
                  ].map((item, i) => (
                    <motion.div
                      key={item.tool}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05, x: 10 }}
                      transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
                      viewport={{ once: true }}
                      className={`flex items-center gap-3 py-2.5 px-3 font-mono text-xs cursor-default ${item.bad ? "text-white/30 line-through decoration-white/20" : "text-primary font-bold border border-primary/30 bg-primary/5 no-underline shadow-[0_0_15px_rgba(255,61,0,0.1)]"}`}
                    >
                      <span className={`w-5 text-center ${item.bad ? "text-white/20" : "text-primary"}`}>{item.bad ? "✕" : "◆"}</span>
                      <span className={`font-bold uppercase tracking-wider ${item.bad ? "text-white/40" : "text-white"}`}>{item.tool}</span>
                      <span className="ml-auto text-right">{item.verdict}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="order-1 md:order-2"
                >
                  <div className="flex items-baseline gap-6 mb-6">
                    <span className="text-7xl md:text-[110px] font-black text-white/[0.06] leading-none select-none">02</span>
                    <div className="w-11 h-11 bg-white text-black flex items-center justify-center shrink-0"><Cloud className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-5 leading-[0.95] text-white">Not Another<br />Lucidchart.</h3>
                  <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md">
                    Generic diagramming tools weren't built for infra. Meshwork speaks Kubernetes, understands cloud primitives, and treats your architecture as a first-class citizen — not clip art.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* ── 03: Kill Stale Docs ── */}
            <div className="border-t border-white/10 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <div className="flex items-baseline gap-6 mb-6">
                    <span className="text-7xl md:text-[110px] font-black text-white/[0.06] leading-none select-none">03</span>
                    <div className="w-11 h-11 bg-white text-black flex items-center justify-center shrink-0"><FileCode2 className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-5 leading-[0.95] text-white">Kill Stale<br />Architecture Docs.</h3>
                  <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md">
                    Onboard new engineers in minutes, not hours. Everyone sees the same architecture — always current, always accurate. Stop asking &ldquo;where&rsquo;s the latest diagram?&rdquo;
                  </p>
                </motion.div>

                {/* Visual: alive doc vs dead doc */}
                <div className="space-y-0">
                  {[
                    { label: "Outdated wiki diagram", status: "Last updated 8 months ago", dead: true },
                    { label: "Screenshot in Slack", status: "Can't find the original", dead: true },
                    { label: "Meshwork canvas", status: "Live • Auto-synced • Always current", dead: false },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 60 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02, x: -10, backgroundColor: "rgba(255,255,255,0.02)" }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                      viewport={{ once: true }}
                      className={`flex items-center gap-4 py-4 px-2 border-b border-white/8 group cursor-default transition-colors ${item.dead ? "" : "border-primary/20"}`}
                    >
                      <span className={`w-8 h-8 flex items-center justify-center text-xs font-black shrink-0 ${item.dead ? "bg-white/5 text-white/20" : "bg-primary text-white"}`}>
                        {item.dead ? "✕" : "◆"}
                      </span>
                      <div className="flex flex-col">
                        <span className={`font-bold uppercase tracking-wider text-sm ${item.dead ? "text-white/30 line-through decoration-white/15" : "text-white"}`}>{item.label}</span>
                        <span className={`text-[11px] font-mono mt-0.5 ${item.dead ? "text-white/15" : "text-green-400/70"}`}>{item.status}</span>
                      </div>
                      {!item.dead && <motion.div className="w-2 h-2 bg-green-500 ml-auto shrink-0" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 04: Layouts That Just Work (reversed) ── */}
            <div className="border-t border-b border-white/10 py-16 md:py-24">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -100, rotate: -2 }}
                  whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="order-2 md:order-1 flex justify-center md:justify-start"
                >
                  <svg viewBox="0 0 280 180" className="w-full max-w-sm h-auto">
                    <rect x="10" y="10" width="60" height="32" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
                    <text x="40" y="30" textAnchor="middle" fill="white" opacity="0.4" className="text-[9px] font-bold uppercase">LB</text>
                    <rect x="210" y="10" width="60" height="32" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
                    <text x="240" y="30" textAnchor="middle" fill="white" opacity="0.4" className="text-[9px] font-bold uppercase">API</text>
                    <rect x="110" y="138" width="60" height="32" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
                    <text x="140" y="158" textAnchor="middle" fill="white" opacity="0.4" className="text-[9px] font-bold uppercase">DB</text>
                    <rect x="100" y="50" width="80" height="40" fill="white" fillOpacity="0.02" stroke="white" strokeWidth="1" strokeDasharray="4 3" opacity="0.15" />
                    <text x="140" y="74" textAnchor="middle" fill="white" opacity="0.1" className="text-[8px] font-mono uppercase">VPC</text>
                    <motion.path d="M70 26 L95 26 L95 100 L210 100 L210 26" fill="none" stroke="#FF3D00" strokeWidth="2.5" strokeDasharray="8 6" animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M70 26 L70 154 L110 154" fill="none" stroke="#FF3D00" strokeWidth="2.5" opacity="0.5" strokeDasharray="8 6" animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }} />
                    <motion.circle cx="40" cy="26" r="5" fill="#FF3D00" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} viewport={{ once: true }} />
                    <motion.circle cx="240" cy="26" r="5" fill="white" fillOpacity="0.3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2.0, type: "spring" }} viewport={{ once: true }} />
                    <motion.circle cx="140" cy="154" r="5" fill="white" fillOpacity="0.3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2.0, type: "spring" }} viewport={{ once: true }} />
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="order-1 md:order-2"
                >
                  <div className="flex items-baseline gap-6 mb-6">
                    <span className="text-7xl md:text-[110px] font-black text-white/[0.06] leading-none select-none">04</span>
                    <div className="w-11 h-11 bg-white text-black flex items-center justify-center shrink-0"><Workflow className="w-5 h-5" /></div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-5 leading-[0.95] text-white">Layouts That<br />Just Work.</h3>
                  <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-md">
                    Stop fighting with alignment and connector lines. Edges auto-route around obstacles, nodes snap to grids, and complex architectures stay clean without manual fiddling.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — Timeline ═══ */}
        <section id="how-it-works" className="w-full py-24 md:py-32 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-center mb-20 md:mb-28"
            >
              <span className="inline-block border border-white/15 bg-white/5 px-4 py-1 font-mono text-[11px] uppercase tracking-widest text-white/50 mb-6">
                Workflow
              </span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
                Three steps.<br />
                <span className="text-primary">Zero friction.</span>
              </h2>
            </motion.div>

            <div className="relative">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
                className="hidden md:block absolute top-[36px] left-[16.7%] right-[16.7%] border-t border-dashed border-white/15 origin-left z-0"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative z-10">
                {[
                  { number: "01", title: "Map", desc: "Drop real infrastructure components — not clip art. K8s pods, RDS instances, Lambda functions, all first-class.", icon: <MousePointerClick className="w-5 h-5" /> },
                  { number: "02", title: "Wire", desc: "Define relationships and data flows. Edges auto-route, dependencies surface instantly, no manual alignment.", icon: <GitBranch className="w-5 h-5" /> },
                  { number: "03", title: "Share", desc: "Your team sees the architecture the moment you save. New hire on day one? They get it in minutes.", icon: <Zap className="w-5 h-5" /> },
                ].map((step, i) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -15, scale: 1.05 }}
                    transition={{ delay: 0.3 + i * 0.25, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true }}
                    className="text-center p-6 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-colors cursor-default"
                  >
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <span className="text-5xl md:text-6xl font-black text-primary leading-none">{step.number}</span>
                      <div className="w-10 h-10 bg-white text-black flex items-center justify-center">{step.icon}</div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 text-white">{step.title}</h3>
                    <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: 0.7 + i * 0.25, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="h-1 w-16 bg-primary mx-auto mt-6 origin-left"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section ref={ctaRef} className="w-full bg-[#080808] text-white py-24 md:py-32 relative z-10 overflow-hidden border-t border-white/5">
          <motion.div
            style={{ y: ctaWatermarkY }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black tracking-tighter text-white/[0.02] pointer-events-none select-none uppercase whitespace-nowrap"
          >
            BUILD
          </motion.div>

          <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-2"
            >
              Stop Drawing.
            </motion.h2>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              viewport={{ once: true, amount: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-primary mb-12 md:mb-16"
            >
              Start Building.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              viewport={{ once: true }}
              className="max-w-sm mx-auto mb-10 border border-white/10 bg-white/[0.03] text-left overflow-hidden"
            >
              <div className="border-b border-white/8 px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary" />
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Terminal</span>
              </div>
              <div className="p-4 font-mono text-xs md:text-sm space-y-1.5">
                <div><span className="text-primary">$</span> meshwork start</div>
                <div className="text-white/30">✓ Workspace loaded — 12ms</div>
                <div className="text-white/30">✓ Cloud sync connected</div>
                <div className="text-green-400">▸ Canvas ready.</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/auth/register">
                <button className="bg-primary text-white font-bold uppercase tracking-wider py-5 px-10 text-lg md:text-xl shadow-[0_0_40px_rgba(255,61,0,0.3)] hover:shadow-[0_0_60px_rgba(255,61,0,0.5)] hover:brightness-110 transition-all w-full sm:w-auto">
                  Get Meshwork Studio Free
                </button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              viewport={{ once: true }}
              className="mt-8 font-mono text-xs text-white/25 uppercase tracking-widest"
            >
              No credit card required • Instant access • Open source
            </motion.p>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="w-full bg-[#0a0a0a] py-16 px-6 border-t border-white/8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8">
              <div className="flex flex-col gap-4 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-white/15 bg-white/5 flex items-center justify-center"><div className="w-3.5 h-3.5 bg-primary" /></div>
                  <span className="font-black uppercase tracking-tighter text-xl text-white">Meshwork Studio</span>
                </div>
                <p className="text-white/35 text-sm font-medium leading-relaxed">
                  The open-source, local-first canvas for visualizing cloud infrastructure. Fast, opinionated, and built for engineers.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["React", "TypeScript", "PostgreSQL", "Node.js"].map((tech) => (
                    <span key={tech} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-white/10 text-white/30">{tech}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-16 md:gap-20">
                <div className="flex flex-col gap-4">
                  <div className="font-black uppercase tracking-widest text-xs text-white/25 mb-1">Product</div>
                  <a href="#features" className="font-bold uppercase tracking-wider text-white/40 hover:text-primary transition-colors text-xs">Features</a>
                  <a href="#how-it-works" className="font-bold uppercase tracking-wider text-white/40 hover:text-primary transition-colors text-xs">How It Works</a>
                  <Link href="/auth/login" className="font-bold uppercase tracking-wider text-white/40 hover:text-primary transition-colors text-xs">Sign In</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="font-black uppercase tracking-widest text-xs text-white/25 mb-1">Legal</div>
                  <span className="font-bold uppercase tracking-wider text-white/40 hover:text-primary transition-colors cursor-pointer text-xs">Privacy</span>
                  <span className="font-bold uppercase tracking-wider text-white/40 hover:text-primary transition-colors cursor-pointer text-xs">Terms</span>
                </div>
              </div>
            </div>
            <div className="mt-14 pt-6 border-t border-white/8 flex flex-col md:flex-row justify-between gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/20">
              <span>&copy; {new Date().getFullYear()} Meshwork.</span>
              <span>All systems nominal. {process.env.NODE_ENV === "production" ? "PROD" : "DEV"}_ENCLAVE</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
