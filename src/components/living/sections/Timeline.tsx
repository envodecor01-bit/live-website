import { Reveal } from "../Reveal";
import { useLiving } from "@/store/living";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.span
      style={{ whiteSpace: "pre-wrap" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.02,
            delayChildren: delay,
          },
        },
        hidden: {},
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={{
            visible: { opacity: 1, filter: "blur(0px)" },
            hidden: { opacity: 0, filter: "blur(4px)" },
          }}
          transition={{ duration: 0.2 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function Timeline() {
  const mutations = useLiving((s) => s.mutations);
  const visible = [...mutations].reverse().slice(0, 10);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  return (
    <section ref={ref} id="timeline" className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <Reveal sectionId="timeline" className="mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            05 — Evolution timeline
          </p>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-gradient">
            Your version of this site, written live.
          </h2>
        </Reveal>

        {visible.length === 0 ? (
          <div className="glass-strong rounded-3xl p-8 shadow-soft">
            <p className="text-muted-foreground text-sm">
              No mutations yet. Talk to the orb or switch a theme — the journal will begin.
            </p>
          </div>
        ) : (
          <div className="relative pl-8 md:pl-14">
            {/* the live drawing line */}
            <div className="absolute left-2 md:left-5 top-0 bottom-0 w-px bg-foreground/10" />
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-2 md:left-5 top-0 w-px bg-gradient-to-b from-[color:var(--accent)] via-[color:var(--primary)] to-transparent shadow-[0_0_18px_var(--accent)]"
            />

            <ol className="space-y-10">
              {visible.map((m, i) => (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group"
                >
                  {/* node */}
                  <span
                    className={`absolute -left-[28px] md:-left-[37px] top-2 size-3 rounded-full ring-4 ring-background transition-transform group-hover:scale-150 ${
                      m.source === "auto"
                        ? "bg-accent"
                        : m.source === "prompt"
                          ? "bg-[color:var(--accent)] shadow-[0_0_20px_var(--accent)]"
                          : "bg-foreground/70"
                    }`}
                  />
                  {/* card */}
                  <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] backdrop-blur-sm p-5 md:p-6 transition-all duration-500 group-hover:border-[color:var(--accent)]/40 group-hover:translate-x-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono flex items-center gap-2">
                      <span className="tabular-nums">{new Date(m.at).toLocaleTimeString()}</span>
                      <span className="text-foreground/30">·</span>
                      <span className="text-[color:var(--accent)]">{m.source}</span>
                    </p>
                    <p className="mt-2 text-base md:text-lg text-foreground/90 leading-relaxed font-light">
                      <TypewriterText text={m.message} delay={0.4 + i * 0.04} />
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
