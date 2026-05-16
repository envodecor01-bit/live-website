import { useEffect, useState } from "react";
import { Reveal } from "../Reveal";
import { useLiving } from "@/store/living";

export function Behavior() {
  const behavior = useLiving((s) => s.behavior);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(Math.round((Date.now() - behavior.sessionStart) / 1000));
    const id = window.setInterval(
      () => setElapsed(Math.round((Date.now() - behavior.sessionStart) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [behavior.sessionStart]);

  const stats = [
    { label: "Session", value: `${elapsed}s` },
    { label: "Sections viewed", value: behavior.sectionsViewed.length },
    { label: "Cursor velocity", value: `${Math.round(behavior.cursorVelocity)} px/s` },
    { label: "Scroll velocity", value: `${Math.round(behavior.scrollSpeed)} px/s` },
    { label: "Clicks", value: behavior.clicks },
    { label: "Hesitations", value: behavior.hesitations },
  ];

  return (
    <section id="behavior" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal sectionId="behavior" className="max-w-2xl mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            04 — Behavior signal
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gradient">
            The site is listening.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Every gesture is a signal. This is the live read on you — used only
            to retune your experience, never sold, never shared.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="glass rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition" />
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
                  <p className="mt-3 text-3xl md:text-4xl font-light text-gradient font-mono">{s.value}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
