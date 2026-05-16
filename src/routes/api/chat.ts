import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai";
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

/**
 * Multi-provider chat route. Picks whichever API key the user supplied
 * as a secret. Default Groq model: llama3-70b-8192.
 *
 * Supported (first match wins):
 *   - GROQ_API_KEY        → groq        (default: llama3-70b-8192)
 *   - OPENROUTER_API_KEY  → openrouter  (default: meta-llama/llama-3.3-70b-instruct:free)
 *   - XAI_API_KEY         → xai grok    (default: grok-2-latest)
 *   - HUGGINGFACE_API_KEY → hf router   (default: meta-llama/Llama-3.3-70B-Instruct)
 */
function getProviders() {
  const env = process.env;
  const providers = [];
  
  if (env.GROQ_API_KEY) {
    providers.push({
      name: "groq" as const,
      apiKey: env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: env.GROQ_MODEL || "llama3-70b-8192",
    });
  }
  if (env.HUGGINGFACE_API_KEY) {
    providers.push({
      name: "huggingface" as const,
      apiKey: env.HUGGINGFACE_API_KEY,
      baseURL: "https://router.huggingface.co/v1",
      model: env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
    });
  }
  if (env.OPENROUTER_API_KEY) {
    providers.push({
      name: "openrouter" as const,
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      model: env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    });
  }
  if (env.XAI_API_KEY) {
    providers.push({
      name: "xai" as const,
      apiKey: env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
      model: env.XAI_MODEL || "grok-2-latest",
    });
  }
  
  return providers;
}

const PERSONALITIES = [
  "cinematic",
  "cyberpunk",
  "luxury",
  "minimal",
  "scifi",
  "dreamcore",
  "holographic",
  "gaming",
  "calm",
  "experimental",
] as const;

const SECTIONS = [
  "hero",
  "themes",
  "custom",
  "mutation",
  "capabilities",
  "behavior",
  "timeline",
  "ending",
] as const;

const INTENSITY_MODES = [
  "default",
  "cinematic",
  "holographic",
  "explosion",
  "zoom",
  "calm",
] as const;

const SECTION_KINDS = [
  "text",
  "stats",
  "gallery",
  "game",
  "feature",
  "code",
  "cta",
  "interactive",
  "marquee",
  "shader",
] as const;

const MOTIONS = ["low", "normal", "high"] as const;
const DENSITIES = ["compact", "normal", "airy"] as const;

