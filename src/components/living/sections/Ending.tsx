import { Reveal } from "../Reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { HoloObject } from "../HoloObject";

export function Ending() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <section 
      ref={ref}
      id="ending" 
      className="relative min-h-[100svh] flex items-center justify-center px-6 md:px-16 lg:px-24 overflow-hidden"
    >
      {/* Deep Gradient Fog & Glass Distortion Layer */}
      <motion.div style={{ opacity }} className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft Volumetric Fog */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_50%)] mix-blend-screen opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,color-mix(in_oklab,var(--accent)_8%,transparent)_0%,transparent_60%)] mix-blend-screen opacity-50" />
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_30%,transparent_70%,var(--background)_100%)]" />
        
        {/* Grain/Noise Layer for Cinematic Feel */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </motion.div>

      {/* Centerpiece: Asymmetric Holographic Orb */}
      <motion.div 
        style={{ y, opacity, scale }}
        className="absolute top-1/2 right-1/2 md:right-[-10%] lg:right-[-5%] translate-x-1/2 md:translate-x-0 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[900px] md:h-[900px] z-0 pointer-events-none flex items-center justify-center opacity-80"
      >
        {/* Orbital rings for subtle space depth */}
        <div className="absolute inset-[15%] rounded-full border border-primary/10 shadow-[0_0_100px_color-mix(in_oklab,var(--primary)_5%,transparent)_inset] animate-[spin_40s_linear_infinite]" style={{ transform: "rotateX(75deg) rotateY(15deg)" }} />
        <div className="absolute inset-[25%] rounded-full border border-accent/10 shadow-[0_0_100px_color-mix(in_oklab,var(--accent)_5%,transparent)_inset] animate-[spin_30s_linear_infinite_reverse]" style={{ transform: "rotateX(65deg) rotateY(-10deg)" }} />
        
        {/* Core Animated Orb */}
        <HoloObject className="!w-[60%] !h-[60%] m-auto" />
      </motion.div>

      {/* Foreground Cinematic Typography */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 pointer-events-none">
        
        {/* Text Block Offset Left */}
        <div className="md:col-span-10 lg:col-span-7 flex flex-col justify-center text-left pt-32 md:pt-0">
          <Reveal>
            <div className="flex items-center gap-4 mb-10 md:mb-16">
              <span className="w-8 h-[1px] bg-foreground/20" />
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-mono text-foreground/40">
                Final Frame
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-[1.1] mb-8 md:mb-12">
              No two visitors <br />
              experienced the <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">same reality.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="text-sm md:text-lg text-foreground/50 tracking-wide font-light max-w-lg leading-relaxed mb-16 md:mb-24">
              The internet should evolve with humans. 
              A digital organism that breathes, remembers, and adapts to your intention. Welcome to the living web.
            </p>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="pointer-events-auto w-fit">
              <button 
                data-magnetic
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group relative flex items-center gap-6 text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-mono text-foreground/50 hover:text-foreground transition-all duration-500"
              >
                <span className="relative z-10 font-medium">Return to Origin</span>
                <span className="relative flex items-center justify-center w-14 h-14 rounded-full border border-foreground/10 group-hover:border-primary/40 transition-all duration-500 bg-background/30 backdrop-blur-md overflow-hidden">
                  <span className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                  <span className="relative w-2 h-2 rounded-full bg-foreground/40 group-hover:bg-primary transition-colors shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_50%,transparent)] group-hover:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_100%,transparent)]" />
                </span>
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Footer Strip */}
      <Reveal delay={0.8} className="absolute bottom-0 inset-x-0">
        <div className="border-t border-foreground/5 p-6 md:px-16 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-[0.2em] font-mono text-foreground/40 z-20 pointer-events-auto backdrop-blur-sm bg-background/50">
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-primary transition-colors duration-300">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">GitHub</a>
            <a href="#" className="hover:text-primary transition-colors duration-300">Discord</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <span>Living Network © {new Date().getFullYear()}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
