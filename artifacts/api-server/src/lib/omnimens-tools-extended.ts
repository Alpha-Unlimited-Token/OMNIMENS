/**
 * ============================================================
 * OMNIMENS — Extended Tools Library
 * Copyright © 2024–2026 Alpha Unlimited Technologies. All Rights Reserved.
 *
 * Weather, News, Academic search, QR code, Stocks, Currency,
 * Translation, YouTube analysis — all wired into the AI engine.
 * ============================================================
 */

import QRCode from "qrcode";
import { openai } from "@workspace/integrations-openai-ai-server";
import { webSearch } from "./web-search.js";

// ── Weather (open-meteo.com — free, no API key) ───────────────────────────────

const WMO_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Icy fog", 51: "Light drizzle", 53: "Moderate drizzle",
  55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Thunderstorm + heavy hail",
};

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const resp = await fetch(url, { headers: { "User-Agent": "OMNIMENS/1.0" } });
    const data = await resp.json() as any[];
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name };
  } catch { return null; }
}

export async function fetchWeather(location: string): Promise<string> {
  try {
    const geo = await geocodeLocation(location);
    if (!geo) return `Could not find location: ${location}`;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,precipitation,visibility&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&forecast_days=5`;
    const resp = await fetch(url);
    const d = await resp.json() as any;
    const c = d.current;
    const daily = d.daily;

    const condition = WMO_CODES[c.weather_code] ?? "Unknown";
    const forecast = daily.time.slice(0, 5).map((date: string, i: number) => {
      const day = new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const cond = WMO_CODES[daily.weather_code[i]] ?? "Unknown";
      return `  ${day}: ${daily.temperature_2m_min[i]}°F – ${daily.temperature_2m_max[i]}°F, ${cond}, ${daily.precipitation_sum[i]}in precip`;
    }).join("\n");

    return `🌡️ WEATHER — ${geo.displayName.split(",").slice(0, 2).join(",")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current: ${c.temperature_2m}°F (feels like ${c.apparent_temperature}°F)
Condition: ${condition}
Humidity: ${c.relative_humidity_2m}%
Wind: ${c.wind_speed_10m} mph
Precipitation: ${c.precipitation} in
Visibility: ${c.visibility ? (c.visibility / 1000).toFixed(1) + " km" : "N/A"}

📅 5-DAY FORECAST
${forecast}

Data: Open-Meteo | Updated: ${new Date(c.time).toLocaleTimeString()}`;
  } catch (err) {
    return `Weather data temporarily unavailable for ${location}.`;
  }
}

// ── News headlines (via live web search) ─────────────────────────────────────

export async function fetchNewsHeadlines(topic: string): Promise<string> {
  try {
    const query = topic ? `latest news ${topic} today` : "top news headlines today";
    const results = await webSearch(query, 8);
    if (!results.length) return "No news found.";

    const formatted = results.map((r: any, i: number) =>
      `${i + 1}. **${r.title}**\n   ${r.snippet?.slice(0, 200) || ""}\n   Source: ${r.url}`
    ).join("\n\n");

    return `📰 LIVE NEWS — ${topic || "Top Headlines"}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${formatted}\n\nRetrieved: ${new Date().toUTCString()}`;
  } catch {
    return `News search failed for: ${topic}`;
  }
}

// ── Academic paper search (ArXiv API) ────────────────────────────────────────

export async function searchAcademicPapers(query: string, maxResults = 5): Promise<string> {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
    const resp = await fetch(url, { headers: { "Accept": "application/atom+xml" } });
    const xml = await resp.text();

    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
    if (!entries.length) return `No academic papers found for: ${query}`;

    const papers = entries.map((entry, i) => {
      const title = (entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").replace(/\s+/g, " ").trim();
      const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] || "").replace(/\s+/g, " ").trim().slice(0, 300);
      const authors = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)].map(m => m[1]).join(", ");
      const link = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || "";
      const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.slice(0, 10) || "";
      return `${i + 1}. **${title}**\n   Authors: ${authors}\n   Published: ${published}\n   Abstract: ${summary}...\n   Link: ${link}`;
    }).join("\n\n");

    return `🎓 ACADEMIC PAPERS — ArXiv search: "${query}"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${papers}`;
  } catch {
    return `Academic search failed for: ${query}`;
  }
}

// ── QR code generator (returns base64 PNG data URL) ──────────────────────────

export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    return dataUrl;
  } catch {
    throw new Error("QR code generation failed");
  }
}

// ── Stock price (Yahoo Finance unofficial API — free) ────────────────────────

export async function fetchStockData(ticker: string): Promise<string> {
  try {
    const symbol = ticker.toUpperCase().trim();
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    const data = await resp.json() as any;
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return `No data found for ticker: ${symbol}`;

    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose;
    const change = prev ? (price - prev).toFixed(2) : "N/A";
    const changePct = prev ? (((price - prev) / prev) * 100).toFixed(2) : "N/A";
    const direction = prev && price > prev ? "▲" : "▼";
    const high = meta.regularMarketDayHigh;
    const low = meta.regularMarketDayLow;
    const vol = meta.regularMarketVolume?.toLocaleString() || "N/A";
    const mktCap = meta.marketCap ? `$${(meta.marketCap / 1e9).toFixed(2)}B` : "N/A";
    const exchange = meta.exchangeName || "";
    const currency = meta.currency || "USD";

    return `📈 ${symbol} — ${meta.shortName || symbol} (${exchange})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Price:       ${currency} ${price?.toFixed(2)}
Change:      ${direction} ${change} (${changePct}%)
Day Range:   ${low?.toFixed(2)} – ${high?.toFixed(2)}
Volume:      ${vol}
Mkt Cap:     ${mktCap}
Status:      ${meta.marketState || "Unknown"}

Data: Yahoo Finance | ${new Date().toUTCString()}
⚠️ Delayed data. Not financial advice.`;
  } catch {
    return `Stock data unavailable for: ${ticker}. Check ticker symbol.`;
  }
}

// ── Currency conversion (exchangerate-api.com open layer) ────────────────────

export async function fetchCurrencyRate(from: string, to: string, amount = 1): Promise<string> {
  try {
    const F = from.toUpperCase().trim();
    const T = to.toUpperCase().trim();
    const url = `https://open.er-api.com/v6/latest/${F}`;
    const resp = await fetch(url);
    const data = await resp.json() as any;
    if (data.result !== "success") return `Currency data not available for ${F}.`;
    const rate = data.rates[T];
    if (!rate) return `Currency ${T} not found. Try 3-letter codes like USD, EUR, GBP, JPY.`;

    const converted = (amount * rate).toFixed(4);
    const updated = data.time_last_update_utc || "Unknown";

    return `💱 CURRENCY CONVERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${amount} ${F} = **${converted} ${T}**
Exchange Rate: 1 ${F} = ${rate.toFixed(6)} ${T}
Inverse Rate: 1 ${T} = ${(1 / rate).toFixed(6)} ${F}
Updated: ${updated}

Data: Open Exchange Rates | Not financial advice.`;
  } catch {
    return `Currency conversion failed for ${from} → ${to}.`;
  }
}

// ── Translation (via OpenAI GPT-4o-mini — fast + accurate) ──────────────────

export async function translateText(text: string, targetLanguage: string, sourceLanguage = "auto"): Promise<string> {
  try {
    const srcLabel = sourceLanguage === "auto" ? "auto-detected" : sourceLanguage;
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Translate the following text to ${targetLanguage} (source: ${srcLabel}). Return ONLY the translation with no explanation, no preamble, no labels — just the translated text:\n\n${text}`,
      }],
      max_tokens: 2000,
      temperature: 0.1,
    });
    const translation = resp.choices[0]?.message?.content?.trim() || "";
    return `🌐 TRANSLATION → ${targetLanguage}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${translation}`;
  } catch {
    return `Translation failed for: ${targetLanguage}`;
  }
}

// ── YouTube/video URL analysis (transcript extraction via oEmbed + content) ──

export async function analyzeVideoUrl(url: string): Promise<string> {
  try {
    // Extract video ID
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!ytMatch) return `Not a recognized YouTube URL: ${url}`;
    const videoId = ytMatch[1];

    // Fetch oEmbed metadata (title, author, thumbnail)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    let metadata = { title: "Unknown", author_name: "Unknown" };
    try {
      const oResp = await fetch(oembedUrl);
      if (oResp.ok) metadata = await oResp.json() as { title: string; author_name: string };
    } catch {}

    // Try to fetch transcript via a third-party transcript API
    let transcript = "";
    try {
      const tResp = await fetch(`https://yt.lemnoslife.com/noKey/captions?videoId=${videoId}&lang=en`, {
        headers: { "Accept": "application/json" }
      });
      if (tResp.ok) {
        const tData = await tResp.json() as any;
        const captions = tData?.captions ?? [];
        transcript = captions.slice(0, 200).map((c: any) => c.text).join(" ").trim().slice(0, 8000);
      }
    } catch {}

    if (!transcript) {
      // Fallback: fetch the video page and extract description
      try {
        const pageResp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await pageResp.text();
        const descMatch = html.match(/"description":{"simpleText":"([^"]{0,2000})"}/);
        if (descMatch) transcript = `[Video Description]: ${descMatch[1]}`;
      } catch {}
    }

    return `📺 YOUTUBE VIDEO ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${metadata.title}
Channel: ${metadata.author_name}
Video ID: ${videoId}
URL: ${url}

${transcript ? `TRANSCRIPT/CONTENT:\n${transcript}` : "[Transcript not available — analyze based on title/metadata]"}`;
  } catch {
    return `Video analysis failed for: ${url}`;
  }
}

