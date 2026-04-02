/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextSummarizer
 * Written: 2026-04-02T14:10:20.492Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextSummarizer.mjs

import crypto from 'crypto';

/**
 * Splits a large context into manageable chunks for processing.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Scores sentences based on importance using a simple hashing heuristic.
 * @param {string[]} sentences - Array of sentences to score.
 * @returns {Array<{ sentence, score}>} - Sentences with scores.
 */
export function scoreSentences(sentences) {
  return sentences.map(sentence => ({
    sentence,
    score: crypto.createHash('sha256').update(sentence).digest('hex').split('').reduce((sum, char) => sum + parseInt(char, 16), 0)
  }));
}

/**
 * Summarizes a chunk of text by selecting the most important sentences.
 * @param {string} text - The input text to summarize.
 * @param {number} summarySize - The number of sentences to include in the summary.
 * @returns {string} - A summarized version of the text.
 */
export function summarizeChunk(text, summarySize) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
  const scored = scoreSentences(sentences);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, summarySize).map(item => item.sentence).join(' ');
}

/**
 * Recursively summarizes large contexts until they fit within the token limit.
 * @param {string} text - The input text to process.
 * @param {number} tokenLimit - The maximum token size for the final summary.
 * @param {number} chunkSize - The size of chunks to process at each level.
 * @param {number} summarySize - The number of sentences to include in each chunk summary.
 * @returns {string} - A recursively summarized version of the text.
 */
export function recursiveSummarize(text, tokenLimit, chunkSize, summarySize) {
  let currentText = text;

  while (currentText.length > tokenLimit) {
    const chunks = splitIntoChunks(currentText, chunkSize);
    const summaries = chunks.map(chunk => summarizeChunk(chunk, summarySize));
    currentText = summaries.join(' ');
  }

  return currentText;
}

/**
 * Utility to count tokens (approximation based on word count).
 * @param {string} text - The input text to analyze.
 * @returns {number} - Approximate token count.
 */
export function countTokens(text) {
  return text.split(/\s+/).length;
}

/**
 * Main function to process and summarize large contexts.
 * @param {string} context - The input context to process.
 * @param {number} tokenLimit - The maximum token size for the final summary.
 * @param {number} chunkSize - The size of chunks to process at each level.
 * @param {number} summarySize - The number of sentences to include in each chunk summary.
 * @returns {string} - The final summarized context.
 */
export function processLargeContext(context, tokenLimit = 1000, chunkSize = 5000, summarySize = 5) {
  if (countTokens(context) <= tokenLimit) {
    return context;
  }
  return recursiveSummarize(context, tokenLimit, chunkSize, summarySize);
}
