/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: semanticContextReconstructor
 * Purpose: Preserves semantic fidelity when compressing long token windows for reasoning.
 * Description: Preserves semantic fidelity by reconstructing compressed context dynamically using token embeddings and relevance scoring.
 * Migrated: 2026-04-03T00:35:24.030Z
 */

// semanticContextReconstructor.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic graph from token embeddings.
 * @param {Array<Array<number>>} embeddings - Array of token embeddings.
 * @returns {Object} - Semantic graph representation.
 */
export function generateSemanticGraph(embeddings) {
  const graph = {};

  for (let i = 0; i < embeddings.length; i++) {
    const nodeId = `node_${i}`;
    graph[nodeId] = {
      embedding: embeddings[i],
      edges: {},
    };

    for (let j = 0; j < embeddings.length; j++) {
      if (i !== j) {
        const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
        graph[nodeId].edges[`node_${j}`] = similarity;
      }
    }
  }

  return graph;
}

/**
 * Computes cosine similarity between two vectors.
 * @param {Array<number>} vecA - First vector.
 * @param {Array<number>} vecB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB || 1);
}

/**
 * Dynamically reconstructs context based on importance scores and query relevance.
 * @param {Object} semanticGraph - Semantic graph.
 * @param {Array<number>} queryEmbedding - Query embedding.
 * @param {number} topN - Number of top nodes to retain.
 * @returns {Array<string>} - Reconstructed context node IDs.
 */
export function reconstructContext(semanticGraph, queryEmbedding, topN = 5) {
  const scores = Object.entries(semanticGraph).map(([nodeId, node]) => {
    const relevance = cosineSimilarity(node.embedding, queryEmbedding);
    const importance = Object.values(node.edges).reduce((sum, edgeWeight) => sum + edgeWeight, 0);
    return { nodeId, score: relevance + importance };
  });

  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, topN).map(({ nodeId }) => nodeId);
}

/**
 * Generates a hash for a given input to ensure consistent node IDs.
 * @param {string} input - Input string.
 * @returns {string} - Hashed output.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Utility to normalize embeddings for consistent processing.
 * @param {Array<number>} embedding - Raw embedding.
 * @returns {Array<number>} - Normalized embedding.
 */
export function normalizeEmbedding(embedding) {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val ** 2, 0));
  return embedding.map(val => val / (magnitude || 1));
}

/**
 * Utility to filter low-relevance nodes from semantic graph.
 * @param {Object} semanticGraph - Semantic graph.
 * @param {number} threshold - Minimum edge weight to retain.
 * @returns {Object} - Filtered semantic graph.
 */
export function filterLowRelevanceNodes(semanticGraph, threshold = 0.1) {
  const filteredGraph = {};

  for (const [nodeId, node] of Object.entries(semanticGraph)) {
    const filteredEdges = Object.entries(node.edges)
      .filter(([, weight]) => weight >= threshold)
      .reduce((acc, [edgeId, weight]) => {
        acc[edgeId] = weight;
        return acc;
      }, {});

    filteredGraph[nodeId] = {
      embedding: node.embedding,
      edges: filteredEdges,
    };
  }

  return filteredGraph;
}
