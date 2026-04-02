/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_14
 * Name: multiLayerTokenHierarchy
 * Purpose: Dynamically manages token context using hierarchical compression and selective detail preservation.
 * Description: Manages token context dynamically via hierarchical compression and selective detail preservation for multi-agent utility.
 * Migrated: 2026-04-02T14:21:19.472Z
 */

// multiLayerTokenHierarchy.mjs

import crypto from 'crypto';

/**
 * Dynamically manages token context using hierarchical compression and selective detail preservation.
 * This module provides utilities for token segmentation, scoring, and hierarchical summarization.
 */

// Utility to hash tokens for unique identification
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Function to segment tokens into importance-scored groups
export function segmentTokens(tokens, scoringFunction) {
  if (!Array.isArray(tokens) || typeof scoringFunction !== 'function') {
    throw new TypeError('Invalid arguments: tokens must be an array and scoringFunction must be a function.');
  }

  return tokens.map(token => ({
    token,
    score: scoringFunction(token)
  })).sort((a, b) => b.score - a.score);
}

// Function to compress tokens hierarchically
export function hierarchicalCompress(tokens, maxLevels) {
  if (!Array.isArray(tokens) || typeof maxLevels !== 'number' || maxLevels <= 0) {
    throw new TypeError('Invalid arguments: tokens must be an array and maxLevels must be a positive number.');
  }

  const hierarchy = [];
  let currentLevel = tokens;

  for (let i = 0; i < maxLevels; i++) {
    const nextLevel = [];

    for (let j = 0; j < currentLevel.length; j += 2) {
      const group = currentLevel.slice(j, j + 2);
      const summary = group.map(t => t.token).join(' ');
      nextLevel.push({
        token: summary,
        score: group.reduce((sum, t) => sum + t.score, 0) / group.length
      });
    }

    hierarchy.push(nextLevel);
    currentLevel = nextLevel;

    if (currentLevel.length === 1) break; // Stop if fully compressed
  }

  return hierarchy;
}

// Function to selectively expand details from a compressed hierarchy
export function expandDetails(hierarchy, detailLevel) {
  if (!Array.isArray(hierarchy) || typeof detailLevel !== 'number' || detailLevel < 0) {
    throw new TypeError('Invalid arguments: hierarchy must be an array and detailLevel must be a non-negative number.');
  }

  return hierarchy[Math.min(detailLevel, hierarchy.length - 1)].map(entry => entry.token);
}

// Example scoring function (can be replaced by any domain-specific logic)
export function exampleScoringFunction(token) {
  return token.length; // Simple heuristic: score based on token length
}

// Example usage function (for demonstration purposes)
export function processTokens(tokens, maxLevels, detailLevel) {
  const scoredTokens = segmentTokens(tokens, exampleScoringFunction);
  const hierarchy = hierarchicalCompress(scoredTokens, maxLevels);
  return expandDetails(hierarchy, detailLevel);
}
