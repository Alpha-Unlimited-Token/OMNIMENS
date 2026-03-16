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

// DuckDuckGo Instant Answer API — free, no key, returns structured data
async function duckduckgoSearch(query: string, maxResults = 6): Promise<SearchResult[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetchWithTimeout(url, {
    headers: { "User-Agent": "OMNIMENS-AI/1.0 (omnimens.app)" },
  });
  if (!res.ok) throw new Error(`DuckDuckGo API error: ${res.status}`);
  const data: any = await res.json();

  const results: SearchResult[] = [];

  if (data.AbstractText) {
    results.push({
      title: data.Heading || query,
      snippet: data.AbstractText,
      url: data.AbstractURL || data.AbstractSource || "",
      source: "DuckDuckGo Abstract",
    });
  }

  const topics: any[] = data.RelatedTopics || [];
  for (const t of topics) {
    if (results.length >= maxResults) break;
    if (t.Text && t.FirstURL) {
      results.push({
        title: t.Text.split(" - ")[0]?.slice(0, 80) || query,
        snippet: t.Text,
        url: t.FirstURL,
        source: "DuckDuckGo",
      });
    }
    if (t.Topics) {
      for (const sub of t.Topics) {
        if (results.length >= maxResults) break;
        if (sub.Text && sub.FirstURL) {
          results.push({
            title: sub.Text.split(" - ")[0]?.slice(0, 80) || query,
            snippet: sub.Text,
            url: sub.FirstURL,
            source: "DuckDuckGo",
          });
        }
      }
    }
  }

  if (data.Results) {
    for (const r of data.Results) {
      if (results.length >= maxResults) break;
      results.push({
        title: r.Text || query,
        snippet: r.Text || "",
        url: r.FirstURL || "",
        source: "DuckDuckGo Result",
      });
    }
  }

  return results;
}

// Wikipedia OpenSearch — free, finds current encyclopedia articles
async function wikipediaSearch(query: string, maxResults = 4): Promise<SearchResult[]> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${maxResults}&format=json&origin=*`;
  const res = await fetchWithTimeout(searchUrl, {
    headers: { "User-Agent": "OMNIMENS-AI/1.0 (omnimens.app)" },
  });
  if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
  const [, titles, descriptions, urls]: [string, string[], string[], string[]] = await res.json() as [string, string[], string[], string[]];

  return titles.map((title, i) => ({
    title,
    snippet: descriptions[i] || title,
    url: urls[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
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
