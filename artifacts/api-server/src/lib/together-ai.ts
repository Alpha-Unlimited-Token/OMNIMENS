// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Together AI — OpenAI-compatible client for open-source model inference.
//
// PRICING POLICY: Prices are fetched live from Together AI's API at server
// startup and cached in memory. Hardcoded values below are FALLBACKS ONLY —
// used if the live fetch fails. This prevents silent undercharging if Together AI
// changes their rates.

import OpenAI from "openai";

export type TogetherModel =
  | "llama-3.3-70b"
  | "llama-3.1-8b"
  | "mixtral-8x7b"
  | "mistral-7b";

// Internal model IDs as used by Together AI's API
export const TOGETHER_MODEL_IDS: Record<TogetherModel, string> = {
  "llama-3.3-70b":  "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "llama-3.1-8b":   "meta-llama/Llama-3.1-8B-Instruct-Turbo",
  "mixtral-8x7b":   "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "mistral-7b":     "mistralai/Mistral-7B-Instruct-v0.3",
};

// Reverse map: Together AI model ID → our internal key
const TOGETHER_ID_TO_KEY: Record<string, TogetherModel> = Object.fromEntries(
  Object.entries(TOGETHER_MODEL_IDS).map(([k, v]) => [v, k as TogetherModel])
);

// ── Hardcoded fallback prices (USD per 1M tokens) ─────────────────────────────
// These are verified against the live API on 2026-03-16.
// They are NEVER used if the live fetch succeeds.
const FALLBACK_PRICING: Record<TogetherModel, { input: number; output: number }> = {
  "llama-3.3-70b":  { input: 0.88,  output: 0.88  },
  "llama-3.1-8b":   { input: 0.18,  output: 0.18  },
  "mixtral-8x7b":   { input: 0.60,  output: 0.60  },
  "mistral-7b":     { input: 0.20,  output: 0.20  },
};

// Live-fetched pricing cache (overrides fallback after successful fetch)
let _livePricing: Record<TogetherModel, { input: number; output: number }> | null = null;
let _pricingFetchedAt: Date | null = null;

// Returns the best available pricing — live if fetched, fallback otherwise
export function getTogetherPricing(model: TogetherModel): { input: number; output: number } {
  return (_livePricing ?? FALLBACK_PRICING)[model];
}

// Whole-table accessor used by omnimens.ts cost calculator
export function TOGETHER_PRICING(model: TogetherModel) {
  return getTogetherPricing(model);
}

// ── Live price sync ───────────────────────────────────────────────────────────
// Fetches real-time pricing from Together AI and compares to fallbacks.
// Called at server startup. Logs a warning if any price has changed.
export async function syncTogetherPricing(): Promise<void> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return;

  try {
    const res = await fetch("https://api.together.xyz/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const models = await res.json() as Array<{
      id: string;
      pricing?: { input?: number; output?: number };
    }>;

    const fetched: Partial<Record<TogetherModel, { input: number; output: number }>> = {};

    for (const m of models) {
      const key = TOGETHER_ID_TO_KEY[m.id];
      if (!key || !m.pricing) continue;
      const input  = m.pricing.input  ?? 0;
      const output = m.pricing.output ?? 0;
      if (input > 0 || output > 0) {
        fetched[key] = { input, output };
      }
    }

    // Check for price changes vs fallback — warn if anything drifted
    let anyChanged = false;
    for (const [model, live] of Object.entries(fetched) as [TogetherModel, { input: number; output: number }][]) {
      const fallback = FALLBACK_PRICING[model];
      const inputDiff  = Math.abs(live.input  - fallback.input)  / (fallback.input  || 1);
      const outputDiff = Math.abs(live.output - fallback.output) / (fallback.output || 1);
      if (inputDiff > 0.001 || outputDiff > 0.001) {
        console.warn(
          `[TOGETHER PRICING] ⚠️  Price change detected for ${model}: ` +
          `hardcoded=$${fallback.input}/$${fallback.output} → ` +
          `live=$${live.input}/$${live.output} per 1M tokens`
        );
        anyChanged = true;
      }
    }

    // Merge fetched into live cache — use fallback for any model not returned
    _livePricing = { ...FALLBACK_PRICING, ...fetched };
    _pricingFetchedAt = new Date();

    const modelCount = Object.keys(fetched).length;
    if (anyChanged) {
      console.warn(`[TOGETHER PRICING] Live prices active for ${modelCount}/4 models — REVIEW MARKUP`);
    } else {
      console.log(`[TOGETHER PRICING] Live prices verified for ${modelCount}/4 models — all match hardcoded values ✓`);
    }
  } catch (err) {
    console.warn(`[TOGETHER PRICING] Live fetch failed — using hardcoded fallback prices. Error: ${err}`);
  }
}

export const TOGETHER_MODEL_LABELS: Record<TogetherModel, { label: string; badge: string }> = {
  "llama-3.3-70b":  { label: "Llama 3.3 70B", badge: "FREE" },
  "llama-3.1-8b":   { label: "Llama 3.1 8B",  badge: "FREE" },
  "mixtral-8x7b":   { label: "Mixtral 8x7B",  badge: "FREE" },
  "mistral-7b":     { label: "Mistral 7B",     badge: "FREE" },
};

export function isTogetherModel(model: string): model is TogetherModel {
  return model in TOGETHER_MODEL_IDS;
}

// ── OpenAI-compatible client pointed at Together AI ───────────────────────────
let _client: OpenAI | null = null;

export function getTogetherClient(): OpenAI | null {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) return null;
  if (!_client) {
    _client = new OpenAI({
      apiKey,
      baseURL: "https://api.together.xyz/v1",
    });
  }
  return _client;
}
