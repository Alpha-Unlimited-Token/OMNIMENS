/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticAwareCompression
 * Written: 2026-04-02T15:04:33.401Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
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
 * @param {Array<{source, target, relationship}>} edges - Array of edges with source, target, and relationship.
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