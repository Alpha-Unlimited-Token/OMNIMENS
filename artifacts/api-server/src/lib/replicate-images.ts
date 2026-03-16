// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Replicate — image generation via Flux 1.1 Pro (faster, higher quality than DALL-E for photos).
// Used as the image backend when Together AI models are active, or as a general alternative.

const REPLICATE_API = "https://api.replicate.com/v1";
const FLUX_MODEL    = "black-forest-labs/flux-1.1-pro";
const POLL_INTERVAL = 2000;  // ms between status checks
const MAX_POLLS     = 60;    // 2 min timeout

export async function generateImageWithReplicate(prompt: string): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not configured");

  // 1. Start the prediction
  const startRes = await fetch(`${REPLICATE_API}/models/${FLUX_MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=5",  // short-poll: Replicate returns immediately if done in 5s
    },
    body: JSON.stringify({
      input: {
        prompt,
        width: 1024,
        height: 1024,
        output_format: "png",
        output_quality: 90,
        safety_tolerance: 2,
        prompt_upsampling: true,
      },
    }),
  });

  if (!startRes.ok) {
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

  // 2. Poll until completed (if not already done via Prefer: wait)
  let polls = 0;
  while (prediction.status !== "succeeded" && prediction.status !== "failed" && polls < MAX_POLLS) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const pollRes = await fetch(`${REPLICATE_API}/predictions/${prediction.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    prediction = await pollRes.json();
    polls++;
  }

  if (prediction.status === "failed") {
    throw new Error(`Replicate image generation failed: ${prediction.error || "unknown error"}`);
  }
  if (prediction.status !== "succeeded" || !prediction.output) {
    throw new Error("Replicate image generation timed out");
  }

  // 3. Download the image from the output URL
  const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to download Replicate image");
  return Buffer.from(await imgRes.arrayBuffer());
}

export function replicateAvailable(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}
