import { useEffect } from "react";
import { useLiving } from "@/store/living";
import { isLight, withAlpha } from "@/lib/color";

export function ThemeApplier() {
  const { theme, motion, density, customPalette } = useLiving();

  useEffect(() => {
    const root = document.documentElement;
    // Clear any prior custom palette injection
    const customProps = [
      "--background",
      "--foreground",
      "--primary",
      "--primary-foreground",
      "--accent",
      "--accent-foreground",
      "--glow",
      "--glow-secondary",
      "--card",
      "--muted",
      "--muted-foreground",
      "--border",
    ];
    if (theme === "custom") {
      const { background, foreground, primary, accent } = customPalette;
      root.removeAttribute("data-theme");
      root.style.setProperty("--background", background);
      root.style.setProperty("--foreground", foreground);
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--primary-foreground", isLight(primary) ? "#0a0a0a" : "#ffffff");
      root.style.setProperty("--accent", accent);
      root.style.setProperty("--accent-foreground", isLight(accent) ? "#0a0a0a" : "#ffffff");
      root.style.setProperty("--glow", primary);
      root.style.setProperty("--glow-secondary", accent);
      root.style.setProperty("--card", withAlpha(foreground, 0.04));
      root.style.setProperty("--muted", withAlpha(foreground, 0.06));
      root.style.setProperty("--muted-foreground", withAlpha(foreground, 0.6));
      root.style.setProperty("--border", withAlpha(foreground, 0.12));
    } else {
      customProps.forEach((p) => root.style.removeProperty(p));
      root.setAttribute("data-theme", theme);
    }
  }, [theme, customPalette]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("motion-low", "motion-high");
    if (motion === "low") body.classList.add("motion-low");
    if (motion === "high") body.classList.add("motion-high");
  }, [motion]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("density-compact", "density-airy");
    if (density === "compact") body.classList.add("density-compact");
    if (density === "airy") body.classList.add("density-airy");
  }, [density]);

  return null;
}
