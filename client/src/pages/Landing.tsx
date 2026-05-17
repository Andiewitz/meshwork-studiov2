import React, { useRef, useEffect, useState } from 'react';
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
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
                        <a href="#features" className="text-[15px] font-serif font-medium text-white/70 hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="text-[15px] font-serif font-medium text-white/70 hover:text-white transition-colors">How It Works</a>
                    </div>
                    <div className="flex items-center gap-5">
                        <Link href="/auth/login">
                            <button className="font-serif font-medium text-[15px] text-white/70 hover:text-white transition-colors cursor-pointer">Log in</button>
                        </Link>
                        <Link href="/auth/register">
                            <button className="bg-primary text-black border border-primary/20 py-2.5 px-5 text-sm font-black shadow-[0_0_20px_rgba(255,61,0,0.3)] hover:shadow-[0_0_30px_rgba(255,61,0,0.5)] hover:brightness-110 transition-all cursor-pointer">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="container mx-auto px-4 text-center relative z-10 pt-20 pb-12 md:pt-32 md:pb-24 flex-1">
                {/* Dotted Background Grid */}
                <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090b] to-[#09090b]">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
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
                    <div className="relative w-full h-[750px] flex items-center justify-center mb-16 overflow-visible"
                         onMouseEnter={() => setIsPaused(true)}
                         onMouseLeave={() => setIsPaused(false)}
                    >
                        {CARDS.map((card, idx) => {
                            let distance = idx - currentIndex;
                            if (distance > CARDS.length / 2) distance -= CARDS.length;
                            if (distance < -CARDS.length / 2) distance += CARDS.length;

                            if (Math.abs(distance) > 4) return null;

                            const isActive = distance === 0;
                            const offset = distance * 680; // 640px width + 40px gap
                            
                            return (
                                <motion.div 
                                    key={card.id}
                                    className="absolute w-[640px] shrink-0 origin-center"
                                    initial={false}
                                    animate={{ 
                                        x: offset,
                                        height: isActive ? 400 : 320,
                                        y: isActive ? -40 : -10, // Push up slightly to leave room for the prompt box
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
                        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-[500px] flex flex-col items-center">
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

            {/* CALL TO ACTION */}
            <section className="relative min-h-[60vh] flex items-center justify-center mt-24 border-t border-white/5 overflow-hidden pb-32">
                <div className="container mx-auto px-4 relative z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true, margin: "-20%" }}
                        className="max-w-4xl mx-auto"
                    >
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

                        <h2 className="font-sans text-5xl md:text-8xl font-bold tracking-tight text-white leading-[0.85] mb-8">
                            <span className="block opacity-60">Stop Drawing.</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Start Building.</span>
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                            <Link href="/auth/register">
                                <Button size="lg" className="w-full sm:w-auto px-10 h-14 bg-white/[0.08] backdrop-blur-lg border border-white/[0.15] hover:bg-white/[0.15] hover:border-white/[0.25] text-white shadow-[0_8px_32px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)] transition-all duration-300 font-sans tracking-widest uppercase">
                                    Get Meshwork Free
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

             {/* FOOTER */}
             <footer className="w-full bg-background py-16 px-6 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-8 border-b border-white/5 pb-12">
                        <div className="flex flex-col gap-4 max-w-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 flex items-center justify-center"><MeshworkLogo /></div>
                                <span className="font-bold font-sans tracking-tight text-xl text-white">Meshwork Studio</span>
                            </div>
                            <p className="text-white/30 text-sm font-medium leading-relaxed">
                                The visual workspace for mapping, connecting, and sharing your cloud infrastructure.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                            <div className="flex flex-col gap-3">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Product</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Features</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Pricing</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Changelog</a>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Resources</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Documentation</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Blog</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Community</a>
                            </div>
                            <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
                                <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-2">Legal</h4>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Privacy Policy</a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors text-sm font-medium">Terms of Service</a>
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
