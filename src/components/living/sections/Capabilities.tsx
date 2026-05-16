import { Reveal } from "../Reveal";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const ITEMS = [
  { k: "Sense", title: "Reads behavior", body: "Scroll velocity, hesitation, cursor energy, dwell. Every micro-gesture is signal." },
  { k: "Adapt", title: "Re-skins itself", body: "Ten built-in realities or your own four-color palette. Atmosphere shifts in 1.2s." },
  { k: "Speak", title: "Listens to language", body: "Tell it 'make this feel premium' or 'too much motion' — it reshapes immediately." },
  { k: "Narrate", title: "Tells you what changed", body: "A live narrator captions every mutation and walks you to the relevant section." },
  { k: "Compose", title: "Density & motion dials", body: "Calm or kinetic. Airy or compact. Direct your own tempo." },
  { k: "Journal", title: "Writes your version live", body: "Every change is logged. No two sessions render the same page." },
];

function SpotlightCard({ item, index }: { item: typeof ITEMS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <Reveal delay={index * 0.05}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => setPos({ x: -200, y: -200 })}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="card-soft p-7 h-full relative overflow-hidden group border border-foreground/10"
      >
        {/* spotlight that follows cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(380px circle at ${pos.x}px ${pos.y}px, color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)`,
          }}
        />
        {/* corner crosshair */}
        <span aria-hidden className="absolute top-3 right-3 font-mono text-[9px] tracking-[0.3em] text-foreground/30">
          0{index + 1}
        </span>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent)] mb-3 font-mono">
          / {item.k}
        </p>
        <h3 className="text-xl font-light mb-2">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
      </motion.div>
    </Reveal>
  );
}

export function Capabilities() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section ref={ref} id="capabilities" className="relative py-32 px-6 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <Reveal sectionId="capabilities" className="max-w-2xl mb-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            02b — Capabilities
          </p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-gradient">
            Six senses of a living interface.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ITEMS.map((it, i) => (
            <SpotlightCard key={it.k} item={it} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
