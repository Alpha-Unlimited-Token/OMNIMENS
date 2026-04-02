/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextReconstructionEngine
 * Written: 2026-04-02T15:04:22.980Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextReconstructionEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given input object to track context nodes.
 * @param {Object} obj - The input object to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(obj) {
  const jsonString = JSON.stringify(obj);
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Builds a probabilistic graph from input relationships.
 * @param {Array} nodes - Array of context nodes with relationships.
 * @returns {Object} - Graph representation of nodes and edges.
 */
export function buildGraph(nodes) {
  const graph = {};

  nodes.forEach((node) => {
    const { id, relationships } = node;
    graph[id] = relationships.map((rel) => ({ target: rel.target, weight: rel.weight }));
  });

  return graph;
}

/**
 * Performs Bayesian inference to rank context relevance.
 * @param {Object} graph - Graph representation of nodes and edges.
 * @param {string} startNode - The starting node for inference.
 * @param {number} iterations - Number of iterations for probability diffusion.
 * @returns {Object} - Node relevance scores.
 */
export function bayesianInference(graph, startNode, iterations = 10) {
  const scores = {};
  Object.keys(graph).forEach((node) => {
    scores[node] = node === startNode ? 1 : 0;
  });

  for (let i = 0; i < iterations; i++) {
    const newScores = { ...scores };

    Object.keys(graph).forEach((node) => {
      const neighbors = graph[node];
      neighbors.forEach(({ target, weight }) => {
        newScores[target] += scores[node] * weight;
      });
    });

    const totalScore = Object.values(newScores).reduce((sum, val) => sum + val, 0);
    Object.keys(newScores).forEach((node) => {
      newScores[node] /= totalScore;
    });

    Object.assign(scores, newScores);
  }

  return scores;
}

/**
 * Reconstructs a compressed token window into a full context.
 * @param {Array} compressedTokens - Array of compressed token objects.
 * @param {Object} graph - Graph representation of context relationships.
 * @param {number} maxTokens - Maximum number of tokens to reconstruct.
 * @returns {Array} - Reconstructed token window.
 */
export function reconstructContext(compressedTokens, graph, maxTokens) {
  const tokenScores = compressedTokens.map((token) => {
    const relevance = bayesianInference(graph, token.id);
    return { ...token, relevance: relevance[token.id] || 0 };
  });

  tokenScores.sort((a, b) => b.relevance - a.relevance);

  const reconstructed = [];
  let tokenCount = 0;

  for (const token of tokenScores) {
    if (tokenCount + token.size > maxTokens) break;
    reconstructed.push(token);
    tokenCount += token.size;
  }

  return reconstructed;
}

/**
 * Utility to normalize weights in a relationship array.
 * @param {Array} relationships - Array of relationship objects with weights.
 * @returns {Array} - Normalized relationships.
 */
export function normalizeWeights(relationships) {
  const totalWeight = relationships.reduce((sum, rel) => sum + rel.weight, 0);
  return relationships.map((rel) => ({ ...rel, weight: rel.weight / totalWeight }));
}

/**
 * Example usage function demonstrating the module's capabilities.
 */
export function exampleUsage() {
  const nodes = [
    { id: 'A', relationships: normalizeWeights([{ target: 'B', weight: 2 }, { target: 'C', weight: 1 }]) },
    { id: 'B', relationships: normalizeWeights([{ target: 'A', weight: 1 }, { target: 'C', weight: 3 }]) },
    { id: 'C', relationships: normalizeWeights([{ target: 'A', weight: 1 }, { target: 'B', weight: 1 }]) }
  ];

  const graph = buildGraph(nodes);
  const relevanceScores = bayesianInference(graph, 'A');
  const compressedTokens = [
    { id: 'A', size: 10 },
    { id: 'B', size: 15 },
    { id: 'C', size: 5 }
  ];

  const reconstructed = reconstructContext(compressedTokens, graph, 20);

  return { relevanceScores, reconstructed };
}