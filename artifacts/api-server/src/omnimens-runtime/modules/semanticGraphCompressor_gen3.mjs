/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-03T07:27:19.789Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticGraphCompressor.mjs

import { createHash } from 'crypto';

/**
 * Extract entities and relations from text using a simple heuristic-based approach.
 * @param {string} text - Input text to analyze.
 * @returns {Array} - Array of extracted entities and their relations.
 */
export function extractEntitiesAndRelations(text) {
  const words = text.split(/\s+/);
  const entities = new Set();
  const relations = [];

  for (let i = 0; i < words.length - 1; i++) {
    const word = words[i].toLowerCase();
    const nextWord = words[i + 1].toLowerCase();

    if (word.length > 3 && nextWord.length > 3) {
      entities.add(word);
      entities.add(nextWord);
      relations.push([word, nextWord]);
    }
  }

  return { entities: Array.from(entities), relations };
}

/**
 * Build a semantic graph from entities and relations.
 * @param {Array} entities - Array of entities.
 * @param {Array} relations - Array of relations (pairs of entities).
 * @returns {Object} - Semantic graph represented as an adjacency list.
 */
export function buildSemanticGraph(entities, relations) {
  const graph = {};

  for (const entity of entities) {
    graph[entity] = new Set();
  }

  for (const [entityA, entityB] of relations) {
    if (graph[entityA] && graph[entityB]) {
      graph[entityA].add(entityB);
      graph[entityB].add(entityA);
    }
  }

  return graph;
}

/**
 * Calculate centrality scores for nodes in the graph.
 * @param {Object} graph - Semantic graph represented as an adjacency list.
 * @returns {Object} - Centrality scores for each node.
 */
export function calculateCentrality(graph) {
  const centrality = {};

  for (const node in graph) {
    centrality[node] = graph[node].size;
  }

  return centrality;
}

/**
 * Compress the semantic graph by retaining only the most central nodes.
 * @param {Object} graph - Semantic graph represented as an adjacency list.
 * @param {number} threshold - Minimum centrality score to retain a node.
 * @returns {Object} - Compressed semantic graph.
 */
export function compressGraph(graph, threshold) {
  const centrality = calculateCentrality(graph);
  const compressedGraph = {};

  for (const node in graph) {
    if (centrality[node] >= threshold) {
      compressedGraph[node] = new Set(
        Array.from(graph[node]).filter((neighbor) => centrality[neighbor] >= threshold)
      );
    }
  }

  return compressedGraph;
}

/**
 * Hash a semantic graph to create a unique identifier for its structure.
 * @param {Object} graph - Semantic graph represented as an adjacency list.
 * @returns {string} - Hash of the graph structure.
 */
export function hashGraph(graph) {
  const graphString = JSON.stringify(
    Object.keys(graph)
      .sort()
      .reduce((acc, key) => {
        acc[key] = Array.from(graph[key]).sort();
        return acc;
      }, {})
  );

  return createHash('sha256').update(graphString).digest('hex');
}

/**
 * Main function to process text, build, compress, and hash the semantic graph.
 * @param {string} text - Input text to process.
 * @param {number} threshold - Minimum centrality score to retain a node.
 * @returns {Object} - Processed graph, compressed graph, and hash.
 */
export function processTextToGraph(text, threshold = 2) {
  const { entities, relations } = extractEntitiesAndRelations(text);
  const graph = buildSemanticGraph(entities, relations);
  const compressedGraph = compressGraph(graph, threshold);
  const graphHash = hashGraph(compressedGraph);

  return { graph, compressedGraph, graphHash };
}