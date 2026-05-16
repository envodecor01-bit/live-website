import { create } from "zustand";

export type ThemeId =
  | "cinematic"
  | "cyberpunk"
  | "luxury"
  | "minimal"
  | "scifi"
  | "dreamcore"
  | "holographic"
  | "gaming"
  | "calm"
  | "experimental"
  | "custom";

export type Motion = "low" | "normal" | "high";
export type Density = "compact" | "normal" | "airy";

export interface CustomPalette {
  background: string; // hex
  foreground: string;
  primary: string;
  accent: string;
}

export interface Behavior {
  scrollSpeed: number;
  cursorVelocity: number;
  hoverTime: number;
  sectionsViewed: string[];
  clicks: number;
  hesitations: number;
  sessionStart: number;
}

export type LiveLayout = "manifesto" | "stats" | "quote" | "pitch" | "story";

export type LiveKind =
  | "text"        // body copy / manifesto / quote
  | "stats"       // big numbers
  | "gallery"     // image / shape grid
  | "game"        // animated mini-scene (mario, pong, etc.)
  | "feature"     // 3 columns of features
  | "code"        // monospace block
  | "cta"         // big call to action
  | "interactive" // floating shapes you can hover
  | "marquee"     // scrolling text band
  | "shader";     // mini animated shader card

export interface LiveSection {
  id: string;
  title: string;
  body: string;
  layout: LiveLayout;
  kind?: LiveKind;
  theme?: string;        // free-form mood label
  palette?: string[];    // hex colors to drive the look
  items?: string[];
  stats?: { label: string; value: string }[];
  emojis?: string[];     // for game/interactive scenes
  accent?: string;
  eyebrow?: string;
  createdAt: number;
}

export interface MutationEvent {
  id: string;
  at: number;
  source: "auto" | "prompt" | "user" | "system";
  message: string;
  theme?: ThemeId;
  motion?: Motion;
  density?: Density;
  glow?: number;
  particles?: number;
  focusSection?: string;
}

interface LivingState {
  theme: ThemeId;
  motion: Motion;
  density: Density;
  glow: number;
  particles: number;
  shaderIntensity: number;
  introDone: boolean;
  customPalette: CustomPalette;
  focusSection: string | null;
  narratorOn: boolean;
  voiceOn: boolean;
  behavior: Behavior;
  mutations: MutationEvent[];
  setTheme: (t: ThemeId, source?: MutationEvent["source"], msg?: string) => void;
  setMotion: (m: Motion) => void;
  setDensity: (d: Density) => void;
  setGlow: (g: number) => void;
  setParticles: (p: number) => void;
  setShader: (s: number) => void;
  setCustomPalette: (p: Partial<CustomPalette>) => void;
  applyCustomPalette: () => void;
  focusOn: (sectionId: string, msg?: string) => void;
  toggleNarrator: () => void;
  toggleVoice: () => void;
  markIntroDone: () => void;
  trackSection: (id: string) => void;
  trackClick: () => void;
  trackHover: (ms: number) => void;
  trackCursor: (v: number) => void;
  trackScroll: (v: number) => void;
  trackHesitation: () => void;
  addMutation: (m: Omit<MutationEvent, "id" | "at">) => void;
  liveSections: LiveSection[];
  spawnLiveSection: (s: Omit<LiveSection, "id" | "createdAt">) => string;
  removeLiveSection: (id: string) => void;
  clearLiveSections: () => void;
  // --- AI as environmental consciousness ---
  sectionIntensities: Record<string, string>;
  setSectionIntensity: (sectionId: string, mode: string) => void;
  pulseAt: number;
  triggerPulse: () => void;
  emotion: { energy: number; focus: number; overwhelm: number; curiosity: number };
  setEmotion: (e: { energy: number; focus: number; overwhelm: number; curiosity: number }) => void;
}

