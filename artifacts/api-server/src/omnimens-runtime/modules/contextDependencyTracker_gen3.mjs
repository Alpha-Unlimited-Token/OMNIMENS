/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextDependencyTracker
 * Written: 2026-04-02T20:58:56.879Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextDependencyTracker.mjs

import { createHash } from 'crypto';

/**
 * Tracks probabilistic dependencies in token sequences using Bayesian network modeling
 * with recency-weighted scoring for nuanced context preservation.
 */

// Utility function to hash tokens for efficient storage and comparison
export function hashToken(token) {
  const hash = createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}

// Function to calculate recency-weighted probability
export function calculateRecencyWeight(index, totalTokens, decayFactor = 0.9) {
  if (index < 0 || totalTokens <= 0 || decayFactor <= 0 || decayFactor >= 1) {
    throw new Error('Invalid parameters for recency weight calculation.');
  }
  return Math.pow(decayFactor, totalTokens - index - 1);
}

// Function to update Bayesian probabilities for token dependencies
export function updateTokenDependencies(tokenGraph, tokenSequence, decayFactor = 0.9) {
  if (!Array.isArray(tokenSequence) || tokenSequence.length === 0) {
    throw new Error('Token sequence must be a non-empty array.');
  }

  for (let i = 0; i < tokenSequence.length; i++) {
    const currentToken = hashToken(tokenSequence[i]);

    if (!tokenGraph[currentToken]) {
      tokenGraph[currentToken] = { dependencies: {}, count: 0 };
    }

    tokenGraph[currentToken].count += 1;

    for (let j = i + 1; j < tokenSequence.length; j++) {
      const dependentToken = hashToken(tokenSequence[j]);
      const weight = calculateRecencyWeight(j - i, tokenSequence.length, decayFactor);

      if (!tokenGraph[currentToken].dependencies[dependentToken]) {
        tokenGraph[currentToken].dependencies[dependentToken] = 0;
      }

      tokenGraph[currentToken].dependencies[dependentToken] += weight;
    }
  }

  return tokenGraph;
}

// Function to query token dependencies and their probabilities
export function queryTokenDependencies(tokenGraph, token, normalize = true) {
  const hashedToken = hashToken(token);
  const result = {};

  if (!tokenGraph[hashedToken]) {
    return result; // No dependencies found for the token
  }

  const dependencies = tokenGraph[hashedToken].dependencies;
  const totalWeight = normalize
    ? Object.values(dependencies).reduce((sum, weight) => sum + weight, 0)
    : 1;

  for (const [dependentToken, weight] of Object.entries(dependencies)) {
    result[dependentToken] = weight / totalWeight;
  }

  return result;
}

// Function to initialize an empty token graph
export function createTokenGraph() {
  return {};
}

// Example usage of the module
export function exampleUsage() {
  const tokenGraph = createTokenGraph();
  const tokenSequence = ['emerging', 'programming', 'paradigms', 'functional', 'reactive', '2025'];

  updateTokenDependencies(tokenGraph, tokenSequence);

  const dependencies = queryTokenDependencies(tokenGraph, 'programming');
  return dependencies;
}