import { Reveal } from "../Reveal";

const ROWS = [
  ["Reacts to behavior", false, true],
  ["Adapts atmosphere on the fly", false, true],
  ["Responds to natural language", false, true],
  ["Narrates state changes", false, true],
  ["Custom-built palette per visitor", false, true],
  ["Same page for every user", true, false],
];

export function Comparison() {
  return (
    <section id="comparison" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal sectionId="comparison" className="mb-14 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            06 — Static vs Living
          </p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gradient">
            The web you know vs the web that knows you.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground border-b border-border">
              <div className="col-span-6">Behavior</div>
              <div className="col-span-3 text-center">Static site</div>
              <div className="col-span-3 text-center text-primary">Living site</div>
            </div>
            {ROWS.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center px-6 py-5 border-b border-border/40 last:border-0 hover:bg-secondary/30 transition"
              >
                <div className="col-span-6 text-sm">{r[0] as string}</div>
                <div className="col-span-3 flex justify-center">
                  <Mark on={r[1] as boolean} dim />
                </div>
                <div className="col-span-3 flex justify-center">
                  <Mark on={r[2] as boolean} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Mark({ on, dim }: { on: boolean; dim?: boolean }) {
  if (on)
    return (
      <span
        className={`size-7 rounded-full flex items-center justify-center text-xs ${
          dim ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-glow"
        }`}
      >
        ✓
      </span>
    );
  return (
    <span className="size-7 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground">
      —
    </span>
  );
}
