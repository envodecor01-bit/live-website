import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, X } from "lucide-react";
import { useLiving } from "@/store/living";
import {
  applyMutation,
  applyPersonality,
  pulseEnvironment,
  setSectionIntensity,
  applyToolCall,
  type IntensityMode,
  type PersonalityId,
} from "@/lib/mutation-engine";

type ToolPart = {
  type: `tool-${string}`;
  toolName?: string;
  state?: string;
  input?: unknown;
};

const SUGGESTIONS = [
  "add a mario game",
  "spawn a pricing section",
  "make hero insane",
  "cyberpunk neon mode",
  "iridescent dream",
  "show me stats",
  "calm everything",
  "clean minimal",
];



export function AIOrb() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const handled = useRef<Set<string>>(new Set());
  const [orbActive, setOrbActive] = useState(false);

  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" }));
  const { messages, sendMessage, status, error } = useChat({ transport: transport.current });

  useEffect(() => {
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      for (let i = 0; i < m.parts.length; i++) {
        const p = m.parts[i] as ToolPart;
        if (!p.type?.startsWith("tool-")) continue;
        const key = `${m.id}:${i}`;
        if (handled.current.has(key)) continue;
        const ready =
          p.state === "input-available" ||
          p.state === "output-available" ||
          p.state === "call" ||
          p.state === "result";
        if (!ready) continue;
        const name = p.toolName || p.type.replace(/^tool-/, "");
        handled.current.add(key);
        try {
          applyToolCall(name, (p.input || {}) as Record<string, unknown>);
        } catch (e) {
          console.error("tool dispatch failed", e);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const isBusy = status === "submitted" || status === "streaming";
  
  const lastAssistantMessage = useMemo(() => {
    const reversed = messages.slice().reverse();
    // Find latest assistant text from parts (UIMessage has no .content field)
    for (const m of reversed) {
      if (m.role !== "assistant" || !m.parts) continue;
      const textPart = [...m.parts].reverse().find(
        (p) => (p as { type?: string }).type === "text",
      ) as { text?: string } | undefined;
      if (textPart?.text) return textPart.text;
    }

    // Fall back to "note" from the most recent tool call
    for (const m of reversed) {
      if (m.role !== "assistant" || !m.parts) continue;
      for (let i = m.parts.length - 1; i >= 0; i--) {
        const p = m.parts[i] as { type?: string; input?: { note?: string } };
        if (p.type?.startsWith("tool-") && p.input && typeof p.input.note === "string") {
          return p.input.note;
        }
      }
    }
    return "";
  }, [messages]);

  useEffect(() => {
    if (isBusy) {
      setOrbActive(true);
    } else {
      const t = setTimeout(() => setOrbActive(false), 600);
      return () => clearTimeout(t);
    }
  }, [isBusy]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    pulseEnvironment();
    
    // Inject current environment state so the AI has context
    const s = useLiving.getState();
    const envContext = `\n\n[CURRENT ENVIRONMENT CONTEXT: theme=${s.theme}, motion=${s.motion}, density=${s.density}, glow=${s.glow.toFixed(2)}, emotion=${JSON.stringify(s.emotion)}]`;
    
    void sendMessage({ text: t + envContext });
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[5000]">
      {/* Loading Popup */}
      <AnimatePresence>
        {isBusy && !open && (
          <motion.div
            initial={{ opacity: 0, y: -16, x: "-50%", filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, x: "-50%", filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, x: "-50%", filter: "blur(8px)" }}
            className="fixed top-24 left-1/2 z-[6000] glass-strong rounded-full px-5 py-3 shadow-soft flex items-center gap-3"
          >
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping" />
              <span className="relative rounded-full size-2 bg-primary" />
            </span>
            <span className="text-sm text-foreground/90 font-light max-w-[280px] truncate">
              {lastAssistantMessage || "AI is manifesting changes..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-24 right-0 w-[360px] md:w-[440px]"
          >
            {/* Outer ambient glow */}
            <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-[2.5rem] blur-xl opacity-70 pointer-events-none" />
            
            <div className="relative rounded-3xl shadow-2xl overflow-hidden bg-background/30 backdrop-blur-2xl border border-foreground/10">
              <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/10 bg-foreground/[0.02]">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2">
                    <span
                      className={`absolute inset-0 rounded-full bg-primary ${isBusy ? "animate-ping" : "animate-pulse-glow"}`}
                    />
                    <span className="relative rounded-full size-2 bg-primary" />
                  </span>
                  <p className="text-[9px] uppercase tracking-[0.35em] font-mono text-foreground/60 truncate max-w-[200px]">
                    {isBusy 
                      ? (lastAssistantMessage || "mutating reality…")
                      : "command · environment"}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-foreground/50 hover:text-foreground transition"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
                className="p-5 pb-3"
              >
                <div className="relative group">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="describe a feeling, a vibe, a mutation…"
                    className="w-full bg-background/40 border border-foreground/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all placeholder:text-foreground/40 font-light shadow-inner text-foreground"
                  />
                  {/* Subtle input glow */}
                  <div className="absolute inset-0 -z-10 bg-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </form>

              <div className="px-5 pb-5 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={s}
                    onClick={() => submit(s)}
                    disabled={isBusy}
                    className="text-[10px] uppercase tracking-[0.15em] font-mono px-3.5 py-2 rounded-full bg-foreground/[0.03] hover:bg-primary/15 text-foreground/60 hover:text-foreground border border-foreground/10 hover:border-primary/40 transition-colors disabled:opacity-40 shadow-sm"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>

              {error && (
                <div className="mx-4 mb-4 text-[10px] font-mono text-destructive bg-destructive/10 rounded-xl p-2.5">
                  {error.message || "the room flickered. try again."}
                </div>
              )}

              <div className="px-5 py-3 border-t border-foreground/10 bg-foreground/[0.02] flex items-center gap-2 text-[8px] uppercase tracking-[0.4em] font-mono text-foreground/40">
                <span className="size-1 rounded-full bg-accent animate-pulse" />
                <span>no chat · only mutation</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orb with rotating ring */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={orbActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: orbActive ? Infinity : 0 }}
        className="relative size-[68px] rounded-full flex items-center justify-center"
        aria-label="Command the environment"
        data-magnetic
      >
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full">
          <div
            className="absolute inset-0 rounded-full orbit-ring"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, var(--primary) 30%, transparent 60%, var(--accent) 80%, transparent)",
              animationDuration: orbActive ? "2s" : "8s",
              mask: "radial-gradient(circle, transparent 60%, black 62%, black 100%)",
              WebkitMask: "radial-gradient(circle, transparent 60%, black 62%, black 100%)",
            }}
          />
        </div>
        {/* Glass core */}
        <div className="absolute inset-1.5 rounded-full glass-deep" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary to-accent opacity-90 blur-md" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/80 to-accent/80" />
        <Sparkles className="relative size-5 text-primary-foreground drop-shadow" />
      </motion.button>
    </div>
  );
}
