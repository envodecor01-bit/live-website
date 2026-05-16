# Living Website — Cinematic Overhaul + AI Hardening

Two parallel tracks: **(A) make every section feel like the inspiration sites** (Oryzo, Sazabi, Shader.se, Yesnowww, Vertex3D, Planetono, Manayerba, Arynx, Anushka) and **(B) make the AI brain rock-solid so bad prompts never break it**.

---

## Track A — Section-by-section UI/UX upgrade

Add these libraries:
- `motion` (Framer Motion successor) — already-feel hover/scroll/spring animations
- `@react-three/fiber` + `@react-three/drei` — Three.js scenes for hero & shader sections
- `lenis` — buttery smooth scroll (Sazabi/Oryzo feel)
- `split-type` — letter-by-letter text reveals (Shader.se feel)

Per-section direction:

| Section | New direction |
|---|---|
| **Hero** | Full-bleed WebGL orb (react-three-fiber) with chromatic-aberration shader, scramble-text headline, magnetic CTA, marquee tagline strip (Yesnowww-style) |
| **Themes** | Bento-grid of preset cards with 3D tilt on hover, live mini-preview that morphs colors on hover (Vertex3D vibe) |
| **CustomTheme** | Floating glass control panel, live gradient orb reacts to inputs, draggable hue ring |
| **Mutation** | Scroll-pinned section: as user scrolls, the page visibly mutates — text scrambles, particles burst (Shader.se selected-work feel) |
| **Capabilities** | Horizontal infinite marquee of capability chips + interactive cursor-following spotlight grid (Arynx style) |
| **Behavior** | Heatmap-style canvas that tracks real cursor; sentences fade in word-by-word via split-type |
| **Timeline** | Vertical sticky timeline with parallax milestone cards, glowing connector line draws on scroll (Planetono style) |
| **Comparison** | Split-screen "before/after" drag slider comparing static vs living web |
| **Whispers** | Floating type that drifts across screen like dust, ambient audio-reactive scale |
| **Ending** | Giant kinetic typography blowup + final CTA orb (Anushka style) |
| **Nav** | Magnetic links, blur-on-scroll, animated underline |
| **Intro** | Loader with progress bar + brand reveal (Oryzo opening) |

Global: Lenis smooth scroll, cursor orb upgraded to magnetic blob, all sections wrapped in scroll-reveal containers.

---

## Track B — AI hardening

Current pain: model calls invalid tools, missing `note`, wrong arg types → 500s.

Fixes:
1. **Add Groq key as secret** (you must rotate the one you pasted first — it's now public). Store new key as `GROQ_API_KEY` via secret tool, not in code.
2. **Switch default model** to `llama3-70b-8192` (your choice) with `llama-3.3-70b-versatile` as fallback.
3. **Self-healing tool layer**: wrap every tool's `execute` so missing `note` is auto-filled, numeric strings coerced to numbers, unknown enums clamped to nearest valid value, items arrays force-stringified.
4. **Zod `.catch()` defaults** on every field so a bad arg never throws — it gets normalized.
5. **Retry middleware**: if model emits malformed JSON or hits 429, retry up to 2x with backoff, falling back to a simpler tool call.
6. **System-prompt tightening**: add hard examples of correct vs incorrect tool calls + a "if uncertain, call set_personality with a safe preset" rule.
7. **Client-side guard**: if assistant returns no tool calls within 8s, show a graceful whisper instead of an error toast.
8. **Higher `stepCountIs`** (50) so multi-tool chains complete.

---

## Technical notes

- All animations use `prefers-reduced-motion` guard.
- Three.js scenes lazy-load via `React.lazy` so initial bundle stays light.
- New section components live in `src/components/living/sections/` (replacing existing files in place).
- Shared motion primitives go in `src/components/living/motion/` (MagneticLink, ScrambleText, SplitReveal, MarqueeRow, TiltCard).
- AI hardening lives entirely in `src/routes/api/chat.ts` + a new `src/lib/ai-self-heal.ts`.

---

## Order of work

1. Install libraries
2. Add Groq secret (after you rotate)
3. Harden AI route (Track B) — quick win, unblocks testing
4. Build shared motion primitives
5. Rebuild sections in priority order: Hero → Themes → Mutation → Timeline → Capabilities → rest
6. Wire Lenis + cursor upgrades globally
7. QA pass with reduced-motion + mobile viewport

This is ~2 hours of focused work. Approve and I'll start with Track B (AI fix) so you can immediately test prompts while I build the visual layer.
