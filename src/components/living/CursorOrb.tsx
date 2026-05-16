import { useEffect, useRef } from "react";
import { useLiving } from "@/store/living";

export function CursorOrb() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLDivElement>(null);
  const trackCursor = useLiving((s) => s.trackCursor);
  const trackHesitation = useLiving((s) => s.trackHesitation);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let lastX = 0,
      lastY = 0,
      lastT = performance.now();
    let tx = 0, ty = 0, rx = 0, ry = 0, trX = 0, trY = 0;
    let idleTimer: number | undefined;
    let raf = 0;

    const tick = () => {
      // Spring-y trailing
      rx += (tx - rx) * 0.22;
      ry += (ty - ry) * 0.22;
      trX += (tx - trX) * 0.08;
      trY += (ty - trY) * 0.08;
      if (dot.current) dot.current.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      if (trail.current) trail.current.style.transform = `translate(${trX}px, ${trY}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const v = (Math.sqrt(dx * dx + dy * dy) / dt) * 1000;
      trackCursor(v);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => trackHesitation(), 1500);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, [data-magnetic], input, textarea");
      if (ring.current) {
        ring.current.style.width = interactive ? "64px" : "32px";
        ring.current.style.height = interactive ? "64px" : "32px";
        ring.current.style.opacity = interactive ? "1" : "0.7";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
    };
  }, [trackCursor, trackHesitation]);

  return (
    <>
      <div
        ref={trail}
        className="cursor-orb"
        style={{ opacity: 0.5, width: 120, height: 120, filter: "blur(28px)" }}
      />
      <div ref={ring} className="cursor-orb ring" style={{ width: 32, height: 32 }} />
      <div ref={dot} className="cursor-orb" style={{ width: 6, height: 6, mixBlendMode: "normal" }} />
    </>
  );
}
