import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLiving } from "@/store/living";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "h1" | "h2" | "h3" | "p" | "span";
  sectionId?: string;
}

export function Reveal({ children, delay = 0, className, sectionId }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const trackSection = useLiving((s) => s.trackSection);

  useEffect(() => {
    if (inView && sectionId) trackSection(sectionId);
  }, [inView, sectionId, trackSection]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
