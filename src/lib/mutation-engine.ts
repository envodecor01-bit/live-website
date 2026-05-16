import { useLiving, type ThemeId, type Motion as MotionMode, type Density } from "@/store/living";

export type PersonalityId =
  | "cinematic"
  | "cyberpunk"
  | "luxury"
  | "minimal"
  | "scifi"
  | "dreamcore"
  | "holographic"
  | "gaming"
  | "calm"
  | "experimental";

export interface PersonalityPreset {
  id: PersonalityId;
  theme: ThemeId;
  motion: MotionMode;
  density: Density;
  glow: number;
  particles: number;
  shaderIntensity: number;
  whisper: string;
}

export const PERSONALITIES: Record<PersonalityId, PersonalityPreset> = {
  cinematic: {
    id: "cinematic",
    theme: "cinematic",
    motion: "high",
    density: "airy",
    glow: 1.1,
    particles: 1.1,
    shaderIntensity: 1.2,
    whisper: "atmosphere widens — cinematic depth",
  },
  cyberpunk: {
    id: "cyberpunk",
    theme: "cyberpunk",
    motion: "high",
    density: "compact",
    glow: 1.4,
    particles: 1.6,
    shaderIntensity: 1.5,
    whisper: "neon current rising",
  },
  luxury: {
    id: "luxury",
    theme: "luxury",
    motion: "normal",
    density: "airy",
    glow: 0.95,
    particles: 0.5,
    shaderIntensity: 0.8,
    whisper: "slow gold settles in",
  },
  dreamcore: {
    id: "dreamcore",
    theme: "dreamcore",
    motion: "high",
    density: "airy",
    glow: 1.25,
    particles: 1.3,
    shaderIntensity: 1.4,
    whisper: "the air softens into a dream",
  },
  holographic: {
    id: "holographic",
    theme: "holographic",
    motion: "high",
    density: "normal",
    glow: 1.35,
    particles: 1.2,
    shaderIntensity: 1.6,
    whisper: "surfaces turn iridescent",
  },
  calm: {
    id: "calm",
    theme: "calm",
    motion: "low",
    density: "airy",
    glow: 0.7,
    particles: 0.4,
    shaderIntensity: 0.6,
    whisper: "everything exhales",
  },
  experimental: {
    id: "experimental",
    theme: "experimental",
    motion: "high",
    density: "compact",
    glow: 1.5,
    particles: 1.8,
    shaderIntensity: 1.8,
    whisper: "rules dissolve",
  },
  minimal: {
    id: "minimal",
    theme: "minimal",
    motion: "low",
    density: "airy",
    glow: 0.5,
    particles: 0.2,
    shaderIntensity: 0.3,
    whisper: "silence becomes the design",
  },
  scifi: {
    id: "scifi",
    theme: "scifi",
    motion: "high",
    density: "normal",
    glow: 1.2,
    particles: 1.3,
    shaderIntensity: 1.3,
    whisper: "systems online",
  },
  gaming: {
    id: "gaming",
    theme: "gaming",
    motion: "high",
    density: "compact",
    glow: 1.45,
    particles: 1.6,
    shaderIntensity: 1.5,
    whisper: "kinetic mode engaged",
  },
};

