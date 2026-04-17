import { motion } from "framer-motion";
import { Book, Terminal, LayoutGrid, Users, Calendar, ArrowRight, ChevronRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

const MOCK_DOCS = [
  { id: 1, title: "Getting Started", desc: "Learn the basics of Meshwork Studio and set up your first workspace.", icon: <Book className="w-5 h-5" /> },
  { id: 2, title: "API Reference", desc: "Detailed documentation for our REST and GraphQL APIs.", icon: <Terminal className="w-5 h-5" /> },
  { id: 3, title: "Component Library", desc: "Explore the pre-built UI components available for your projects.", icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 4, title: "Authentication", desc: "Guide to implementing user login and access control.", icon: <Users className="w-5 h-5" /> },
];

const MOCK_CHANGELOG = [
  { version: "v2.4.0", date: "Today", changes: "Added search dropdown and new docs layout." },
  { version: "v2.3.5", date: "Apr 12", changes: "Improved project grid animations." },
  { version: "v2.3.0", date: "Apr 05", changes: "Introduced Figma-style custom cursors." },
];

export default function Docs() {
  return (
    <motion.div
      key="docs"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="w-full max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUpVariants} className="mb-10">
        <h2 className="text-2xl font-extrabold tracking-tighter text-white font-headline uppercase">Docs & Blogs</h2>
        <p className="text-outline text-sm mt-2">Everything you need to build with Meshwork Studio.</p>
      </motion.div>

      {/* Featured Blog */}
      <motion.div variants={fadeUpVariants} className="mb-10 group relative overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/10 p-8 cursor-figma-pointer hover:border-[#FF5500]/30 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5500]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:bg-[#FF5500]/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/10 text-primary text-[10px] font-headline font-bold px-3 py-1 rounded-full border border-primary/20 tracking-widest uppercase">Dev Blog</span>
            <span className="text-xs text-outline flex items-center gap-1"><Calendar className="w-3 h-3" /> Apr 15, 2026</span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-white mb-3 group-hover:text-primary transition-colors">The Future of Spatial Interfaces</h3>
          <p className="text-outline max-w-2xl mb-6">We're rethinking how users interact with 3D space on the web. Dive into our latest experiments with WebGL and React Three Fiber to build immersive dashboards.</p>
          <div className="flex items-center text-sm font-bold text-white gap-2 group-hover:gap-3 transition-all">
            Read Article <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Docs Categories */}
        <motion.div variants={fadeUpVariants} className="lg:col-span-2">
          <h3 className="text-xs font-bold font-headline tracking-[0.2em] uppercase text-outline mb-6">Documentation</h3>
          <div className="flex flex-col gap-3">
            {MOCK_DOCS.map(doc => (
              <div key={doc.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-high border border-transparent hover:border-outline-variant/20 transition-all cursor-figma-pointer group">
                <div className="p-3 rounded-lg bg-surface-container-high text-outline group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  {doc.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-headline font-semibold text-white mb-1 group-hover:text-primary transition-colors">{doc.title}</h4>
                  <p className="text-sm text-outline">{doc.desc}</p>
                </div>
                <div className="self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <ChevronRight className="w-5 h-5 text-outline" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Changelog */}
        <motion.div variants={fadeUpVariants} className="lg:col-span-1">
          <h3 className="text-xs font-bold font-headline tracking-[0.2em] uppercase text-outline mb-6">Latest Updates</h3>
          <div className="relative border-l border-outline-variant/20 ml-3 space-y-8 pb-4">
            {MOCK_CHANGELOG.map((log, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute w-2.5 h-2.5 bg-surface-container-highest border-2 border-outline-variant/50 rounded-full -left-[5px] top-1.5"></div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-headline font-bold text-white">{log.version}</span>
                  <span className="text-[10px] text-outline uppercase tracking-wider">{log.date}</span>
                </div>
                <p className="text-sm text-outline">{log.changes}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
