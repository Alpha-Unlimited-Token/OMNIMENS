// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Replicate — AI video generation via Minimax video-01-live (fast, high quality).

const REPLICATE_API = "https://api.replicate.com/v1";
const VIDEO_MODEL = "minimax/video-01-live";
const POLL_INTERVAL = 3000;
const MAX_POLLS = 120;

export async function generateVideoWithReplicate(
  prompt: string
): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN not configured");

  const startRes = await fetch(`${REPLICATE_API}/models/${VIDEO_MODEL}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        prompt: prompt.slice(0, 2000),
        prompt_optimizer: true,
      },
    }),
  });

  if (!startRes.ok) {
    const err = await startRes.text();
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
