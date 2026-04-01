/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. 
 * All Rights Reserved. Unauthorized use prohibited.
 *
 * OMNIMENS URL Analyzer — v2.0 (spike-driven, unified runtime)
 */

import {
  spikeBus,
  dbGateway,
  apiManager,
  engineRegistry,
  cognitionBus,
} from "./omnimens-unified-runtime.js";

const MAX_CONTENT_CHARS = 12_000;
const ENGINE_ID = "url-analyzer";
type Vendor = "http-get";

export interface UrlContent {
  url: string;
  title: string;
  text: string;
  wordCount: number;
  error?: string;
}

/* ---------- Engine Registration ---------- */
engineRegistry.registerEngine(ENGINE_ID, "NORMAL", { dbQuota: 10 });

export function shutdown() {
  engineRegistry.unregisterEngine(ENGINE_ID);
}

/* ---------- HTML → Text ---------- */
const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
};
const ENT_RE = new RegExp(`&(${Object.keys(ENTITIES).join("|")});`, "g");

function extractTextFromHtml(html: string): { title: string; text: string } {
  const strip = (s: string) =>
    s
      .replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(ENT_RE, (_, e) => ENTITIES[e] || " ")
      .replace(/\s{3,}/g, "\n\n")
      .trim()
      .slice(0, MAX_CONTENT_CHARS);

  const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "Untitled")
    .trim();

  return { title, text: strip(html) };
}

/* ---------- Core Fetch ---------- */
export async function fetchUrlContent(url: string): Promise<UrlContent> {
  try {
    new URL(url); // throws if malformed

    const { ok, status, statusText, headers, body } = await apiManager.call(
      ENGINE_ID,
      "http-get" as Vendor,
      {
        url,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; OMNIMENS/1.0; +https://omnimens.ai)",
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
        },
      }
    );

    if (!ok) {
      return { url, title: "Error", text: "", wordCount: 0, error: `HTTP ${status}: ${statusText}` };
    }

    const raw = typeof body === "string" ? body : String(body);
    const type = (headers?.get?.("content-type") ?? "") as string;

    let title = url;
    let text = raw.slice(0, MAX_CONTENT_CHARS);

    if (type.includes("text/html")) ({ title, text } = extractTextFromHtml(raw));
    else if (type.includes("application/json"))
      text = JSON.stringify(JSON.parse(raw), null, 2).slice(0, MAX_CONTENT_CHARS);

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const doc = { url, title, text, wordCount };

    dbGateway.write(ENGINE_ID, "url_cache", doc, "NORMAL").catch(() => {});
    cognitionBus.shareInsight(ENGINE_ID, { type: "url_fetched", data: { url, wordCount } });

    return doc;
  } catch (err: any) {
    return { url, title: "Error", text: "", wordCount: 0, error: err.message || "Fetch failed" };
  }
}

/* ---------- Utilities ---------- */
export const extractUrls = (msg: string): string[] =>
  Array.from(new Set(msg.match(/https?:\/\/[^\s<>"']+/gi) || [])).slice(0, 3);

export const formatUrlContent = (c: UrlContent): string =>
  c.error
    ? `[URL: ${c.url}]\nError: ${c.error}\n`
    : `[WEB PAGE: "${c.title}"]\nURL: ${c.url}\nWords: ${c.wordCount}\n\n${c.text}\n`;

/* ---------- Cognitive Hooks ---------- */
cognitionBus.onInsight((_src, insight) => {
  if (insight.type === "discovery" && insight.data?.relatedUrls) {
    (insight.data.relatedUrls as string[]).forEach((u) =>
      spikeBus.scheduleSpike(`${ENGINE_ID}:fetch`, { url: u }, 0)
    );
  }
});

/* ---------- Spike Processing ---------- */
const cycle = `${ENGINE_ID}:cycle`;
spikeBus.on(cycle, async () => {
  // Simple periodic sanity check / cache flush placeholder
  await dbGateway.flush?.(ENGINE_ID).catch(() => {});
  spikeBus.scheduleSpike(cycle, {}, 60_000);
});
spikeBus.scheduleSpike(cycle, {}, 60_000);

spikeBus.on(`${ENGINE_ID}:fetch`, async ({ url }) => {
  if (typeof url === "string") await fetchUrlContent(url);
});

spikeBus.on(`attention:${ENGINE_ID}`, () => spikeBus.scheduleSpike(cycle, {}, 0));
spikeBus.on("cognition:curiosity", () => spikeBus.scheduleSpike(cycle, {}, 5_000));

/* ---------- Structured Logging ---------- */
const log = (...args: any[]) =>
  console.log("[OMNIMENS-URL-ANALYZER]", ...args);

log("Engine initialized, spike-driven and ready.");