import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Boxes, BarChart3 } from 'lucide-react';
import Button from '../components/ui/Button';
import DashboardPreview from '../components/dashboard/DashboardPreview';

const Home = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();

    const barOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

    return (
        <div ref={containerRef} className="relative">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
                style={{ scaleX: scrollYProgress, opacity: barOpacity }}
            />
            {/* Background Atmosphere — static, no blur, no per-frame cost */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[5%] left-[-10%] w-[700px] h-[700px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,90,0,0.07) 0%, transparent 70%)' }} />
                <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(120,20,0,0.05) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[20%] left-[20%] w-[800px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(100,40,0,0.03) 0%, transparent 70%)' }} />
            </div>

            {/* Hero Section - Padding to clear fixed header */}
            <section className="container mx-auto px-4 text-center relative z-10 pt-28 pb-12 md:pt-48 md:pb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="font-serif text-4xl md:text-7xl font-medium tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
                        The Operating System{' '}
                        <span className="hidden md:inline"><br /></span>
                        for Modern Business.
                    </h1>
                    <p className="text-sm md:text-lg text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed px-2">
                        Consolidate your Point of Sale, inventory, and analytics into one reliable platform.{' '}
                        Built to handle <span className="text-white">high-volume retail</span> operations.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 md:mb-24">
                        <Button size="sm" className="w-full sm:w-auto px-8 h-12 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                            Explore Products <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full sm:w-auto px-8 h-12">
                            View Pricing
                        </Button>
                    </div>
                </motion.div>

                {/* DashboardPreview — hidden on mobile, shown on md+ */}
                <div className="hidden md:block">
                    <DashboardPreview />
                </div>
            </section>

            {/* THE "WHY" SECTION: REDESIGNED WITH SPARK BACKGROUND */}
            <section className="relative min-h-screen pt-12 md:pt-24">
                {/* Background Transition Overlay & Lava Flow */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* The Grid Background with a smooth top mask */}
                    <div className="absolute inset-0 bg-[#050607]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'
                        }}>
                    </div>

                    {/* Performance-Focused Lava Flow Effect */}
                    <div className="absolute inset-0 opacity-20 transition-opacity duration-1000">
                        {[
                            { left: '10%', top: '20%', size: '600px', color: 'rgba(255, 69, 0, 0.15)', dur: 25 },
                            { left: '60%', top: '10%', size: '800px', color: 'rgba(255, 140, 0, 0.1)', dur: 35 },
                            { left: '30%', top: '50%', size: '700px', color: 'rgba(255, 100, 0, 0.12)', dur: 30 },
                            { left: '70%', top: '60%', size: '600px', color: 'rgba(220, 20, 60, 0.08)', dur: 40 }
                        ].map((lava, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full blur-[100px]"
                                style={{
                                    left: lava.left,
                                    top: lava.top,
                                    width: lava.size,
                                    height: lava.size,
                                    background: `radial-gradient(circle, ${lava.color} 0%, transparent 70%)`,
                                    willChange: 'transform'
                                }}
                                animate={{
                                    x: [0, 100, -50, 0],
                                    y: [0, -50, 80, 0],
                                    scale: [1, 1.1, 0.9, 1]
                                }}
                                transition={{
                                    duration: lava.dur,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    {/* Logo Bar - Technical Aesthetic */}
                    <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-white/[0.02] border border-white/10 rounded-t-2xl overflow-x-auto gap-2">
                        <div className="flex-1 flex justify-center border-r border-white/5 opacity-50 min-w-[60px]">
                            <span className="font-bold text-sm md:text-lg tracking-tighter whitespace-nowrap">hud</span>
                        </div>
                        <div className="flex-1 flex justify-center border-r border-white/5 opacity-50 min-w-[60px]">
                            <span className="font-bold text-sm md:text-lg tracking-tighter whitespace-nowrap">BILT</span>
                        </div>
                        <div className="hidden sm:flex flex-1 justify-center border-r border-white/5 opacity-50 uppercase text-xs font-bold tracking-widest min-w-[80px]">
                            mgm resorts
                        </div>
                        <div className="hidden sm:flex flex-1 justify-center border-r border-white/5 opacity-50 italic font-bold min-w-[80px]">
                            Switzerland
                        </div>
                        <div className="flex-1 flex justify-center opacity-50 uppercase text-xs font-bold tracking-widest min-w-[60px]">
                            numeral
                        </div>
                    </div>

                    {/* Main Container - Redesigned to match image */}
                    <div className="bg-[#0c0e12]/60 border-x border-b border-white/10 rounded-b-2xl p-6 md:p-20 relative overflow-hidden">
                        <div className="relative z-10 space-y-20 md:space-y-48">

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                            >
                                <div className="lg:col-span-6 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono text-primary uppercase tracking-[0.2em]">
                                        Legacy Replacement
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-serif font-medium text-white leading-tight">
                                        Retire your janky <br />
                                        legacy systems.
                                    </h3>
                                    <p className="text-base text-gray-400 leading-relaxed font-medium">
                                        Fragmented software and outdated hardware are holding you back. Hefestus replaces your disconnected legacy tools with a single, high-performance business suite.
                                    </p>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-primary transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Unified Infrastructure</h4>
                                                <p className="text-xs text-gray-500">Every store, tablet, and terminal runs on the same codebase, eliminating regional data silos.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-primary transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Legacy Bridge</h4>
                                                <p className="text-xs text-gray-500">Integrations designed to port data from your existing systems without disrupting daily sales.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Alternative to</span>
                                        <div className="h-4 w-[1px] bg-white/20" />
                                        <span className="font-bold text-xs">Toast</span>
                                        <span className="font-bold text-xs italic">Clover</span>
                                        <span className="font-bold text-xs uppercase">Square</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                    <div className="w-full max-w-sm bg-[#050607] rounded-2xl border border-white/10 p-6 space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                            <div className="h-2 w-24 bg-white/10 rounded" />
                                            <div className="h-2 w-8 bg-primary/40 rounded-full" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-24 w-full bg-white/[0.03] rounded-xl border border-white/5 p-4">
                                                <div className="h-2 w-1/2 bg-white/10 rounded mb-2" />
                                                <div className="h-4 w-1/3 bg-primary/20 rounded" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="h-12 bg-white/[0.02] rounded-lg border border-white/5" />
                                                <div className="h-12 bg-white/[0.02] rounded-lg border border-white/5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 2: Global Inventory */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                            >
                                <div className="lg:col-span-6 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-[10px] font-mono text-orange-500 uppercase tracking-[0.2em]">
                                        Unified Suite
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-serif font-medium text-white leading-tight">
                                        One unified suite, <br />
                                        zero silos.
                                    </h3>
                                    <p className="text-base text-gray-400 leading-relaxed font-medium">
                                        Maintaining separate systems for POS, warehouse, and e-commerce is inefficient. Hefestus consolidates your entire business operations into a single source of truth.
                                    </p>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-orange-500 transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Cross-Platform Sync</h4>
                                                <p className="text-xs text-gray-500">Real-time updates across physical stores, warehouse inventory, and online marketplaces simultaneously.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-orange-500 transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Deep Integration</h4>
                                                <p className="text-xs text-gray-500">A suite where every module talks to each other natively. No manual data imports or spreadsheet hacks.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Alternative to</span>
                                        <div className="h-4 w-[1px] bg-white/20" />
                                        <span className="font-bold text-xs uppercase">SAP</span>
                                        <span className="font-bold text-xs">NetSuite</span>
                                        <span className="font-bold text-xs">Oracle</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                    <div className="w-full max-w-sm bg-[#0c0e12] rounded-2xl border border-white/10 p-6 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                                <Boxes className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div className="h-2 w-32 bg-white/10 rounded" />
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-12 w-full bg-white/[0.02] rounded-lg border border-white/5 flex items-center px-4 justify-between">
                                                    <div className="h-2 w-24 bg-white/10 rounded" />
                                                    <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: i === 1 ? '80%' : i === 2 ? '40%' : '65%' }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            className="h-full bg-orange-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 3: Analytics */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                            >
                                <div className="lg:col-span-6 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-[10px] font-mono text-blue-500 uppercase tracking-[0.2em]">
                                        Reporting & Analytics
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-serif font-medium text-white leading-tight">
                                        Business Intelligence. <br />
                                        Not just dashboards.
                                    </h3>
                                    <p className="text-base text-gray-400 leading-relaxed font-medium">
                                        Access deep insights into your revenue, margins, and employee performance. Stop waiting for end-of-month reports to understand your numbers.
                                    </p>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-blue-500 transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Margin Analysis</h4>
                                                <p className="text-xs text-gray-500">Monitor profitability at the product, store, or regional level in real-time.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 group">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-blue-500 transition-colors flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Trend Forecasting</h4>
                                                <p className="text-xs text-gray-500">Identify seasonal trends and customer behavior patterns to optimize operations.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Alternative to</span>
                                        <div className="h-4 w-[1px] bg-white/20" />
                                        <span className="font-bold text-xs">Tableau</span>
                                        <span className="font-bold text-xs italic">Looker</span>
                                        <span className="font-bold text-xs uppercase">PowerBI</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                    <div className="w-full max-w-sm bg-[#050607] rounded-3xl border border-white/10 p-6 space-y-6">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="h-2 w-24 bg-white/10 rounded" />
                                        </div>
                                        <div className="flex justify-between items-end gap-2 h-24">
                                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    whileInView={{ height: `${h}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                                    className="flex-1 bg-blue-500/20 border-t border-blue-500/40 rounded-t-sm"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section 4: Built For You */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-10%" }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                            >
                                <div className="lg:col-span-6 space-y-8">
                                    <div className="inline-block px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-[10px] font-mono text-green-500 uppercase tracking-[0.2em]">
                                        Built For You
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-serif font-medium text-white leading-tight">
                                        One platform. <br />
                                        Every business.
                                    </h3>
                                    <p className="text-base text-gray-400 leading-relaxed font-medium">
                                        Whether you run a single café or a multi-location retail chain, Hefestus adapts to how you operate — not the other way around.
                                    </p>

                                    <div className="space-y-6 pt-4 border-t border-white/5">
                                        {[
                                            { label: "Restaurants & Cafés", desc: "Table management, kitchen display, and split bills — all unified." },
                                            { label: "Retail & Grocery", desc: "Multi-location inventory, barcode scanning, and loyalty built in." },
                                            { label: "Franchises & Chains", desc: "Centralized control with per-location reporting and role-based access." },
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-white/20 group-hover:bg-green-500 transition-colors flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{item.label}</h4>
                                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4">
                                        <Button size="sm" className="px-8 h-12 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                            Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="lg:col-span-6 relative flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl h-[300px] md:h-[400px] overflow-hidden">
                                    <div className="w-full max-w-sm space-y-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01] ${i === 1 ? 'border-green-500/20 bg-green-500/5' : 'opacity-40'}`}>
                                                <div className="h-4 w-4 rounded-full bg-white/10" />
                                                <div className="h-2 w-32 bg-white/10 rounded" />
                                                {i === 1 && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA — THE FORGE */}
            <section className="relative overflow-hidden" style={{ height: 'clamp(520px, 80vh, 760px)' }}>
                {/* Extended Top Glow - Seamlessly blends the gap */}
                <div className="absolute top-0 left-0 right-0 h-[500px] z-0 pointer-events-none flex justify-center overflow-hidden">
                    <div className="w-[120%] h-full bg-[radial-gradient(ellipse_at_bottom,rgba(245,100,0,0.15),transparent_70%)] blur-3xl opacity-80" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-stretch top-[80px]"
                >
                    {/* ── UNIFIED TOP CAP / LINTEL ── */}
                    <div className="absolute top-0 left-0 right-0 h-16 z-40 flex pointer-events-none">
                        {/* Left Cap */}
                        <div className="w-[28%] h-full bg-gradient-to-b from-[#1a1a1a] to-transparent" />
                        {/* Center Arch Cap */}
                        <div className="flex-1 h-full bg-gradient-to-b from-[#111] to-transparent" />
                        {/* Right Cap */}
                        <div className="w-[28%] h-full bg-gradient-to-b from-[#1a1a1a] to-transparent" />
                        {/* Continuous top edge highlight - softened */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-white/10 opacity-50" />
                    </div>

                    {/* ── SEAM COVER PILLARS (Hide the gap) ── */}
                    <div className="absolute top-0 bottom-0 left-[28%] w-24 -translate-x-1/2 z-20 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 40%, transparent 70%)' }}>
                        <div className="mx-auto w-2 h-full bg-[#111]/80" /> {/* Central dark spine */}
                    </div>
                    <div className="absolute top-0 bottom-0 right-[28%] w-24 translate-x-1/2 z-20 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 40%, transparent 70%)' }}>
                        <div className="mx-auto w-2 h-full bg-[#111]/80" /> {/* Central dark spine */}
                    </div>

                    {/* LEFT IRON WALL — Soft Blend to Center */}
                    <div className="relative flex-shrink-0" style={{ width: '28%' }}>
                        <div className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(160deg, #1c1c1c 0%, #111 30%, #0a0a0a 70%, #0d0d0d 100%)',
                                zIndex: 1
                            }}>
                            {/* Texture Lines */}
                            {[12, 25, 38, 52, 65, 78, 90].map(t => (
                                <div key={t} className="absolute left-0 right-0 h-px"
                                    style={{ top: `${t}%`, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)' }} />
                            ))}
                            {[15, 30, 45, 60, 75, 88].map(t => (
                                <div key={t} className="absolute left-5 w-4 h-4 rounded-full"
                                    style={{ top: `${t}%`, background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #0d0d0d)', boxShadow: 'inset 1px 1px 3px #333, inset -1px -1px 3px #000' }} />
                            ))}
                            {[22, 37, 52, 67, 82].map(t => (
                                <div key={t} className="absolute right-6 w-4 h-4 rounded-full"
                                    style={{ top: `${t}%`, background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #0d0d0d)', boxShadow: 'inset 1px 1px 3px #333, inset -1px -1px 3px #000' }} />
                            ))}

                            {/* Inner Fade to black — smooth vertical blend */}
                            <div className="absolute right-0 inset-y-0 w-32 bg-gradient-to-l from-[#060606] via-[#0a0a0a]/80 to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* FURNACE CHAMBER */}
                    <div className="relative flex-1 flex flex-col overflow-hidden"
                        style={{ background: '#060606', boxShadow: 'inset 0 10px 40px rgba(0,0,0,0.8)' }}>

                        {/* Top arch — sits above doors */}
                        <div className="absolute top-0 left-0 right-0 h-16 z-30"
                            style={{ background: 'linear-gradient(to bottom, #111, #080808)' }} />

                        {/* ── BLAST DOORS ── */}
                        <div className="absolute inset-0 z-20 pointer-events-none flex">
                            {/* Left Door */}
                            <motion.div
                                initial={{ x: 0 }}
                                whileInView={{ x: '-100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 2.2, ease: [0.2, 0, 0.2, 1], delay: 0.2 }}
                                className="w-1/2 h-full relative"
                                style={{
                                    background: 'linear-gradient(90deg, #111 0%, #0d0d0d 100%)',
                                    boxShadow: 'inset -2px 0 10px rgba(0,0,0,0.8)' // Soft shadow seam
                                }}
                            >
                                {/* Door Detail Lines */}
                                {[10, 30, 50, 70, 90].map(p => (
                                    <div key={p} className="absolute left-0 right-0 h-px bg-white/[0.03]" style={{ top: `${p}%` }} />
                                ))}
                                {/* Rivets */}
                                {[20, 40, 60, 80].map(p => (
                                    <div key={p} className="absolute right-4 w-3 h-3 rounded-full bg-[#1a1a1a] shadow-[inset_1px_1px_2px_#333,inset_-1px_-1px_2px_black]" style={{ top: `${p}%` }} />
                                ))}
                            </motion.div>

                            {/* Right Door */}
                            <motion.div
                                initial={{ x: 0 }}
                                whileInView={{ x: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 2.2, ease: [0.2, 0, 0.2, 1], delay: 0.2 }}
                                className="w-1/2 h-full relative"
                                style={{
                                    background: 'linear-gradient(-90deg, #111 0%, #0d0d0d 100%)',
                                    boxShadow: 'inset 2px 0 10px rgba(0,0,0,0.8)' // Soft shadow seam
                                }}
                            >
                                {[10, 30, 50, 70, 90].map(p => (
                                    <div key={p} className="absolute left-0 right-0 h-px bg-white/[0.03]" style={{ top: `${p}%` }} />
                                ))}
                                {[20, 40, 60, 80].map(p => (
                                    <div key={p} className="absolute left-4 w-3 h-3 rounded-full bg-[#1a1a1a] shadow-[inset_1px_1px_2px_#333,inset_-1px_-1px_2px_black]" style={{ top: `${p}%` }} />
                                ))}
                            </motion.div>
                        </div>


                        {/* Fire layers */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 h-[70%]"
                                style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(160,25,0,0.95) 0%, rgba(100,15,0,0.7) 40%, transparent 75%)' }} />
                            <div className="absolute bottom-0 left-0 right-0 h-[55%]"
                                style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(240,90,0,0.85) 0%, rgba(190,50,0,0.55) 45%, transparent 78%)' }} />
                            <div className="absolute bottom-0 left-0 right-0 h-[38%]"
                                style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,190,0,0.75) 0%, rgba(245,140,0,0.5) 40%, transparent 72%)' }} />
                            <div className="absolute bottom-0 left-[25%] right-[25%] h-[18%]"
                                style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,255,220,0.95) 0%, rgba(255,210,60,0.5) 50%, transparent 100%)' }} />

                            {[
                                { left: '5%', w: '15%', delay: 0, dur: 2.0 },
                                { left: '24%', w: '19%', delay: 0.4, dur: 1.8 },
                                { left: '45%', w: '18%', delay: 0.2, dur: 2.3 },
                                { left: '64%', w: '17%', delay: 0.7, dur: 1.9 },
                                { left: '82%', w: '14%', delay: 0.1, dur: 2.2 },
                            ].map((f, i) => (
                                <motion.div key={i} className="absolute bottom-0 rounded-t-full"
                                    style={{ left: f.left, width: f.w, background: `linear-gradient(to top, rgba(255,${120 + i * 25},0,0.95), rgba(255,80,0,0.4), transparent)`, transformOrigin: 'bottom center', willChange: 'transform' }}
                                    animate={{ height: ['28%', '52%', '33%', '58%', '30%'], scaleX: [1, 0.82, 1.12, 0.88, 1], x: [0, (i % 2 === 0 ? 6 : -6), 0, (i % 2 === 0 ? -4 : 4), 0] }}
                                    transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            ))}

                            {[
                                { left: '15%', delay: 0, dur: 2.8 },
                                { left: '38%', delay: 0.6, dur: 3.2 },
                                { left: '60%', delay: 0.2, dur: 2.5 },
                                { left: '82%', delay: 1.0, dur: 3.0 },
                            ].map((e, i) => (
                                <motion.div key={i} className="absolute w-2 h-2 rounded-full"
                                    style={{ left: e.left, bottom: '28%', background: 'rgba(255,170,40,0.95)', boxShadow: '0 0 8px rgba(255,140,0,0.9)', willChange: 'transform, opacity' }}
                                    animate={{ y: [0, -320], x: [0, (i % 2 === 0 ? 30 : -30)], opacity: [1, 0.9, 0], scale: [1, 0.6, 0] }}
                                    transition={{ duration: e.dur, delay: e.delay, repeat: Infinity, ease: 'easeOut' }}
                                />
                            ))}
                        </div>

                        {/* CTA inside the furnace */}
                        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 pb-16 pt-20 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <p className="text-[10px] font-mono text-amber-400/60 uppercase tracking-[0.4em] mb-5">No lock-in. No excuses.</p>
                                <h2 className="font-serif text-5xl md:text-7xl font-medium text-white leading-[1.05] mb-5"
                                    style={{ textShadow: '0 0 60px rgba(245,140,0,0.5), 0 0 120px rgba(245,100,0,0.2)' }}>
                                    Stop patching.<br />
                                    <span className="bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">Start running.</span>
                                </h2>
                                <p className="text-gray-400 text-base max-w-sm mx-auto mb-10 leading-relaxed">One system. Every store. Real-time, always.</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button size="default" className="px-12 h-12 rounded-full bg-primary hover:bg-amber-400 text-black font-bold shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_70px_rgba(245,158,11,0.7)] transition-all">
                                        Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                    <Button variant="secondary" size="default" className="px-12 h-12 rounded-full border-white/10 hover:border-white/20">
                                        Talk to Sales
                                    </Button>
                                </div>
                                <p className="mt-6 text-[10px] font-mono text-gray-600 uppercase tracking-widest">14-day free trial · no credit card</p>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT IRON WALL — Soft Blend to Center */}
                    <div className="relative flex-shrink-0" style={{ width: '28%' }}>
                        <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(200deg, #1c1c1c 0%, #111 30%, #0a0a0a 70%, #0d0d0d 100%)', zIndex: 1 }}>

                            {/* Inner Fade to black — smooth vertical blend */}
                            <div className="absolute left-0 inset-y-0 w-32 bg-gradient-to-r from-[#060606] via-[#0a0a0a]/80 to-transparent pointer-events-none" />

                            {[12, 25, 38, 52, 65, 78, 90].map(t => (
                                <div key={t} className="absolute left-0 right-0 h-px"
                                    style={{ top: `${t}%`, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)' }} />
                            ))}
                            {[15, 30, 45, 60, 75, 88].map(t => (
                                <div key={t} className="absolute right-5 w-4 h-4 rounded-full"
                                    style={{ top: `${t}%`, background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #0d0d0d)', boxShadow: 'inset 1px 1px 3px #333, inset -1px -1px 3px #000' }} />
                            ))}
                            {[22, 37, 52, 67, 82].map(t => (
                                <div key={t} className="absolute left-6 w-4 h-4 rounded-full"
                                    style={{ top: `${t}%`, background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #0d0d0d)', boxShadow: 'inset 1px 1px 3px #333, inset -1px -1px 3px #000' }} />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Bottom floor */}
                <div className="absolute bottom-0 left-0 right-0 h-6"
                    style={{ background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)' }} />
                <div className="absolute -bottom-4 left-[28%] right-[28%] h-12 blur-3xl"
                    style={{ background: 'radial-gradient(ellipse, rgba(245,100,0,0.35), transparent 70%)' }} />


            </section>

        </div>
    );
};

export default Home;
