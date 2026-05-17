import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion';
import { ArrowRight, Sparkles, Move, FileCode2, Network, GitBranch, Terminal } from 'lucide-react';
import Button from '../components/prometheus/Button';
import Lenis from "lenis";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { MeshworkLogo } from "@/components/MeshworkLogo";

const BASE_CARDS = [
  { src: "/assets/carousel-1.webp", alt: "Dark UI Design", isShader: false },
  { src: "/assets/carousel-2.webp", alt: "Visual Workflow", isShader: false },
  { src: "/assets/carousel-3.webp", alt: "Infrastructure Context", isShader: false },
  { src: "/assets/carousel-4.webp", alt: "Auto-Routing Algorithms", isShader: false },
  { src: "/assets/carousel-5.webp", alt: "Deployment Dashboard", isShader: false },
  { src: "/assets/carousel-6.webp", alt: "Architecture Map", isShader: false },
  { src: "/assets/carousel-7.webp", alt: "Cloud Integration", isShader: false },
];

const CARDS = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  ...BASE_CARDS[i % 7],
}));

const Home = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    // Carousel state
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    useEffect(() => {
        if (!isPaused) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % CARDS.length);
            }, 2500);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused]);

    const barOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.2 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    };

    return (
        <div ref={containerRef} className="relative font-sans text-white min-h-screen flex flex-col bg-background">
            <Helmet>
                <title>Meshwork Studio</title>
                <meta name="description" content="Design, visualize, and auto-sync your cloud architecture with Meshwork Studio. Fast, local-first, and beautifully brutal." />
                <meta property="og:title" content="Meshwork Studio" />
                <meta property="og:description" content="The open-source, local-first canvas for visualizing cloud infrastructure." />
                <meta property="og:type" content="website" />
            </Helmet>

            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
                style={{ scaleX: scrollYProgress, opacity: barOpacity }}
            />

            {/* Background Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 technical-gradient">
                <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[150px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[50%] rounded-full bg-purple-500/10 blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.03]" 
                    style={{ backgroundImage: 'linear-gradient(rgba(255,85,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }} 
                />
            </div>

            {/* NAVBAR */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-black/40 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                    : "bg-transparent border-b border-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,61,0,0.5)]">
                            <MeshworkLogo />
                        </div>
                        <span className="text-lg font-sans font-bold tracking-tight hidden sm:block text-white">Meshwork Studio</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-sans font-normal text-white/60 hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-sans font-normal text-white/60 hover:text-white transition-colors">How It Works</a>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link href="/auth/login">
                            <button className="font-sans font-medium text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Log in</button>
                        </Link>
                        <Link href="/auth/register">
                            <button className="bg-primary text-black rounded-lg py-2 px-5 text-sm font-bold hover:brightness-110 transition-all cursor-pointer">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="w-full relative z-10 pt-20 pb-12 md:pt-32 md:pb-24 flex-1 overflow-x-hidden">
                {/* Dotted Background Grid */}
                <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090b] to-[#09090b]">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] bg-[length:24px_24px] bg-repeat [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_70%)] opacity-70" />
                </div>

                {/* Independent Hero Header */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center mb-16"
                >
                    <motion.h1 
                        variants={itemVariants}
                        className="text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-medium font-sans text-white leading-[1.1] tracking-tight mb-4 drop-shadow-md"
                    >
                        Build with Meshwork Studio
                    </motion.h1>
                    <motion.p 
                        variants={itemVariants}
                        className="text-[1rem] sm:text-[1.125rem] text-white/60 font-medium tracking-wide max-w-[600px]"
                    >
                        Go from prompt to production with automated infrastructure, seamless scaling, and more.
                    </motion.p>
                </motion.div>

                {/* 3D Carousel Section */}
                <div className="w-full flex flex-col items-center mt-6">
                    <div className="relative w-full flex items-center justify-center mb-16 overflow-visible"
                         style={{ height: isMobile ? 600 : 700 }}
                         onMouseEnter={() => setIsPaused(true)}
                         onMouseLeave={() => setIsPaused(false)}
                    >
                        {CARDS.map((card, idx) => {
                            let distance = idx - currentIndex;
                            if (distance > CARDS.length / 2) distance -= CARDS.length;
                            if (distance < -CARDS.length / 2) distance += CARDS.length;

                            if (Math.abs(distance) > 4) return null;

                            const isActive = distance === 0;
                            const cardWidth = isMobile ? 280 : 400;
                            const cardGap = isMobile ? 16 : 30;
                            const activeHeight = isMobile ? 400 : 540;
                            const inactiveHeight = isMobile ? 320 : 460;
                            const offset = distance * (cardWidth + cardGap);
                            
                            return (
                                <motion.div 
                                    key={card.id}
                                    className="absolute shrink-0 origin-center"
                                    style={{ width: cardWidth }}
                                    initial={false}
                                    animate={{ 
                                        x: offset,
                                        height: isActive ? activeHeight : inactiveHeight,
                                        y: isActive ? (isMobile ? -20 : -30) : 0,
                                        opacity: isActive ? 1 : 0.4,
                                        zIndex: isActive ? 10 : 0
                                    }}
                                    transition={{ type: "spring", stiffness: 150, damping: 20, mass: 0.8 }}
                                >
                                    <div 
                                        className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-white/[0.05] border border-white/[0.05]"
                                        style={{
                                            boxShadow: isActive ? '0 0 120px rgba(59, 130, 246, 0.4)' : 'none'
                                        }}
                                    >
                                        <img 
                                            src={card.src} 
                                            alt={card.alt} 
                                            className="absolute inset-0 w-full h-full object-cover opacity-80" 
                                            loading={Math.abs(distance) <= 1 ? "eager" : "lazy"}
                                            decoding="async"
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                        {/* Anchored Prompt Overlay */}
                        <div className={`absolute left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-[500px] flex flex-col items-center px-4 ${isMobile ? 'top-[65%]' : 'top-[55%]'}`}>
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="bg-[#202124] rounded-[1rem] p-5 sm:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/5 w-[500px] text-left flex flex-col justify-between"
                            >
                                <p className="text-[1.125rem] text-white font-sans mb-8">
                                    Create a collaborative live particle art<span className="animate-pulse text-blue-500">|</span>
                                </p>
                                <div className="flex justify-end">
                                    <Link href="/auth/register">
                                        <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg py-2.5 px-5 transition-colors font-sans font-medium flex items-center justify-center text-sm">
                                            <ArrowRight className="mr-2 w-4 h-4" /> Get started
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Pagination Controls */}
                            <div className="flex justify-center mt-6">
                                <div className="bg-[#202124] rounded-full flex items-center p-1 border border-white/5">
                                    <button onClick={() => setIsPaused(true)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                    </button>
                                    <button onClick={() => setIsPaused(true)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* TEMPLATES SECTION */}
            <section className="w-full relative z-10 py-24 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="font-sans text-4xl md:text-5xl font-bold text-white tracking-tight">
                            Templates ready to Remix
                        </h2>
                        
                        {/* Tabs */}
                        <div className="flex flex-wrap justify-center gap-2 mt-10">
                            <button className="bg-white/[0.08] text-white rounded-full px-5 py-2 text-[13px] font-medium flex items-center gap-2 border border-white/10 backdrop-blur-sm">
                                <Sparkles className="w-3.5 h-3.5" /> Featured
                            </button>
                            <button className="text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-full px-5 py-2 text-[13px] font-medium flex items-center gap-2 transition-all">
                                <Network className="w-3.5 h-3.5" /> Cloud Architectures
                            </button>
                            <button className="text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-full px-5 py-2 text-[13px] font-medium flex items-center gap-2 transition-all">
                                <FileCode2 className="w-3.5 h-3.5" /> Full-Stack
                            </button>
                            <button className="text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-full px-5 py-2 text-[13px] font-medium flex items-center gap-2 transition-all">
                                <GitBranch className="w-3.5 h-3.5" /> Data Pipelines
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.06] mb-10" />

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-purple-600/[0.05]" />
                                {/* Mock UI */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-40 group-hover:opacity-60 transition-opacity">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400/60" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                                        <div className="w-2 h-2 rounded-full bg-green-400/60" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">Multi-Region VPC</h3>
                            <p className="text-white/40 text-sm leading-relaxed">Deploy a highly available VPC across multiple regions with automatic failover and load balancing.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-teal-600/[0.05]" />
                                {/* Mock UI */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-40 group-hover:opacity-60 transition-opacity">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400/60" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                                        <div className="w-2 h-2 rounded-full bg-green-400/60" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-2/3 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-full bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-1/3 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">Next.js + FastAPI</h3>
                            <p className="text-white/40 text-sm leading-relaxed">Full-stack template with Next.js frontend and FastAPI backend, pre-configured with auth and database.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.07] via-transparent to-orange-600/[0.05]" />
                                {/* Mock UI */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-40 group-hover:opacity-60 transition-opacity">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400/60" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                                        <div className="w-2 h-2 rounded-full bg-green-400/60" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-1/4 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">Event-Driven Pipeline</h3>
                            <p className="text-white/40 text-sm leading-relaxed">Serverless data pipeline using SQS, Lambda, and S3 with built-in monitoring.</p>
                        </div>
                    </div>

                    {/* Button */}
                    <div className="flex justify-center mt-14">
                        <button className="text-white/70 hover:text-white rounded-full px-7 py-2.5 text-sm font-medium border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all">
                            Explore the template gallery
                        </button>
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="relative min-h-[80vh] flex items-center justify-center border-t border-white/5 overflow-hidden">
                {/* Radial dot background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiLz48L3N2Zz4=')] bg-[length:24px_24px] bg-repeat [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
                </div>

                <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true, margin: "-15%" }}
                    >
                        <h2 className="font-sans text-4xl md:text-[3.5rem] font-medium text-white tracking-tight leading-tight mb-12">
                            Bring your ideas to life
                        </h2>

                        {/* Prompt Input Bar */}
                        <div className="bg-[#1a1a1d] rounded-xl border border-white/[0.08] flex items-center px-5 py-3.5 gap-3 mb-8">
                            <span className="text-white/30 text-sm font-sans flex-1 text-left">Describe your infrastructure in a sentence or two</span>
                            <Link href="/auth/register">
                                <button className="text-white/40 text-sm font-medium whitespace-nowrap hover:text-white/60 transition-colors">
                                    Get started
                                </button>
                            </Link>
                        </div>

                        {/* Suggestion Chips */}
                        <div className="flex flex-col items-start gap-3 max-w-md mx-auto">
                            <div className="flex items-center gap-3 text-white/35 text-sm">
                                <Network className="w-4 h-4 shrink-0" />
                                <span>A multi-region Kubernetes cluster with auto-scaling</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/35 text-sm">
                                <Sparkles className="w-4 h-4 shrink-0" />
                                <span>A real-time data pipeline with event-driven triggers</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/35 text-sm">
                                <Terminal className="w-4 h-4 shrink-0" />
                                <span>Help me design a serverless API gateway</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CASE STUDIES */}
            <section className="w-full relative z-10 py-24 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="font-sans text-3xl md:text-[2.5rem] font-medium text-white tracking-tight leading-tight mb-14">
                        How developers build with<br />Meshwork Studio
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white/80 font-sans font-bold text-2xl tracking-tight">[Partner]</span>
                                </div>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1.5">[Company Name]</h3>
                            <a href="#" className="text-primary text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                Read case study <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        {/* Card 2 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 via-slate-500/10 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white/80 font-sans font-bold text-2xl tracking-tight">[Partner]</span>
                                </div>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1.5">[Company Name]</h3>
                            <a href="#" className="text-primary text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                Read case study <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        {/* Card 3 */}
                        <div className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-cyan-500/10 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white/80 font-sans font-bold text-2xl tracking-tight">[Partner]</span>
                                </div>
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1.5">[Company Name]</h3>
                            <a href="#" className="text-primary text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                                Read case study <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full bg-background relative z-10 border-t border-white/5">
                {/* Upper footer */}
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-14">
                        {/* Left CTA */}
                        <div className="flex flex-col gap-5 max-w-xs">
                            <h3 className="font-sans text-xl font-medium text-white leading-snug">
                                Start exploring and building<br />with Meshwork Studio.
                            </h3>
                            <Link href="/auth/register">
                                <button className="text-white text-sm font-medium border border-white/20 rounded-full px-6 py-2.5 hover:bg-white/[0.06] transition-all w-fit">
                                    Sign up and get started
                                </button>
                            </Link>
                        </div>

                        {/* Link columns */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
                            <div className="flex flex-col gap-3">
                                <h4 className="font-sans font-semibold text-white text-sm mb-1">Platform</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Canvas</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Templates</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">AI Assistant</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="font-sans font-semibold text-white text-sm mb-1">Product</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Features</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Pricing</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Documentation</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Changelog</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="font-sans font-semibold text-white text-sm mb-1">Resources</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Blog</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Community</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Case studies</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="font-sans font-semibold text-white text-sm mb-1">Legal</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Giant brand wordmark */}
                <div className="w-full overflow-hidden pb-8 pt-4">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="font-sans font-bold text-[clamp(3rem,10vw,8rem)] text-white/[0.06] leading-none tracking-tighter select-none" aria-hidden="true">
                            Meshwork Studio
                        </h2>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
