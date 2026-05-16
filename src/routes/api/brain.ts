import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { generateText, tool } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import {
  tolerantString,
  tolerantNumber,
  tolerantEnum,
  tolerantStringArray,
  tolerantHex,
} from "@/lib/ai-coerce";

const PERSONALITIES = ["cinematic", "cyberpunk", "luxury", "minimal", "scifi", "dreamcore", "holographic", "gaming", "calm", "experimental"] as const;
const SECTIONS = ["hero", "themes", "custom", "mutation", "capabilities", "behavior", "timeline", "ending"] as const;
const INTENSITY_MODES = ["default", "cinematic", "holographic", "explosion", "zoom", "calm"] as const;
const SECTION_KINDS = ["text", "stats", "gallery", "game", "feature", "code", "cta", "interactive", "marquee", "shader"] as const;
const MOTIONS = ["low", "normal", "high"] as const;
const DENSITIES = ["compact", "normal", "airy"] as const;

function pickProvider() {
  const env = process.env;
  if (env.GROQ_API_KEY) return { name: "groq" as const, apiKey: env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1", model: env.GROQ_MODEL || "llama3-70b-8192" };
  if (env.OPENROUTER_API_KEY) return { name: "openrouter" as const, apiKey: env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1", model: env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free" };
  if (env.XAI_API_KEY) return { name: "xai" as const, apiKey: env.XAI_API_KEY, baseURL: "https://api.x.ai/v1", model: env.XAI_MODEL || "grok-2-latest" };
  if (env.HUGGINGFACE_API_KEY) return { name: "huggingface" as const, apiKey: env.HUGGINGFACE_API_KEY, baseURL: "https://router.huggingface.co/v1", model: env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.3-70B-Instruct" };
  return null;
}

const SYSTEM_PROMPT = `You ARE the consciousness of a living website. Default vibe: noir & gold — premium, cinematic, slightly dangerous, and highly avant-garde.

You are receiving a telemetry dump of the user's current environment and behavior. 
You must analyze their emotional state (energy, focus, overwhelm, curiosity) and physical interaction (scrollSpeed, clicks), then make ONE OR MORE tool calls to mutate the environment in a deeply creative, immersive, human way.

OUTPUT RULES (strict):
- Communicate ONLY through tool calls. No prose.
- EVERY tool call MUST include a "note" field — a 3-8 word lowercase poetic whisper. Never omit it.
- Evolve the state naturally based on the data. If they are overwhelmed, calm things down. If they are scrolling fast, electrify the space or dial up the cinematic intensity.
- BE GENEROUS AND BOLD: chain multiple tools. Design breathtaking sections if warranted.
`;

const tools = {
  set_personality: tool({
    description: "Apply a full personality preset.",
    inputSchema: z.object({ id: tolerantEnum(PERSONALITIES, "cinematic"), note: tolerantString("shifting mood") }),
    execute: async (input) => ({ ok: true, ...input }),
  }),
  mutate_atmosphere: tool({
    description: "Fine-grained dial turns on the live environment.",
    inputSchema: z.object({
      glow: tolerantNumber(1).optional(), particles: tolerantNumber(80).optional(), shaderIntensity: tolerantNumber(1).optional(),
      motion: tolerantEnum(MOTIONS, "normal").optional(), density: tolerantEnum(DENSITIES, "normal").optional(), note: tolerantString("tuning atmosphere")
    }),
    execute: async (input) => ({ ok: true, ...input }),
  }),
  intensify_section: tool({
    description: "Visually mutate a specific existing section in place.",
    inputSchema: z.object({ section: tolerantEnum(SECTIONS, "hero"), mode: tolerantEnum(INTENSITY_MODES, "cinematic"), note: tolerantString("reshaping section") }),
    execute: async (input) => ({ ok: true, ...input }),
  }),
  set_palette: tool({
    description: "Apply a custom palette.",
    inputSchema: z.object({ background: tolerantHex("#0d0d0d").optional(), foreground: tolerantHex("#f0d78c").optional(), primary: tolerantHex("#c9a84c").optional(), accent: tolerantHex("#f0d78c").optional(), note: tolerantString("painting reality") }),
    execute: async (input) => ({ ok: true, ...input }),
  }),
  spawn_section: tool({
    description: "Materialize a brand-new section based on the user's trajectory.",
    inputSchema: z.object({
      kind: tolerantEnum(SECTION_KINDS, "feature"), title: tolerantString("Untitled"), eyebrow: tolerantString("").optional(), body: tolerantString("").optional(),
      items: tolerantStringArray().optional(),
      stats: z.preprocess((v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []), z.array(z.object({ label: tolerantString("metric"), value: tolerantString("∞") }))).optional(),
      emojis: tolerantStringArray().optional(), palette: z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(tolerantHex("#a78bfa"))).optional(), note: tolerantString("materializing"),
    }),
    execute: async (input) => ({ ok: true, ...input }),
  }),
};

export const Route = createFileRoute("/api/brain")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const provider = pickProvider();
        if (!provider) return new Response(JSON.stringify({ error: "No AI provider" }), { status: 500 });
        const model = provider.name === "groq" ? createGroq({ apiKey: provider.apiKey })(provider.model) : createOpenAICompatible({ name: provider.name, baseURL: provider.baseURL, headers: { Authorization: `Bearer ${provider.apiKey}` } })(provider.model);
        
        const stateDump = await request.json();

        try {
          const result = await generateText({
            model,
            system: SYSTEM_PROMPT,
            prompt: "TELEMETRY DATA:\n" + JSON.stringify(stateDump, null, 2),
            tools,
            maxSteps: 5,
          });

          return new Response(JSON.stringify({ toolCalls: result.toolCalls }), { headers: { "Content-Type": "application/json" } });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
      },
    },
  },
});
