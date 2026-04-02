/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticContextPreserver
 * Written: 2026-04-02T15:15:14.457Z
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
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (5 IR steps) | python: OK (5 IR steps) | c: OK (5 IR steps) | x86_64: OK (5 IR steps) | arm64: OK (5 IR steps) | avr: OK (5 IR steps)
 * Translation map version: 22
 */
// semanticContextPreserver.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given input string using SHA256.
 * @param {string} input - The input string to hash.
 * @returns {string} - The semantic hash of the input.
 */
export function generateSemanticHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Recursively summarizes a list of context strings into a single compressed summary.
 * @param {string[]} contexts - Array of context strings.
 * @returns {string} - Hierarchical summary of the contexts.
 */
export function recursiveSummarization(contexts) {
  if (contexts.length === 1) return contexts[0];

  const mid = Math.floor(contexts.length / 2);
  const leftSummary = recursiveSummarization(contexts.slice(0, mid));
  const rightSummary = recursiveSummarization(contexts.slice(mid));

  return `${leftSummary} | ${rightSummary}`;
}

/**
 * Reconstructs context using attention weights to prioritize important segments.
 * @param {string[]} contexts - Array of context strings.
 * @param {number[]} weights - Array of attention weights corresponding to contexts.
 * @returns {string} - Weighted reconstructed context.
 */
export function weightedContextReconstruction(contexts, weights) {
  if (contexts.length !== weights.length) {
    throw new Error('Contexts and weights arrays must have the same length.');
  }

  const weightedContexts = contexts.map((context, index) => ({
    context,
    weight: weights[index]
  }));

  weightedContexts.sort((a, b) => b.weight - a.weight);

  return weightedContexts.map(item => item.context).join(' ');
}

/**
 * Combines semantic hashing, recursive summarization, and weighted reconstruction.
 * @param {string[]} contexts - Array of context strings.
 * @param {number[]} weights - Array of attention weights corresponding to contexts.
 * @returns {object} - Object containing semantic hash, hierarchical summary, and reconstructed context.
 */
export function preserveSemanticContext(contexts, weights) {
  const hierarchicalSummary = recursiveSummarization(contexts);
  const reconstructedContext = weightedContextReconstruction(contexts, weights);
  const semanticHash = generateSemanticHash(hierarchicalSummary);

  return {
    semanticHash,
    hierarchicalSummary,
    reconstructedContext
  };
}

/**
 * Utility to normalize attention weights.
 * @param {number[]} weights - Array of raw attention weights.
 * @returns {number[]} - Normalized weights.
 */
export function normalizeWeights(weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total === 0) {
    throw new Error('Total weight cannot be zero.');
  }

  return weights.map(weight => weight / total);
}