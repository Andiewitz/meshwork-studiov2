import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BrainCircuit, Box, Paintbrush, ChevronRight, BookOpen } from "lucide-react";

const DOCS = [
  {
    id: "engine",
    title: "Canvas Engine",
    icon: <Box className="w-5 h-5" />,
    content: (
      <div className="space-y-6 text-[15px] leading-relaxed text-outline">
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">4-Layer Architecture</h3>
          <p>Meshwork turns drag-and-drop into persistent diagrams through React Flow (visuals), Spatial Containment (nesting logic), Local Cache (offline-first), and Postgres Upsert Syncing.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Interaction Modes</h3>
          <p>Tools are strictly decoupled. <strong>Select / Infrastructure</strong> mode allows box-selection but disables node dragging. <strong>Pan / Grab</strong> mode allows moving nodes and canvas panning but disables selection.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Upsert Diffing</h3>
          <p>Instead of nuking and rebuilding the database on every save, the engine calculates a diff and only sends modified nodes and edges to the server, resulting in a 99% performance boost for large diagrams.</p>
        </div>
      </div>
    )
  },
  {
    id: "ai",
    title: "Mosh AI Architecture",
    icon: <BrainCircuit className="w-5 h-5" />,
    content: (
      <div className="space-y-6 text-[15px] leading-relaxed text-outline">
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">BYOK Encryption</h3>
          <p>User-provided API keys are AES-256-GCM encrypted. They are decrypted exclusively in-memory during external HTTP requests and never logged or exposed to the client.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Resilience & Rate Limiting</h3>
          <p>External LLM providers are notoriously flaky. If a request hits a rate limit (HTTP 429), Mosh automatically enters a client-side exponential backoff loop to retry the request without user intervention.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Pseudo-Nodes</h3>
          <p>While generating, Mosh places a temporary glowing pseudo-node on the canvas to simulate its spatial presence, streaming the structural JSON directly into React Flow via Server-Sent Events (SSE).</p>
        </div>
      </div>
    )
  },
  {
    id: "security",
    title: "Security Model",
    icon: <Shield className="w-5 h-5" />,
    content: (
      <div className="space-y-6 text-[15px] leading-relaxed text-outline">
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Defense-in-Depth</h3>
          <p>We don't rely on a single layer. Browser protections (Helmet, CSP), CSRF double-submit cookies, session validation, strict Zod schemas, IDOR checks, and parameterized Drizzle SQL work together.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Brute-Force Lockout</h3>
          <p>Failed logins trigger progressive lockouts (1 min → 60 mins) to prevent credential stuffing. A successful login immediately resets the tracker.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Sanitized Logs</h3>
          <p>Production logs automatically and recursively redact sensitive fields (passwords, emails, keys, tokens) before writing to standard output.</p>
        </div>
      </div>
    )
  },
  {
    id: "design",
    title: "Sharp Glassmorphism",
    icon: <Paintbrush className="w-5 h-5" />,
    content: (
      <div className="space-y-6 text-[15px] leading-relaxed text-outline">
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">The Aesthetic</h3>
          <p>Meshwork evolved from pure Neo-Brutalism into Sharp Glassmorphism. This means maintaining hard edges (0px border radius) and high contrast, while introducing frosted glass overlays (<code>backdrop-filter: blur()</code>).</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">True Dark Mode</h3>
          <p>We don't just invert colors. We use deep charcoal (<code>#121212</code>) and warm off-white (<code>#EBEBEA</code>) to reduce eye strain, while preserving our bold brand red (<code>#FF3D00</code>) for accents and sharp shadows.</p>
        </div>
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-2 uppercase tracking-wide">Dynamic Tooltips</h3>
          <p>Component hover states pull custom user-defined descriptions directly from the Properties Sidebar, rendered through portals with preserved whitespace instead of relying on generic helper text.</p>
        </div>
      </div>
    )
  }
];

export default function Docs() {
  const [activeDoc, setActiveDoc] = useState(DOCS[0].id);

  const activeContent = DOCS.find(d => d.id === activeDoc);

  return (
    <motion.div
      key="docs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-6xl mx-auto min-h-[80vh] flex flex-col px-4 md:px-8 py-12"
    >
      {/* Header */}
      <div className="mb-16 md:mb-24 text-center mt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-none border border-[#FF3D00]/30 bg-[#FF3D00]/10 text-[#FF3D00] text-[10px] md:text-xs font-headline font-bold tracking-[0.2em] uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Manual
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white font-headline uppercase mb-6">
          How It <span className="text-[#FF3D00]">Works</span>
        </h1>
        <p className="text-outline text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Simplified engineering manuals and architecture notes for Meshwork Studio. 
          No fluff, no jargon—just the systems that power the canvas.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          {DOCS.map(doc => {
            const isActive = activeDoc === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`flex items-center gap-4 p-4 text-left transition-all relative overflow-hidden border bg-black/40 backdrop-blur-md cursor-figma-pointer ${
                  isActive 
                    ? "border-[#FF3D00]/50 bg-[#FF3D00]/10" 
                    : "border-white/5 hover:bg-white/5 hover:border-white/20"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3D00]"
                  />
                )}
                <div className={`p-2.5 transition-colors border ${
                  isActive 
                    ? "text-[#FF3D00] bg-[#FF3D00]/10 border-[#FF3D00]/20" 
                    : "text-outline bg-white/5 border-transparent"
                }`}>
                  {doc.icon}
                </div>
                <div className="flex-1 font-headline font-bold text-sm tracking-[0.1em] text-white uppercase">
                  {doc.title}
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  isActive ? "text-[#FF3D00] translate-x-1" : "text-outline/40"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="w-full lg:w-2/3 relative min-h-[450px]">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-[#FF3D00]/5 rounded-none blur-3xl -z-10 pointer-events-none" />
          
          {/* Glass Content Box */}
          <div className="w-full border border-white/10 bg-[#0e0e0e]/80 backdrop-blur-xl p-8 md:p-12 shadow-[8px_8px_0_0_rgba(255,61,0,0.15)] relative overflow-hidden">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF3D00]/10 border-l border-b border-[#FF3D00]/20" />
            
            <AnimatePresence mode="wait">
              {activeContent && (
                <motion.div
                  key={activeContent.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-5 mb-10 border-b border-white/10 pb-8">
                    <div className="p-4 bg-[#FF3D00]/10 text-[#FF3D00] border border-[#FF3D00]/20 self-start">
                      {activeContent.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-headline font-bold text-white uppercase tracking-tight mb-2">
                        {activeContent.title}
                      </h2>
                      <p className="text-xs font-bold tracking-[0.2em] text-[#FF3D00] uppercase">
                        System Overview
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    {activeContent.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
