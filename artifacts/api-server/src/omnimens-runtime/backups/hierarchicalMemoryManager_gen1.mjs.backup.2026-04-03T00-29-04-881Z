/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T16:33:07.564Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input string to uniquely identify contexts.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateContextHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes a large text input into a shorter version using hierarchical summarization.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - The maximum length of the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, maxLength) {
  if (text.length <= maxLength) return text; // No summarization needed.

  const sentences = text.split('. ');
  const importanceScores = sentences.map((sentence, index) => ({
    index,
    score: sentence.length / text.length // Simple length-based scoring.
  }));

  importanceScores.sort((a, b) => b.score - a.score);

  const selectedSentences = [];
  let currentLength = 0;

  for (const { index } of importanceScores) {
    const sentence = sentences[index];
    if (currentLength + sentence.length <= maxLength) {
      selectedSentences.push(sentence);
      currentLength += sentence.length;
    }
    if (currentLength >= maxLength) break;
  }

  return selectedSentences.join('. ') + '.';
}

/**
 * Recursively summarizes large contexts into manageable chunks.
 * @param {string[]} contexts - Array of text contexts.
 * @param {number} maxLength - Maximum token length for each summary.
 * @returns {string[]} - Array of summarized contexts.
 */
export function recursiveSummarization(contexts, maxLength) {
  if (contexts.length === 1 && contexts[0].length <= maxLength) return contexts;

  const summaries = contexts.map(context => summarizeText(context, maxLength));
  const concatenated = summaries.join(' ');

  if (concatenated.length <= maxLength) return [concatenated];

  return recursiveSummarization([concatenated], maxLength);
}

/**
 * Dynamically reinjects relevant context into a given input based on importance.
 * @param {string} input - The input text requiring additional context.
 * @param {string[]} contexts - Array of available contexts.
 * @param {number} maxLength - Maximum token length for reinjected context.
 * @returns {string} - Input text with reinjected context.
 */
export function reinjectContext(input, contexts, maxLength) {
  const relevantContexts = contexts.filter(context => {
    return context.includes(input.split(' ')[0]); // Simple relevance check based on first word.
  });

  const summarizedContexts = recursiveSummarization(relevantContexts, maxLength);

  return summarizedContexts.join(' ') + ' ' + input;
}

/**
 * Manages hierarchical memory by summarizing, storing, and reinjecting contexts.
 * @param {string[]} contexts - Array of text contexts to manage.
 * @param {string} input - The input text requiring memory management.
 * @param {number} maxLength - Maximum token length for context windows.
 * @returns {string} - Processed input with managed memory.
 */
export function hierarchicalMemoryManager(contexts, input, maxLength) {
  const summarizedContexts = recursiveSummarization(contexts, maxLength);
  return reinjectContext(input, summarizedContexts, maxLength);
}

/**
 * Utility function to split a large text into smaller chunks.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {string[]} - Array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}