export const useLiving = create<LivingState>((set, get) => ({
  theme: "cinematic",
  motion: "normal",
  density: "normal",
  glow: 1,
  particles: 1,
  shaderIntensity: 1,
  introDone: false,
  customPalette: {
    background: "#0a0d1a",
    foreground: "#f5f7ff",
    primary: "#7aa8ff",
    accent: "#ff8ad8",
  },
  focusSection: null,
  narratorOn: true,
  voiceOn: false,
  behavior: {
    scrollSpeed: 0,
    cursorVelocity: 0,
    hoverTime: 0,
    sectionsViewed: [],
    clicks: 0,
    hesitations: 0,
    sessionStart: Date.now(),
  },
  mutations: [],
  setTheme: (theme, source = "user", message = `Theme → ${theme}`) => {
    set({ theme });
    get().addMutation({ source, message, theme });
  },
  setMotion: (motion) => {
    set({ motion });
    get().addMutation({ source: "user", message: `Motion → ${motion}`, motion });
  },
  setDensity: (density) => {
    set({ density });
    get().addMutation({ source: "user", message: `Density → ${density}`, density });
  },
  setGlow: (glow) => set({ glow }),
  setParticles: (particles) => set({ particles }),
  setShader: (shaderIntensity) => set({ shaderIntensity }),
  setCustomPalette: (p) =>
    set((s) => ({ customPalette: { ...s.customPalette, ...p } })),
  applyCustomPalette: () => {
    set({ theme: "custom" });
    get().addMutation({
      source: "user",
      message: "Custom palette applied — your own reality",
      theme: "custom",
    });
  },
  focusOn: (sectionId, msg) => {
    // No forced scrolling. Just emit a mutation event with the section so
    // the Narrator can offer the user an explicit "jump" affordance.
    if (msg) get().addMutation({ source: "system", message: msg, focusSection: sectionId });
  },
  toggleNarrator: () => set((s) => ({ narratorOn: !s.narratorOn })),
  toggleVoice: () => set((s) => ({ voiceOn: !s.voiceOn })),
  markIntroDone: () => set({ introDone: true }),
  trackSection: (id) =>
    set((s) =>
      s.behavior.sectionsViewed.includes(id)
        ? s
        : { behavior: { ...s.behavior, sectionsViewed: [...s.behavior.sectionsViewed, id] } },
    ),
  trackClick: () => set((s) => ({ behavior: { ...s.behavior, clicks: s.behavior.clicks + 1 } })),
  trackHover: (ms) =>
    set((s) => ({ behavior: { ...s.behavior, hoverTime: s.behavior.hoverTime + ms } })),
  trackCursor: (v) =>
    set((s) => ({
      behavior: { ...s.behavior, cursorVelocity: s.behavior.cursorVelocity * 0.85 + v * 0.15 },
    })),
  trackScroll: (v) =>
    set((s) => ({
      behavior: { ...s.behavior, scrollSpeed: s.behavior.scrollSpeed * 0.8 + v * 0.2 },
    })),
  trackHesitation: () =>
    set((s) => ({ behavior: { ...s.behavior, hesitations: s.behavior.hesitations + 1 } })),
  addMutation: (m) =>
    set((s) => ({
      mutations: [
        ...s.mutations,
        { ...m, id: crypto.randomUUID(), at: Date.now() },
      ].slice(-80),
    })),
  liveSections: [],
  spawnLiveSection: (sec) => {
    const id = crypto.randomUUID();
    set((s) => ({
      liveSections: [...s.liveSections, { ...sec, id, createdAt: Date.now() }].slice(-12),
    }));
    get().addMutation({
      source: "prompt",
      message: `${(sec.kind ?? "section").toUpperCase()} materialised — "${sec.title}"`,
      focusSection: `live-${id}`,
    });
    return id;
  },
  removeLiveSection: (id) =>
    set((s) => ({ liveSections: s.liveSections.filter((x) => x.id !== id) })),
  clearLiveSections: () => set({ liveSections: [] }),
  sectionIntensities: {},
  setSectionIntensity: (sectionId, mode) =>
    set((s) => ({ sectionIntensities: { ...s.sectionIntensities, [sectionId]: mode } })),
  pulseAt: 0,
  triggerPulse: () => set({ pulseAt: Date.now() }),
  emotion: { energy: 0, focus: 0, overwhelm: 0, curiosity: 0 },
  setEmotion: (emotion) => set({ emotion }),
}));
