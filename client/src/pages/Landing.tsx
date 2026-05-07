import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, HardDrive, Layers, Cloud, Sparkles, Code2, Move, FileCode2, Network, GitBranch, Terminal } from 'lucide-react';
import Button from '../components/prometheus/Button';
import CanvasPreview from '../components/prometheus/CanvasPreview';
import Lenis from "lenis";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { MeshworkLogo } from "@/components/MeshworkLogo";

const Home = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });

        const lenis = new Lenis({
            lerp: 0.08,
            wheelMultiplier: 1.2,
        });
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        return () => {
            window.removeEventListener("scroll", onScroll);
            lenis.destroy();
        }
    }, []);

    const barOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

    return (
        <div ref={containerRef} className="relative font-sans text-white min-h-screen flex flex-col">
            <Helmet>
                <title>Meshwork Studio</title>
                <meta name="description" content="Design, visualize, and auto-sync your cloud architecture with Meshwork Studio. Fast, local-first, and beautifully brutal." />
                <meta property="og:title" content="Meshwork Studio" />
                <meta property="og:description" content="The open-source, local-first canvas for visualizing cloud infrastructure." />
                <meta property="og:type" content="website" />
            </Helmet>

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
                style={{ scaleX: scrollYProgress, opacity: barOpacity }}
            />

            {/* Background Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 technical-gradient">
                <div className="absolute top-[5%] left-[-10%] w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.07) 0%, transparent 70%)' }} />
                <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[20%] left-[20%] w-[800px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.03) 0%, transparent 70%)' }} />
            </div>

            {/* NAVBAR */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-black/40 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                    : "bg-transparent border-b border-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,61,0,0.5)]">
                            <MeshworkLogo />
                        </div>
                        <span className="text-lg font-display font-black tracking-tighter uppercase hidden sm:block text-white">Meshwork Studio</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold uppercase tracking-wider text-white/50 hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-bold uppercase tracking-wider text-white/50 hover:text-primary transition-colors">How It Works</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <button className="font-bold uppercase text-sm text-white/60 hover:text-primary transition-colors tracking-wider px-3 py-2 cursor-pointer">Log In</button>
                        </Link>
                        <Link href="/auth/register">
                            <button className="bg-primary text-black border border-primary/20 py-2.5 px-5 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,61,0,0.3)] hover:shadow-[0_0_30px_rgba(255,61,0,0.5)] hover:brightness-110 transition-all cursor-pointer">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-4 text-center relative z-10 pt-32 pb-12 md:pt-48 md:pb-24 flex-1">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    {/* V1 Pill Removed */}
                    <h1 className="font-headline text-5xl md:text-8xl lg:text-[100px] font-extrabold tracking-tighter leading-[0.85] text-white mb-8 max-w-5xl mx-auto">
                        Design Cloud <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 block mt-2">Architecture</span>
                    </h1>
                    <p className="text-base md:text-xl font-medium text-white/50 max-w-2xl mx-auto tracking-tight leading-snug mb-10 px-2 lg:px-0">
                        The visual workspace for mapping, connecting, and sharing your cloud infrastructure. Built explicitly for engineering teams who think in systems.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 md:mb-24">
                        <Link href="/auth/register">
                            <Button size="lg" className="w-full sm:w-auto px-10 border border-primary shadow-[0_0_30px_rgba(255,61,0,0.3)] hover:shadow-[0_0_40px_rgba(255,61,0,0.5)] bg-primary text-black font-headline tracking-widest uppercase">
                                Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <a href="#features">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10 text-white hover:bg-white/[0.06] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 font-headline tracking-widest uppercase">
                                Discover Features
                            </Button>
                        </a>
                    </div>
                </motion.div>

                {/* Canvas Preview Simulation */}
                <div className="hidden md:block">
                    <CanvasPreview />
                </div>
            </main>

            {/* THE "WHY" SECTION: REDESIGNED WITH SPARK BACKGROUND */}
            <section id="features" className="relative min-h-screen pt-12 md:pt-24 border-t border-white/5">
                {/* Background Transition Overlay & Lava Flow */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[#050607]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'
                        }}>
                    </div>

                    <div className="absolute inset-0 opacity-20 transition-opacity duration-1000">
                        {[
                            { left: '10%', top: '20%', size: '600px', color: 'rgba(255, 85, 0, 0.15)', dur: 25 },
                            { left: '60%', top: '10%', size: '800px', color: 'rgba(255, 85, 0, 0.12)', dur: 35 },
                            { left: '20%', top: '50%', size: '700px', color: 'rgba(255, 85, 0, 0.15)', dur: 30 },
                            { left: '70%', top: '60%', size: '600px', color: 'rgba(255, 85, 0, 0.08)', dur: 40 }
                        ].map((lava, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full blur-[100px]"
                                style={{ left: lava.left, top: lava.top, width: lava.size, height: lava.size, background: `radial-gradient(circle, ${lava.color} 0%, transparent 70%)`, willChange: 'transform' }}
                                animate={{ x: [0, 100, -50, 0], y: [0, -50, 80, 0], scale: [1, 1.1, 0.9, 1] }}
                                transition={{ duration: lava.dur, repeat: Infinity, ease: "linear" }}
                            />
                        ))}
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    {/* Integration Tech Bar */}
                    <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-white/[0.02] border border-white/10 rounded-t-2xl overflow-x-auto gap-2">
                        <div className="flex-1 flex justify-center border-r border-white/5 opacity-50 min-w-[60px]">
                            <span className="font-black uppercase text-sm md:text-lg tracking-widest whitespace-nowrap">AWS</span>
                        </div>
                        <div className="flex-1 flex justify-center border-r border-white/5 opacity-50 min-w-[60px]">
                            <span className="font-bold text-sm md:text-lg tracking-tighter whitespace-nowrap">Kubernetes</span>
                        </div>
                        <div className="hidden sm:flex flex-1 justify-center border-r border-white/5 opacity-50 uppercase text-sm font-bold tracking-widest min-w-[80px]">
                            Docker
                        </div>
                        <div className="hidden sm:flex flex-1 justify-center border-r border-white/5 opacity-50 font-bold uppercase text-sm min-w-[80px] tracking-widest">
                            Terraform
                        </div>
                        <div className="flex-1 flex justify-center opacity-50 uppercase text-xs font-bold tracking-widest min-w-[60px]">
                            Vercel
                        </div>
                    </div>

                    {/* Main Container - Redesigned to match image */}
                    <div className="bg-black/40 backdrop-blur-2xl border-x border-b border-white/[0.08] rounded-b-2xl p-6 md:p-20 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        <div className="relative z-10 space-y-20 md:space-y-48">

                            {/* 01: See Your Entire Stack */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-6 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded border border-primary/20 bg-primary/5 text-[10px] font-mono text-primary uppercase tracking-[0.2em]">
                                        Bird's-eye View
                                    </div>
                                    <h3 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tighter text-white leading-[0.9]">
                                        See your entire <br />
                                        stack. At once.
                                    </h3>
                                    <p className="text-base text-white/50 leading-relaxed font-medium">
                                        Drop Kubernetes pods, databases, APIs, and load balancers onto an infinite canvas. See every dependency and data flow at a glance — not buried in YAML files or stale wiki pages.
                                    </p>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-primary transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Unified Infrastructure</h4>
                                                <p className="text-xs text-white/40">Visualizing AWS and local services on the same codebase.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                    <div className="w-full h-full font-mono text-xs md:text-sm space-y-3 pl-6 border-l-2 border-primary/40 flex flex-col justify-center align-start">
                                        {["k8s/ingress-gateway", "rds/postgres-main", "elasticache/redis-sessions", "lambda/auth-handler", "s3/static-assets"].map((node, i) => (
                                            <motion.div key={node} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} whileHover={{ x: 10, color: "#FF3D00" }} transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }} className="flex items-center gap-3 cursor-default">
                                                <motion.div className="w-2 h-2 bg-green-500 shrink-0" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                                                <span className="text-white/60"><span className="text-primary">&gt;</span> {node}</span>
                                            </motion.div>
                                        ))}
                                        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.3 }} className="h-1 bg-gradient-to-r from-primary to-primary/60 origin-left mt-2 relative overflow-hidden">
                                            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }} />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* 02: Not Another Lucidchart */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-6 lg:order-2 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded border border-blue-500/20 bg-blue-500/5 text-[10px] font-mono text-blue-500 uppercase tracking-[0.2em]">
                                        Specialized Tooling
                                    </div>
                                    <h3 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tighter text-white leading-[0.9]">
                                        Not another <br /> Lucidchart.
                                    </h3>
                                    <p className="text-base text-white/50 leading-relaxed font-medium">
                                        Generic diagramming tools weren't built for infra. Meshwork speaks Kubernetes, understands cloud primitives, and treats your architecture as a first-class citizen — not clip art.
                                    </p>
                                </div>

                                <div className="lg:col-span-6 lg:order-1 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                    <div className="flex flex-col gap-3 w-full max-w-sm">
                                        {[
                                            { tool: "Lucidchart", verdict: "Generic shapes. No infra context.", bad: true },
                                            { tool: "Draw.io", verdict: "Free but fragile. Zero collaboration.", bad: true },
                                            { tool: "Confluence", verdict: "Where diagrams go to die.", bad: true },
                                            { tool: "Meshwork", verdict: "Built for infrastructure.", bad: false },
                                        ].map((item, i) => (
                                            <motion.div key={item.tool} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.05, x: 10 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }} className={`flex items-center gap-3 py-3 px-4 font-mono text-xs cursor-default border rounded-lg ${item.bad ? "border-white/5 bg-white/5 text-white/30" : "text-primary font-bold border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(255,61,0,0.15)]"}`}>
                                                <span className={`w-5 text-center ${item.bad ? "text-white/20" : "text-primary"}`}>{item.bad ? "✕" : "◆"}</span>
                                                <span className={`font-bold uppercase tracking-wider ${item.bad ? "text-white/40" : "text-white"}`}>{item.tool}</span>
                                                <span className="ml-auto text-right md:inline hidden">{item.verdict}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* 03: Kill Stale Docs */}
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-6 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em]">
                                        Always Current
                                    </div>
                                    <h3 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tighter text-white leading-[0.9]">
                                        Kill stale <br /> Architecture docs.
                                    </h3>
                                    <p className="text-base text-white/50 leading-relaxed font-medium">
                                        Onboard new engineers in minutes, not hours. Everyone sees the same architecture — always current, always accurate. Stop asking "where's the latest diagram?"
                                    </p>
                                </div>

                                <div className="lg:col-span-6 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                     <div className="space-y-4 w-full max-w-sm">
                                        {[
                                            { label: "Outdated wiki diagram", status: "Last updated 8 months ago", dead: true },
                                            { label: "Screenshot in Slack", status: "Can't find the original", dead: true },
                                            { label: "Meshwork canvas", status: "Live • Auto-synced • Always current", dead: false },
                                        ].map((item, i) => (
                                            <motion.div key={item.label} initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.02, x: -5, backgroundColor: "rgba(255,255,255,0.05)" }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }} className={`flex items-center gap-4 py-4 px-4 border rounded-xl group cursor-default transition-colors ${item.dead ? "border-white/5 bg-white/[0.02]" : "border-emerald-500/30 bg-emerald-500/10"}`}>
                                                <span className={`w-8 h-8 flex items-center justify-center text-xs font-black shrink-0 rounded-full ${item.dead ? "bg-white/5 text-white/30" : "bg-emerald-500 text-[#0a0a0a]"}`}>
                                                    {item.dead ? "✕" : "◆"}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold uppercase tracking-wider text-sm ${item.dead ? "text-white/30 line-through decoration-white/15" : "text-white"}`}>{item.label}</span>
                                                    <span className={`text-[11px] font-mono mt-0.5 ${item.dead ? "text-white/20" : "text-emerald-400"}`}>{item.status}</span>
                                                </div>
                                                {!item.dead && <motion.div className="w-2 h-2 rounded-full bg-emerald-500 ml-auto shrink-0" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                             {/* 04: Layouts That Just Work */}
                             <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-6 lg:order-2 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded border border-purple-500/20 bg-purple-500/5 text-[10px] font-mono text-purple-500 uppercase tracking-[0.2em]">
                                        Auto-Routing
                                    </div>
                                    <h3 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tighter text-white leading-[0.9]">
                                        Layouts that <br /> just work.
                                    </h3>
                                    <p className="text-base text-white/50 leading-relaxed font-medium">
                                        Stop fighting with alignment and connector lines. Edges auto-route around obstacles, nodes snap to grids, and complex architectures stay clean without manual fiddling.
                                    </p>
                                </div>

                                <div className="lg:col-span-6 lg:order-1 relative flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                     <svg viewBox="0 0 280 180" className="w-full h-full max-w-sm">
                                        <rect x="10" y="10" width="60" height="32" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" rx="4" />
                                        <text x="40" y="30" textAnchor="middle" fill="white" opacity="0.4" className="text-[9px] font-bold uppercase">LB</text>
                                        <rect x="210" y="10" width="60" height="32" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" rx="4" />
                                        <text x="240" y="30" textAnchor="middle" fill="white" opacity="0.4" className="text-[9px] font-bold uppercase">API</text>
                                        <rect x="110" y="138" width="60" height="32" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" rx="4" />
                                        <text x="140" y="158" textAnchor="middle" fill="white" opacity="0.4" className="text-[9px] font-bold uppercase">DB</text>
                                        <rect x="100" y="50" width="80" height="40" fill="white" fillOpacity="0.02" stroke="white" strokeWidth="1" strokeDasharray="4 3" opacity="0.15" rx="4" />
                                        <text x="140" y="74" textAnchor="middle" fill="white" opacity="0.1" className="text-[8px] font-mono uppercase">VPC</text>
                                        <motion.path d="M70 26 L95 26 L95 100 L210 100 L210 26" fill="none" stroke="#FF3D00" strokeWidth="2.5" strokeDasharray="8 6" animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                                        <motion.path d="M70 26 L70 154 L110 154" fill="none" stroke="#a855f7" strokeWidth="2.5" opacity="0.8" strokeDasharray="8 6" animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }} />
                                        <motion.circle cx="40" cy="26" r="5" fill="#FF3D00" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} viewport={{ once: true }} />
                                        <motion.circle cx="240" cy="26" r="5" fill="white" fillOpacity="0.3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1.0, type: "spring" }} viewport={{ once: true }} />
                                        <motion.circle cx="140" cy="154" r="5" fill="white" fillOpacity="0.3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1.0, type: "spring" }} viewport={{ once: true }} />
                                    </svg>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION — THE FORGE */}
            <section className="relative min-h-[80vh] flex items-center justify-center mt-24 border-t border-white/5 overflow-hidden">
                {/* Removed Fire and Iron walls */}

                <div className="container mx-auto px-4 relative z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true, margin: "-20%" }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Terminal Box UI element */}
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            viewport={{ once: true }}
                            className="max-w-xs mx-auto mb-10 border border-white/10 bg-black/50 backdrop-blur text-left overflow-hidden rounded-xl"
                        >
                            <div className="border-b border-white/5 bg-white/5 px-4 py-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                                <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">Terminal</span>
                            </div>
                            <div className="p-4 font-mono text-xs space-y-1.5">
                                <div><span className="text-primary">$</span> meshwork start</div>
                                <div className="text-white/30">✓ Workspace loaded — 12ms</div>
                                <div className="text-white/30">✓ Cloud sync connected</div>
                                <div className="text-green-500">▸ Canvas ready.</div>
                            </div>
                        </motion.div>

                        <h2 className="font-headline text-5xl md:text-8xl lg:text-[100px] font-extrabold tracking-tighter text-white leading-[0.85] mb-8" style={{ textShadow: '0 0 60px rgba(245,140,0,0.5), 0 0 120px rgba(245,100,0,0.2)' }}>
                            <span className="block opacity-60">Stop Drawing.</span>
                            <span className="block text-primary drop-shadow-[0_0_80px_rgba(255,61,0,0.4)]">Start Building.</span>
                        </h2>

                        <p className="text-lg md:text-2xl text-white/40 font-medium mb-12 max-w-2xl mx-auto tracking-tight">
                            Your infrastructure mapped, managed, and completely alive.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register">
                                <Button size="lg" className="w-full sm:w-auto px-10 h-14 bg-primary text-black hover:brightness-110 border border-primary/50 shadow-[0_0_30px_rgba(255,61,0,0.3)] hover:shadow-[0_0_40px_rgba(255,61,0,0.5)] font-headline tracking-widest uppercase">
                                    Get Meshwork Studio Free
                                </Button>
                            </Link>
                            <Link href="/docs">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-10 h-14 text-white hover:bg-white/[0.06] bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 font-headline tracking-widest uppercase">
                                    Read the Docs
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

             {/* FOOTER */}
             <footer className="w-full bg-[#050505] py-16 px-6 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8 border-b border-white/5 pb-12">
                        <div className="flex flex-col gap-4 max-w-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 flex items-center justify-center"><MeshworkLogo /></div>
                                <span className="font-black uppercase tracking-tighter text-xl text-white">Meshwork Studio</span>
                            </div>
                            <p className="text-white/30 text-sm font-medium leading-relaxed">
                                The visual workspace for mapping, connecting, and sharing your cloud infrastructure. Built explicitly for engineers who think in systems.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                            <div className="flex flex-col gap-3">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Product</h4>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Features</a>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Pricing</a>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Changelog</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Resources</h4>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Documentation</a>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Blog</a>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Community</a>
                            </div>
                            <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Legal</h4>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Privacy Policy</a>
                                <a href="#" className="text-white/40 hover:text-primary transition-colors text-sm font-medium">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/20 text-xs font-mono">© 2026 Meshwork Studio. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs font-mono text-green-500/70">All systems operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
