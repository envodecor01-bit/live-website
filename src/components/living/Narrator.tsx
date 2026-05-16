import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLiving } from "@/store/living";

/** Live narrator: captions every mutation, auto-scrolls to the relevant section,
 *  and (optionally) speaks. The interface's voice. */
export function Narrator() {
  const mutations = useLiving((s) => s.mutations);
  const narratorOn = useLiving((s) => s.narratorOn);
  const voiceOn = useLiving((s) => s.voiceOn);
  const toggleNarrator = useLiving((s) => s.toggleNarrator);
  const toggleVoice = useLiving((s) => s.toggleVoice);

  const last = mutations[mutations.length - 1];
  const [visible, setVisible] = useState<typeof last | null>(null);
  const lastId = useRef<string | null>(null);
  const hideTimer = useRef<number | null>(null);

  // Show new mutation banner
  useEffect(() => {
    if (!last || !narratorOn) return;
    if (lastId.current === last.id) return;
    lastId.current = last.id;
    setVisible(last);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisible(null), 5200);

    if (voiceOn && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const u = new SpeechSynthesisUtterance(last.message.replace(/[“”"]/g, ""));
        u.rate = 1.05;
        u.pitch = 1;
        u.volume = 0.85;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        /* noop */
      }
    }
  }, [last, narratorOn, voiceOn]);

  // Auto-scroll only when user prompted the AI to make a change
  useEffect(() => {
    if (last && last.focusSection && last.source === "prompt") {
      const timer = setTimeout(() => {
        const el = document.getElementById(last.focusSection!);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [last]);

  return (
    <>
      {/* Banner */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[4500] pointer-events-none w-[min(92vw,640px)]">
        <AnimatePresence>
          {narratorOn && visible && (
            <motion.div
              key={visible.id}
              initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-full px-5 py-3 shadow-soft flex items-center gap-3 pointer-events-auto"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
                <span className="relative rounded-full size-2 bg-primary" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {visible.source === "auto"
                  ? "auto"
                  : visible.source === "prompt"
                    ? "you said"
                    : visible.source === "system"
                      ? "system"
                      : "you"}
              </span>
              <span className="text-sm text-foreground/95 truncate flex-1">{visible.message}</span>
              {visible.focusSection && (
                <button
                  onClick={() => {
                    const el = document.getElementById(visible.focusSection!);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="text-[10px] uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition shrink-0"
                >
                  jump →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle dock */}
      <div className="fixed bottom-6 left-6 z-[5000] flex items-center gap-2">
        <button
          onClick={toggleNarrator}
          data-magnetic
          className="glass-strong rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.25em] flex items-center gap-2 hover:bg-secondary/50 transition"
          aria-label="Toggle narrator"
        >
          <span
            className={`size-1.5 rounded-full ${narratorOn ? "bg-primary animate-pulse-glow" : "bg-muted-foreground"}`}
          />
          Narrator {narratorOn ? "on" : "off"}
        </button>
        <button
          onClick={toggleVoice}
          data-magnetic
          className="glass-strong rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.25em] flex items-center gap-2 hover:bg-secondary/50 transition"
          aria-label="Toggle voice"
        >
          <span className={`size-1.5 rounded-full ${voiceOn ? "bg-accent" : "bg-muted-foreground"}`} />
          Voice {voiceOn ? "on" : "off"}
        </button>
      </div>
    </>
  );
}
