/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_7
 * Name: semanticAwareCompression
 * Purpose: Preserves key semantic relationships during token window compression for long-context reasoning.
 * Description: Preserves semantic relationships during token window compression using graph-based summarization techniques.
 * Migrated: 2026-04-02T15:11:36.912Z
 */

// semanticAwareCompression.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given string to uniquely identify nodes in the graph.
 * @param {string} input - The string to hash.
 * @returns {string} - The hashed string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Builds a semantic graph from input data.
 * @param {Array<{source: string, target: string, relationship: string}>} edges - Array of edges with source, target, and relationship.
 * @returns {Object} - The semantic graph represented as an adjacency list.
 */
export function buildSemanticGraph(edges) {
  const graph = {};

  for (const { source, target, relationship } of edges) {
    const sourceHash = generateHash(source);
    const targetHash = generateHash(target);

    if (!graph[sourceHash]) {
      graph[sourceHash] = { entity: source, connections: [] };
    }

    graph[sourceHash].connections.push({ target: targetHash, relationship });

    if (!graph[targetHash]) {
      graph[targetHash] = { entity: target, connections: [] };
    }
  }

  return graph;
}

/**
 * Compresses the semantic graph by prioritizing key relationships.
 * @param {Object} graph - The semantic graph represented as an adjacency list.
 * @param {Array<string>} priorityRelationships - List of relationships to prioritize during compression.
 * @returns {Object} - The compressed semantic graph.
 */
export function compressSemanticGraph(graph, priorityRelationships) {
  const compressedGraph = {};

  for (const [node, data] of Object.entries(graph)) {
    const filteredConnections = data.connections.filter(conn => priorityRelationships.includes(conn.relationship));

    compressedGraph[node] = {
      entity: data.entity,
      connections: filteredConnections
    };
  }

  return compressedGraph;
}

/**
 * Summarizes the compressed graph into a readable format.
 * @param {Object} graph - The compressed semantic graph.
 * @returns {Array<string>} - Array of summary strings for each node.
 */
export function summarizeCompressedGraph(graph) {
  const summaries = [];

  for (const [node, data] of Object.entries(graph)) {
    const connectionsSummary = data.connections.map(conn => `${data.entity} -> ${graph[conn.target].entity} (${conn.relationship})`).join(', ');
    summaries.push(`Node: ${data.entity}, Connections: [${connectionsSummary}]`);
  }

  return summaries;
}

/**
 * Example usage:
 * const edges = [
 *   { source: 'Google', target: 'DeepMind', relationship: 'owns' },
 *   { source: 'Alphabet', target: 'Google', relationship: 'parent' },
 *   { source: 'Amazon', target: 'Alexa+', relationship: 'develops' }
 * ];
 * const graph = buildSemanticGraph(edges);
 * const compressedGraph = compressSemanticGraph(graph, ['owns', 'parent']);
 * const summary = summarizeCompressedGraph(compressedGraph);
 * console.log(summary);
 */