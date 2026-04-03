/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextRetrieval
 * Written: 2026-04-03T07:28:48.348Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextRetrieval.mjs

import { createHash } from 'crypto';

/**
 * Generate a hash for a given string to ensure unique identification of context segments.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Score context segments based on importance using a simple heuristic.
 * @param {string} context - The context segment to score.
 * @returns {number} - Importance score (higher is more important).
 */
export function scoreContext(context) {
  const wordCount = context.split(' ').length;
  const keywordMatches = (context.match(/(important|critical|key|essential)/gi) || []).length;
  return wordCount + keywordMatches * 10; // Weight keywords higher.
}

/**
 * Summarize a context segment by extracting key sentences.
 * @param {string} context - The context segment to summarize.
 * @returns {string} - A summarized version of the context.
 */
export function summarizeContext(context) {
  const sentences = context.split('.');
  const keySentences = sentences.filter(sentence => sentence.match(/(important|critical|key|essential)/gi));
  return keySentences.join('. ') || sentences.slice(0, 2).join('. '); // Default to first 2 sentences.
}

/**
 * Retrieve and refine context segments recursively.
 * @param {Array<string>} contexts - Array of context segments.
 * @param {number} depth - Maximum recursion depth.
 * @returns {Array<string>} - Refined context segments.
 */
export function recursiveContextRetrieval(contexts, depth = 3) {
  if (depth === 0 || contexts.length === 0) return contexts;

  const scoredContexts = contexts.map(context => ({
    context,
    score: scoreContext(context)
  })).sort((a, b) => b.score - a.score); // Sort by importance.

  const topContexts = scoredContexts.slice(0, Math.ceil(scoredContexts.length / 2)).map(item => item.context); // Take top 50%.
  const summarizedContexts = topContexts.map(summarizeContext);

  return recursiveContextRetrieval(summarizedContexts, depth - 1); // Recurse with summarized contexts.
}

/**
 * Utility function to embed context segments for similarity search.
 * @param {string} context - The context segment to embed.
 * @returns {Array<number>} - A simple numeric vector representation.
 */
export function embedContext(context) {
  const charCodes = context.split('').map(char => char.charCodeAt(0));
  const sum = charCodes.reduce((acc, code) => acc + code, 0);
  const avg = sum / charCodes.length;
  return [sum, avg, charCodes.length]; // Simple embedding: [sum, avg, length].
}

/**
 * Perform similarity search between embedded contexts.
 * @param {Array<number>} vectorA - First context vector.
 * @param {Array<number>} vectorB - Second context vector.
 * @returns {number} - Similarity score (higher is more similar).
 */
export function similaritySearch(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB); // Cosine similarity.
}

/**
 * Main entry point to process and refine context segments.
 * @param {Array<string>} contexts - Array of raw context segments.
 * @returns {Array<string>} - Fully refined context segments.
 */
export function processContexts(contexts) {
  const refinedContexts = recursiveContextRetrieval(contexts);
  const embeddedContexts = refinedContexts.map(embedContext);
  return { refinedContexts, embeddedContexts };
}