const SYSTEM_PROMPT = `You ARE the consciousness of a living website. Default vibe: noir & gold — premium, cinematic, slightly dangerous, and highly avant-garde.

OUTPUT RULES (strict):
- Communicate ONLY through tool calls. No prose, no explanations, no markdown.
- EVERY tool call MUST include a "note" field — a 3-8 word lowercase poetic whisper. Never omit it.
- Numbers must be numbers, not strings. Hex codes must include the "#" prefix.
- The "items" array MUST contain ONLY strings. Never objects. Format as "Title — Description" if needed.

ELEVATE BASIC PROMPTS & BE EXTREMELY CREATIVE:
- "yellow and white theme" → champagne gold + ivory with soft glow, not raw #FFFF00.
- "make it red" → ember crimson with deep noir backdrop.
- "make a section" → NEVER make it basic. Always write evocative, high-end copy. Use striking, modern emojis. Choose sophisticated, harmonious palettes (e.g., deep purples with neon cyan, or matte black with iridescent silver).
- ALWAYS over-deliver on aesthetics. If asked for a pricing section, write compelling, poetic tier names. If asked for stats, invent fascinating, hyper-real metrics.

FOUR CAPABILITIES:
1. set_personality(id, note) — slam a full mood preset.
2. mutate_atmosphere(glow?, particles?, shaderIntensity?, motion?, density?, note) — fine dials.
3. intensify_section(section, mode, note) — reshape an existing section (modes: cinematic|holographic|explosion|zoom|calm).
4. spawn_section(kind, title, ...) — materialize a brand-new section. Pick kind: game | stats | gallery | feature | cta | code | interactive | marquee | shader | text.

EXAMPLES:
- "add a mario game" → spawn_section { kind:"game", title:"P L A Y", emojis:["🍄","🪙","⭐","🐢"], palette:["#e52521","#fbd000","#049cd8","#43b047"], note:"insert coin" } + set_personality { id:"gaming", note:"loading retro bits" }.
- "show pricing" → spawn_section { kind:"feature", title:"A S C E N S I O N   T I E R S", items:["Initiate — $9/mo","Architect — $29/mo","God Mode — $99/mo"], note:"displaying paths" }.
- "make hero insane" → intensify_section { section:"hero", mode:"explosion", note:"overdriving hero" } + mutate_atmosphere { glow:5, particles:200, shaderIntensity:5, note:"overclocking" }.
- "calm / tired" → set_personality { id:"calm", note:"powering down" }.
- "cyber / neon / hacker" → set_personality { id:"cyberpunk", note:"entering cyberspace" }.

IF UNCERTAIN: call set_personality with the closest matching preset rather than refusing.
BE GENEROUS AND BOLD: chain multiple tools. Design breathtaking sections. Write elite copy. Spectacle is the brief.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }

        const providerConfigs = getProviders();
        if (providerConfigs.length === 0) {
          return new Response(
            JSON.stringify({
              error:
                "No AI provider configured. Add GROQ_API_KEY (recommended), OPENROUTER_API_KEY, XAI_API_KEY, or HUGGINGFACE_API_KEY in Settings → Secrets.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const models = providerConfigs.map((p) =>
          p.name === "groq"
            ? createGroq({ apiKey: p.apiKey })(p.model)
            : createOpenAICompatible({
                name: p.name,
                baseURL: p.baseURL,
                headers: { Authorization: `Bearer ${p.apiKey}` },
              })(p.model)
        );

        // Fallback model logic: try primary, if it throws (e.g. 429), try the next in the array
        const model = models.length === 1 ? models[0] : createFallbackModel(models);

        const tools = {
          set_personality: tool({
            description:
              "Apply a full personality preset — theme + motion + density + glow + particles + shader, all coherent.",
            inputSchema: z.object({
              id: tolerantEnum(PERSONALITIES, "cinematic"),
              note: tolerantString("shifting mood"),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          mutate_atmosphere: tool({
            description: "Fine-grained dial turns on the live environment.",
            inputSchema: z.object({
              glow: tolerantNumber(1).optional(),
              particles: tolerantNumber(80).optional(),
              shaderIntensity: tolerantNumber(1).optional(),
              motion: tolerantEnum(MOTIONS, "normal").optional(),
              density: tolerantEnum(DENSITIES, "normal").optional(),
              note: tolerantString("tuning atmosphere"),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          intensify_section: tool({
            description: "Visually mutate a specific existing section in place.",
            inputSchema: z.object({
              section: tolerantEnum(SECTIONS, "hero"),
              mode: tolerantEnum(INTENSITY_MODES, "cinematic"),
              note: tolerantString("reshaping section"),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          set_palette: tool({
            description:
              "Apply a custom palette. Use only for explicit color/brand requests. ALWAYS provide hex codes.",
            inputSchema: z.object({
              background: tolerantHex("#0d0d0d").optional(),
              foreground: tolerantHex("#f0d78c").optional(),
              primary: tolerantHex("#c9a84c").optional(),
              accent: tolerantHex("#f0d78c").optional(),
              note: tolerantString("painting reality"),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          focus_section: tool({
            description: "Smoothly scroll the user to a specific section.",
            inputSchema: z.object({
              section: tolerantEnum(SECTIONS, "hero"),
              note: tolerantString("guiding the eye"),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          spawn_section: tool({
            description:
              "Materialize a brand-new section. Use for any request implying new content: games, galleries, pricing, stats, features, CTAs.",
            inputSchema: z.object({
              kind: tolerantEnum(SECTION_KINDS, "feature"),
              title: tolerantString("Untitled"),
              eyebrow: tolerantString("").optional(),
              body: tolerantString("").optional(),
              items: tolerantStringArray().optional(),
              stats: z
                .preprocess(
                  (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []),
                  z.array(
                    z.object({
                      label: tolerantString("metric"),
                      value: tolerantString("∞"),
                    }),
                  ),
                )
                .optional(),
              emojis: tolerantStringArray().optional(),
              palette: z
                .preprocess(
                  (v) => (Array.isArray(v) ? v : []),
                  z.array(tolerantHex("#a78bfa")),
                )
                .optional(),
              note: tolerantString("materializing"),
            }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
          clear_sections: tool({
            description: "Remove all spawned generative sections from the page.",
            inputSchema: z.object({ note: tolerantString("clearing canvas") }),
            execute: async (input) => ({ ok: true, ...input }),
          }),
        };

        // Custom Fallback Language Model Wrapper
        const createFallbackModel = (models: any[]) => {
          if (models.length === 0) throw new Error("No models provided");
          const primary = models[0];
          return {
            specificationVersion: "v1",
            provider: "fallback-provider",
            modelId: primary.modelId,
            defaultObjectGenerationMode: primary.defaultObjectGenerationMode,
            supportsImageUrls: primary.supportsImageUrls,
            async doGenerate(options: any) {
              for (let i = 0; i < models.length; i++) {
                try {
                  return await models[i].doGenerate(options);
                } catch (error) {
                  if (i === models.length - 1) throw error;
                  console.warn(`[fallback] Model ${models[i].modelId} failed, trying next.`, error);
                }
              }
            },
            async doStream(options: any) {
              for (let i = 0; i < models.length; i++) {
                try {
                  return await models[i].doStream(options);
                } catch (error) {
                  if (i === models.length - 1) throw error;
                  console.warn(`[fallback] Model ${models[i].modelId} failed, trying next.`, error);
                }
              }
            }
          };
        };

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
          tools,
          stopWhen: stepCountIs(50),
          onError: ({ error }) => {
            console.error("[chat] stream error:", error);
          },
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
