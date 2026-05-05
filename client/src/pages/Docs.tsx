import { Shield, BrainCircuit, Box, Paintbrush, BookOpen, Clock, Calendar, Code, Database, Lock, Server } from "lucide-react";

export default function Docs() {
  return (
    <div className="max-w-3xl mx-auto pb-24 relative px-4 pt-12 md:pt-20 font-body">
      {/* Grid overlay */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49.5%,currentColor_49.5%,currentColor_50.5%,transparent_50.5%),linear-gradient(-45deg,transparent_49.5%,currentColor_49.5%,currentColor_50.5%,transparent_50.5%)] [background-size:40px_40px] opacity-[0.02]" />
      </div>

      {/* Article Header */}
      <header className="mb-14">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6 font-label">
          <span className="flex items-center gap-1.5 font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            <BookOpen className="w-4 h-4" />
            Engineering Manual
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            May 2026
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            12 min read
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-foreground mb-6 leading-tight">
          Meshwork Studio Architecture & Systems Overview
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Comprehensive technical specifications, persistence strategies, and security models governing the Meshwork canvas engine, AI integration layer, and infrastructure stack.
        </p>
      </header>

      {/* Divider */}
      <div className="w-full h-px bg-border/50 mb-14" />

      {/* Content */}
      <div className="space-y-20">
        
        {/* Section 1: Canvas Engine */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-md bg-muted text-foreground">
              <Box className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-display font-semibold text-foreground tracking-tight">Canvas Engine Pipeline</h2>
          </div>
          
          <div className="space-y-10 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" /> Render & Math Layer
              </h3>
              <p className="mb-3">
                Canvas operations map React Flow's node and edge state arrays to standard DOM elements. Instead of relying on absolute positioning, we utilize custom spatial containment mathematics to calculate relative `(x, y)` coordinate offsets when nodes are dragged inside other parent nodes, achieving infinite nesting capabilities without Z-index conflicts.
              </p>
              <p>
                Auto-layout is driven by a localized implementation of <code>dagre</code>. Top-to-bottom and left-to-right graphs are generated dynamically by parsing the edges array into a directed acyclic graph, running the layout algorithm, and dispatching coordinate updates back to the state store via optimistic UI updates.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                <Box className="w-4 h-4 text-primary" /> Strict Mode Interactions
              </h3>
              <p>
                To prevent accidental destructive behavior, interaction states are strictly decoupled. <strong>Select Mode</strong> explicitly sets <code>nodesDraggable=false</code> to prevent unintended layout destruction during box-selection. <strong>Pan Mode</strong> explicitly sets <code>elementsSelectable=false</code> and <code>panOnDrag=true</code>, allowing the user to navigate the infinite canvas without accidentally grabbing node infrastructure.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Upsert Diffing Protocol
              </h3>
              <p>
                To minimize database I/O, the client calculates a deterministic hash of the initial canvas state upon load. When an autosave interval triggers, the engine diffs the current state against the initial hash. Only nodes or edges that yield a delta are packaged into the API payload. 
              </p>
              <p className="mt-3">
                The backend receives this partial payload and executes PostgreSQL <code>ON CONFLICT (id) DO UPDATE</code> queries. This strategy bypasses standard row-deletion/re-insertion anti-patterns, significantly reducing PostgreSQL lock contention and minimizing payload size by up to 98% on large documents.
              </p>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-border/20" />

        {/* Section 2: AI Service */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-md bg-muted text-foreground">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-display font-semibold text-foreground tracking-tight">Mosh AI Integration</h2>
          </div>
          
          <div className="space-y-10 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Key Management (BYOK)
              </h3>
              <p>
                To support Bring Your Own Key (BYOK) without risking credential leakage, user API keys are encrypted at rest using AES-256-GCM. A randomly generated initialization vector (IV) is prefixed to the ciphertext for every write. Decryption occurs exclusively in-memory on the Node.js backend when actively proxying requests to external provider APIs. The raw key material is never exposed back to the client application payload.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-primary" /> Fault-Tolerant Event Streaming
              </h3>
              <p>
                When a user initiates an AI architecture generation, the server opens a standard Server-Sent Events (SSE) stream. As the LLM generates the JSON structure, the backend buffers the chunks and streams them to the client.
              </p>
              <p className="mt-3">
                Because streaming JSON is inherently malformed until complete, the client utilizes a fault-tolerant parser that strips trailing commas and unclosed brackets before attempting a <code>JSON.parse()</code>. If parsing succeeds, temporary "pseudo-nodes" are mounted on the canvas to visually allocate coordinate space in real-time, giving the user immediate structural feedback before the final data mapping occurs.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Exponential Backoff Resilience
              </h3>
              <p>
                LLM providers exhibit high failure rates under load. Meshwork handles HTTP 429 (Too Many Requests) and HTTP 503 (Service Unavailable) status codes natively. Upon detecting these codes, the client immediately pauses the stream and enters a retry loop using the standard equation: <code>wait_time = base_delay * (2 ^ attempt_count)</code>. A jitter variable is applied to prevent thundering herd problems on our proxy servers.
              </p>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-border/20" />

        {/* Section 3: Security */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-md bg-muted text-foreground">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-display font-semibold text-foreground tracking-tight">Security Posture</h2>
          </div>
          
          <div className="space-y-10 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3">API & Validation Boundaries</h3>
              <p>
                All HTTP requests route through a multi-layered middleware stack. Helmet.js assigns strict HTTP headers (HSTS, NoSniff, FrameGuard). Authentication state is managed via <code>express-session</code> utilizing a Redis store, entirely avoiding stateless JWT vulnerabilities. State-changing requests mandate CSRF double-submit validation. Finally, request bodies are strictly mapped against Zod schemas before reaching the controller, preventing Prototype Pollution and NoSQL/SQL injection attacks at the boundary.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3">Rate Limiting & Lockouts</h3>
              <p>
                General API endpoints enforce standard sliding-window rate limits (e.g., 100 requests per 15 minutes). Sensitive endpoints (like <code>/api/auth/login</code>) utilize a Redis-backed progressive timeout mechanism. Successive failures trigger exponential lockout periods mapped to both the requester's IP address and the targeted username to aggressively mitigate credential stuffing and distributed brute-force attacks.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3">Log Sanitization</h3>
              <p>
                To maintain SOC2 compliance readiness, our application logger utilizes a recursive redaction transport. Before any payload writes to standard output, it is scanned for configured keys (e.g., <code>password</code>, <code>token</code>, <code>email</code>, <code>apiKey</code>). The values of these keys are replaced with an irreversible <code>[REDACTED]</code> string, ensuring zero PII or credentials enter the aggregated log pipeline.
              </p>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-border/20" />

        {/* Section 4: Design System */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-md bg-muted text-foreground">
              <Paintbrush className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-display font-semibold text-foreground tracking-tight">Design System & UI</h2>
          </div>
          
          <div className="space-y-10 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3">Tailwind Utility Foundation</h3>
              <p>
                Meshwork employs Tailwind CSS explicitly without the use of <code>@apply</code> directives in standard CSS files, preserving exact specificity and preventing unexpected cascading overrides. The design aesthetic enforces strict brutalist geometry via <code>rounded-none</code> utilities across structural components, while floating elements utilize <code>backdrop-blur-xl</code> utilities over semi-transparent backgrounds to achieve depth without relying on generic drop-shadows.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3">Variable Opacity Mapping</h3>
              <p>
                Root theme implementation maps semantic color variables (like <code>--primary</code>) to raw HSL values rather than absolute hex codes. This strict standard enables arbitrary opacity modifiers directly in Tailwind classes (e.g., <code>bg-primary/10</code>) without requiring manual RGBA color definitions for every potential alpha step, ensuring seamless light and dark mode transitions while strictly adhering to WCAG contrast ratio requirements.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-headline font-semibold text-foreground mb-3">Accessible React Primitives</h3>
              <p>
                Complex interactive components (Dialogs, Dropdowns, Tooltips, Accordions) are constructed utilizing Radix UI primitives. This delegates focus management, keyboard navigation (Escape, Arrow keys), and screen-reader ARIA attribute assignment to the primitive layer. Our tooltip architecture specifically renders descriptions via React portals, guaranteeing tooltips escape hidden overflow boundaries while maintaining context to the targeted canvas node.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
