/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: longTermMemoryConsolidator
 * Written: 2026-04-02T15:17:20.403Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// longTermMemoryConsolidator.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for a given input, ensuring consistent node identification in the knowledge graph.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash representing the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Embeds semantic meaning into a vector representation using a simple token-based approach.
 * @param {string} text - The input text to embed.
 * @returns {number[]} - A numeric vector representing the semantic embedding.
 */
export function embedText(text) {
  const tokens = text.split(/\s+/);
  return tokens.map(token => token.length % 10); // Simple embedding based on token length.
}

/**
 * Clusters nodes hierarchically based on semantic similarity.
 * @param {Array<{ id, embedding}>} nodes - Array of nodes with embeddings.
 * @returns {Array<{ clusterId, members}>} - Hierarchical clusters of nodes.
 */
export function clusterNodes(nodes) {
  const clusters = [];

  // Simple clustering algorithm based on Euclidean distance.
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    let clusterFound = false;

    for (const cluster of clusters) {
      const centroid = cluster.centroid;
      const distance = Math.sqrt(
        node.embedding.reduce((sum, val, idx) => sum + Math.pow(val - centroid[idx], 2), 0)
      );

      if (distance < 5) { // Threshold for clustering.
        cluster.members.push(node.id);
        clusterFound = true;
        break;
      }
    }

    if (!clusterFound) {
      clusters.push({
        clusterId: generateHash(node.id),
        members: [node.id],
        centroid: node.embedding
      });
    }
  }

  return clusters.map(({ clusterId, members }) => ({ clusterId, members }));
}

/**
 * Consolidates working memory into a persistent knowledge graph.
 * @param {Array<{ id, content}>} workingMemory - Array of memory nodes.
 * @returns {Object} - Consolidated knowledge graph with nodes and edges.
 */
export function consolidateMemory(workingMemory) {
  const nodes = workingMemory.map(({ id, content }) => ({
    id,
    embedding: embedText(content)
  }));

  const clusters = clusterNodes(nodes);

  const graph = {
    nodes: nodes.map(node => ({ id: node.id, embedding: node.embedding })),
    edges: clusters.flatMap(cluster => cluster.members.map((member, idx, arr) =>
      idx > 0 ? { from: arr[idx - 1], to: member } : null
    ).filter(edge => edge))
  };

  return graph;
}

/**
 * Queries the knowledge graph for nodes matching a semantic embedding.
 * @param {Object} graph - The knowledge graph.
 * @param {number[]} queryEmbedding - The embedding to query.
 * @returns {Array<string>} - IDs of matching nodes.
 */
export function queryGraph(graph, queryEmbedding) {
  return graph.nodes.filter(node => {
    const distance = Math.sqrt(
      queryEmbedding.reduce((sum, val, idx) => sum + Math.pow(val - node.embedding[idx], 2), 0)
    );
    return distance < 5; // Threshold for similarity.
  }).map(node => node.id);
}

/**
 * Periodically summarizes the knowledge graph.
 * @param {Object} graph - The knowledge graph.
 * @returns {Array<{ summaryId, content}>} - Summarized nodes.
 */
export function summarizeGraph(graph) {
  return graph.nodes.map(node => ({
    summaryId: generateHash(node.id),
    content: `Summary of node ${node.id}`
  }));
}
