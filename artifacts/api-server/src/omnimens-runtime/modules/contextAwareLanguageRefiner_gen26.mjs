/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextAwareLanguageRefiner
 * Written: 2026-04-02T15:06:29.779Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextAwareLanguageRefiner.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic coherence score based on contextual similarity.
 * @param {string} input - The input text to evaluate.
 * @param {string} context - The context text for comparison.
 * @returns {number} - A score between 0 and 1 representing semantic coherence.
 */
export function semanticCoherenceScore(input, context) {
  if (typeof input !== 'string' || typeof context !== 'string') {
    throw new TypeError('Both input and context must be strings.');
  }

  const inputWords = new Set(input.toLowerCase().split(/\s+/));
  const contextWords = new Set(context.toLowerCase().split(/\s+/));

  const intersection = [...inputWords].filter(word => contextWords.has(word));
  const union = new Set([...inputWords, ...contextWords]);

  return intersection.length / union.size;
}

/**
 * Re-ranks candidate outputs based on semantic coherence.
 * @param {Array<string>} candidates - Array of candidate outputs.
 * @param {string} context - The context text for comparison.
 * @returns {Array<{ text, score}>} - Ranked candidates with their scores.
 */
export function rankCandidatesByContext(candidates, context) {
  if (!Array.isArray(candidates) || typeof context !== 'string') {
    throw new TypeError('Candidates must be an array and context must be a string.');
  }

  const ranked = candidates.map(candidate => {
    const score = semanticCoherenceScore(candidate, context);
    return { text: candidate, score };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

/**
 * Hashes text for lightweight deduplication or caching purposes.
 * @param {string} text - The text to hash.
 * @returns {string} - A SHA-256 hash of the text.
 */
export function hashText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Text must be a string.');
  }

  return createHash('sha256').update(text).digest('hex');
}

/**
 * Refines a conversational output by selecting the most contextually relevant candidate.
 * @param {Array<string>} candidates - Array of candidate outputs.
 * @param {string} context - The context text for comparison.
 * @returns {string} - The most contextually relevant candidate.
 */
export function refineOutput(candidates, context) {
  if (!Array.isArray(candidates) || typeof context !== 'string') {
    throw new TypeError('Candidates must be an array and context must be a string.');
  }

  const ranked = rankCandidatesByContext(candidates, context);
  return ranked.length > 0 ? ranked[0].text : '';
}

/**
 * Validates input to ensure it meets basic requirements for processing.
 * @param {string} input - The input text to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateInput(input) {
  return typeof input === 'string' && input.trim().length > 0;
}

/**
 * Utility function to normalize text by removing extra spaces and converting to lowercase.
 * @param {string} text - The text to normalize.
 * @returns {string} - Normalized text.
 */
export function normalizeText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Text must be a string.');
  }

  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Analyzes multiple conversational contexts and selects the best response for each.
 * @param {Array<{ candidates, context}>} scenarios - Array of scenarios to process.
 * @returns {Array<string>} - Array of refined outputs for each scenario.
 */
export function batchRefineOutputs(scenarios) {
  if (!Array.isArray(scenarios)) {
    throw new TypeError('Scenarios must be an array.');
  }

  return scenarios.map(({ candidates, context }) => refineOutput(candidates, context));
}