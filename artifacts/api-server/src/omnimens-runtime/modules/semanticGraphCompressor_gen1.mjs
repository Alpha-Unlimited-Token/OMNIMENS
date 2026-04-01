/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_17
 * Name: semanticGraphCompressor
 * Purpose: Preserves nuanced context in extended conversations by using attention-weighted semantic graph traversal.
 * Description: Implements semantic graph compression using attention-weighted traversal and recursive merging for nuanced context preservation.
 * Migrated: 2026-04-01T22:23:20.229Z
 */

// semanticGraphCompressor.mjs

import crypto from 'crypto';

/**
 * Builds a semantic graph from tokens and their relationships.
 * @param {Array<string>} tokens - Input tokens.
 * @param {Array<Array<number>>} attentionMatrix - Attention scores between tokens.
 * @returns {Map<string, Object>} - A graph representation where keys are tokens and values are their neighbors and weights.
 */
export function buildSemanticGraph(tokens, attentionMatrix) {
  if (!Array.isArray(tokens) || !Array.isArray(attentionMatrix)) {
    throw new Error("Invalid input: tokens and attentionMatrix must be arrays.");
  }

  const graph = new Map();

  tokens.forEach((token, i) => {
    const neighbors = {};
    attentionMatrix[i].forEach((weight, j) => {
      if (weight > 0) {
        neighbors[tokens[j]] = weight;
      }
    });
    graph.set(token, { neighbors });
  });

  return graph;
}

/**
 * Compresses a semantic graph by merging nodes with high attention weights.
 * @param {Map<string, Object>} graph - The semantic graph.
 * @param {number} threshold - Minimum attention weight to consider merging.
 * @returns {Map<string, Object>} - A compressed semantic graph.
 */
export function compressSemanticGraph(graph, threshold = 0.5) {
  if (!(graph instanceof Map)) {
    throw new Error("Invalid input: graph must be a Map.");
  }

  const compressedGraph = new Map(graph);

  for (const [node, { neighbors }] of graph.entries()) {
    for (const [neighbor, weight] of Object.entries(neighbors)) {
      if (weight >= threshold && compressedGraph.has(neighbor)) {
        const mergedNode = `${node}_${neighbor}`;
        const mergedNeighbors = { ...compressedGraph.get(node).neighbors, ...compressedGraph.get(neighbor).neighbors };

        // Remove self-loops
        delete mergedNeighbors[node];
        delete mergedNeighbors[neighbor];

        compressedGraph.set(mergedNode, { neighbors: mergedNeighbors });
        compressedGraph.delete(node);
        compressedGraph.delete(neighbor);
        break;
      }
    }
  }

  return compressedGraph;
}

/**
 * Traverses a semantic graph recursively to extract meaningful paths.
 * @param {Map<string, Object>} graph - The semantic graph.
 * @param {string} startNode - Starting node for traversal.
 * @param {number} depth - Maximum depth for traversal.
 * @returns {Array<string>} - An array of paths (as strings).
 */
export function traverseSemanticGraph(graph, startNode, depth = 3) {
  if (!(graph instanceof Map) || typeof startNode !== "string" || typeof depth !== "number") {
    throw new Error("Invalid input: check graph, startNode, and depth.");
  }

  const paths = [];

  function dfs(node, currentPath, currentDepth) {
    if (currentDepth > depth || !graph.has(node)) {
      return;
    }

    currentPath.push(node);
    paths.push(currentPath.join(" -> "));

    const { neighbors } = graph.get(node);
    for (const neighbor of Object.keys(neighbors)) {
      dfs(neighbor, [...currentPath], currentDepth + 1);
    }
  }

  dfs(startNode, [], 0);
  return paths;
}

/**
 * Generates a hash for a semantic graph to enable quick comparisons.
 * @param {Map<string, Object>} graph - The semantic graph.
 * @returns {string} - A hash representing the graph structure.
 */
export function hashSemanticGraph(graph) {
  if (!(graph instanceof Map)) {
    throw new Error("Invalid input: graph must be a Map.");
  }

  const sortedGraph = Array.from(graph.entries()).sort(([a], [b]) => a.localeCompare(b));
  const graphString = JSON.stringify(
    sortedGraph.map(([node, { neighbors }]) => ({ node, neighbors: Object.entries(neighbors).sort() }))
  );

  return crypto.createHash("sha256").update(graphString).digest("hex");
}

/**
 * Utility to normalize an attention matrix.
 * @param {Array<Array<number>>} matrix - The attention matrix.
 * @returns {Array<Array<number>>} - Normalized attention matrix.
 */
export function normalizeAttentionMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error("Invalid input: matrix must be an array.");
  }

  return matrix.map(row => {
    const sum = row.reduce((acc, val) => acc + val, 0);
    return sum === 0 ? row : row.map(val => val / sum);
  });
}
