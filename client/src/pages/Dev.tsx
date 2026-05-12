import { useState } from "react";
import { Search, Grid3X3, List, ArrowLeft, Calendar, Clock, Tag, Share2, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  readTime: string;
  imageColor: string;
  imagePattern?: string;
  content?: string;
  author?: string;
}

function PatternSvg({ pattern }: { pattern: string }) {
  const patterns: Record<string, JSX.Element> = {
    chart: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M40,110 Q60,60 80,90 T120,70 T160,50" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="80" cy="90" r="4" fill="#1a1a1a" />
        <circle cx="120" cy="70" r="4" fill="#1a1a1a" />
        <path d="M140,40 L150,30 M150,40 L160,30" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    stairs: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M60,120 L60,90 L90,90 L90,60 L120,60 L120,30" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M130,40 Q140,30 150,40" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <rect x="50" y="30" width="100" height="90" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <line x1="80" y1="30" x2="80" y2="120" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="95" y1="50" x2="130" y2="50" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="95" y1="65" x2="130" y2="65" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="95" y1="80" x2="120" y2="80" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    ),
    code: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <path d="M70,75 L50,55 L70,35" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M130,75 L150,55 L130,35" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="85" y1="85" x2="115" y2="25" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <ellipse cx="100" cy="75" rx="50" ry="30" fill="none" stroke="#1a1a1a" strokeWidth="3" />
        <circle cx="100" cy="75" r="15" fill="#1a1a1a" />
        <path d="M150,45 L170,35" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        <path d="M155,55 L175,50" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    nodes: (
      <svg viewBox="0 0 200 150" className="w-full h-full">
        <circle cx="60" cy="75" r="12" fill="#1a1a1a" />
        <circle cx="140" cy="50" r="12" fill="#1a1a1a" />
        <circle cx="140" cy="100" r="12" fill="#1a1a1a" />
        <line x1="72" y1="75" x2="128" y2="55" stroke="#1a1a1a" strokeWidth="2" />
        <line x1="72" y1="75" x2="128" y2="95" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="140" cy="50" r="4" fill="#fff" />
        <circle cx="140" cy="100" r="4" fill="#fff" />
      </svg>
    ),
  };
  return patterns[pattern] || null;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Canvas Engine Pipeline & Architecture",
    subtitle: "Render math, DAG layouts, interaction modes, and PostgreSQL diffing strategies.",
    date: "May 10, 2026",
    category: "Engineering",
    readTime: "12 min read",
    imageColor: "bg-[#7A8B6E]",
    imagePattern: "nodes",
    author: "Meshwork Engineering",
    content: `
## Render & Math Layer

The canvas maps React Flow node/edge arrays to DOM elements. Absolute positioning is avoided for nested nodes. Instead, spatial containment math calculates relative \`(x, y)\` coordinate offsets when nodes are dragged inside parent nodes. This enables infinite nesting without Z-index conflicts.

Auto-layout uses a localized \`dagre\` implementation. Top-to-bottom and left-to-right graphs are generated dynamically by parsing edges into a directed acyclic graph (DAG), running the layout algorithm, and dispatching coordinates to the state store via optimistic UI updates.

## Strict Mode Interactions

Interaction states are explicitly decoupled to prevent layout destruction:
- **Select Mode**: Sets \`nodesDraggable=false\` to prevent movement during box-selection.
- **Pan Mode**: Sets \`elementsSelectable=false\` and \`panOnDrag=true\` for safe viewport navigation.

## Upsert Diffing Protocol

The client calculates a deterministic hash of the initial canvas state. On autosave, the engine diffs the current state against the hash. Only modified nodes/edges are sent to the API.

The backend executes PostgreSQL \`ON CONFLICT (id) DO UPDATE\` queries with this partial payload. This avoids row-deletion/re-insertion, reducing lock contention and decreasing payload size by up to 98% for large documents.
    `
  },
  {
    id: 2,
    title: "AI Integration Architecture",
    subtitle: "SSE streaming, BYOK key management, and exponential backoff.",
    date: "May 8, 2026",
    category: "Technical",
    readTime: "8 min read",
    imageColor: "bg-[#E8DED5]",
    imagePattern: "code",
    author: "Meshwork Engineering",
    content: `
## Key Management (BYOK)

User API keys are encrypted at rest via AES-256-GCM. A randomly generated IV is prefixed to the ciphertext on every write. Decryption occurs exclusively in-memory on the Node.js backend when proxying requests to external provider APIs. Raw key material is never exposed to the client.

## Fault-Tolerant Event Streaming

AI architecture generation uses Server-Sent Events (SSE). The backend buffers LLM JSON chunks and streams them to the client.

Since streaming JSON is malformed until completion, the client uses a fault-tolerant parser that strips trailing commas and unclosed brackets before calling \`JSON.parse()\`. Upon successful parsing, temporary "pseudo-nodes" mount on the canvas to allocate coordinate space, providing immediate structural feedback before final data mapping.

## Exponential Backoff Resilience

LLM providers return HTTP 429 and 503 frequently under load. Meshwork handles these natively. The client pauses the stream and enters a retry loop using: \`wait_time = base_delay * (2 ^ attempt_count)\`. Jitter is applied to prevent thundering herd problems on proxy servers.
    `
  },
  {
    id: 3,
    title: "Security Posture & API Defenses",
    subtitle: "Middleware boundaries, Redis lockouts, and recursive log sanitization.",
    date: "May 5, 2026",
    category: "Engineering",
    readTime: "6 min read",
    imageColor: "bg-[#B8C5C4]",
    imagePattern: "eye",
    author: "Meshwork Security Team",
    content: `
## API & Validation Boundaries

All HTTP requests route through multi-layered middleware. Helmet.js enforces strict HTTP headers (HSTS, NoSniff, FrameGuard). Authentication state uses \`express-session\` via a Redis store, avoiding stateless JWT vulnerabilities. 

State-changing requests require CSRF double-submit validation. Request bodies are mapped against Zod schemas prior to reaching the controller, preventing Prototype Pollution and injection attacks.

## Rate Limiting & Lockouts

API endpoints enforce sliding-window rate limits (e.g., 100 requests / 15 min). Sensitive endpoints (e.g., \`/api/auth/login\`) use a Redis-backed progressive timeout. Successive failures trigger exponential lockout periods mapped to both the requester's IP and the target username to mitigate credential stuffing and brute-force attacks.

## Log Sanitization

The application logger uses a recursive redaction transport. Before payloads write to standard output, they are scanned for sensitive keys (e.g., \`password\`, \`token\`, \`email\`, \`apiKey\`). Values are replaced with an irreversible \`[REDACTED]\` string, ensuring zero credentials enter the log pipeline.
    `
  },
  {
    id: 4,
    title: "Design System Implementation",
    subtitle: "Tailwind utility architecture, opacity mapping, and accessible primitives.",
    date: "May 2, 2026",
    category: "Design",
    readTime: "5 min read",
    imageColor: "bg-[#9B8B7A]",
    imagePattern: "stairs",
    author: "Meshwork Design",
    content: `
## Tailwind Utility Foundation

Meshwork uses Tailwind CSS explicitly without \`@apply\` directives in CSS files. This preserves specificity and prevents cascading overrides. The design enforces brutalist geometry via \`rounded-none\` on structural components, while floating elements use \`backdrop-blur-xl\` over semi-transparent backgrounds to achieve depth without drop-shadows.

## Variable Opacity Mapping

The root theme maps semantic color variables (\`--primary\`) to raw HSL values rather than hex codes. This enables arbitrary opacity modifiers in Tailwind classes (e.g., \`bg-primary/10\`) without requiring manual RGBA color definitions for every alpha step. This ensures clean light/dark mode transitions and strict adherence to WCAG contrast requirements.

## Accessible React Primitives

Interactive components (Dialogs, Dropdowns, Tooltips, Accordions) use Radix UI primitives. This delegates focus management, keyboard navigation (Escape, Arrow keys), and ARIA attribute assignment to the primitive layer. Tooltips render descriptions via React portals to escape hidden overflow boundaries while maintaining context to the targeted node.
    `
  }
];

