import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#__abcdefABCDEF0123456789";

interface Props {
  text: string;
  className?: string;
  trigger?: boolean;
  duration?: number;
}

/** Scrambles letters into place — Shader.se / Awwwards staple. */
export function ScrambleText({ text, className, trigger = true, duration = 900 }: Props) {
  const [output, setOutput] = useState(text);
  const frame = useRef(0);
  const queue = useRef<{ from: string; to: string; start: number; end: number; char?: string }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const length = Math.max(output.length, text.length);
    const q: typeof queue.current = [];
    for (let i = 0; i < length; i++) {
      const from = output[i] || "";
      const to = text[i] || "";
      const start = Math.floor(Math.random() * (duration / 2));
      const end = start + Math.floor(Math.random() * (duration / 2));
      q.push({ from, to, start, end });
    }
    queue.current = q;
    let f = 0;
    let raf = 0;
    const tick = () => {
      let out = "";
      let complete = 0;
      for (const item of queue.current) {
        if (f >= item.end) {
          complete++;
          out += item.to;
        } else if (f >= item.start) {
          if (!item.char || Math.random() < 0.28) {
            item.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          out += item.char;
        } else {
          out += item.from;
        }
      }
      setOutput(out);
      if (complete < queue.current.length) {
        f += 16;
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    frame.current = raf;
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger]);

  return <span className={className}>{output}</span>;
}
