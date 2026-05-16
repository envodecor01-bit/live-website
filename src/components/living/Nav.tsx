import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLiving } from "@/store/living";

const LINKS = [
  { href: "#themes", label: "Realities" },
  { href: "#custom", label: "Custom" },
  { href: "#mutation", label: "Mutate" },
  { href: "#behavior", label: "Signal" },
  { href: "#timeline", label: "Evolution" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const theme = useLiving((s) => s.theme);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-[4000] transition-all duration-700 ${
        scrolled ? "py-3" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        <a href="#hero" className="flex items-center gap-3" data-magnetic>
          <div className="relative size-8 rounded-full glass-deep flex items-center justify-center">
            <div className="size-1.5 rounded-full bg-primary animate-pulse-glow" />
            <div className="absolute inset-0 rounded-full border border-primary/30 orbit-ring" style={{ animationDuration: "8s" }} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] tracking-[0.4em] uppercase font-mono">Living</span>
            <span className="text-[8px] tracking-[0.3em] uppercase text-foreground/40 font-mono mt-0.5">v∞ · alive</span>
          </div>
        </a>

        <div
          className={`glass-deep rounded-full px-2 py-1.5 flex items-center gap-0.5 transition-all duration-500 ${
            scrolled ? "shadow-soft" : ""
          }`}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-magnetic
              className="relative text-[10px] uppercase tracking-[0.25em] font-mono px-3.5 py-2 rounded-full text-foreground/60 hover:text-foreground transition group"
            >
              <span className="relative z-10">{l.label}</span>
              <span className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-foreground/40 font-mono">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span>{theme}</span>
        </div>
      </div>
    </motion.nav>
  );
}
