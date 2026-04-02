/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticGraphCompressor
 * Written: 2026-04-02T14:25:08.639Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (10 IR steps) | python: OK (10 IR steps) | c: OK (10 IR steps) | x86_64: OK (10 IR steps) | arm64: OK (10 IR steps) | avr: OK (10 IR steps)
 * Translation map version: 22
 */
// semanticGraphCompressor.mjs

import crypto from 'crypto';

/**
 * Generates a hash for a given string to create unique node identifiers.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash identifier.
 */
export function generateNodeId(input) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Converts text into a semantic graph representation.
 * @param {string} text - The input text to process.
 * @param {number} attentionThreshold - Minimum attention score to retain an edge.
 * @returns {object} - A graph object with nodes and edges.
 */
export function createSemanticGraph(text, attentionThreshold = 0.1) {
  const words = text.split(/\s+/);
  const nodes = new Map();
  const edges = [];

  // Create nodes with embeddings (placeholder: hash-based embeddings)
  words.forEach((word) => {
    const nodeId = generateNodeId(word);
    if (!nodes.has(nodeId)) {
      nodes.set(nodeId, { id: nodeId, label: word, embedding: hashToVector(nodeId) });
    }
  });

  // Create edges based on attention scores (placeholder: proximity-based scores)
  for (let i = 0; i < words.length - 1; i++) {
    const sourceId = generateNodeId(words[i]);
    const targetId = generateNodeId(words[i + 1]);
    const attentionScore = calculateAttentionScore(words[i], words[i + 1]);

    if (attentionScore >= attentionThreshold) {
      edges.push({ source: sourceId, target: targetId, weight: attentionScore });
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}

/**
 * Compresses a semantic graph by merging similar nodes and pruning weak edges.
 * @param {object} graph - The input graph with nodes and edges.
 * @param {number} mergeThreshold - Cosine similarity threshold for merging nodes.
 * @returns {object} - A compressed graph object.
 */
export function compressSemanticGraph(graph, mergeThreshold = 0.8) {
  const { nodes, edges } = graph;
  const mergedNodes = new Map();
  const prunedEdges = [];

  // Merge similar nodes based on cosine similarity
  nodes.forEach((node) => {
    let merged = false;
    for (const [key, mergedNode] of mergedNodes) {
      if (cosineSimilarity(node.embedding, mergedNode.embedding) >= mergeThreshold) {
        mergedNode.label += `, ${node.label}`;
        mergedNode.embedding = averageVectors(mergedNode.embedding, node.embedding);
        merged = true;
        break;
      }
    }
    if (!merged) {
      mergedNodes.set(node.id, { ...node });
    }
  });

  // Prune edges with low weights
  edges.forEach((edge) => {
    if (edge.weight >= mergeThreshold) {
      prunedEdges.push(edge);
    }
  });

  return { nodes: Array.from(mergedNodes.values()), edges: prunedEdges };
}

/**
 * Calculates a placeholder attention score between two words (proximity-based).
 * @param {string} word1 - The first word.
 * @param {string} word2 - The second word.
 * @returns {number} - A simulated attention score.
 */
function calculateAttentionScore(word1, word2) {
  return 1 / (1 + Math.abs(word1.length - word2.length));
}

/**
 * Converts a hash into a simple vector representation.
 * @param {string} hash - The hash string.
 * @returns {number[]} - A vector representation.
 */
function hashToVector(hash) {
  return Array.from(hash).slice(0, 16).map((char) => char.charCodeAt(0) / 255);
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number} - The cosine similarity score.
 */
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v ** 2, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v ** 2, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Averages two vectors element-wise.
 * @param {number[]} vec1 - The first vector.
 * @param {number[]} vec2 - The second vector.
 * @returns {number[]} - The averaged vector.
 */
function averageVectors(vec1, vec2) {
  return vec1.map((v, i) => (v + vec2[i]) / 2);
}
