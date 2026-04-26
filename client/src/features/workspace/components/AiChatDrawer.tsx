import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Send, Sparkles, Bot, Loader2 } from "lucide-react";

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

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
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openrouter",
          model: "meta-llama/llama-3.1-8b-instruct:free", // Smart free model
          messages: messages.concat(userMsg).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate response");
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 400, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[600px] max-w-[90vw] bg-[#0A0A0A] border border-b-0 border-white/[0.06] rounded-t-xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#111]">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-body text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center mt-0.5"
                       style={{ background: msg.role === "assistant" ? "#1a1a1a" : "#FF5500" }}>
                    {msg.role === "assistant" ? (
                      <Bot className="w-3.5 h-3.5 text-[#FF5500]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/80" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-xl whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#FF5500]/10 border border-[#FF5500]/20 text-white/90"
                        : "bg-white/[0.03] border border-white/[0.05] text-white/70"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-6 h-6 rounded-md bg-[#1a1a1a] shrink-0 flex items-center justify-center mt-0.5">
                    <Loader2 className="w-3.5 h-3.5 text-[#FF5500] animate-spin" />
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/40 flex items-center h-[46px]">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/[0.05] bg-[#111]">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-end gap-2 bg-[#0A0A0A] border border-white/[0.08] rounded-xl focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all p-1"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask AI to design a diagram..."
                  className="flex-1 max-h-32 min-h-[40px] bg-transparent border-0 resize-none outline-none text-white/90 text-[13px] placeholder:text-white/30 px-3 py-2.5 font-body scrollbar-thin"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 shrink-0 flex items-center justify-center mb-1 mr-1 rounded-lg bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500]/20 disabled:opacity-50 disabled:hover:bg-[#FF5500]/10 transition-colors cursor-figma-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2 text-[10px] text-white/20 font-body">
                Powered by OpenRouter • Models may make mistakes
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
