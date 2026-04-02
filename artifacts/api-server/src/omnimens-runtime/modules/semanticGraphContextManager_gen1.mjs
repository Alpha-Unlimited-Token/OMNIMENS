/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_63
 * Name: semanticGraphContextManager
 * Purpose: Preserve fine-grained relationships in compressed token windows using semantic graph structures.
 * Description: Preserves fine-grained token relationships using semantic graph structures for context retrieval and knowledge representation.
 * Migrated: 2026-04-02T14:50:29.438Z
 */

// semanticGraphContextManager.mjs

import crypto from 'crypto';

/**
 * Generate a unique hash for a token to use as a node identifier.
 * @param {string} token - The token to hash.
 * @returns {string} - A unique hash for the token.
 */
export function generateTokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Build a semantic graph from a list of tokens and their relationships.
 * @param {Array<string>} tokens - List of tokens.
 * @param {Array<[string, string, number]>} relationships - Array of [token1, token2, weight].
 * @returns {Object} - A semantic graph represented as an adjacency list.
 */
export function buildSemanticGraph(tokens, relationships) {
  const graph = {};

  // Initialize nodes
  for (const token of tokens) {
    const hash = generateTokenHash(token);
    graph[hash] = { token, edges: [] };
  }

  // Add edges
  for (const [token1, token2, weight] of relationships) {
    const hash1 = generateTokenHash(token1);
    const hash2 = generateTokenHash(token2);

    if (graph[hash1] && graph[hash2]) {
      graph[hash1].edges.push({ target: hash2, weight });
      graph[hash2].edges.push({ target: hash1, weight }); // Assuming undirected graph
    }
  }

  return graph;
}

/**
 * Traverse the graph to retrieve context for a given token.
 * @param {Object} graph - The semantic graph.
 * @param {string} token - The token to retrieve context for.
 * @param {number} depth - Depth of traversal.
 * @returns {Array<string>} - List of tokens in the context.
 */
export function retrieveContext(graph, token, depth = 1) {
  const visited = new Set();
  const context = [];
  const queue = [{ node: generateTokenHash(token), currentDepth: 0 }];

  while (queue.length > 0) {
    const { node, currentDepth } = queue.shift();

    if (!graph[node] || visited.has(node) || currentDepth > depth) {
      continue;
    }

    visited.add(node);
    context.push(graph[node].token);

    for (const edge of graph[node].edges) {
      queue.push({ node: edge.target, currentDepth: currentDepth + 1 });
    }
  }

  return context;
}

/**
 * Utility function to normalize relationship weights.
 * @param {Array<[string, string, number]>} relationships - Array of [token1, token2, weight].
 * @returns {Array<[string, string, number]>} - Normalized relationships.
 */
export function normalizeWeights(relationships) {
  const maxWeight = Math.max(...relationships.map(([,, weight]) => weight));
  return relationships.map(([token1, token2, weight]) => [token1, token2, weight / maxWeight]);
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const tokens = ['AI', 'safety', 'technique', 'implementation'];
  const relationships = [
    ['AI', 'safety', 5],
    ['safety', 'technique', 3],
    ['technique', 'implementation', 4],
    ['AI', 'implementation', 2]
  ];

  const normalizedRelationships = normalizeWeights(relationships);
  const graph = buildSemanticGraph(tokens, normalizedRelationships);
  const context = retrieveContext(graph, 'AI', 2);

  return { graph, context };
}