export type IntensityMode = "default" | "cinematic" | "holographic" | "explosion" | "zoom" | "calm";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Smoothly interpolate a numeric store field over `ms`. */
function tween(
  read: () => number,
  write: (v: number) => void,
  target: number,
  ms = 700,
) {
  const start = read();
  const t0 = performance.now();
  const tick = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    const eased = 1 - Math.pow(1 - k, 3);
    write(start + (target - start) * eased);
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export interface MutationDelta {
  glow?: number;
  particles?: number;
  shaderIntensity?: number;
  motion?: MotionMode;
  density?: Density;
}

/** Apply a partial atmosphere mutation with smooth interpolation on numbers. */
export function applyMutation(delta: MutationDelta, source: "auto" | "prompt" | "user" = "prompt", reason?: string) {
  const s = useLiving.getState();
  if (typeof delta.glow === "number")
    tween(() => useLiving.getState().glow, s.setGlow, clamp(delta.glow, 0.2, 1.6));
  if (typeof delta.particles === "number")
    tween(() => useLiving.getState().particles, s.setParticles, clamp(delta.particles, 0, 2));
  if (typeof delta.shaderIntensity === "number")
    tween(() => useLiving.getState().shaderIntensity, s.setShader, clamp(delta.shaderIntensity, 0, 2));
  if (delta.motion) s.setMotion(delta.motion);
  if (delta.density) s.setDensity(delta.density);
  if (reason) s.addMutation({ source, message: reason });
  pulseEnvironment();
}

export function applyPersonality(id: PersonalityId, source: "auto" | "prompt" | "user" = "prompt", note?: string) {
  const p = PERSONALITIES[id];
  if (!p) return;
  const s = useLiving.getState();
  s.setTheme(p.theme, source, note || p.whisper);
  s.setMotion(p.motion);
  s.setDensity(p.density);
  tween(() => useLiving.getState().glow, s.setGlow, p.glow);
  tween(() => useLiving.getState().particles, s.setParticles, p.particles);
  tween(() => useLiving.getState().shaderIntensity, s.setShader, p.shaderIntensity);
  pulseEnvironment();
}

/** Trigger the EnvFeedback ripple. */
export function pulseEnvironment() {
  useLiving.getState().triggerPulse();
}

export function setSectionIntensity(section: string, mode: IntensityMode, note?: string) {
  const s = useLiving.getState();
  s.setSectionIntensity(section, mode);
  s.addMutation({
    source: "prompt",
    message: note || `${section} → ${mode}`,
    focusSection: section,
  });
  pulseEnvironment();
}

import type { LiveKind } from "@/store/living";

export function applyToolCall(name: string, input: Record<string, unknown>) {
  const s = useLiving.getState();
  const note = (input.note as string) || undefined;
  switch (name) {
    case "set_personality": {
      const id = input.id as PersonalityId;
      if (id) applyPersonality(id, "auto", note);
      break;
    }
    case "mutate_atmosphere": {
      applyMutation(
        {
          glow: typeof input.glow === "number" ? input.glow : undefined,
          particles: typeof input.particles === "number" ? input.particles : undefined,
          shaderIntensity:
            typeof input.shaderIntensity === "number" ? input.shaderIntensity : undefined,
          motion: input.motion as MotionMode | undefined,
          density: input.density as Density | undefined,
        },
        "auto",
        note,
      );
      break;
    }
    case "intensify_section": {
      const section = String(input.section || "");
      const mode = (input.mode as IntensityMode) || "default";
      if (section) {
        setSectionIntensity(section, mode, note);
      }
      break;
    }
    case "set_palette": {
      s.setCustomPalette({
        background: String(input.background || s.customPalette.background),
        foreground: String(input.foreground || s.customPalette.foreground),
        primary: String(input.primary || s.customPalette.primary),
        accent: String(input.accent || s.customPalette.accent),
      });
      s.applyCustomPalette();
      if (note) s.addMutation({ source: "auto", message: note });
      pulseEnvironment();
      break;
    }
    case "focus_section": {
      const id = String(input.section || "");
      if (id) s.focusOn(id, note);
      break;
    }
    case "spawn_section": {
      const kind = (input.kind as LiveKind) || "text";
      const title = String(input.title || "New section");
      const body = String(input.body || "");
      const eyebrow = input.eyebrow ? String(input.eyebrow) : undefined;
      const items = Array.isArray(input.items) ? (input.items as string[]) : undefined;
      const stats = Array.isArray(input.stats)
        ? (input.stats as { label: string; value: string }[])
        : undefined;
      const emojis = Array.isArray(input.emojis) ? (input.emojis as string[]) : undefined;
      const palette = Array.isArray(input.palette) ? (input.palette as string[]) : undefined;
      const id = s.spawnLiveSection({
        kind,
        title,
        body,
        eyebrow,
        items,
        stats,
        emojis,
        palette,
        layout: "pitch",
        accent: palette?.[2],
      });
      pulseEnvironment();
      if (note) s.addMutation({ source: "auto", message: note, focusSection: `live-${id}` });
      break;
    }
    case "clear_sections": {
      s.clearLiveSections();
      if (note) s.addMutation({ source: "auto", message: note });
      break;
    }
  }
}
