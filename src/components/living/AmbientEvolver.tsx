import { useEffect } from "react";
import { useLiving } from "@/store/living";

/**
 * Always-on subtle drift so the site never feels static — even when
 * the user isn't doing anything. Pauses for low-motion preferences.
 */
export function AmbientEvolver() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const motion = useLiving.getState().motion;
      if (motion === "low") {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = (now - t0) / 1000;
      const root = document.documentElement;
      // Tiny breathing applied via CSS vars (read by shader & glows already)
      const breath = 0.04 * Math.sin(t * 0.18);
      const pulse = 0.03 * Math.sin(t * 0.31 + 1.4);
      root.style.setProperty("--ambient-breath", String(1 + breath));
      root.style.setProperty("--ambient-pulse", String(1 + pulse));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
