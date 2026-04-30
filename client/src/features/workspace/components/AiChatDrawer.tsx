import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, Loader2, ChevronDown, Wand2, Zap } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  appliedToCanvas?: boolean;
}

const SYSTEM_PROMPT = `You are Meshwork AI — the most powerful cloud architecture co-pilot ever built. You are embedded inside Meshwork Studio, a professional diagramming tool for designing cloud infrastructure.

IMPORTANT RULES:
1. Always respond in natural, clear language first — explain what you are doing or what you added, like a real architect talking to their team.
2. When you generate or modify architecture, ALWAYS provide a brief explanation of the changes (2-4 sentences) and then output the full architecture JSON in a single \`\`\`json code block.
3. NEVER show raw backend schema, IDs, or technical boilerplate in your conversational text.
4. If no diagram change is needed, just answer naturally with no JSON block.

Node Schema (for your reference, never show to user):
- id: string (unique, e.g., 'api-1')
- type: string ('microservice' | 'database' | 'cache' | 'vpc' | 'region' | 'loadBalancer' | 'auth0' | 's3' | 'route53' | 'waf' | 'cdn' | 'stripe' | 'bus' | 'k8s-pod')
- position: { x: number, y: number }
- data: { label: string, category: string, provider?: string }
- style: { width: number, height: number }
- parentId?: string

Edge Schema:
- id, source, target, type ('step'|'smoothstep'), style: { stroke, strokeWidth }

When modifying the canvas, always emit the COMPLETE updated nodes+edges (not just the diff).`;

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "I'm Meshwork AI. Describe your system and I'll design the architecture — or ask me to modify what's already on the canvas.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const { setNodes, setEdges, fitView, getNodes, getEdges } = useReactFlow();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, isOpen]);

  // Strip JSON blocks cleanly — returns { display: string, jsonBlock: string | null }
  const parseAIResponse = useCallback((content: string) => {
    const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
    const display = content.replace(/```(?:json)?\n[\s\S]*?\n```/g, "").trim();
    return { display, jsonBlock: jsonMatch ? jsonMatch[1].trim() : null };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const { secureFetch } = await import("@/lib/secure-fetch");

      // Silently inject canvas state into system context
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const hasCanvas = currentNodes.length > 0;
      const canvasContext = hasCanvas
        ? `\n\nCURRENT CANVAS STATE (${currentNodes.length} nodes, ${currentEdges.length} edges):\n\`\`\`json\n${JSON.stringify({ nodes: currentNodes, edges: currentEdges }, null, 2)}\n\`\`\`\nWhen modifying, emit the COMPLETE updated nodes+edges replacing the current state.`
        : `\n\nThe canvas is currently empty.`;

      const enrichedSystemPrompt = SYSTEM_PROMPT + canvasContext;

      const payloadMessages = [
        { role: "system", content: enrichedSystemPrompt },
        ...messages.filter((m) => m.id !== "init"),
        userMsg,
      ].map((m) => ({ role: m.role, content: m.content }));

      const response = await secureFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openrouter",
          model: "openrouter/free",
          messages: payloadMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.message || `Error ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0]?.message?.content || "No response generated.";
      const { display, jsonBlock } = parseAIResponse(rawContent);

      let appliedToCanvas = false;

      // Silently apply architecture to canvas
      if (jsonBlock) {
        try {
          const parsed = JSON.parse(jsonBlock);
          if (parsed.nodes && parsed.edges) {
            setNodes(parsed.nodes); // REPLACE, not append
            setEdges(parsed.edges);
            setTimeout(() => fitView({ duration: 800, padding: 0.25 }), 100);
            appliedToCanvas = true;
          }
        } catch (err) {
          console.warn("[MeshworkAI] Could not parse architecture JSON:", err);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: display || rawContent,
          appliedToCanvas,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Something went wrong: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    "Design a 3-tier web app",
    "Add a Redis cache layer",
    "Add a load balancer",
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
      {/* ── Pull Tab ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2 px-4 h-8 bg-[#111]/90 backdrop-blur-xl border border-b-0 border-white/[0.08] rounded-t-xl hover:bg-[#1a1a1a] transition-all cursor-pointer shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        animate={isOpen ? { opacity: 0.6 } : { opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-white/50" />
        </motion.div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
          </motion.div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-white/60">
            Meshwork AI
          </span>
          <span className="text-[9px] text-white/25 border border-white/10 px-1.5 py-0.5 rounded-md font-mono tracking-wide">
            BETA
          </span>
        </div>
      </motion.button>

      {/* ── Drawer Body ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 520, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="pointer-events-auto w-[640px] max-w-[92vw] flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(10,10,10,0.97) 0%, rgba(8,8,8,0.98) 100%)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderBottom: "none",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -20px 60px -10px rgba(0,0,0,0.8), 0 -4px 30px -5px rgba(255,85,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #FF5500, #FF3300)", boxShadow: "0 2px 12px rgba(255,85,0,0.4)" }}
                >
                  <Wand2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-white/90 tracking-wide">Meshwork AI</span>
                    <span className="text-[9px] text-[#FF5500]/70 border border-[#FF5500]/20 bg-[#FF5500]/5 px-1.5 py-0.5 rounded font-mono tracking-wider">BETA</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <span className="text-[10px] text-white/30">Connected</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={chatAreaRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-thin scrollbar-thumb-white/[0.06]"
            >
              {/* Suggestions — only show when no user messages yet */}
              {messages.filter((m) => m.role === "user").length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-2 mb-1"
                >
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      onClick={() => {
                        setInput(s);
                        textareaRef.current?.focus();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] text-white/50 border border-white/[0.06] hover:border-[#FF5500]/30 hover:text-white/80 hover:bg-[#FF5500]/5 transition-all cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-[#FF5500]/60" />
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35, delay: i === 0 ? 0 : 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 border border-white/[0.06]"
                      style={{ background: "linear-gradient(145deg, #1E1E1E, #141414)" }}
                    >
                      <Bot className="w-3.5 h-3.5 text-[#FF5500]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm text-white/90"
                        : "rounded-tl-sm text-white/80"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg, rgba(255,85,0,0.15), rgba(255,60,0,0.08))",
                            border: "1px solid rgba(255,85,0,0.2)",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.055)",
                          }
                    }
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:text-white/90 prose-headings:font-semibold prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0.5 prose-li:text-white/70 prose-strong:text-white/90 prose-strong:font-semibold prose-code:text-[#FF7733] prose-code:bg-white/[0.06] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[12px] prose-code:font-mono">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        {msg.appliedToCanvas && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                            <span className="text-[11px] text-emerald-400/60 font-medium">Applied to canvas</span>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex gap-3 justify-start"
                  >
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 border border-white/[0.06]"
                      style={{ background: "linear-gradient(145deg, #1E1E1E, #141414)" }}
                    >
                      <Loader2 className="w-3.5 h-3.5 text-[#FF5500] animate-spin" />
                    </div>
                    <div
                      className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.055)" }}
                    >
                      <div className="flex items-center gap-1">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-[#FF5500]/60"
                            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 0.9, delay, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                      <span className="text-[12px] text-white/30">Thinking</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-end gap-2 rounded-2xl p-1.5 transition-all"
                style={{
                  background: "rgba(20,20,20,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 0 0 0 rgba(255,85,0,0)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={() => {}}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe an architecture or ask me to modify the canvas..."
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent border-0 resize-none outline-none text-white/90 text-[13px] placeholder:text-white/25 px-3 py-3 leading-relaxed scrollbar-thin"
                  rows={1}
                  style={{ fontFamily: "inherit" }}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 shrink-0 flex items-center justify-center mb-0.5 rounded-xl text-white transition-all cursor-pointer disabled:cursor-default"
                  style={{
                    background: input.trim() && !isLoading
                      ? "linear-gradient(135deg, #FF6611, #FF3300)"
                      : "rgba(255,255,255,0.04)",
                    boxShadow: input.trim() && !isLoading ? "0 4px 16px rgba(255,85,0,0.35)" : "none",
                  }}
                  whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                  whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                >
                  <Send className="w-4 h-4" style={{ opacity: input.trim() && !isLoading ? 1 : 0.25 }} />
                </motion.button>
              </form>
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                <Sparkles className="w-2.5 h-2.5 text-white/15" />
                <span className="text-[10px] text-white/20 tracking-wide">OpenRouter · Enter to send · Shift+Enter for new line</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
