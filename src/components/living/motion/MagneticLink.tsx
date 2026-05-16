import { useRef, type ReactNode, type CSSProperties } from "react";

interface Props {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
  as?: "a" | "button" | "div";
  href?: string;
  onClick?: () => void;
}

/** Magnetic hover — the element drifts toward the cursor. */
export function MagneticLink({
  children,
  strength = 0.35,
  className = "",
  style,
  as = "a",
  href,
  onClick,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const handleMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate3d(0,0,0)";
  };

  const Tag = as as "a";
  return (
    <Tag
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`inline-block will-change-transform transition-transform duration-300 ease-out ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
