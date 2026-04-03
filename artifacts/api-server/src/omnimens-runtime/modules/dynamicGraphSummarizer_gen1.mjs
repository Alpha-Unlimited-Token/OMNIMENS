/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: dynamicGraphSummarizer
 * Purpose: Preserves semantic and causal relationships in token window compression for long-term reasoning.
 * Description: Builds and traverses a dynamic knowledge graph to summarize and prioritize key content while preserving semantic relationships.
 * Migrated: 2026-04-03T00:35:24.031Z
 */

// dynamicGraphSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Builds a dynamic knowledge graph from entities, events, and relationships.
 * @param {Array} tokens - Array of tokens (words, phrases, or concepts).
 * @param {Array} relationships - Array of relationships in the format [{source, target, type}].
 * @returns {Object} - A graph represented as an adjacency list.
 */
export function buildKnowledgeGraph(tokens, relationships) {
  const graph = {};

  // Initialize nodes
  tokens.forEach(token => {
    const id = hashToken(token);
    if (!graph[id]) {
      graph[id] = { token, edges: [] };
    }
  });

  // Add edges
  relationships.forEach(({ source, target, type }) => {
    const sourceId = hashToken(source);
    const targetId = hashToken(target);

    if (graph[sourceId] && graph[targetId]) {
      graph[sourceId].edges.push({ target: targetId, type });
    }
  });

  return graph;
}

/**
 * Traverses the graph to prioritize key content based on traversal depth.
 * @param {Object} graph - The knowledge graph.
 * @param {string} startToken - The starting token for traversal.
 * @param {number} maxDepth - Maximum depth for traversal.
 * @returns {Array} - Array of prioritized tokens.
 */
export function prioritizeContent(graph, startToken, maxDepth) {
  const startId = hashToken(startToken);
  const visited = new Set();
  const queue = [{ id: startId, depth: 0 }];
  const prioritizedTokens = [];

  while (queue.length > 0) {
    const { id, depth } = queue.shift();

    if (visited.has(id) || depth > maxDepth) {
      continue;
    }

    visited.add(id);
    prioritizedTokens.push(graph[id].token);

    graph[id].edges.forEach(edge => {
      if (!visited.has(edge.target)) {
        queue.push({ id: edge.target, depth: depth + 1 });
      }
    });
  }

  return prioritizedTokens;
}

/**
 * Hashes a token to create a unique identifier.
 * @param {string} token - The token to hash.
 * @returns {string} - A unique hash of the token.
 */
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Summarizes content by building a graph and extracting key tokens.
 * @param {Array} tokens - Array of tokens (words, phrases, or concepts).
 * @param {Array} relationships - Array of relationships in the format [{source, target, type}].
 * @param {string} startToken - The starting token for summarization.
 * @param {number} maxDepth - Maximum depth for traversal.
 * @returns {Array} - Array of summarized key tokens.
 */
export function summarizeContent(tokens, relationships, startToken, maxDepth) {
  const graph = buildKnowledgeGraph(tokens, relationships);
  return prioritizeContent(graph, startToken, maxDepth);
}

/**
 * Example utility function to extract relationships from raw text.
 * @param {string} text - Raw input text.
 * @returns {Array} - Extracted relationships in the format [{source, target, type}].
 */
export function extractRelationships(text) {
  // Naive example: extract pairs of words as relationships
  const words = text.split(/\s+/);
  const relationships = [];

  for (let i = 0; i < words.length - 1; i++) {
    relationships.push({ source: words[i], target: words[i + 1], type: 'sequence' });
  }

  return relationships;
}

// Example usage (commented out for production):
// const tokens = ['AI', 'JavaScript', 'performance', 'optimization', 'V8'];
// const relationships = [
//   { source: 'AI', target: 'JavaScript', type: 'related' },
//   { source: 'JavaScript', target: 'performance', type: 'related' },
//   { source: 'performance', target: 'optimization', type: 'related' },
//   { source: 'optimization', target: 'V8', type: 'related' }
// ];
// console.log(summarizeContent(tokens, relationships, 'AI', 2));