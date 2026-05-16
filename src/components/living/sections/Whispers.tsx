import { useEffect, useState } from "react";
import { Reveal } from "../Reveal";
import { motion, AnimatePresence } from "framer-motion";
import { useLiving } from "@/store/living";

const LINES = [
  "you're being noticed.",
  "the room is adjusting.",
  "atmosphere holding steady.",
  "the site is breathing.",
  "still listening.",
  "every gesture is heard.",
  "you are the cursor of this world.",
  "this version of the page only exists for you.",
];

export function Whispers() {
  const [i, setI] = useState(0);
  const cursor = useLiving((s) => s.behavior.cursorVelocity);

  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % LINES.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="whispers" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <Reveal sectionId="whispers">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-10">
            07 — Whispers
          </p>
        </Reveal>
        <div className="relative h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl md:text-5xl font-light italic text-gradient"
            >
              {LINES[i]}
            </motion.p>
          </AnimatePresence>
        </div>
        <Reveal delay={0.1}>
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-full glass text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-glow" />
            cursor energy {Math.round(cursor)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
