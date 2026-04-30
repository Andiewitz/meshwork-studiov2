import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Send, Sparkles, Bot, Loader2, Code2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I am Meshwork AI. How can I help you design your architecture today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes, setEdges, fitView } = useReactFlow();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

const SYSTEM_PROMPT = `You are Meshwork AI, an expert cloud architecture assistant. 
When asked to design or update architecture, you must understand our React Flow JSON schema.
Node Schema:
- id: string (unique, e.g., 'api-1')
- type: string (valid types: 'microservice', 'database', 'cache', 'vpc', 'region', 'loadBalancer', 'auth0', 's3', 'route53', 'waf', 'cdn', 'stripe', 'bus', 'k8s-pod', etc.)
- position: { x: number, y: number }
- data: { label: string, category: string, provider?: string }
- style: { width: number, height: number } (standard sizes: microservice is 168x72, database is 144x120, vpc is 1100x500)
- parentId?: string (for grouping inside vpc or region)

Edge Schema:
- id: string
- source: string (node id)
- target: string (node id)
- type: 'step' | 'default' | 'straight' | 'smoothstep'
- style: { stroke: string, strokeWidth: number, strokeDasharray?: string }

Provide technical, precise answers and return JSON blocks wrapped in \`\`\`json when generating architecture.`;

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
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const { secureFetch } = await import("@/lib/secure-fetch");
      
      const payloadMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.filter(m => m.id !== "init"),
        userMsg
      ].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await secureFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openrouter",
          model: "openrouter/free", // Dynamically routes to fastest non-rate-limited free model
          messages: payloadMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "No response generated.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content,
        },
      ]);

      // Try to parse architecture JSON from the response and apply it
      try {
        const jsonMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, content];
        const jsonString = jsonMatch[1].trim();
        if (jsonString.startsWith("{") || jsonString.startsWith("[")) {
          const parsed = JSON.parse(jsonString);
          if (parsed.nodes && parsed.edges) {
            setNodes((prev: any) => [...prev, ...parsed.nodes]);
            setEdges((prev: any) => [...prev, ...parsed.edges]);
            setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
          }
        }
      } catch (err) {
        console.warn("AI response did not contain valid architecture JSON:", err);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${error.message}`,
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

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* ── Pull-up Tab ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-6 bg-[#1a1a1a] border border-b-0 border-white/[0.06] rounded-t-lg hover:bg-[#222] transition-colors cursor-figma-pointer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-white/50" />
        ) : (
          <ChevronUp className="w-4 h-4 text-white/50" />
        )}
      </motion.button>

      {/* ── Drawer Body ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: 20 }}
            animate={{ height: 500, opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="w-[600px] max-w-[90vw] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-b-0 border-white/[0.08] rounded-t-2xl overflow-hidden flex flex-col shadow-[0_-10px_40px_-10px_rgba(255,85,0,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] bg-gradient-to-r from-[#111]/80 to-[#0A0A0A]/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5500]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70" style={{ fontFamily: 'var(--font-headline)' }}>
                  Meshwork AI <span className="text-white/30 text-[9px] border border-white/10 px-1.5 py-0.5 rounded ml-1">BETA</span>
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white/70 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-body text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => {
                // Strip JSON blocks and replace with a sleek indicator
                const displayContent = msg.content.replace(
                  /```(?:json)?\n[\s\S]*?\n```/g,
                  "\n\n> ✨ *Generated architecture applied to canvas*"
                );

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex gap-3 max-w-[90%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 shadow-md border border-white/5"
                         style={{ background: msg.role === "assistant" ? "linear-gradient(145deg, #1a1a1a, #0A0A0A)" : "linear-gradient(145deg, #FF6611, #FF4400)" }}>
                      {msg.role === "assistant" ? (
                        <Bot className="w-4 h-4 text-[#FF5500]" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
                      )}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-[#FF5500]/10 border border-[#FF5500]/20 text-white/90 rounded-tr-sm"
                          : "bg-white/[0.04] border border-white/[0.06] text-white/80 rounded-tl-sm shadow-inner"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 text-[13px] max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayContent}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 shadow-md border border-white/5" style={{ background: "linear-gradient(145deg, #1a1a1a, #0A0A0A)" }}>
                    <Loader2 className="w-4 h-4 text-[#FF5500] animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/50 flex items-center shadow-inner rounded-tl-sm h-[48px]">
                    <span className="flex items-center gap-1">
                      Thinking
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}>.</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.2 }}>.</motion.span>
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1], delay: 0.4 }}>.</motion.span>
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gradient-to-t from-[#0A0A0A] to-[#0A0A0A]/90 border-t border-white/[0.05]">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-end gap-2 bg-[#141414]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl focus-within:border-[#FF5500]/50 focus-within:ring-1 focus-within:ring-[#FF5500]/20 focus-within:shadow-[0_0_15px_rgba(255,85,0,0.1)] transition-all p-1.5"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Meshwork AI to design a diagram..."
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent border-0 resize-none outline-none text-white/90 text-[13px] placeholder:text-white/30 px-3 py-2.5 font-body scrollbar-thin"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 shrink-0 flex items-center justify-center mb-0.5 mr-0.5 rounded-xl bg-gradient-to-b from-[#FF6611] to-[#FF4400] text-white shadow-lg hover:shadow-[#FF5500]/20 disabled:opacity-50 disabled:from-white/5 disabled:to-white/5 disabled:text-white/30 disabled:shadow-none transition-all cursor-figma-pointer"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-white/30 font-body">
                <Sparkles className="w-3 h-3 text-white/20" />
                <span>Powered by OpenRouter • Models may hallucinate architecture</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
