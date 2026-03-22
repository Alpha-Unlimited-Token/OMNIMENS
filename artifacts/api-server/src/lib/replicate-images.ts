// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Replicate — image generation via Flux 1.1 Pro Ultra (highest quality photorealistic)
// and Flux 1.1 Pro standard. Supports aspect ratios, styles, and quality tiers.

const REPLICATE_API = "https://api.replicate.com/v1";
const FLUX_MODEL_PRO = "black-forest-labs/flux-1.1-pro";
const FLUX_MODEL_ULTRA = "black-forest-labs/flux-1.1-pro-ultra";
const POLL_INTERVAL = 2000;
const MAX_POLLS = 90;

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";
export type ImageQualityTier = "standard" | "hd" | "ultra";
export type ImageStyle = "auto" | "photorealistic" | "illustration" | "anime" | "oil-painting" | "watercolor" | "3d-render" | "pixel-art" | "cinematic" | "sketch" | "pop-art" | "fantasy" | "minimalist" | "neon" | "vintage";

const STYLE_PREFIXES: Record<ImageStyle, string> = {
  auto: "",
  photorealistic: "Ultra-photorealistic photograph, DSLR quality, natural lighting, sharp focus, 8K resolution. ",
  illustration: "Professional digital illustration, clean lines, vibrant colors, detailed artwork. ",
  anime: "High-quality anime art style, detailed anime illustration, vibrant colors, expressive characters. ",
  "oil-painting": "Classical oil painting style, rich textures, visible brushstrokes, masterful composition, gallery quality. ",
  watercolor: "Delicate watercolor painting, soft blending, translucent washes, artistic paper texture. ",
  "3d-render": "Professional 3D render, Octane render quality, volumetric lighting, photorealistic materials, studio lighting. ",
  "pixel-art": "Detailed pixel art, retro gaming aesthetic, carefully placed pixels, vibrant palette. ",
  cinematic: "Cinematic film still, anamorphic lens, dramatic lighting, color graded, movie quality, shallow depth of field. ",
  sketch: "Professional pencil sketch, detailed linework, cross-hatching, artistic shading, paper texture. ",
  "pop-art": "Bold pop art style, flat colors, halftone dots, graphic design inspired, Andy Warhol influenced. ",
  fantasy: "Epic fantasy art, magical atmosphere, ethereal lighting, intricate details, concept art quality. ",
  minimalist: "Clean minimalist design, simple shapes, negative space, modern aesthetic, elegant composition. ",
  neon: "Neon-lit cyberpunk aesthetic, glowing colors, dark background, futuristic, synthwave atmosphere. ",
  vintage: "Vintage retro style, film grain, muted colors, nostalgic aesthetic, analog photography look. ",
};

const ASPECT_RATIO_DIMENSIONS: Record<ImageAspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1216, height: 896 },
  "3:4": { width: 896, height: 1216 },
  "3:2": { width: 1216, height: 832 },
  "2:3": { width: 832, height: 1216 },
};

export interface ImageGenOptions {
  prompt: string;
  aspectRatio?: ImageAspectRatio;
  quality?: ImageQualityTier;
  style?: ImageStyle;
  negativePrompt?: string;
}

export async function generateImageWithReplicate(
  promptOrOptions: string | ImageGenOptions
): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not configured");

  const opts: ImageGenOptions = typeof promptOrOptions === "string"
    ? { prompt: promptOrOptions }
    : promptOrOptions;

  const aspectRatio = opts.aspectRatio || "1:1";
  const quality = opts.quality || "standard";
  const style = opts.style || "auto";
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio] || ASPECT_RATIO_DIMENSIONS["1:1"];

  const stylePrefix = STYLE_PREFIXES[style] || "";
  const enhancedPrompt = `${stylePrefix}${opts.prompt}${opts.negativePrompt ? `. Avoid: ${opts.negativePrompt}` : ""}`;

  const useUltra = quality === "ultra";
  const model = useUltra ? FLUX_MODEL_ULTRA : FLUX_MODEL_PRO;

  const input: Record<string, any> = {
    prompt: enhancedPrompt.slice(0, 2000),
    output_format: "png",
    safety_tolerance: 2,
    prompt_upsampling: true,
  };

  if (useUltra) {
    input.aspect_ratio = aspectRatio;
    input.raw = false;
  } else {
    input.width = dims.width;
    input.height = dims.height;
    input.output_quality = quality === "hd" ? 95 : 90;
  }

  const startRes = await fetch(`${REPLICATE_API}/models/${model}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=5",
    },
    body: JSON.stringify({ input }),
  });

  if (!startRes.ok) {
    if (useUltra) {
      return generateImageWithReplicate({ ...opts, quality: "hd" });
    }
    const err = await startRes.text();
    throw new Error(`Replicate prediction failed to start: ${err}`);
  }

  let prediction = await startRes.json() as {
    id: string;
    status: string;
    urls?: { get?: string };
    output?: string | string[];
    error?: string;
  };

  let polls = 0;
  while (prediction.status !== "succeeded" && prediction.status !== "failed" && polls < MAX_POLLS) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const pollRes = await fetch(`${REPLICATE_API}/predictions/${prediction.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    prediction = await pollRes.json() as typeof prediction;
    polls++;
  }

  if (prediction.status === "failed") {
    if (useUltra) {
      return generateImageWithReplicate({ ...opts, quality: "hd" });
    }
    throw new Error(`Replicate image generation failed: ${prediction.error || "unknown error"}`);
  }
  if (prediction.status !== "succeeded" || !prediction.output) {
    throw new Error("Replicate image generation timed out");
  }

  const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to download Replicate image");
  return Buffer.from(await imgRes.arrayBuffer());
}

export function replicateAvailable(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}
