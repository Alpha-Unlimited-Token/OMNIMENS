/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_8
 * Name: neuroSymbolicReasoningEngine
 * Purpose: Combines neural embeddings with symbolic logic for hybrid reasoning and explainable AI.
 * Description: A hybrid neuro-symbolic reasoning engine combining Prolog-style inference with neural embeddings for explainable AI and multi-agent utility.
 * Migrated: 2026-04-03T00:28:21.830Z
 */

// neuroSymbolicReasoningEngine.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic similarity score between two neural embeddings.
 * @param {number[]} embeddingA - First embedding vector.
 * @param {number[]} embeddingB - Second embedding vector.
 * @returns {number} - Cosine similarity score (-1 to 1).
 */
export function calculateSemanticSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error("Embeddings must have the same length.");
  }

  const dotProduct = embeddingA.reduce((sum, val, i) => sum + val * embeddingB[i], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Performs a Prolog-style backward chaining inference.
 * @param {Object[]} knowledgeBase - Array of rules (objects with `if` and `then` properties).
 * @param {string} goal - The goal to infer.
 * @param {Set<string>} [visited=new Set()] - Tracks visited goals to prevent infinite loops.
 * @returns {boolean} - True if the goal can be inferred, false otherwise.
 */
export function backwardChaining(knowledgeBase, goal, visited = new Set()) {
  if (visited.has(goal)) {
    return false; // Prevent infinite loops
  }
  visited.add(goal);

  for (const rule of knowledgeBase) {
    if (rule.then === goal) {
      if (rule.if.every((subGoal) => backwardChaining(knowledgeBase, subGoal, visited))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Links a symbolic inference engine with neural embeddings for hybrid reasoning.
 * @param {Object[]} knowledgeBase - Array of rules (objects with `if` and `then` properties).
 * @param {string} goal - The goal to infer.
 * @param {Object} embeddings - Map of symbols to their neural embeddings.
 * @param {number} similarityThreshold - Minimum similarity score to consider a match.
 * @returns {boolean} - True if the goal can be inferred, false otherwise.
 */
export function hybridReasoning(knowledgeBase, goal, embeddings, similarityThreshold = 0.8) {
  const augmentedKnowledgeBase = knowledgeBase.map((rule) => ({
    if: rule.if.map((symbol) => findClosestSymbol(symbol, embeddings, similarityThreshold)),
    then: findClosestSymbol(rule.then, embeddings, similarityThreshold),
  }));

  const closestGoal = findClosestSymbol(goal, embeddings, similarityThreshold);

  return backwardChaining(augmentedKnowledgeBase, closestGoal);
}

/**
 * Finds the closest symbol to a given symbol based on semantic similarity.
 * @param {string} symbol - The target symbol.
 * @param {Object} embeddings - Map of symbols to their neural embeddings.
 * @param {number} similarityThreshold - Minimum similarity score to consider a match.
 * @returns {string} - The closest symbol or the original symbol if no match is found.
 */
export function findClosestSymbol(symbol, embeddings, similarityThreshold) {
  if (!embeddings[symbol]) {
    throw new Error(`Embedding for symbol '${symbol}' not found.`);
  }

  let closestSymbol = symbol;
  let highestSimilarity = -Infinity;

  for (const [candidate, embedding] of Object.entries(embeddings)) {
    const similarity = calculateSemanticSimilarity(embeddings[symbol], embedding);
    if (similarity > highestSimilarity && similarity >= similarityThreshold) {
      highestSimilarity = similarity;
      closestSymbol = candidate;
    }
  }

  return closestSymbol;
}

/**
 * Generates a deterministic hash for a given input string.
 * Useful for creating unique identifiers for symbols.
 * @param {string} input - The input string.
 * @returns {string} - A hexadecimal hash string.
 */
export function generateSymbolHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

// Example usage (commented out for production):
// const knowledgeBase = [
//   { if: ['A', 'B'], then: 'C' },
//   { if: ['C'], then: 'D' },
// ];
// const embeddings = {
//   A: [1, 0, 0],
//   B: [0, 1, 0],
//   C: [0.5, 0.5, 0],
//   D: [0.5, 0.5, 0.5],
// };
// console.log(hybridReasoning(knowledgeBase, 'D', embeddings, 0.8));