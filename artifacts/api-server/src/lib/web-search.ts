/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Web Search — Internet access layer
 *
 * Uses DuckDuckGo (free, no API key) for fast factual searches.
 * Uses open Wikipedia API for deep knowledge lookups.
 * Falls back to raw URL fetching for specific pages.
 * Requires no third-party keys — works in production.
 */

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

const FETCH_TIMEOUT_MS = 12_000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function duckduckgoSearch(query: string, maxResults = 6): Promise<SearchResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `q=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`DuckDuckGo search error: ${res.status}`);
  const html = await res.text();

  const results: SearchResult[] = [];

  const linkRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  const links: { url: string; title: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(html)) !== null) {
    const rawUrl = m[1];
    const title = m[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim();
    let cleanUrl = rawUrl;
    const udMatch = rawUrl.match(/uddg=([^&]+)/);
    if (udMatch) cleanUrl = decodeURIComponent(udMatch[1]);
    links.push({ url: cleanUrl, title });
  }

  const snippets: string[] = [];
  while ((m = snippetRegex.exec(html)) !== null) {
    snippets.push(m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').trim());
  }

  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    const snippet = snippets[i] || links[i].title;
    if (snippet.length > 10) {
      results.push({
        title: links[i].title,
        snippet,
        url: links[i].url,
        source: "DuckDuckGo",
      });
    }
  }

  return results;
}

async function wikipediaSearch(query: string, maxResults = 4): Promise<SearchResult[]> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${maxResults}&format=json&origin=*`;
  const res = await fetchWithTimeout(searchUrl, {
    headers: { "User-Agent": "OMNIMENS-AI/1.0 (omnimens.app)" },
  });
  if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
  const data: any = await res.json();
  const items: any[] = data?.query?.search || [];

  return items.map((item) => ({
    title: item.title || query,
    snippet: (item.snippet || item.title || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim(),
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
    source: "Wikipedia",
  }));
}

// Fetch and extract readable text from a URL
export async function fetchPageContent(url: string, maxChars = 3000): Promise<string> {
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "OMNIMENS-AI/1.0 (omnimens.app)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return `[Could not fetch: HTTP ${res.status}]`;
    const html = await res.text();
    // Strip HTML tags, scripts, styles
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
    return text.slice(0, maxChars);
  } catch (err: any) {
    return `[Fetch error: ${err?.message || String(err)}]`;
  }
}

// Main search function — combines multiple sources
export async function webSearch(query: string, maxResults = 8): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const add = (r: SearchResult) => {
    if (!seen.has(r.url) && r.snippet.length > 10) {
      seen.add(r.url);
      results.push(r);
    }
  };

  // Run DuckDuckGo + Wikipedia in parallel
  const [ddg, wiki] = await Promise.allSettled([
    duckduckgoSearch(query, maxResults),
    wikipediaSearch(query, 3),
  ]);

  if (ddg.status === "fulfilled") ddg.value.forEach(add);
  if (wiki.status === "fulfilled") wiki.value.forEach(add);

  return results.slice(0, maxResults);
}

// Format search results as a concise context string for GPT
export function formatSearchResults(results: SearchResult[], query: string): string {
  if (results.length === 0) return `[No search results found for: "${query}"]`;
  const lines = results.map((r, i) =>
    `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url ? `Source: ${r.url}` : ""}`.trim()
  );
  return `SEARCH RESULTS FOR: "${query}"\n\n${lines.join("\n\n")}`;
}
