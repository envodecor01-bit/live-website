import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { useLiving } from "@/store/living";
import type { IntensityMode } from "@/lib/mutation-engine";

interface Props {
  id: string;
  children: ReactNode;
}

const STYLES: Record<IntensityMode, CSSProperties> = {
  default: {},
  cinematic: {},
  holographic: {},
  explosion: {},
  zoom: {},
  calm: { opacity: 0.92 },
};

/** Wraps a section and visually mutates it when the AI sets its intensity. */
export function SectionIntensity({ id, children }: Props) {
  const mode = (useLiving((s) => s.sectionIntensities[id]) as IntensityMode | undefined) || "default";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "explosion") return;
    const el = ref.current;
    if (!el) return;
    const burst = document.createElement("div");
    burst.className = "pointer-events-none absolute inset-0 z-20";
    burst.style.cssText =
      "background:radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--accent) 60%, transparent) 0%, transparent 55%);animation:section-burst 1.4s ease-out forwards;mix-blend-mode:screen";
    el.appendChild(burst);
    const t = window.setTimeout(() => burst.remove(), 1500);
    return () => {
      window.clearTimeout(t);
      burst.remove();
    };
  }, [mode]);

  return (
    <div
      ref={ref}
      data-intensity={mode}
      className={`relative ${mode === "holographic" ? "section-holographic" : ""}`}
      style={{
        ...STYLES[mode],
        transition: "filter 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </div>
  );
}

