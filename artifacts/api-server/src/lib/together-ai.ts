// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Together AI — OpenAI-compatible client for open-source model inference.
// Used to serve free/cheap-tier users with Llama, Mistral, and Mixtral models.

import OpenAI from "openai";

export type TogetherModel =
  | "llama-3.3-70b"
  | "llama-3.1-8b"
  | "mixtral-8x7b"
  | "mistral-7b";

export const TOGETHER_MODEL_IDS: Record<TogetherModel, string> = {
  "llama-3.3-70b":  "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "llama-3.1-8b":   "meta-llama/Llama-3.1-8B-Instruct-Turbo",
  "mixtral-8x7b":   "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "mistral-7b":     "mistralai/Mistral-7B-Instruct-v0.3",
};

// Together AI pricing (USD per 1M tokens) — ~10-20x cheaper than OpenAI
export const TOGETHER_PRICING: Record<TogetherModel, { input: number; output: number }> = {
  "llama-3.3-70b":  { input: 0.88,  output: 0.88  },
  "llama-3.1-8b":   { input: 0.18,  output: 0.18  },
  "mixtral-8x7b":   { input: 0.60,  output: 0.60  },
  "mistral-7b":     { input: 0.20,  output: 0.20  },
};

export const TOGETHER_MODEL_LABELS: Record<TogetherModel, { label: string; badge: string }> = {
  "llama-3.3-70b":  { label: "Llama 3.3 70B",   badge: "FREE" },
  "llama-3.1-8b":   { label: "Llama 3.1 8B",    badge: "FREE" },
  "mixtral-8x7b":   { label: "Mixtral 8x7B",    badge: "FREE" },
  "mistral-7b":     { label: "Mistral 7B",       badge: "FREE" },
};

export function isTogetherModel(model: string): model is TogetherModel {
  return model in TOGETHER_MODEL_IDS;
}

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
