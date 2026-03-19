/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS URL Analyzer
 * Fetches web page content and makes it available for analysis.
 * Like Perplexity's "focus on URL" and Claude's URL attachment feature.
 */

const MAX_CONTENT_CHARS = 12_000;

export interface UrlContent {
  url: string;
  title: string;
  text: string;
  wordCount: number;
  error?: string;
}

function extractTextFromHtml(html: string): { title: string; text: string } {
  // Remove script/style/nav/header/footer blocks
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, "\n\n")
    .trim();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "Untitled";

  return { title, text: clean.slice(0, MAX_CONTENT_CHARS) };
}

export async function fetchUrlContent(url: string): Promise<UrlContent> {
  try {
    // Validate URL
    new URL(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OMNIMENS/1.0; +https://omnimens.ai)",
        "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        url,
        title: "Error",
        text: "",
        wordCount: 0,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();

    let title = "Untitled";
    let text = "";

    if (contentType.includes("text/html")) {
      ({ title, text } = extractTextFromHtml(raw));
    } else if (contentType.includes("application/json")) {
      text = JSON.stringify(JSON.parse(raw), null, 2).slice(0, MAX_CONTENT_CHARS);
      title = url;
    } else {
      text = raw.slice(0, MAX_CONTENT_CHARS);
      title = url;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return { url, title, text, wordCount };
  } catch (err: any) {
    return {
      url,
      title: "Error",
      text: "",
      wordCount: 0,
      error: err.message || "Failed to fetch URL",
    };
  }
}

/**
 * Detect URLs in a user message.
 * Returns a list of URLs that should be fetched and analyzed.
 */
export function extractUrls(message: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"']+/gi;
  const matches = message.match(urlRegex) || [];
  return [...new Set(matches)].slice(0, 3); // max 3 URLs per message
}

export function formatUrlContent(content: UrlContent): string {
  if (content.error) {
    return `[URL: ${content.url}]\nError: ${content.error}\n`;
  }
  return `[WEB PAGE: "${content.title}"]\nURL: ${content.url}\nWords: ${content.wordCount}\n\n${content.text}\n`;
}
