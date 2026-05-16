import { useLiving } from "@/store/living";
import { applyMutation, applyPersonality, applyToolCall } from "./mutation-engine";

/**
 * Continuous environmental brain.
 * Reads behavior signals, computes an emotional state, and subtly
 * nudges the environment every few seconds. Big shifts happen
 * via the AI /api/brain endpoint when sustained signals are detected.
 */
export function startAdaptiveBrain() {
  let lastShift = 0;
  let prevScroll = 0;
  let prevCursor = 0;

  const id = window.setInterval(() => {
    const s = useLiving.getState();
    const b = s.behavior;

    // --- emotional state ---
    const energy = clamp01((b.scrollSpeed / 1500) * 0.5 + (b.cursorVelocity / 1200) * 0.5);
    const overwhelm = clamp01(b.hesitations / 8);
    const focus = clamp01(b.sectionsViewed.length / 6) * (1 - overwhelm);
    const curiosity = clamp01(b.clicks / 10);
    s.setEmotion({ energy, focus, overwhelm, curiosity });

    // --- subtle continuous nudges (every tick) ---
    const targetGlow = 0.7 + energy * 0.5 - overwhelm * 0.2;
    const targetParticles = 0.5 + energy * 0.9 + curiosity * 0.3 - overwhelm * 0.4;
    const targetShader = 0.6 + energy * 0.7 + focus * 0.3 - overwhelm * 0.3;

    applyMutation({
      glow: lerp(s.glow, targetGlow, 0.15),
      particles: lerp(s.particles, targetParticles, 0.12),
      shaderIntensity: lerp(s.shaderIntensity, targetShader, 0.12),
    }, "auto");

    // --- big personality shifts via AI ---
    const now = Date.now();
    // Only ping AI every 25s max
    if (now - lastShift < 25000) return;

    if (energy > 0.35 || overwhelm > 0.4 || focus > 0.4 || curiosity > 0.3) {
      lastShift = now;

      const stateDump = {
        theme: s.theme,
        motion: s.motion,
        density: s.density,
        glow: s.glow,
        particles: s.particles,
        behavior: {
           scrollSpeed: b.scrollSpeed,
           cursorVelocity: b.cursorVelocity,
           clicks: b.clicks,
           hesitations: b.hesitations
        },
        emotion: {
           energy, focus, overwhelm, curiosity
        }
      };

      fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateDump)
      })
      .then(res => res.json())
      .then(data => {
         if (data && data.toolCalls) {
            data.toolCalls.forEach((tc: any) => {
               applyToolCall(tc.toolName, tc.args);
            });
         }
      })
      .catch((e) => console.error("adaptive brain error:", e));
    }

    prevScroll = b.scrollSpeed;
    prevCursor = b.cursorVelocity;
    void prevScroll; void prevCursor;
  }, 4000);

  return () => window.clearInterval(id);
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
