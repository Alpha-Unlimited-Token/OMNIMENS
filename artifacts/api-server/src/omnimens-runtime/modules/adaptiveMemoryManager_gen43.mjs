/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveMemoryManager
 * Written: 2026-04-02T13:32:46.032Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveMemoryManager.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for summarization layers to ensure consistency.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a block of text hierarchically by importance scoring.
 * @param {string[]} blocks - Array of text blocks to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - A hierarchical summary of the input blocks.
 */
export function hierarchicalSummarization(blocks, maxLength) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  
  const importanceScores = blocks.map(block => ({
    block,
    score: importanceScoring(block)
  }));

  importanceScores.sort((a, b) => b.score - a.score);

  let summary = '';
  for (const { block } of importanceScores) {
    if ((summary + block).length > maxLength) break;
    summary += block + ' ';
  }

  return summary.trim();
}

/**
 * Scores the importance of a text block based on length and keyword density.
 * @param {string} text - The text block to score.
 * @returns {number} - The importance score of the text.
 */
export function importanceScoring(text) {
  if (typeof text !== 'string' || text.length === 0) return 0;

  const keywords = ['critical', 'important', 'key', 'priority'];
  const words = text.toLowerCase().split(/\s+/);

  const keywordCount = words.filter(word => keywords.includes(word)).length;
  const lengthScore = Math.min(text.length / 100, 1); // Normalize length score to [0, 1]

  return keywordCount * 2 + lengthScore; // Weight keywords higher
}

/**
 * Compresses text recursively to fit within a token limit.
 * @param {string} text - The text to compress.
 * @param {number} tokenLimit - The maximum number of tokens allowed.
 * @returns {string} - The compressed text.
 */
export function recursiveCompression(text, tokenLimit) {
  if (typeof text !== 'string' || text.length <= tokenLimit) return text;

  const blocks = text.match(/.{1,200}/g) || []; // Split text into chunks of 200 chars
  const summary = hierarchicalSummarization(blocks, tokenLimit);

  return summary.length > tokenLimit ? recursiveCompression(summary, tokenLimit) : summary;
}

/**
 * Dynamically prioritizes context based on scoring and token constraints.
 * @param {string[]} contexts - Array of context strings.
 * @param {number} maxTokens - Maximum tokens allowed for combined context.
 * @returns {string} - Prioritized and concatenated context.
 */
export function dynamicContextPrioritization(contexts, maxTokens) {
  if (!Array.isArray(contexts) || contexts.length === 0) return '';

  const scoredContexts = contexts.map(context => ({
    context,
    score: importanceScoring(context)
  }));

  scoredContexts.sort((a, b) => b.score - a.score);

  let combinedContext = '';
  for (const { context } of scoredContexts) {
    if ((combinedContext + context).length > maxTokens) break;
    combinedContext += context + ' ';
  }

  return combinedContext.trim();
}

/**
 * Utility function to tokenize text into an array of words.
 * @param {string} text - The text to tokenize.
 * @returns {string[]} - Array of tokens (words).
 */
export function tokenize(text) {
  if (typeof text !== 'string') return [];
  return text.split(/\s+/).filter(token => token.length > 0);
}

/**
 * Utility function to count tokens in a text.
 * @param {string} text - The text to count tokens for.
 * @returns {number} - The number of tokens.
 */
export function countTokens(text) {
  return tokenize(text).length;
}
