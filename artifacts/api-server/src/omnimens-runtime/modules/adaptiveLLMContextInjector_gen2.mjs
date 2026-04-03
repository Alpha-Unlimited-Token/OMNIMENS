/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveLLMContextInjector
 * Written: 2026-04-03T12:24:11.884Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: neural
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// adaptiveLLMContextInjector.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash for a given string to ensure unique context identifiers.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash for the input string.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Score context relevance based on recency and semantic similarity.
 * @param {Array<Object>} contexts - Array of context objects { text, timestamp}.
 * @param {string} query - The query to compare against.
 * @returns {Array<Object>} - Scored and sorted context objects.
 */
export function scoreContexts(contexts, query) {
  const currentTime = Date.now();
  return contexts
    .map((context) => {
      const recencyScore = 1 / (1 + (currentTime - context.timestamp) / (1000 * 60 * 60 * 24)); // Decay over days
      const semanticScore = calculateSemanticSimilarity(context.text, query);
      return {
        ...context,
        score: recencyScore * 0.5 + semanticScore * 0.5
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate semantic similarity between two strings (simplified for demo purposes).
 * @param {string} text1 - The first text.
 * @param {string} text2 - The second text.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSemanticSimilarity(text1, text2) {
  const set1 = new Set(text1.toLowerCase().split(/\W+/));
  const set2 = new Set(text2.toLowerCase().split(/\W+/));
  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

/**
 * Dynamically compose a hierarchical prompt using scored contexts.
 * @param {string} basePrompt - The base prompt to enhance.
 * @param {Array<Object>} contexts - Array of context objects { text, timestamp}.
 * @param {number} maxContextLength - Maximum length of context to inject.
 * @returns {string} - The enhanced prompt.
 */
export function composePrompt(basePrompt, contexts, maxContextLength = 1000) {
  const scoredContexts = scoreContexts(contexts, basePrompt);
  let injectedContext = '';
  for (const context of scoredContexts) {
    if (injectedContext.length + context.text.length <= maxContextLength) {
      injectedContext += `\n${context.text}`;
    } else {
      break;
    }
  }
  return `${basePrompt}\nContext:${injectedContext}`;
}

/**
 * Utility to inject adaptive context into prompts for LLMs.
 * @param {string} basePrompt - The base prompt to enhance.
 * @param {Array<Object>} contexts - Array of context objects { text, timestamp}.
 * @param {number} maxContextLength - Maximum length of context to inject.
 * @returns {string} - The enhanced prompt.
 */
export function adaptiveLLMContextInjector(basePrompt, contexts, maxContextLength = 1000) {
  return composePrompt(basePrompt, contexts, maxContextLength);
}

/**
 * Filter contexts to remove duplicates based on content hash.
 * @param {Array<Object>} contexts - Array of context objects { text, timestamp}.
 * @returns {Array<Object>} - Deduplicated context objects.
 */
export function deduplicateContexts(contexts) {
  const seenHashes = new Set();
  return contexts.filter((context) => {
    const hash = generateHash(context.text);
    if (seenHashes.has(hash)) {
      return false;
    }
    seenHashes.add(hash);
    return true;
  });
}

// Example usage:
// const contexts = [
//   { text: 'Neuro-symbolic AI combines neural and symbolic methods.', timestamp: 1698787200000 },
//   { text: 'Emergent capabilities in large language models.', timestamp: 1698873600000 },
// ];
// const basePrompt = 'Explain the significance of neuro-symbolic AI.';
// console.log(adaptiveLLMContextInjector(basePrompt, contexts));