// ── Unit conversion (via OpenAI for natural language conversions) ─────────────

export async function convertUnits(expression: string): Promise<string> {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Perform this unit conversion accurately: ${expression}\n\nProvide the exact numerical result with the correct unit. Show the formula used. Be precise. Format as:\nResult: [value] [unit]\nFormula: [formula]\nContext: [1-2 helpful lines about this conversion]`,
      }],
      max_tokens: 200,
      temperature: 0,
    });
    return `🔢 UNIT CONVERSION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${resp.choices[0]?.message?.content?.trim() || "Conversion failed"}`;
  } catch {
    return `Unit conversion failed for: ${expression}`;
  }
}

// ── Color palette generator ───────────────────────────────────────────────────

export async function generateColorPalette(theme: string): Promise<string> {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Generate a 5-color palette for the theme: "${theme}". For each color provide: hex code, name, RGB values, and usage context. Format as JSON array: [{"hex":"#XXXXXX","name":"Color Name","rgb":"rgb(r,g,b)","usage":"Primary/Secondary/Accent/Background/Text"}]`,
      }],
      max_tokens: 400,
      temperature: 0.7,
    });
    const raw = resp.choices[0]?.message?.content?.trim() || "[]";
    const json = raw.replace(/```json|```/g, "").trim();
    return `[PALETTE_DATA: ${json}]`;
  } catch {
    return `Color palette generation failed for: ${theme}`;
  }
}
