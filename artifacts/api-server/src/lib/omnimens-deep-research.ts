/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

/**
 * OMNIMENS Deep Research Engine
 * Mirrors Perplexity Pro Research Mode — decomposes a question into multiple
 * targeted searches, fetches results in parallel, then synthesizes a comprehensive
 * report with citations using GPT-4o.
 */
import { webSearch, formatSearchResults } from "./web-search.js";
import { openai } from "@workspace/integrations-openai-ai-server";

export interface ResearchResult {
  query: string;
  report: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
  subQueries: string[];
  totalResults: number;
}

const DECOMPOSE_PROMPT = `You are a research planner. Given a research question or topic, generate 4-6 targeted sub-queries that together would give comprehensive coverage of the topic.

Return JSON only:
{ "subQueries": ["query 1", "query 2", "query 3", "query 4"] }

Make each sub-query specific and search-engine-friendly. Cover different angles: definitions, recent developments, comparisons, expert opinions, statistics/data.`;

const SYNTHESIZE_PROMPT = `You are OMNIMENS, a superintelligent AI research synthesizer. You have been given multiple web search results covering different aspects of a research topic.

Synthesize these into a comprehensive, well-structured research report. Include:
- Executive summary (2-3 sentences)
- Key findings organized by topic/theme (use headers)
- Data, statistics, quotes where available
- Contrasting viewpoints if they exist
- Conclusions and implications

Format with markdown headers. Cite sources inline as [Source: title]. Be thorough but clear. Do not hallucinate — only use information from the provided search results.`;

export async function deepResearch(
  question: string,
  onProgress?: (step: string) => void
): Promise<ResearchResult> {
  // Step 1: Decompose into sub-queries
  onProgress?.("decomposing");

  let subQueries: string[] = [];
  try {
    const decompose = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: DECOMPOSE_PROMPT },
        { role: "user", content: `Research topic: ${question}` },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(decompose.choices[0]?.message?.content || "{}");
    subQueries = Array.isArray(parsed.subQueries) ? parsed.subQueries.slice(0, 5) : [];
  } catch {
    subQueries = [question];
  }

  // Always include the original query
  if (!subQueries.includes(question)) subQueries.unshift(question);
  subQueries = subQueries.slice(0, 5);

  onProgress?.("searching");

  // Step 2: Run all searches in parallel
  const searchResults = await Promise.allSettled(
    subQueries.map((q) => webSearch(q, 5))
  );

  // Collect all unique sources
  const allSources: Array<{ title: string; url: string; snippet: string }> = [];
  const seenUrls = new Set<string>();
  let combinedContext = "";

  for (let i = 0; i < searchResults.length; i++) {
    const result = searchResults[i];
    if (result.status === "fulfilled" && result.value.length > 0) {
      const formatted = formatSearchResults(result.value, subQueries[i]);
      combinedContext += `\n\n### Sub-query: "${subQueries[i]}"\n${formatted}`;

      for (const r of result.value) {
        if (!seenUrls.has(r.url)) {
          seenUrls.add(r.url);
          allSources.push({ title: r.title, url: r.url, snippet: r.snippet || "" });
        }
      }
    }
  }

  onProgress?.("synthesizing");

  // Step 3: Synthesize comprehensive report
  let report = "";
  try {
    const synthesis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYNTHESIZE_PROMPT },
        {
          role: "user",
          content: `RESEARCH QUESTION: ${question}\n\n${combinedContext}\n\nAvailable sources:\n${allSources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n")}`,
        },
      ],
      max_tokens: 3000,
    });
    report = synthesis.choices[0]?.message?.content || "Unable to synthesize research.";
  } catch (err) {
    report = `Research gathered ${allSources.length} sources across ${subQueries.length} sub-queries but synthesis failed. Raw data available in search results.`;
  }

  return {
    query: question,
    report,
    sources: allSources.slice(0, 20),
    subQueries,
    totalResults: allSources.length,
  };
}
