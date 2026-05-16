import { Reveal } from "../Reveal";
import { useLiving, type CustomPalette } from "@/store/living";
import { motion } from "framer-motion";
import { useCallback } from "react";

const PRESETS: Array<{ name: string; p: CustomPalette }> = [
  { name: "Aurora", p: { background: "#070b1a", foreground: "#eaf2ff", primary: "#7cf0d2", accent: "#a78bff" } },
  { name: "Ember",  p: { background: "#180806", foreground: "#fff1ea", primary: "#ff6a3d", accent: "#ffb454" } },
  { name: "Mono",   p: { background: "#0a0a0a", foreground: "#fafafa", primary: "#ffffff", accent: "#a3a3a3" } },
  { name: "Lagoon", p: { background: "#031a1f", foreground: "#e8fbff", primary: "#3ddad7", accent: "#7ce0ff" } },
  { name: "Solaris",p: { background: "#0a0512", foreground: "#fff4ea", primary: "#ffb347", accent: "#ff5470" } },
  { name: "Vapor",  p: { background: "#0a0a1f", foreground: "#f0eaff", primary: "#9d7bff", accent: "#5ce1ff" } },
];

type FieldProps = {
  label: string;
  keyName: keyof CustomPalette;
  value: string;
  onChange: (key: keyof CustomPalette, value: string) => void;
};

// Defined OUTSIDE the parent component so it doesn't remount on every keystroke
// (that was the bug — the color input lost focus & felt broken).
function Field({ label, keyName, value, onChange }: FieldProps) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 glass rounded-xl p-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(keyName, e.target.value)}
          className="size-10 rounded-md bg-transparent border border-border cursor-pointer"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(keyName, e.target.value)}
          className="flex-1 bg-transparent text-sm font-mono outline-none"
          spellCheck={false}
        />
      </div>
    </label>
  );
}

export function CustomTheme() {
  const customPalette = useLiving((s) => s.customPalette);
  const setCustomPalette = useLiving((s) => s.setCustomPalette);
  const applyCustomPalette = useLiving((s) => s.applyCustomPalette);
  const theme = useLiving((s) => s.theme);
  const active = theme === "custom";

  // Live-apply: as soon as the user changes a swatch, push it to the DOM if custom is active.
  const handleChange = useCallback(
    (key: keyof CustomPalette, value: string) => {
      setCustomPalette({ [key]: value });
      if (theme !== "custom" && /^#[0-9a-fA-F]{6}$/.test(value)) {
        // First edit auto-enters custom reality so feedback is instant.
        applyCustomPalette();
      }
    },
    [setCustomPalette, applyCustomPalette, theme],
  );

  return (
    <section id="custom" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-start">
        <Reveal sectionId="custom" className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Your own reality
          </p>
          <h2 className="text-5xl md:text-6xl font-light tracking-tight text-gradient">
            Paint the atmosphere.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
            Pick any four colors. Glow, glass, shadows, particles and the shader
            background re-skin live around you.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setCustomPalette(preset.p);
                  applyCustomPalette();
                }}
                data-magnetic
                className="px-3 py-1.5 rounded-full text-xs border border-border hover:border-primary/60 transition flex items-center gap-2"
              >
                <span className="flex -space-x-1">
                  {Object.values(preset.p).map((c, i) => (
                    <span
                      key={i}
                      className="size-3 rounded-full border border-background/60"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                {preset.name}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-7">
          <motion.div whileHover={{ y: -4 }} className="glass-strong rounded-3xl p-8 shadow-soft">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Background" keyName="background" value={customPalette.background} onChange={handleChange} />
              <Field label="Foreground" keyName="foreground" value={customPalette.foreground} onChange={handleChange} />
              <Field label="Primary"    keyName="primary"    value={customPalette.primary}    onChange={handleChange} />
              <Field label="Accent"     keyName="accent"     value={customPalette.accent}     onChange={handleChange} />
            </div>

            <div
              className="mt-6 h-36 rounded-2xl relative overflow-hidden border border-border"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, ${customPalette.primary}66, transparent 60%), radial-gradient(ellipse at 80% 70%, ${customPalette.accent}66, transparent 60%), ${customPalette.background}`,
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center text-3xl font-light tracking-tight"
                style={{ color: customPalette.foreground }}
              >
                <span style={{ color: customPalette.primary }}>Living</span>&nbsp;preview
              </div>
            </div>

            <button
              onClick={applyCustomPalette}
              data-magnetic
              className={`mt-6 w-full rounded-2xl py-3 text-sm font-medium transition ${
                active
                  ? "bg-secondary text-foreground border border-border"
                  : "bg-primary text-primary-foreground shadow-glow hover:opacity-90"
              }`}
            >
              {active ? "Custom reality active · editing live" : "Enter this reality"}
            </button>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
