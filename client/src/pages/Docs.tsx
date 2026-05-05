import { Shield, BrainCircuit, Box, Paintbrush, BookOpen, Clock, Calendar } from "lucide-react";

export default function Docs() {
  return (
    <div className="max-w-3xl mx-auto pb-24 relative px-4 pt-12 md:pt-20 font-sans">
      {/* Background ambient effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49.5%,currentColor_49.5%,currentColor_50.5%,transparent_50.5%),linear-gradient(-45deg,transparent_49.5%,currentColor_49.5%,currentColor_50.5%,transparent_50.5%)] [background-size:40px_40px] opacity-[0.02]" />
      </div>

      {/* Article Header */}
      <header className="mb-14">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1.5 font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            <BookOpen className="w-4 h-4" />
            Engineering Docs
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            May 2026
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            4 min read
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-foreground mb-6 leading-tight">
          Meshwork Studio Architecture & Systems Overview
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Technical specifications, persistence strategies, and security models for the canvas engine and AI integration layer.
        </p>
      </header>

      {/* Divider */}
      <div className="w-full h-px bg-border/50 mb-14" />

      {/* Content */}
      <div className="space-y-16">
        
        {/* Section 1 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-md bg-muted text-foreground">
              <Box className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight">Canvas Engine</h2>
          </div>
          
          <div className="space-y-8 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">System Architecture</h3>
              <p>Canvas operations utilize React Flow for rendering, custom spatial containment math for node nesting, LocalStorage for state recovery, and PostgreSQL upsert batching for persistence.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Interaction States</h3>
              <p>State toggles enforce interaction constraints. <strong>Select</strong> mode disables <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">nodesDraggable</code> to prevent accidental offset. <strong>Pan</strong> mode sets <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">elementsSelectable</code> to false, permitting background drag.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Database Sync</h3>
              <p>Client-side diff calculations filter unchanged nodes/edges before API submission. The backend executes <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">ON CONFLICT DO UPDATE</code> SQL operations to minimize row locking and query overhead.</p>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-md bg-muted text-foreground">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight">AI Service</h2>
          </div>
          
          <div className="space-y-8 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Key Management</h3>
              <p>User API keys are encrypted at rest via AES-256-GCM. Decryption occurs exclusively in-memory during external HTTP requests to provider APIs. Keys are not exposed to the client application.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Rate Limit Handling</h3>
              <p>HTTP 429 (Too Many Requests) responses trigger an automatic client-side exponential backoff loop, retrying the failed request with multiplied timeout intervals.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Event Streaming</h3>
              <p>Response parsing executes concurrently with Server-Sent Events (SSE). Temporary pseudo-nodes are mounted on the canvas to allocate coordinate space while JSON structures are streamed and parsed.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-md bg-muted text-foreground">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight">Security</h2>
          </div>
          
          <div className="space-y-8 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">API Protection</h3>
              <p>Requests route through Helmet middleware, CSRF double-submit validation, and express-session verification. Request bodies map directly to Zod validation schemas before controller execution.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Authentication Limits</h3>
              <p>Failed authentication endpoints trigger progressive timeouts mapped to IP and username. Lockout durations scale exponentially to mitigate brute-force attempts.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Log Redaction</h3>
              <p>Application logger transports recursively filter configured keys (passwords, tokens, emails, keys) replacing payload values with sanitized strings before standard output.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-md bg-muted text-foreground">
              <Paintbrush className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight">Design System</h2>
          </div>
          
          <div className="space-y-8 text-base text-foreground/80 leading-relaxed">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">CSS Framework</h3>
              <p>Tailwind CSS provides the utility foundation. The interface enforces <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">rounded-none</code> for structural components, leveraging <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">backdrop-blur</code> utilities on fixed or absolute positioned overlays.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Theme Implementation</h3>
              <p>Theme state is mapped to root CSS variables. Variables define exact background and foreground hex values rather than relying on color inversion math to ensure contrast ratio compliance.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Tooltip Architecture</h3>
              <p>Hover states render via React portals to escape overflow boundaries. Content is dynamically sourced from the target node's <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground font-mono">data.description</code> property.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
