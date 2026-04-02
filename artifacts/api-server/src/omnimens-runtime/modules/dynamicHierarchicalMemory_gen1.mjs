/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_43
 * Name: dynamicHierarchicalMemory
 * Purpose: Processes large contexts incrementally by dynamically summarizing and retrieving relevant information.
 * Description: Processes large contexts incrementally with hierarchical summarization, sliding windows, and relevance-based retrieval.
 * Migrated: 2026-04-02T14:21:19.465Z
 */

// dynamicHierarchicalMemory.mjs

import crypto from 'crypto';

// Utility function to create a hash for summarization keys
export function createHashKey(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Function to summarize a chunk of text dynamically
export function summarizeText(text, maxLength = 200) {
  if (text.length <= maxLength) return text;

  const sentences = text.split('. ');
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) break;
    summary += sentence + '. ';
  }

  return summary.trim();
}

// Function to calculate importance score of a segment
export function calculateImportanceScore(segment, keywords = []) {
  const lowerSegment = segment.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    const occurrences = (lowerSegment.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    score += occurrences;
  }

  return score;
}

// Sliding window summarization with hierarchical memory
export function processLargeContext(context, windowSize = 500, overlap = 100, keywords = []) {
  const summaries = [];
  let start = 0;

  while (start < context.length) {
    const end = Math.min(start + windowSize, context.length);
    const chunk = context.slice(start, end);

    // Summarize the chunk
    const summary = summarizeText(chunk);

    // Calculate importance score
    const score = calculateImportanceScore(chunk, keywords);

    summaries.push({
      hashKey: createHashKey(chunk),
      summary,
      score
    });

    start += windowSize - overlap;
  }

  // Sort summaries by importance score in descending order
  summaries.sort((a, b) => b.score - a.score);

  return summaries;
}

// Retrieve the most relevant summaries based on a query
export function retrieveRelevantSummaries(summaries, query, topN = 3) {
  const queryKeywords = query.toLowerCase().split(' ');

  return summaries
    .map(summary => ({
      ...summary,
      relevance: calculateImportanceScore(summary.summary, queryKeywords)
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, topN);
}

// Example usage function (not exported)
function exampleUsage() {
  const context = "This is a long text that needs to be processed. It contains multiple sentences and important keywords like AI, machine learning, and transformers. The goal is to dynamically summarize and rank the content based on relevance to a query.";
  const query = "AI transformers";

  const summaries = processLargeContext(context, 50, 10, ['AI', 'transformers']);
  const relevantSummaries = retrieveRelevantSummaries(summaries, query);

  console.log(relevantSummaries);
}

// Uncomment to test example usage
// exampleUsage();