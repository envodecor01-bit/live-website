import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLiving } from "@/store/living";

const LINES = [
  "An interface",
  "that reads you,",
  "then reshapes itself.",
];

export function Intro() {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const markIntroDone = useLiving((s) => s.markIntroDone);

  useEffect(() => {
    if (index >= LINES.length) {
      const t = window.setTimeout(() => {
        setDone(true);
        window.setTimeout(() => markIntroDone(), 700);
      }, 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setIndex((i) => i + 1), 1300);
    return () => window.clearTimeout(t);
  }, [index, markIntroDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9000] flex items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute top-8 left-8 right-8 flex items-start justify-between text-[10px] uppercase tracking-[0.28em] text-foreground/45 font-mono">
            <span>Living Websites</span>
            <span>Loading · 0{Math.min(index + 1, LINES.length)}/0{LINES.length}</span>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
            <div className="h-24 flex items-center">
              <AnimatePresence mode="wait">
                {index < LINES.length && (
                  <motion.h1
                    key={index}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="font-serif italic text-4xl md:text-6xl lg:text-7xl tracking-[-0.01em] text-foreground max-w-3xl"
                  >
                    {LINES[index]}
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
            <motion.div
              className="h-px w-40 bg-foreground/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
