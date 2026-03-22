// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Replicate — AI video generation with multiple model options and enhanced control.

const REPLICATE_API = "https://api.replicate.com/v1";

const VIDEO_MODELS = {
  minimax: "minimax/video-01-live",
  wan: "wan-ai/wan-2.1-i2v-480p-bf16",
} as const;

const POLL_INTERVAL = 3000;
const MAX_POLLS = 150;

export type VideoAspectRatio = "16:9" | "9:16" | "1:1";
export type VideoQualityTier = "standard" | "hd";
export type VideoModel = keyof typeof VIDEO_MODELS;

export interface VideoGenOptions {
  prompt: string;
  aspectRatio?: VideoAspectRatio;
  quality?: VideoQualityTier;
  model?: VideoModel;
  imageUrl?: string;
}

export async function generateVideoWithReplicate(
  promptOrOptions: string | VideoGenOptions
): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not configured");

  const opts: VideoGenOptions = typeof promptOrOptions === "string"
    ? { prompt: promptOrOptions }
    : promptOrOptions;

  const selectedModel = opts.model || "minimax";
  const modelId = VIDEO_MODELS[selectedModel] || VIDEO_MODELS.minimax;
  const aspectRatio = opts.aspectRatio || "16:9";

  const input: Record<string, any> = {
    prompt: opts.prompt.slice(0, 2000),
    prompt_optimizer: true,
  };

  if (selectedModel === "minimax" && aspectRatio) {
    const minimaxRatioMap: Record<string, string> = {
      "16:9": "16:9", "9:16": "9:16", "1:1": "1:1",
    };
    if (minimaxRatioMap[aspectRatio]) {
      input.aspect_ratio = minimaxRatioMap[aspectRatio];
    }
  }

  if (opts.imageUrl && selectedModel === "wan") {
    input.image = opts.imageUrl;
  }

  const startRes = await fetch(`${REPLICATE_API}/models/${modelId}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  if (!startRes.ok) {
    const err = await startRes.text();
    if (selectedModel !== "minimax") {
      return generateVideoWithReplicate({ ...opts, model: "minimax" });
    }
    throw new Error(`Replicate video prediction failed to start: ${err}`);
  }

  let prediction = (await startRes.json()) as {
    id: string;
    status: string;
    urls?: { get?: string };
    output?: string | string[];
    error?: string;
  };

  let polls = 0;
  while (
    prediction.status !== "succeeded" &&
    prediction.status !== "failed" &&
    polls < MAX_POLLS
  ) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    const pollRes = await fetch(
      `${REPLICATE_API}/predictions/${prediction.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    prediction = (await pollRes.json()) as typeof prediction;
    polls++;
  }

  if (prediction.status === "failed") {
    if (selectedModel !== "minimax") {
      return generateVideoWithReplicate({ ...opts, model: "minimax" });
    }
    throw new Error(
      `Replicate video generation failed: ${prediction.error || "unknown error"}`
    );
  }
  if (prediction.status !== "succeeded" || !prediction.output) {
    throw new Error("Replicate video generation timed out");
  }

  const videoUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;
  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error("Failed to download Replicate video");
  return Buffer.from(await videoRes.arrayBuffer());
}

export function replicateVideoAvailable(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}
