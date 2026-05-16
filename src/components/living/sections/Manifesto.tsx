import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "../Reveal";

const LINES = [
  "Websites today are frozen.",
  "Pages, not presences.",
  "We believe an interface should breathe with you,",
  "remember your taste, sense your mood,",
  "and quietly re-author itself in real time.",
  "A living website is not a page.",
  "It is a room you walked into.",
];

function Line({ progress, i, total, text }: { progress: MotionValue<number>; i: number; total: number; text: string }) {
  const start = i / total;
  const end = (i + 1) / total;
  const o = useTransform(progress, [start, end], [0.15, 1]);
  const x = useTransform(progress, [start, end], [-20, 0]);
  return (
    <motion.p
      style={{ opacity: o, x }}
      className="text-2xl md:text-4xl font-light tracking-tight leading-tight text-gradient"
    >
      {text}
    </motion.p>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} id="manifesto" className="relative py-40 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <Reveal sectionId="manifesto" className="mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            01b — Manifesto
          </p>
        </Reveal>
        <div className="space-y-3">
          {LINES.map((line, i) => (
            <Line key={i} progress={scrollYProgress} i={i} total={LINES.length} text={line} />
          ))}
        </div>
      </div>
    </section>
  );
}
