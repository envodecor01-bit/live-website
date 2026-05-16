/**
 * Tolerant coercers for AI tool inputs.
 * Models routinely emit strings where numbers should go, objects in items[],
 * missing `note` fields, malformed hex, or stringified arrays.
 * These helpers normalize all of that so a tool call never throws.
 */
import { z } from "zod";

export const tolerantString = (fallback = "") =>
  z.preprocess(
    (v) => (v == null ? fallback : typeof v === "string" ? v : String(v)),
    z.string(),
  );

export const tolerantNumber = (fallback = 0) =>
  z.preprocess((v) => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
  }, z.number());

export const tolerantEnum = <T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number],
) =>
  z.preprocess((v) => {
    if (typeof v !== "string") return fallback;
    const lower = v.toLowerCase().trim();
    const hit = values.find((x) => x.toLowerCase() === lower);
    if (hit) return hit;
    // fuzzy: pick first that starts with input
    const fuzzy = values.find((x) => x.toLowerCase().startsWith(lower.slice(0, 3)));
    return fuzzy ?? fallback;
  }, z.enum(values));

/** Flattens objects to strings ("Title — Description") and filters nulls. */
export const tolerantStringArray = () =>
  z.preprocess((v) => {
    if (!Array.isArray(v)) return [];
    return v
      .map((item) => {
        if (item == null) return null;
        if (typeof item === "string") return item;
        if (typeof item === "number" || typeof item === "boolean") return String(item);
        if (typeof item === "object") {
          const o = item as Record<string, unknown>;
          const title = o.title ?? o.label ?? o.name ?? o.heading;
          const desc = o.description ?? o.body ?? o.value ?? o.subtitle;
          if (title && desc) return `${title} — ${desc}`;
          if (title) return String(title);
          if (desc) return String(desc);
          return JSON.stringify(item);
        }
        return null;
      })
      .filter((x): x is string => typeof x === "string" && x.length > 0);
  }, z.array(z.string()));

export const tolerantHex = (fallback = "#a78bfa") =>
  z.preprocess((v) => {
    if (typeof v !== "string") return fallback;
    const s = v.trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s;
    if (/^([0-9a-f]{6})$/i.test(s)) return `#${s}`;
    return fallback;
  }, z.string());
