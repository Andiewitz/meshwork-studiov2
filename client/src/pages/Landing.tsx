import { motion } from "framer-motion";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { HardDrive, Cloud, FileCode2, Workflow } from "lucide-react";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1], // Neo-brutalist snap
      },
    },
  };

  return (
    <>
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

      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans">
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

        {/* Navigation */}
        <nav className="w-full relative z-10 p-6 flex justify-between items-center border-b-2 border-foreground bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-foreground bg-card flex items-center justify-center neo-shadow">
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
            <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Meshwork Studio</span>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/auth/login">
               <button className="font-bold uppercase text-sm hover:underline tracking-wider">Log In</button>
             </Link>
             <Link href="/auth/register">
               <button className="accent-btn py-2 px-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm hidden sm:block">
                 Get Started
               </button>
             </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 pt-20 pb-32">
          <motion.div 
            className="max-w-4xl w-full text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-block border-2 border-foreground bg-primary/10 px-4 py-1 font-bold text-primary font-mono text-sm uppercase tracking-widest mb-4">
              v1.0 is Live
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Design Cloud <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-orange-400 drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                Architecture.
              </span>
              <br/>Faster.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl md:text-2xl font-medium text-foreground/80 max-w-2xl mx-auto tracking-tight">
              A local-first, blazing fast visual tool to map out your infrastructure. No more bloated legacy diagramming software.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
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

        {/* Visual Showcase (Fake UI Window) */}
        <section className="w-full bg-primary border-t-2 border-b-2 border-foreground py-20 px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
             <div className="w-full bg-background border-4 border-foreground neo-shadow-lg aspect-[16/9] flex flex-col overflow-hidden">
               {/* Window Header */}
               <div className="h-12 border-b-4 border-foreground bg-card flex items-center px-4 gap-2 shrink-0">
                  <div className="w-4 h-4 rounded-full border-2 border-foreground bg-primary"></div>
                  <div className="w-4 h-4 rounded-full border-2 border-foreground bg-yellow-400"></div>
                  <div className="w-4 h-4 rounded-full border-2 border-foreground bg-green-500"></div>
               </div>
               {/* Window Body (Fake Canvas) */}
               <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#CECECB_1px,transparent_1px)] opacity-90">
                  <motion.div 
                    initial={{ x: 50, y: 50, opacity: 0 }}
                    whileInView={{ x: '10%', y: '15%', opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    viewport={{ once: true }}
                    className="absolute bg-card border-4 border-foreground p-3 md:p-4 neo-shadow flex items-center gap-4 z-10"
                  >
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 flex items-center justify-center border-2 border-primary">
                       <Cloud className="text-primary w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div>
                       <div className="font-bold uppercase tracking-tight text-sm md:text-base">API Gateway</div>
                       <div className="text-[10px] md:text-xs font-mono text-muted-foreground w-full truncate">k8s-ingress-01</div>
                     </div>
                  </motion.div>

                  {/* Connecting Line (Fake) */}
                  <svg className="absolute w-full h-full inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                     <motion.path 
                       initial={{ pathLength: 0 }}
                       whileInView={{ pathLength: 1 }}
                       transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                       viewport={{ once: true }}
                       d="M 150 120 C 300 120, 300 280, 450 280" 
                       fill="none" 
                       stroke="currentColor" 
                       strokeWidth="4" 
                       strokeDasharray="8 8"
                       className="text-foreground"
                     />
                  </svg>

                  <motion.div 
                    initial={{ x: 50, y: 200, opacity: 0 }}
                    whileInView={{ x: '45%', y: '50%', opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.4 }}
                    viewport={{ once: true }}
                    className="absolute bg-card border-4 border-foreground p-3 md:p-4 neo-shadow flex items-center gap-4 z-10"
                  >
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
                       <HardDrive className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div>
                       <div className="font-bold uppercase tracking-tight text-sm md:text-base">Postgres DB</div>
                       <div className="text-[10px] md:text-xs font-mono text-muted-foreground w-full truncate">db-main-cluster</div>
                     </div>
                  </motion.div>

                  {/* Settings Panel mockup */}
                  <motion.div 
                    initial={{ x: '100%', opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="hidden md:flex absolute top-0 bottom-0 right-0 w-64 bg-card border-l-4 border-foreground p-6 flex-col gap-6"
                  >
                     <div className="h-4 w-1/2 bg-foreground/20"></div>
                     <div className="h-10 w-full border-2 border-foreground bg-background"></div>
                     <div className="h-10 w-full border-2 border-foreground bg-background"></div>
                     <div className="h-10 w-full border-2 border-foreground bg-background"></div>
                     <div className="h-32 w-full border-2 border-primary bg-primary/5 mt-auto"></div>
                  </motion.div>
               </div>
             </div>
          </div>
        </section>

        {/* Features Section (Bigger, Bolder) */}
        <section id="features" className="w-full bg-background py-32 relative z-10">
           <div className="max-w-6xl mx-auto px-6">
             <div className="flex flex-col items-center text-center mb-20">
               <div className="inline-block border-2 border-foreground bg-primary/10 px-4 py-1 font-bold text-primary text-sm uppercase tracking-widest mb-6">
                 Core Architecture
               </div>
               <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter max-w-4xl leading-none">
                 Built <span className="text-primary">different</span> from the ground up.
               </h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <FeatureBlock 
                  number="01"
                  icon={<HardDrive className="w-10 h-10 md:w-12 md:h-12"/>}
                  title="Local-First By Default"
                  description="Your entire canvas state saves instantly to browser local storage. Never lose your hard work to a sudden network drop or server timeout."
                />
                <FeatureBlock 
                  number="02"
                  icon={<Cloud className="w-10 h-10 md:w-12 md:h-12"/>}
                  title="Debounced Cloud Sync"
                  description="When you are online, changes are smoothly synced to a Postgres backend via a debounced queue. Your diagrams are securely persisted without flooding the API."
                />
                <FeatureBlock 
                  number="03"
                  icon={<FileCode2 className="w-10 h-10 md:w-12 md:h-12"/>}
                  title="Infrastructure Templates"
                  description="Don't start from scratch. Boot up complex pre-built setups like E-Commerce Microservices, AI Pipelines, or K8s clusters in a single click."
                />
                <FeatureBlock 
                  number="04"
                  icon={<Workflow className="w-10 h-10 md:w-12 md:h-12"/>}
                  title="Smart Orthogonal Routing"
                  description="Edges automatically find the cleanest, most readable paths between nodes. Our layout engine auto-arranges complex meshes for maximum clarity."
                />
             </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="w-full bg-card py-32 border-t-4 border-b-4 border-foreground relative z-10 flex flex-col items-center justify-center text-center px-6">
           <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-4">
             Stop Drawing.
           </h2>
           <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-primary mb-12">
             Start Building.
           </h2>
           <Link href="/auth/register">
             <button className="accent-btn py-5 px-10 text-xl md:text-2xl w-full sm:w-auto neo-shadow-lg hover:translate-x-[4px] hover:translate-y-[4px]">
               Get Meshwork Studio Free
             </button>
           </Link>
           <p className="mt-8 font-mono text-xs md:text-sm text-muted-foreground uppercase tracking-widest">
             No credit card required • Instant access
           </p>
        </section>

        {/* Footer */}
        <footer className="w-full bg-foreground text-background py-16 px-6 relative z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black tracking-tighter opacity-[0.02] text-background pointer-events-none select-none uppercase whitespace-nowrap">
            V 1.0
          </div>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 relative z-20">
             <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 border-2 border-background flex items-center justify-center">
                     <div className="w-4 h-4 bg-primary rounded-none"></div>
                   </div>
                   <span className="font-black uppercase tracking-tighter text-2xl">Meshwork Studio</span>
                 </div>
                 <p className="text-muted text-sm font-medium max-w-xs mt-2">
                   The open-source, local-first canvas for visualizing cloud infrastructure.
                 </p>
             </div>
             
             <div className="flex gap-16">
               <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                 <div className="text-muted mb-2">Product</div>
                 <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
                 <Link href="/auth/login" className="hover:text-primary transition-colors">Sign In</Link>
               </div>
               <div className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest">
                 <div className="text-muted mb-2">Legal</div>
                 <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
                 <span className="hover:text-primary transition-colors cursor-pointer">Terms</span>
               </div>
             </div>
          </div>
          <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-background/20 text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted relative z-20 flex flex-col md:flex-row justify-between gap-4">
            <span>&copy; {new Date().getFullYear()} Meshwork.</span>
            <span>All systems nominal. {process.env.NODE_ENV === "production" ? "PROD" : "DEV"}_ENCLAVE</span>
          </div>
        </footer>
      </div>
    </>
  );
}

function FeatureBlock({ title, description, icon, number }: { title: string; description: string; icon: React.ReactNode; number: string }) {
  return (
    <div className="relative border-4 border-foreground bg-card p-8 md:p-12 neo-shadow group hover:-translate-y-2 transition-all duration-300 flex flex-col gap-6 overflow-hidden">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 font-black text-8xl text-foreground/[0.04] dark:text-foreground/[0.08] group-hover:text-primary/10 transition-colors pointer-events-none select-none">
        {number}
      </div>
      <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-foreground text-background flex items-center justify-center border-4 border-foreground group-hover:bg-primary transition-colors">
        {icon}
      </div>
      <div className="relative z-10 space-y-4">
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">{title}</h3>
        <p className="text-muted-foreground font-medium text-base md:text-lg leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
