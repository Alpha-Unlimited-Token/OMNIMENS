/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_60
 * Name: semanticGraphContextLinker
 * Purpose: Links compressed summaries to their original contexts for nuanced reconstruction during long-context reasoning.
 * Description: Links compressed summaries to original contexts via a semantic graph for nuanced reconstruction and multi-agent reasoning.
 * Migrated: 2026-04-02T15:46:59.459Z
 */

// semanticGraphContextLinker.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given string (used for node IDs).
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Builds a semantic graph linking compressed summaries to their original contexts.
 * @param {Array<{summary: string, context: string}>} data - Array of objects with summaries and contexts.
 * @returns {Object} - A semantic graph with nodes and edges.
 */
export function buildSemanticGraph(data) {
  const graph = { nodes: {}, edges: [] };

  data.forEach(({ summary, context }) => {
    const summaryId = generateHash(summary);
    const contextId = generateHash(context);

    // Add nodes for summary and context
    if (!graph.nodes[summaryId]) {
      graph.nodes[summaryId] = { id: summaryId, type: 'summary', content: summary };
    }
    if (!graph.nodes[contextId]) {
      graph.nodes[contextId] = { id: contextId, type: 'context', content: context };
    }

    // Add edge linking summary to context
    graph.edges.push({ from: summaryId, to: contextId });
  });

  return graph;
}

/**
 * Reconstructs original context for a given summary using the semantic graph.
 * @param {Object} graph - The semantic graph.
 * @param {string} summary - The summary to find the original context for.
 * @returns {string|null} - The original context or null if not found.
 */
export function reconstructContext(graph, summary) {
  const summaryId = generateHash(summary);

  const edge = graph.edges.find(e => e.from === summaryId);
  if (edge) {
    const contextNode = graph.nodes[edge.to];
    return contextNode ? contextNode.content : null;
  }

  return null;
}

/**
 * Finds related summaries for a given context using the semantic graph.
 * @param {Object} graph - The semantic graph.
 * @param {string} context - The context to find related summaries for.
 * @returns {Array<string>} - An array of related summaries.
 */
export function findRelatedSummaries(graph, context) {
  const contextId = generateHash(context);

  return graph.edges
    .filter(e => e.to === contextId)
    .map(e => graph.nodes[e.from]?.content)
    .filter(Boolean);
}

/**
 * Validates the semantic graph structure.
 * @param {Object} graph - The semantic graph to validate.
 * @returns {boolean} - True if the graph is valid, otherwise false.
 */
export function validateGraph(graph) {
  if (!graph || typeof graph !== 'object' || !graph.nodes || !Array.isArray(graph.edges)) {
    return false;
  }

  return graph.edges.every(edge =>
    edge.from in graph.nodes && edge.to in graph.nodes
  );
}

// Example usage (uncomment to test in Node.js):
// const data = [
//   { summary: "Efficient inference techniques", context: "Ultra-efficient compressed models inference across GPUs." },
//   { summary: "Chinese reasoning model", context: "Cutting-edge reasoning model rivals OpenAI." }
// ];
// const graph = buildSemanticGraph(data);
// console.log(graph);
// console.log(reconstructContext(graph, "Efficient inference techniques"));
// console.log(findRelatedSummaries(graph, "Ultra-efficient compressed models inference across GPUs."));
