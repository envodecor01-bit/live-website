import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLiving } from "@/store/living";

/**
 * Full-screen environmental feedback. When the AI mutates anything,
 * a soft ripple pulses across the screen — no popup, no card.
 */
export function EnvFeedback() {
  const pulseAt = useLiving((s) => s.pulseAt);
  const [pulses, setPulses] = useState<number[]>([]);

  useEffect(() => {
    if (!pulseAt) return;
    setPulses((p) => [...p.slice(-2), pulseAt]);
    const t = window.setTimeout(() => {
      setPulses((p) => p.filter((x) => x !== pulseAt));
    }, 1600);
    return () => window.clearTimeout(t);
  }, [pulseAt]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[3000] overflow-hidden">
      <AnimatePresence>
        {pulses.map((p) => (
          <motion.div
            key={p}
            initial={{ opacity: 0.55, scale: 0.6 }}
            animate={{ opacity: 0, scale: 2.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 m-auto size-[60vmax] rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--primary) 35%, transparent) 0%, transparent 60%)",
              mixBlendMode: "screen",
            }}
          />
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {pulses.length > 0 && (
          <motion.div
            key={pulses[pulses.length - 1]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
