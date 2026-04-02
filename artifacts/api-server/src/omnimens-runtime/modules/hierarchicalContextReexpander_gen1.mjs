/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_45
 * Name: hierarchicalContextReexpander
 * Purpose: Dynamically re-expand compressed context when relevant to preserve fine-grained details selectively.
 * Description: Dynamically re-expands compressed hierarchical context based on importance scoring for selective restoration of fine-grained details.
 * Migrated: 2026-04-02T14:50:29.441Z
 */

// hierarchicalContextReexpander.mjs

import { createHash } from 'crypto';

/**
 * Dynamically re-expands compressed hierarchical context based on importance scoring.
 * This module provides utility functions for selective context restoration.
 */

// Utility function to hash content for efficient storage and retrieval
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Compress context into hierarchical layers
export function compressContext(context) {
  if (typeof context !== 'object' || context === null) {
    throw new TypeError('Context must be a non-null object');
  }
  const compressed = {};
  for (const [key, value] of Object.entries(context)) {
    compressed[key] = {
      summary: typeof value === 'string' ? value.slice(0, 50) : JSON.stringify(value).slice(0, 50),
      hash: generateHash(JSON.stringify(value))
    };
  }
  return compressed;
}

// Re-expand context selectively based on importance scoring
export function reExpandContext(compressedContext, importanceScores) {
  if (typeof compressedContext !== 'object' || compressedContext === null) {
    throw new TypeError('Compressed context must be a non-null object');
  }
  if (typeof importanceScores !== 'object' || importanceScores === null) {
    throw new TypeError('Importance scores must be a non-null object');
  }

  const reExpanded = {};
  for (const [key, score] of Object.entries(importanceScores)) {
    if (compressedContext[key] && score > 0.5) { // Threshold for re-expansion
      reExpanded[key] = compressedContext[key].summary; // Restore summary
    }
  }
  return reExpanded;
}

// Importance scoring utility based on keyword relevance
export function calculateImportanceScores(context, keywords) {
  if (typeof context !== 'object' || context === null) {
    throw new TypeError('Context must be a non-null object');
  }
  if (!Array.isArray(keywords)) {
    throw new TypeError('Keywords must be an array');
  }

  const scores = {};
  for (const [key, value] of Object.entries(context)) {
    const content = typeof value === 'string' ? value : JSON.stringify(value);
    let score = 0;
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }
    scores[key] = score / keywords.length; // Normalize score
  }
  return scores;
}

// Example utility to merge multiple contexts hierarchically
export function mergeContexts(contexts) {
  if (!Array.isArray(contexts)) {
    throw new TypeError('Contexts must be an array');
  }

  const merged = {};
  for (const context of contexts) {
    if (typeof context !== 'object' || context === null) {
      throw new TypeError('Each context must be a non-null object');
    }
    for (const [key, value] of Object.entries(context)) {
      merged[key] = value;
    }
  }
  return merged;
}

// Example usage
export function exampleUsage() {
  const rawContext = {
    topic1: "JavaScript performance optimization techniques",
    topic2: "New graph algorithms for computational intelligence",
    topic3: "AI metacognition and self-reflection systems"
  };

  const compressed = compressContext(rawContext);
  const keywords = ["JavaScript", "AI", "graph"];
  const importanceScores = calculateImportanceScores(rawContext, keywords);
  const reExpanded = reExpandContext(compressed, importanceScores);

  return { compressed, importanceScores, reExpanded };
}