import { motion, AnimatePresence } from "framer-motion";
import { useLiving, type LiveSection } from "@/store/living";
import { X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function PaletteVars({ palette }: { palette?: string[] }) {
  if (!palette || palette.length === 0) return null;
  const [bg, fg, p1, p2] = [
    palette[0] ?? "var(--background)",
    palette[1] ?? "var(--foreground)",
    palette[2] ?? "var(--primary)",
    palette[3] ?? palette[2] ?? "var(--accent)",
  ];
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-live-palette="on"]{--lp-bg:${bg};--lp-fg:${fg};--lp-p1:${p1};--lp-p2:${p2};}`,
      }}
    />
  );
}

function Shell({
  section,
  children,
  onRemove,
  className = "",
}: {
  section: LiveSection;
  children: React.ReactNode;
  onRemove: () => void;
  className?: string;
}) {
  const hasPalette = !!section.palette?.length;
  return (
    <motion.section
      id={`live-${section.id}`}
      data-live-palette={hasPalette ? "on" : undefined}
      initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -40, filter: "blur(12px)" }}
      transition={{ duration: 1, ease: EASE }}
      className={`relative px-6 py-28 overflow-hidden ${className}`}
      style={
        hasPalette
          ? ({
              background:
                "radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--lp-p1) 24%, transparent), transparent 60%), radial-gradient(ellipse at 80% 80%, color-mix(in oklab, var(--lp-p2) 22%, transparent), transparent 55%)",
            } as React.CSSProperties)
          : undefined
      }
    >
      <PaletteVars palette={section.palette} />
      <button
        onClick={onRemove}
        className="absolute top-6 right-6 z-20 size-8 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-foreground transition opacity-0 hover:opacity-100 group-hover:opacity-100"
        data-magnetic
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
      <div className="max-w-6xl mx-auto relative z-10 group">{children}</div>
    </motion.section>
  );
}

function Eyebrow({ text, accent }: { text?: string; accent?: string }) {
  if (!text) return null;
  return (
    <p
      className="text-[10px] uppercase tracking-[0.4em] mb-5 font-mono"
      style={{ color: accent ?? "color-mix(in oklab, var(--lp-p1,var(--primary)) 80%, white)" }}
    >
      {text}
    </p>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-5xl md:text-7xl font-extralight tracking-[-0.04em] leading-[0.95] text-gradient">
      {children}
    </h2>
  );
}

function Body({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="mt-6 max-w-2xl text-foreground/65 leading-relaxed font-light">{text}</p>
  );
}

/* ---------- Renderers per kind ---------- */

function TextKind({ s }: { s: LiveSection }) {
  return (
    <>
      <Eyebrow text={s.eyebrow} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
    </>
  );
}

function StatsKind({ s }: { s: LiveSection }) {
  const stats = s.stats ?? [];
  return (
    <>
      <Eyebrow text={s.eyebrow} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((st, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ease: EASE }}
            className="card-soft p-7"
          >
            <div
              className="text-5xl md:text-6xl font-extralight tracking-tight"
              style={{ color: "var(--lp-p1,var(--primary))" }}
            >
              {st.value}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.35em] font-mono text-foreground/55">
              {st.label}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function FeatureKind({ s }: { s: LiveSection }) {
  const items = s.items ?? [];
  return (
    <>
      <Eyebrow text={s.eyebrow} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((it, i) => {
          const [head, ...rest] = it.split(/—|·|\|/);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: EASE }}
              className="card-soft p-8 relative overflow-hidden"
            >
              <div
                className="absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-40"
                style={{ background: "var(--lp-p1,var(--primary))" }}
              />
              <div className="text-[10px] uppercase tracking-[0.4em] font-mono text-foreground/40">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 text-2xl font-light tracking-tight">{head.trim()}</h3>
              {rest.length > 0 && (
                <p className="mt-3 text-foreground/60 font-light leading-relaxed">
                  {rest.join(" ").trim()}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function GalleryKind({ s }: { s: LiveSection }) {
  const items = s.items ?? [];
  return (
    <>
      <Eyebrow text={s.eyebrow} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((it, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.04, rotate: i % 2 ? 1.2 : -1.2 }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, ease: EASE }}
            className="aspect-square rounded-3xl flex items-center justify-center text-center p-4 text-sm font-light overflow-hidden relative"
            style={{
              background: `linear-gradient(${135 + i * 30}deg, color-mix(in oklab, var(--lp-p1,var(--primary)) 60%, var(--background)), color-mix(in oklab, var(--lp-p2,var(--accent)) 50%, var(--background)))`,
              color: "var(--lp-fg, var(--foreground))",
              boxShadow: "0 30px 80px -30px color-mix(in oklab, var(--lp-p1, var(--primary)) 50%, transparent)",
            }}
          >
            <span className="relative z-10 text-2xl">{it}</span>
            <div className="absolute inset-0 scanline opacity-30" />
          </motion.div>
        ))}
      </div>
    </>
  );
}

function GameKind({ s }: { s: LiveSection }) {
  const emojis = s.emojis ?? ["🎮", "⭐", "💥"];
  return (
    <>
      <Eyebrow text={s.eyebrow ?? "live · mini scene"} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
      <div
        className="mt-12 relative rounded-3xl overflow-hidden h-[440px] border border-border"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, var(--lp-p2,var(--accent)) 25%, var(--background)) 0%, color-mix(in oklab, var(--lp-p1,var(--primary)) 15%, var(--background)) 100%)`,
        }}
      >
        {/* Clouds */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`c${i}`}
            className="absolute text-5xl opacity-80"
            style={{ top: 30 + i * 60, left: -100 }}
            animate={{ x: ["0vw", "120vw"] }}
            transition={{ duration: 18 + i * 4, repeat: Infinity, ease: "linear", delay: i * 2 }}
          >
            ☁️
          </motion.div>
        ))}
        {/* Bouncing actors */}
        {emojis.map((e, i) => (
          <motion.div
            key={`e${i}`}
            className="absolute text-5xl"
            style={{ bottom: 50, left: `${5 + i * 13}%` }}
            animate={{
              y: [0, -120, 0],
              rotate: [0, 12, -12, 0],
            }}
            transition={{
              duration: 1.4 + (i % 3) * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.18,
            }}
          >
            {e}
          </motion.div>
        ))}
        {/* Ground */}
        <div
          className="absolute bottom-0 inset-x-0 h-12"
          style={{
            background:
              "repeating-linear-gradient(45deg, color-mix(in oklab, var(--lp-p1,var(--primary)) 80%, black), color-mix(in oklab, var(--lp-p1,var(--primary)) 80%, black) 12px, color-mix(in oklab, var(--lp-p1,var(--primary)) 60%, black) 12px, color-mix(in oklab, var(--lp-p1,var(--primary)) 60%, black) 24px)",
          }}
        />
        <div className="absolute top-4 left-5 text-[10px] uppercase tracking-[0.4em] font-mono text-foreground/80">
          ► running
        </div>
      </div>
    </>
  );
}

