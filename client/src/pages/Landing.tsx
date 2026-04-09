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
        <title>Meshwork Studio | Neo-Brutalist Cloud Architecture Design</title>
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

        {/* Features Section */}
        <section id="features" className="w-full bg-foreground text-background py-24 relative z-10 border-t-2 border-foreground">
           <div className="max-w-6xl mx-auto px-6">
             <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-16 text-center">
               Why Meshwork?
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-foreground">
                <FeatureCard 
                  icon={<HardDrive className="w-8 h-8"/>}
                  title="Offline-First"
                  description="Changes save instantly to localStorage. Never lose your diagrams to network drops."
                />
                <FeatureCard 
                  icon={<Cloud className="w-8 h-8"/>}
                  title="Auto-Sync"
                  description="Debounced Postgres syncing ensures your cloud diagrams are always safely backed up."
                />
                <FeatureCard 
                  icon={<Workflow className="w-8 h-8"/>}
                  title="Smart Routing"
                  description="Edges automatically find the cleanest paths. Layout auto-arranges complex meshes."
                />
                <FeatureCard 
                  icon={<FileCode2 className="w-8 h-8"/>}
                  title="Pre-built Templates"
                  description="Start with standard E-commerce, AI, Fintech, or K8s architectures out of the box."
                />
             </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t-2 border-foreground bg-card py-12 px-6 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 border-2 border-foreground flex items-center justify-center">
                   <div className="w-4 h-4 bg-primary rounded-none"></div>
                 </div>
                 <span className="font-black uppercase tracking-tighter text-lg">Meshwork Studio</span>
             </div>
             
             <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
               &copy; {new Date().getFullYear()} Meshwork. All rights reserved.
             </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="neo-card flex flex-col items-start gap-4 hover:-translate-y-2 transition-transform duration-300">
      <div className="p-3 bg-primary/10 text-primary border-2 border-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
      <p className="text-muted-foreground font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}
