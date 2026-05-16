import { Reveal } from "../Reveal";
import { useLiving, type ThemeId } from "@/store/living";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const THEMES: Array<{ id: ThemeId; name: string; tagline: string; swatch: [string, string] }> = [
  { id: "cinematic", name: "Cinematic", tagline: "Deep, filmic, restrained", swatch: ["#0a1024", "#4ea3ff"] },
  { id: "cyberpunk", name: "Cyberpunk", tagline: "High-voltage chrome", swatch: ["#1a0033", "#19f5ff"] },
  { id: "luxury", name: "Luxury", tagline: "Editorial, golden, slow", swatch: ["#0d0a05", "#d6b170"] },
  { id: "minimal", name: "Minimal", tagline: "Silence is a feature", swatch: ["#f8f8f8", "#1a1a1a"] },
  { id: "scifi", name: "Sci-Fi", tagline: "HUD-grade clarity", swatch: ["#08121f", "#4ec5ff"] },
  { id: "dreamcore", name: "Dreamcore", tagline: "Soft, melted, surreal", swatch: ["#1f0a2e", "#ff95df"] },
  { id: "holographic", name: "Holographic", tagline: "Iridescent prism", swatch: ["#0a0830", "#a0ffe0"] },
  { id: "gaming", name: "Energy", tagline: "Tactile, kinetic, alive", swatch: ["#1a0a05", "#ff6a2c"] },
  { id: "calm", name: "Calm", tagline: "Cool, considered, quiet", swatch: ["#0d1820", "#8fbcd6"] },
  { id: "experimental", name: "Experimental", tagline: "Off-grid, alive, weird", swatch: ["#04140a", "#caff5a"] },
];

function ThemeCard({
  t,
  active,
  onClick,
  index,
}: {
  t: (typeof THEMES)[number];
  active: boolean;
  onClick: () => void;
  index: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 18 });
  const glareBg = useTransform([mx, my], ([x, y]) => {
    const px = ((x as number) + 0.5) * 100;
    const py = ((y as number) + 0.5) * 100;
    return `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.22), transparent 55%)`;
  });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <Reveal delay={index * 0.04}>
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        data-magnetic
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", perspective: 1000 }}
        className={`holo-card group relative w-full aspect-[4/5] text-left p-5 transition-all duration-700 ${
          active ? "shadow-glow" : ""
        }`}
      >
        <div
          className="absolute inset-0 rounded-[1.75rem]"
          style={{
            background: `linear-gradient(155deg, ${t.swatch[0]} 0%, ${t.swatch[0]} 50%, ${t.swatch[1]}44 100%)`,
          }}
        />
        <div
          className="absolute -top-16 -right-16 size-40 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition duration-700"
          style={{ background: t.swatch[1] }}
        />
        {/* Glare */}
        <motion.div
          className="absolute inset-0 rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
          style={{ background: glareBg }}
        />
        {/* scanline */}
        <div className="absolute inset-0 scanline rounded-[1.75rem] opacity-20 pointer-events-none" />

        <div
          className="relative z-10 flex flex-col h-full justify-between"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex items-center justify-between">
            <span
              className="size-2 rounded-full"
              style={{ background: t.swatch[1], boxShadow: `0 0 20px ${t.swatch[1]}` }}
            />
            <span
              className="text-[9px] uppercase tracking-[0.3em] font-mono opacity-60"
              style={{ color: t.swatch[1] }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div>
            {active && (
              <span
                className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] font-mono mb-2"
                style={{ color: t.swatch[1] }}
              >
                <span className="size-1 rounded-full animate-pulse" style={{ background: t.swatch[1] }} />
                Active
              </span>
            )}
            <h3
              className="text-2xl font-light tracking-tight"
              style={{ color: t.swatch[1] }}
            >
              {t.name}
            </h3>
            <p className="text-[11px] mt-1.5 opacity-60 font-mono" style={{ color: t.swatch[1] }}>
              {t.tagline}
            </p>
          </div>
        </div>
      </motion.button>
    </Reveal>
  );
}

export function Themes() {
  const theme = useLiving((s) => s.theme);
  const setTheme = useLiving((s) => s.setTheme);

  return (
    <section id="themes" className="relative py-32 px-6 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <Reveal sectionId="themes" className="max-w-3xl mb-20">
          <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-5 font-mono">
            02 · Adaptive realities
          </p>
          <h2 className="text-5xl md:text-7xl font-extralight tracking-[-0.04em] text-gradient leading-[0.95]">
            Choose a reality.
            <br />
            <span className="font-serif-italic text-foreground/80">The site enters it.</span>
          </h2>
          <p className="mt-8 text-foreground/55 max-w-xl leading-relaxed font-light">
            Every theme is a complete atmospheric shift — light, motion, depth and density
            change in concert. Switching feels like stepping through a door.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {THEMES.map((t, i) => (
            <ThemeCard
              key={t.id}
              t={t}
              index={i}
              active={t.id === theme}
              onClick={() => setTheme(t.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