export default function Dev() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Announcements", "Engineering", "Technical", "Features", "Product", "Design"];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      }
    },
    exit: { opacity: 0, y: -20, scale: 0.96 }
  };

  const { toast } = useToast();

  const handleShareOnX = () => {
    if (!selectedPost) return;
    const text = encodeURIComponent(`Check out this article on Weave Studio: ${selectedPost.title}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Article link copied to clipboard.",
    });
  };

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="post"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="min-h-screen relative"
        >
          {/* Blog post background */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0A0A0A]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_31px,currentColor_31px,currentColor_32px)] opacity-[0.02]" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-0 py-12">
            {/* Back button */}
            <button 
              className="mb-12 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/[0.08]"
              onClick={() => setSelectedPost(null)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to articles
            </button>

            {/* Article header */}
            <article className="space-y-12">
              <div className="space-y-8 text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-4 text-sm font-medium tracking-wide">
                  <span className="px-3 py-1 bg-white/[0.05] border border-white/[0.08] text-white/80 rounded-full">
                    {selectedPost.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Calendar className="w-4 h-4 text-white/30" />
                    {selectedPost.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/40">
                    <Clock className="w-4 h-4 text-white/30" />
                    {selectedPost.readTime}
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold font-headline leading-tight tracking-tight text-white drop-shadow-lg">
                  {selectedPost.title}
                </h1>
                
                <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-sans font-light">
                  {selectedPost.subtitle}
                </p>

              {selectedPost.author && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="w-12 h-12 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center font-semibold text-white/90 shadow-lg">
                    {selectedPost.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white/90">{selectedPost.author}</p>
                    <p className="text-sm text-white/40">Weave Studio Team</p>
                  </div>
                </div>
              )}
            </div>

            {/* Featured image */}
            <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_24px_64px_rgba(0,0,0,0.8)] border border-white/[0.08] group">
              <div className={cn("absolute inset-0 transition-transform duration-700 group-hover:scale-105", selectedPost.imageColor)}>
                 {selectedPost.imagePattern && <PatternSvg pattern={selectedPost.imagePattern} />}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent opacity-60" />
            </div>

            {/* Article content */}
            <div className="prose prose-invert prose-lg md:prose-xl max-w-3xl mx-auto">
              <div className="space-y-8 text-white/80 leading-relaxed font-sans font-light">
                {selectedPost.content?.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-3xl font-bold font-headline mt-16 mb-6 text-white">{paragraph.replace('## ', '')}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-2xl font-semibold font-headline mt-12 mb-4 text-white/90">{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={idx} className="list-disc list-outside space-y-3 ml-6 text-white/70">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith('1. ')) {
                    return (
                      <ol key={idx} className="list-decimal list-outside space-y-3 ml-6 text-white/70">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i}>{item.replace(/^\d+\. /, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={idx} className="font-semibold text-xl text-white/90">{paragraph.replace(/\*\*/g, '')}</p>;
                  }
                  if (paragraph.includes('`')) {
                    return (
                      <p key={idx}>
                        {paragraph.split('`').map((part, i) => 
                          i % 2 === 1 ? (
                            <code key={i} className="px-2 py-1 bg-white/[0.05] border border-white/[0.08] rounded text-[0.9em] font-mono text-blue-300">{part}</code>
                          ) : part
                        )}
                      </p>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>
            </div>

            {/* Share section */}
            <div className="border-t border-white/[0.08] pt-8 mt-16 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleShareOnX}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  >
                    <Share2 className="w-4 h-4" />
                    Share on X
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  >
                    <Link2 className="w-4 h-4" />
                    Copy link
                  </button>
                </div>
                <button className="text-sm font-medium text-white/40 hover:text-white transition-colors" onClick={() => setSelectedPost(null)}>
                  Back to all posts
                </button>
              </div>
            </div>
          </article>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-[calc(100vh-4rem)] relative"
      >
        {/* Dev blog background - fixed to cover full viewport */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0A0A0A]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_31px,currentColor_31px,currentColor_32px)] opacity-[0.02]" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-radial from-indigo-500/5 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-emerald-500/5 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
        </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-24"
      >
      {/* Header with search */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex-1 w-full max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#121214]/60 backdrop-blur-xl border border-white/[0.08] text-white placeholder:text-white/30 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/[0.2] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-[#121214]/60 backdrop-blur-xl border border-white/[0.08] rounded-xl p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-lg transition-colors",
                viewMode === "grid" ? "bg-white/[0.08] text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 rounded-lg transition-colors",
                viewMode === "list" ? "bg-white/[0.08] text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <motion.aside variants={itemVariants} className="w-full lg:w-56 shrink-0 hidden lg:block">
          <div className="space-y-8 sticky top-8">
            <div>
              <h4 className="text-sm font-medium tracking-wider uppercase text-white/40 mb-6 font-sans">Categories</h4>
              <div className="space-y-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      selectedCategory === category 
                        ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                        : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Blog Grid/List with smooth transition */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {filteredPosts.map((post) => (
                  <motion.article
                    key={post.id}
                    variants={itemVariants}
                    onClick={() => setSelectedPost(post)}
                    className="group cursor-pointer bg-[#121214]/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.2] rounded-3xl overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:shadow-[0_24px_64px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.0] to-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className={cn("h-56 w-full flex items-center justify-center p-8 transition-transform duration-700 group-hover:scale-[1.03] shrink-0", post.imageColor)}>
                      {post.imagePattern && <PatternSvg pattern={post.imagePattern} />}
                    </div>
                    <div className="p-8 space-y-4 relative bg-[#121214]/40 flex-1 flex flex-col z-10">
                      <div className="flex items-center gap-3 text-xs font-medium text-white/50 tracking-wide uppercase">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {post.category}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-headline font-semibold text-2xl text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-white/60 line-clamp-2 leading-relaxed font-light">
                        {post.subtitle}
                      </p>
                      <p className="text-sm font-medium text-white/40 pt-2 mt-auto">
                        {post.date}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="space-y-6"
              >
                {filteredPosts.map((post) => (
                  <motion.div 
                    key={post.id} 
                    variants={itemVariants}
                    onClick={() => setSelectedPost(post)}
                    className="relative flex flex-col sm:flex-row gap-6 p-4 bg-[#121214]/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.05] rounded-3xl group cursor-pointer transition-all duration-500 hover:shadow-[0_24px_64px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  >
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className={cn("w-full sm:w-64 h-48 sm:h-auto rounded-2xl shrink-0 flex items-center justify-center p-6 overflow-hidden z-10", post.imageColor)}>
                      <div className="transition-transform duration-700 group-hover:scale-[1.03] w-full h-full flex items-center justify-center">
                        {post.imagePattern && <PatternSvg pattern={post.imagePattern} />}
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 py-4 pr-4 z-10">
                      <div className="flex items-center gap-3 text-xs font-medium text-white/50 tracking-wide uppercase">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {post.category}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="font-headline font-semibold text-2xl text-white group-hover:text-blue-400 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-lg text-white/60 font-sans font-light line-clamp-2">
                        {post.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-24 bg-white/[0.02] border border-white/[0.05] rounded-3xl backdrop-blur-xl">
              <p className="text-white/50 text-lg">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
