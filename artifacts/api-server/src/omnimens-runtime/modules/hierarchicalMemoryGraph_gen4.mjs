/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryGraph
 * Written: 2026-04-03T12:58:34.688Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryGraph.mjs

import { createHash } from 'crypto';

// Utility function: Hashes a string to generate a consistent numeric value
export function hashStringToNumber(input) {
  const hash = createHash('sha256').update(input).digest('hex');
  return parseInt(hash.slice(0, 15), 16); // Use a portion of the hash for a numeric value
}

// Utility function: Compute cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must have the same length');
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Class: Represents a node in the hierarchical memory graph
class MemoryNode {
  constructor(id, data, vector) {
    this.id = id;
    this.data = data;
    this.vector = vector; // High-dimensional vector for semantic locality
    this.children = new Map(); // Child nodes organized by hash buckets
  }
}

// Utility function: Generate locality-sensitive hash (LSH) buckets for a vector
export function generateLSHBuckets(vector, numBuckets = 10) {
  const buckets = [];
  for (let i = 0; i < numBuckets; i++) {
    const randomProjection = vector.map(() => Math.random() - 0.5);
    const dotProduct = vector.reduce((sum, v, idx) => sum + v * randomProjection[idx], 0);
    buckets.push(dotProduct >= 0 ? 1 : 0);
  }
  return buckets.join('');
}

// Class: HierarchicalMemoryGraph
export class HierarchicalMemoryGraph {
  constructor() {
    this.root = new MemoryNode('root', null, []);
  }

  // Add a node to the graph
  addNode(data, vector) {
    const id = hashStringToNumber(JSON.stringify(data));
    const buckets = generateLSHBuckets(vector);
    let currentNode = this.root;

    // Traverse or create nodes along the hash bucket path
    for (const bucket of buckets) {
      if (!currentNode.children.has(bucket)) {
        currentNode.children.set(bucket, new MemoryNode(`${currentNode.id}-${bucket}`, null, []));
      }
      currentNode = currentNode.children.get(bucket);
    }

    // Add the new node at the leaf
    currentNode.data = data;
    currentNode.vector = vector;
  }

  // Retrieve the most similar node to a given vector
  retrieveSimilarNode(vector) {
    let currentNode = this.root;
    let bestMatch = null;
    let bestSimilarity = -Infinity;

    function traverse(node) {
      if (node.vector.length > 0) {
        const similarity = cosineSimilarity(vector, node.vector);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = node;
        }
      }
      for (const child of node.children.values()) {
        traverse(child);
      }
    }

    traverse(currentNode);
    return bestMatch;
  }
}

// Example usage (commented out for production modules)
// const graph = new HierarchicalMemoryGraph();
// graph.addNode({ name: 'Node1' }, [0.1, 0.2, 0.3]);
// graph.addNode({ name: 'Node2' }, [0.4, 0.5, 0.6]);
// const similarNode = graph.retrieveSimilarNode([0.4, 0.5, 0.6]);
// console.log(similarNode);