/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_67
 * Name: recursiveContextCompressor
 * Purpose: Compresses large token contexts recursively while preserving key information for deeper reasoning.
 * Description: A utility module for recursively compressing large text contexts while preserving key information for deeper reasoning.
 * Migrated: 2026-04-02T14:08:14.868Z
 */

// recursiveContextCompressor.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for a given string. Useful for caching or deduplication.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Scores sentences based on their importance using a simple heuristic: length and keyword density.
 * @param {string[]} sentences - Array of sentences to score.
 * @param {string[]} keywords - Array of keywords to prioritize.
 * @returns {Array<{ sentence: string, score: number }>} - Sentences paired with their scores.
 */
export function scoreSentences(sentences, keywords) {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
  return sentences.map(sentence => {
    const words = sentence.split(/\s+/);
    const keywordCount = words.filter(word => keywordSet.has(word.toLowerCase())).length;
    const score = keywordCount / words.length + Math.log(words.length + 1);
    return { sentence, score };
  });
}

/**
 * Summarizes text by selecting the most important sentences based on scores.
 * @param {string} text - The input text to summarize.
 * @param {string[]} keywords - Keywords to prioritize in the summarization.
 * @param {number} maxSentences - Maximum number of sentences in the summary.
 * @returns {string} - A compressed summary of the input text.
 */
export function summarizeText(text, keywords, maxSentences) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
  const scoredSentences = scoreSentences(sentences, keywords);
  scoredSentences.sort((a, b) => b.score - a.score);
  const summary = scoredSentences.slice(0, maxSentences).map(s => s.sentence).join(' ');
  return summary;
}

/**
 * Recursively compresses a large context by summarizing it in multiple hierarchical layers.
 * @param {string} context - The large input context to compress.
 * @param {string[]} keywords - Keywords to prioritize during compression.
 * @param {number} maxDepth - Maximum depth of recursive summarization.
 * @param {number} maxSentencesPerLayer - Maximum sentences per layer of summarization.
 * @returns {string} - The recursively compressed context.
 */
export function recursiveCompress(context, keywords, maxDepth, maxSentencesPerLayer) {
  if (maxDepth <= 0 || context.length === 0) return context;

  const summary = summarizeText(context, keywords, maxSentencesPerLayer);

  // If the summary is short enough, return it; otherwise, recurse.
  if (summary.length < context.length) {
    return recursiveCompress(summary, keywords, maxDepth - 1, maxSentencesPerLayer);
  }

  return summary;
}

/**
 * Utility to split a large text into manageable chunks for processing.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of text chunks.
 */
export function chunkText(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Compresses large contexts by processing them in chunks and applying recursive summarization.
 * @param {string} context - The large context to compress.
 * @param {string[]} keywords - Keywords to prioritize during compression.
 * @param {number} chunkSize - Size of each chunk for initial splitting.
 * @param {number} maxDepth - Maximum depth of recursive summarization.
 * @param {number} maxSentencesPerLayer - Maximum sentences per layer of summarization.
 * @returns {string} - The compressed context.
 */
export function compressLargeContext(context, keywords, chunkSize, maxDepth, maxSentencesPerLayer) {
  const chunks = chunkText(context, chunkSize);
  const compressedChunks = chunks.map(chunk => recursiveCompress(chunk, keywords, maxDepth, maxSentencesPerLayer));
  return compressedChunks.join(' ');
}