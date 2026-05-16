import { Reveal } from "../Reveal";
import { useLiving } from "@/store/living";
import { motion } from "framer-motion";

export function Mutation() {
  const { glow, particles, motion: m, density, setGlow, setParticles, setMotion, setDensity } = useLiving();

  const Slider = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
  }) => (
    <div>
      <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        <span>{label}</span>
        <span className="text-primary font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );

  const Pill = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      data-magnetic
      className={`px-3 py-1.5 text-xs rounded-full border transition ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-glow"
          : "border-border hover:border-primary/60 text-foreground/80"
      }`}
    >
      {children}
    </button>
  );

  return (
    <section id="mutation" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        <Reveal sectionId="mutation" className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            03 — Live mutation
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gradient">
            Direct the atmosphere.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Most websites are static documents. This one has dials. Adjust glow,
            particles, motion, and density — and watch the entire experience
            re-tune itself around your taste.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-7">
          <motion.div whileHover={{ y: -4 }} className="glass-strong rounded-3xl p-8 shadow-soft space-y-7">
            <Slider label="Glow intensity" value={glow} min={0.2} max={1.5} step={0.05} onChange={setGlow} />
            <Slider label="Particle density" value={particles} min={0} max={2} step={0.1} onChange={setParticles} />

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Motion</div>
              <div className="flex gap-2">
                {(["low", "normal", "high"] as const).map((v) => (
                  <Pill key={v} active={m === v} onClick={() => setMotion(v)}>
                    {v}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Layout density
              </div>
              <div className="flex gap-2">
                {(["compact", "normal", "airy"] as const).map((v) => (
                  <Pill key={v} active={density === v} onClick={() => setDensity(v)}>
                    {v}
                  </Pill>
                ))}
              </div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
