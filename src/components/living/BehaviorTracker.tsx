import { useEffect, useRef } from "react";
import { useLiving } from "@/store/living";
import { startAdaptiveBrain } from "@/lib/adaptive-brain";

/** Feeds raw signals to the store and starts the adaptive brain loop. */
export function BehaviorTracker() {
  const lastY = useRef(0);
  const lastT = useRef(performance.now());
  const lastMove = useRef(performance.now());
  const lastPos = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<number | null>(null);

  const trackScroll = useLiving((s) => s.trackScroll);
  const trackCursor = useLiving((s) => s.trackCursor);
  const trackHesitation = useLiving((s) => s.trackHesitation);

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT.current);
      const dy = Math.abs(window.scrollY - lastY.current);
      trackScroll((dy / dt) * 1000);
      lastY.current = window.scrollY;
      lastT.current = now;
    };
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMove.current);
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const v = (Math.sqrt(dx * dx + dy * dy) / dt) * 1000;
      trackCursor(v);
      lastMove.current = now;
      lastPos.current = { x: e.clientX, y: e.clientY };
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => trackHesitation(), 2200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [trackScroll, trackCursor, trackHesitation]);

  // Track which sections are visible
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.4) {
            useLiving.getState().trackSection(e.target.id);
          }
        }
      },
      { threshold: [0.4] },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Start the adaptive brain
  useEffect(() => startAdaptiveBrain(), []);

  return null;
}