function CTAKind({ s }: { s: LiveSection }) {
  return (
    <div className="text-center py-10">
      <Eyebrow text={s.eyebrow} />
      <h2
        className="text-6xl md:text-8xl font-extralight tracking-[-0.05em] leading-[0.9]"
        style={{ color: "var(--lp-fg, var(--foreground))" }}
      >
        {s.title}
      </h2>
      {s.body && (
        <p className="mt-8 max-w-xl mx-auto text-foreground/65 font-light leading-relaxed">
          {s.body}
        </p>
      )}
      <div className="mt-12 flex justify-center gap-3 flex-wrap">
        {(s.items ?? ["Continue →"]).map((label, i) => (
          <button
            key={i}
            data-magnetic
            className={i === 0 ? "btn-holo" : "btn-ghost"}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CodeKind({ s }: { s: LiveSection }) {
  return (
    <>
      <Eyebrow text={s.eyebrow ?? "console · live"} />
      <Title>{s.title}</Title>
      <div className="mt-10 rounded-2xl glass-deep overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/40">
            spawned
          </span>
        </div>
        <pre className="p-6 text-xs md:text-sm font-mono leading-relaxed text-foreground/85 overflow-x-auto whitespace-pre-wrap">
{s.body || "// awaiting input…"}
        </pre>
      </div>
    </>
  );
}

function InteractiveKind({ s }: { s: LiveSection }) {
  const items = s.items ?? ["A", "B", "C", "D", "E"];
  return (
    <>
      <Eyebrow text={s.eyebrow ?? "hover · feel"} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
      <div className="mt-14 relative h-[420px]">
        {items.map((it, i) => {
          const angle = (i / items.length) * Math.PI * 2;
          const r = 38;
          const cx = 50 + Math.cos(angle) * r;
          const cy = 50 + Math.sin(angle) * r * 0.6;
          return (
            <motion.div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-sm font-light cursor-none"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                width: 120,
                height: 120,
                background: `radial-gradient(circle, color-mix(in oklab, var(--lp-p1,var(--primary)) 70%, transparent), transparent 70%)`,
                color: "var(--lp-fg, var(--foreground))",
              }}
              whileHover={{ scale: 1.6, zIndex: 5 }}
              animate={{
                y: [0, -16, 0],
              }}
              transition={{
                y: { duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
              }}
              data-magnetic
            >
              {it}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function MarqueeKind({ s }: { s: LiveSection }) {
  const items = s.items?.length ? s.items : [s.title];
  const line = items.join(" · ");
  return (
    <>
      <Eyebrow text={s.eyebrow} />
      <div className="overflow-hidden -mx-6 py-10">
        <motion.div
          className="whitespace-nowrap text-[14vw] font-extralight tracking-[-0.04em] leading-none"
          style={{ color: "var(--lp-p1, var(--primary))" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        >
          {`${line} · ${line} · `}
        </motion.div>
      </div>
      {s.body && (
        <p className="text-center max-w-2xl mx-auto text-foreground/60 font-light">
          {s.body}
        </p>
      )}
    </>
  );
}

function ShaderKind({ s }: { s: LiveSection }) {
  return (
    <>
      <Eyebrow text={s.eyebrow ?? "shader · live"} />
      <Title>{s.title}</Title>
      <Body text={s.body} />
      <div className="mt-12 aspect-[16/7] rounded-3xl overflow-hidden relative">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, var(--lp-p1,var(--primary)), var(--lp-p2,var(--accent)), var(--lp-p1,var(--primary)))`,
            filter: "blur(60px)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 scanline opacity-30" />
        <div className="absolute inset-0 grain" />
      </div>
    </>
  );
}

/* ---------- Dispatcher ---------- */

const RENDERERS: Record<string, (props: { s: LiveSection }) => React.ReactElement> = {
  text: TextKind,
  stats: StatsKind,
  feature: FeatureKind,
  gallery: GalleryKind,
  game: GameKind,
  cta: CTAKind,
  code: CodeKind,
  interactive: InteractiveKind,
  marquee: MarqueeKind,
  shader: ShaderKind,
};

export function GenerativeSections() {
  const sections = useLiving((s) => s.liveSections);
  const remove = useLiving((s) => s.removeLiveSection);
  return (
    <AnimatePresence mode="popLayout">
      {sections.map((sec) => {
        const Renderer = RENDERERS[sec.kind ?? "text"] ?? TextKind;
        return (
          <Shell key={sec.id} section={sec} onRemove={() => remove(sec.id)}>
            <Renderer s={sec} />
          </Shell>
        );
      })}
    </AnimatePresence>
  );
}
