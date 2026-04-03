/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompressionEngine
 * Written: 2026-04-03T12:17:07.603Z
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
 * Compiled targets: javascript: OK (4 IR steps) | python: OK (4 IR steps) | c: OK (4 IR steps) | x86_64: OK (4 IR steps) | arm64: OK (4 IR steps) | avr: OK (4 IR steps)
 * Translation map version: 22
 */
// contextCompressionEngine.mjs

import { createHash } from 'crypto';

// Utility function: Hash a string to ensure unique and compact identifiers
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, 16); // Shorten to 16 characters for compactness
}

// Utility function: Tokenize text into words
export function tokenizeText(text) {
  return text.split(/\s+/).filter(Boolean);
}

// Utility function: Create a frequency map of words
export function createFrequencyMap(tokens) {
  const frequencyMap = new Map();
  tokens.forEach(token => {
    frequencyMap.set(token, (frequencyMap.get(token) || 0) + 1);
  });
  return frequencyMap;
}

// Utility function: Normalize a frequency map to probabilities
export function normalizeFrequencyMap(frequencyMap) {
  const total = Array.from(frequencyMap.values()).reduce((sum, count) => sum + count, 0);
  const normalizedMap = new Map();
  for (const [key, value] of frequencyMap.entries()) {
    normalizedMap.set(key, value / total);
  }
  return normalizedMap;
}

// Core function: Summarize a context using attention-based weighting
export function summarizeContext(context, maxTokens = 50) {
  const tokens = tokenizeText(context);
  const frequencyMap = createFrequencyMap(tokens);
  const normalizedMap = normalizeFrequencyMap(frequencyMap);

  // Sort tokens by their normalized frequency (importance)
  const sortedTokens = Array.from(normalizedMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token);

  // Return the top N tokens as the summary
  return sortedTokens.slice(0, maxTokens).join(' ');
}

// Core function: Cluster related contexts into groups based on shared keywords
export function clusterContexts(contexts) {
  const clusters = [];

  contexts.forEach(context => {
    const tokens = new Set(tokenizeText(context));
    let addedToCluster = false;

    for (const cluster of clusters) {
      const sharedTokens = new Set([...tokens].filter(token => cluster.tokens.has(token)));
      if (sharedTokens.size > 0) {
        cluster.contexts.push(context);
        cluster.tokens = new Set([...cluster.tokens, ...tokens]);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({ contexts: [context], tokens });
    }
  });

  return clusters.map(cluster => ({
    summary: summarizeContext(cluster.contexts.join(' ')),
    contexts: cluster.contexts
  }));
}

// Example utility: Generate a compressed representation of multiple contexts
export function compressContexts(contexts, maxSummaryLength = 100) {
  const clustered = clusterContexts(contexts);
  return clustered.map(cluster => ({
    id: hashString(cluster.summary),
    summary: summarizeContext(cluster.summary, maxSummaryLength),
    originalContexts: cluster.contexts
  }));
}

// Example usage (commented out for module safety)
// const contexts = [
//   "Understanding artificial intelligence ethics and safety",
//   "Large language model fine-tuning shapes behavior",
//   "AI agent autonomously in complex environments",
//   "Multi-agent systems for problem-solving architectures"
// ];
// console.log(compressContexts(contexts));