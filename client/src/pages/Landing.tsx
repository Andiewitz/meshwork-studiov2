import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  FileCode2,
  Network,
  GitBranch,
  Terminal,
} from "lucide-react";

import Lenis from "lenis";
import { Link, useLocation } from "wouter";
import {
  PRELOADED_TEMPLATES,
  TemplateDefinition,
} from "../features/workspace/utils/preloadedTemplates";
import { Helmet } from "react-helmet-async";
import { MeshworkLogo } from "@/components/MeshworkLogo";

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] =
    useState<TemplateDefinition["category"]>("Featured");

  const handleTemplateClick = (template: TemplateDefinition) => {
    localStorage.setItem("meshwork_pending_template", JSON.stringify(template));
    setLocation("/register");
  };

  const activeTemplates = PRELOADED_TEMPLATES.filter(
    (t) => t.category === activeCategory,
  );

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
    };
  }, []);

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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative font-sans text-white min-h-screen flex flex-col bg-background"
    >
      <Helmet>
        <title>Meshwork Studio</title>
        <meta
          name="description"
          content="Design, visualize, and auto-sync your cloud architecture with Meshwork Studio. Fast, local-first, and beautifully brutal."
        />
        <meta property="og:title" content="Meshwork Studio" />
        <meta
          property="og:description"
          content="The open-source, local-first canvas for visualizing cloud infrastructure."
        />
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
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,85,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.1) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
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
            <span className="text-lg font-headline font-bold tracking-tight hidden sm:block text-white">
              Meshwork Studio
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-sans font-normal text-white/60 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-sans font-normal text-white/60 hover:text-white transition-colors"
            >
              How It Works
            </a>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setLocation("/login")}
              className="font-sans font-medium text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={() => setLocation("/register")}
              className="bg-primary text-black rounded-lg py-2 px-5 text-sm font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full relative z-10 min-h-screen flex flex-col items-center justify-center overflow-x-hidden">
        {/* Dotted Background Grid */}
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090b] to-[#09090b]">
          {/* eslint-disable-next-line no-secrets/no-secrets */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] bg-[length:24px_24px] bg-repeat [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_70%)] opacity-70" />
        </div>

        {/* Centered Hero Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center px-4"
        >
          <motion.h1
            variants={itemVariants}
            className="text-[3rem] sm:text-[4rem] lg:text-[5rem] font-medium font-sans text-white leading-[1.1] tracking-tight mb-6 drop-shadow-md"
          >
            Build with Meshwork Studio
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-[1.125rem] sm:text-[1.25rem] text-white/60 font-medium tracking-wide max-w-[650px] mb-10"
          >
            Go from prompt to production with automated infrastructure, seamless
            scaling, and more.
          </motion.p>
          <motion.div variants={itemVariants} className="flex gap-4">
            <button
              onClick={() => setLocation("/register")}
              className="bg-primary text-black rounded-lg py-3 px-8 text-base font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              Get Started
            </button>
            <a
              href="https://github.com/Andiewitz/Meshwork-Studio_"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-white/10 text-white hover:bg-white/20 rounded-lg py-3 px-8 text-base font-bold transition-all cursor-pointer flex items-center gap-2">
                <FileCode2 className="w-5 h-5" /> View on GitHub
              </button>
            </a>
          </motion.div>
        </motion.div>
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
              {[
                "Featured",
                "Cloud Architectures",
                "Full-Stack",
                "Data Pipelines",
              ].map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setActiveCategory(
                      category as TemplateDefinition["category"],
                    )
                  }
                  className={`rounded-full px-5 py-2 text-[13px] font-medium flex items-center gap-2 transition-all ${
                    activeCategory === category
                      ? "bg-white/[0.08] text-white border border-white/10 backdrop-blur-sm"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {category === "Featured" && (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {category === "Cloud Architectures" && (
                    <Network className="w-3.5 h-3.5" />
                  )}
                  {category === "Full-Stack" && (
                    <FileCode2 className="w-3.5 h-3.5" />
                  )}
                  {category === "Data Pipelines" && (
                    <GitBranch className="w-3.5 h-3.5" />
                  )}
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mb-10" />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTemplates.map((template, idx) => {
              const colors = [
                "from-indigo-500/[0.07] via-transparent to-purple-600/[0.05]",
                "from-emerald-500/[0.07] via-transparent to-teal-600/[0.05]",
                "from-amber-500/[0.07] via-transparent to-orange-600/[0.05]",
              ];
              const bgClass = colors[idx % colors.length];

              return (
                <div
                  key={template.id}
                  className="group cursor-pointer"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${bgClass}`}
                    />
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
                  <h3 className="text-white font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {template.description}
                  </p>
                </div>
              );
            })}
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
          {/* eslint-disable-next-line no-secrets/no-secrets */}
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
              <span className="text-white/30 text-sm font-sans flex-1 text-left">
                Describe your infrastructure in a sentence or two
              </span>
              <button
                onClick={() => setLocation("/register")}
                className="text-white/40 text-sm font-medium whitespace-nowrap hover:text-white/60 transition-colors cursor-pointer"
              >
                Get started
              </button>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-col items-start gap-3 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-white/35 text-sm">
                <Network className="w-4 h-4 shrink-0" />
                <span>A multi-region Kubernetes cluster with auto-scaling</span>
              </div>
              <div className="flex items-center gap-3 text-white/35 text-sm">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  A real-time data pipeline with event-driven triggers
                </span>
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
            How developers build with
            <br />
            Meshwork Studio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/80 font-sans font-bold text-2xl tracking-tight">
                    [Partner]
                  </span>
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1.5">
                [Company Name]
              </h3>
              <a
                href="#"
                className="text-primary text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
              >
                Read case study <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 2 */}
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 via-slate-500/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/80 font-sans font-bold text-2xl tracking-tight">
                    [Partner]
                  </span>
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1.5">
                [Company Name]
              </h3>
              <a
                href="#"
                className="text-primary text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
              >
                Read case study <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0f1114] border border-white/[0.06] mb-5 transition-all duration-300 group-hover:border-white/15 group-hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-cyan-500/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/80 font-sans font-bold text-2xl tracking-tight">
                    [Partner]
                  </span>
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1.5">
                [Company Name]
              </h3>
              <a
                href="#"
                className="text-primary text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
              >
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
                Start exploring and building
                <br />
                with Meshwork Studio.
              </h3>
              <button
                onClick={() => setLocation("/register")}
                className="text-white text-sm font-medium border border-white/20 rounded-full px-6 py-2.5 hover:bg-white/[0.06] transition-all w-fit cursor-pointer"
              >
                Sign up and get started
              </button>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
              <div className="flex flex-col gap-3">
                <h4 className="font-sans font-semibold text-white text-sm mb-1">
                  Platform
                </h4>
                <a
                  href="#features"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  Canvas
                </a>
                <Link href="/templates">
                  <span className="text-white/40 hover:text-white transition-colors text-sm cursor-pointer">
                    Templates
                  </span>
                </Link>
                <a
                  href="#features"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  AI Assistant
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-sans font-semibold text-white text-sm mb-1">
                  Product
                </h4>
                <a
                  href="#features"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  How It Works
                </a>
                <a
                  href="https://github.com/Andiewitz/Meshwork-Studio_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  Documentation
                </a>
                <a
                  href="https://github.com/Andiewitz/Meshwork-Studio_/commits/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  Changelog
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-sans font-semibold text-white text-sm mb-1">
                  Resources
                </h4>
                <Link href="/dev">
                  <span className="text-white/40 hover:text-white transition-colors text-sm cursor-pointer">
                    Blog
                  </span>
                </Link>
                <a
                  href="https://github.com/Andiewitz/Meshwork-Studio_/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  Community
                </a>
                <a
                  href="#case-studies"
                  className="text-white/40 hover:text-white transition-colors text-sm"
                >
                  Case studies
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="font-sans font-semibold text-white text-sm mb-1">
                  Legal
                </h4>
                <Link href="/privacy">
                  <span className="text-white/40 hover:text-white transition-colors text-sm cursor-pointer">
                    Privacy
                  </span>
                </Link>
                <Link href="/terms">
                  <span className="text-white/40 hover:text-white transition-colors text-sm cursor-pointer">
                    Terms
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Giant brand wordmark */}
        <div className="w-full overflow-hidden pb-8 pt-4">
          <div className="max-w-6xl mx-auto px-6">
            <h2
              className="font-sans font-bold text-[clamp(3rem,10vw,8rem)] text-white/[0.06] leading-none tracking-tighter select-none"
              aria-hidden="true"
            >
              Meshwork Studio
            </h2>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
