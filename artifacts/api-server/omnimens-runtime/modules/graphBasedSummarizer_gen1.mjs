/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: graphBasedSummarizer
 * Purpose: Improves context window compression by preserving relationships between entities and events using graph-based techniques.
 * Description: Summarizes text by extracting entities and relationships using graph-based techniques, enabling multi-agent contextual compression and reasoning.
 * Migrated: 2026-03-25T22:49:34.113Z
 */

// graphBasedSummarizer.mjs

import crypto from 'crypto';

/**
 * Extract entities from text using simple word frequency and pattern matching.
 * @param {string} text - The input text to analyze.
 * @returns {Set<string>} - A set of unique entities extracted from the text.
 */
export function extractEntities(text) {
  const entityPattern = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g;
  const matches = text.match(entityPattern) || [];
  return new Set(matches);
}

/**
 * Map relationships between entities based on proximity in the text.
 * @param {string} text - The input text to analyze.
 * @param {Set<string>} entities - A set of entities extracted from the text.
 * @returns {Map<string, Set<string>>} - A graph represented as an adjacency list.
 */
export function mapRelationships(text, entities) {
  const graph = new Map();

  for (const entity of entities) {
    graph.set(entity, new Set());
  }

  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    for (const entity of entities) {
      if (words[i].includes(entity)) {
        for (let j = Math.max(0, i - 5); j < Math.min(words.length, i + 5); j++) {
          for (const neighbor of entities) {
            if (words[j].includes(neighbor) && neighbor !== entity) {
              graph.get(entity).add(neighbor);
            }
          }
        }
      }
    }
  }

  return graph;
}

/**
 * Rank nodes in the graph using a simple centrality measure.
 * @param {Map<string, Set<string>>} graph - The graph represented as an adjacency list.
 * @returns {Array<{entity: string, rank: number}>} - Ranked entities based on centrality.
 */
export function rankNodes(graph) {
  const ranks = [];

  for (const [entity, neighbors] of graph.entries()) {
    ranks.push({ entity, rank: neighbors.size });
  }

  return ranks.sort((a, b) => b.rank - a.rank);
}

/**
 * Summarize text by extracting key entities and relationships.
 * @param {string} text - The input text to summarize.
 * @returns {string} - A summary highlighting key entities and their relationships.
 */
export function summarizeText(text) {
  const entities = extractEntities(text);
  const graph = mapRelationships(text, entities);
  const rankedNodes = rankNodes(graph);

  const summary = rankedNodes.slice(0, 5).map(node => {
    const neighbors = Array.from(graph.get(node.entity));
    return `${node.entity} is connected to: ${neighbors.join(", ")}`;
  });

  return summary.join("\n");
}

/**
 * Generate a unique hash for the graph structure (useful for caching).
 * @param {Map<string, Set<string>>} graph - The graph represented as an adjacency list.
 * @returns {string} - A unique hash representing the graph.
 */
export function generateGraphHash(graph) {
  const serializedGraph = JSON.stringify(
    Array.from(graph.entries()).map(([key, value]) => [key, Array.from(value)])
  );
  return crypto.createHash('sha256').update(serializedGraph).digest('hex');
}