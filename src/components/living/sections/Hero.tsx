import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const ROTATING_WORDS = ["quietly", "secretly", "softly", "willingly", "endlessly"];

function KineticLine({
  text,
  delay = 0,
  italic = false,
}: {
  text: string;
  delay?: number;
  italic?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={`inline-block ${italic ? "font-serif italic" : ""}`}>
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-grid mr-[0.18em] align-baseline"
          style={{ gridTemplateAreas: '"stack"' }}
        >
          {/* Invisible spacer for true baseline and width */}
          <span
            aria-hidden
            className="invisible whitespace-nowrap pb-[0.14em]"
            style={{ gridArea: "stack" }}
          >
            {word}
          </span>
          {/* Visible animating content */}
          <span
            className="whitespace-nowrap overflow-hidden pb-[0.14em]"
            style={{ gridArea: "stack" }}
          >
            {Array.from(word).map((ch, ci) => (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1.1,
                  ease: EASE,
                  delay: delay + wi * 0.05 + ci * 0.012,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function LiveClock() {
  const [t, setT] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      const ms = String(d.getMilliseconds()).padStart(3, "0");
      setT(`${hh}:${mm}:${ss}.${ms}`);
    };
    tick();
    const id = window.setInterval(tick, 53);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t}</span>;
}

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % ROTATING_WORDS.length), 1800);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span
      className="relative inline-grid align-baseline"
      style={{ gridTemplateAreas: '"stack"' }}
    >
      {/* invisible widest sizer so the line doesn't reflow */}
      <span
        aria-hidden
        className="invisible font-serif italic whitespace-nowrap pb-[0.14em]"
        style={{ gridArea: "stack" }}
      >
        {ROTATING_WORDS.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>
      <span
        className="relative font-serif italic text-[color:var(--accent)] whitespace-nowrap overflow-hidden pb-[0.14em]"
        style={{ gridArea: "stack" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ROTATING_WORDS[i]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="inline-block"
          >
            {ROTATING_WORDS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function Marquee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden border-y border-foreground/15 py-4">
      <motion.div
        className="flex gap-16 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/55"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 2 }).map((_, group) => (
          <div key={group} className="flex gap-16 shrink-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-16">
                {children}
                <span aria-hidden className="text-[color:var(--accent)]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yHead = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yAside = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  // cursor-reactive ink blot
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100svh] flex flex-col overflow-hidden"
    >
      {/* Cursor-reactive smudge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background-position] duration-300 ease-out"
        style={{
          background: `radial-gradient(600px 600px at ${mouse.x}% ${mouse.y}%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 60%)`,
        }}
      />

      {/* Fine grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* TOP META BAR */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        className="relative z-10 px-6 md:px-10 pt-28 md:pt-32 grid grid-cols-12 gap-6 text-[10px] uppercase tracking-[0.32em] font-mono text-foreground/55"
      >
        <div className="col-span-4 space-y-1">
          <div>Index · 001 / ∞</div>
          <div className="text-foreground/35">A living document</div>
        </div>
        <div className="col-span-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-[color:var(--accent)] animate-ping opacity-60" />
              <span className="relative size-1.5 rounded-full bg-[color:var(--accent)]" />
            </span>
            Signal · receiving
          </div>
          <div className="text-foreground/35"><LiveClock /></div>
        </div>
        <div className="col-span-4 text-right space-y-1">
          <div>Edition · MMXXVI</div>
          <div className="text-foreground/35">Paris · 48.86° N</div>
        </div>
      </motion.header>

      {/* HEADLINE — asymmetric, breaks the grid */}
      <motion.div
        style={{ y: yHead, opacity }}
        className="relative z-10 flex-1 px-6 md:px-10 pt-10 md:pt-16 grid grid-cols-12 gap-6"
      >
        {/* Side index */}
        <motion.aside
          style={{ y: yAside }}
          className="hidden md:flex col-span-1 flex-col items-start gap-3 pt-6 text-[10px] uppercase tracking-[0.32em] font-mono text-foreground/45"
        >
          <span className="[writing-mode:vertical-rl] rotate-180">
            Chapter 001 — The interface as a reader
          </span>
        </motion.aside>

        {/* Headline */}
        <h1 className="col-span-12 md:col-span-11 font-serif text-[clamp(3rem,11vw,11rem)] leading-[0.9] tracking-[-0.025em] text-foreground">
          <KineticLine text="A website" delay={0.3} />
          <br />
          <span className="inline-flex items-baseline gap-[0.18em]">
            <KineticLine text="that" delay={0.55} />
            <RotatingWord />
          </span>
          <br />
          <KineticLine text="reshapes" delay={0.8} />
          <span className="inline-block w-[0.35em]" />
          <KineticLine text="itself." delay={1.0} italic />
        </h1>
      </motion.div>

      {/* Caption — its own row so it never collides with the headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 1.6 }}
        style={{ opacity }}
        className="relative z-10 px-6 md:px-10 mt-16 md:mt-24 grid grid-cols-12 gap-6"
      >
        <div className="col-span-12 md:col-start-7 md:col-span-6 flex flex-col gap-6">
          <div className="h-px w-16 bg-foreground/40" />
          <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-md">
            An interface that reads behavior, taste, and hesitation —
            then composes itself around the person reading it.
            <span className="font-serif italic text-foreground"> Each visit is the first.</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#themes"
              data-magnetic
              className="group inline-flex items-center gap-3 text-sm tracking-wide"
            >
              <span className="relative inline-block px-6 py-3 border border-foreground rounded-full overflow-hidden transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                Begin the experience
              </span>
              <span
                aria-hidden
                className="inline-flex size-10 items-center justify-center rounded-full border border-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-45"
              >
                →
              </span>
            </a>
            <a
              href="#custom"
              data-magnetic
              className="text-xs uppercase tracking-[0.32em] font-mono text-foreground/55 hover:text-foreground transition-colors story-link"
            >
              Choose your reality
            </a>
          </div>
        </div>
      </motion.div>

      {/* BOTTOM MARQUEE + STATS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.9 }}
        className="relative z-10 mt-10"
      >
        <Marquee>
          <span>Adaptive · Cinematic · Editorial</span>
          <span aria-hidden className="text-[color:var(--accent)]">✦</span>
          <span>The reader writes the page</span>
          <span aria-hidden className="text-[color:var(--accent)]">✦</span>
          <span>v ∞ · always evolving</span>
        </Marquee>

        <div className="px-6 md:px-10 py-6 grid grid-cols-12 gap-6 text-[10px] uppercase tracking-[0.32em] font-mono text-foreground/55">
          <div className="col-span-3">
            <div className="text-foreground/35">(01)</div>
            <div className="mt-1">Scroll to begin</div>
          </div>
          <div className="col-span-3 hidden md:block">
            <div className="text-foreground/35">Tempo</div>
            <div className="mt-1 flex items-center gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="block w-px bg-foreground/60"
                  animate={{ height: [4, 14, 6, 18, 4] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.08,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 text-right text-foreground/60 normal-case tracking-normal font-sans text-xs leading-relaxed">
            <span className="font-serif italic text-foreground">
              "The page you are reading does not exist for anyone else."
            </span>
            <span className="ml-2 text-foreground/40">— Studio Note 001</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
