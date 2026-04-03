/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-03T00:50:04.200Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import { createHash } from 'crypto';

// Utility to hash strings for unique keys
export function hashString(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Node structure for the hierarchical memory tree
class MemoryNode {
  constructor(summary = '', embeddings = []) {
    this.summary = summary; // Compressed summary of the node's content
    this.embeddings = embeddings; // Detailed embeddings stored here
    this.children = new Map(); // Child nodes
  }
}

// HierarchicalMemoryManager class
export class HierarchicalMemoryManager {
  constructor() {
    this.root = new MemoryNode();
  }

  // Add data to the memory tree
  addData(path, summary, embeddings) {
    const keys = path.split('/');
    let currentNode = this.root;

    for (const key of keys) {
      const hashedKey = hashString(key);
      if (!currentNode.children.has(hashedKey)) {
        currentNode.children.set(hashedKey, new MemoryNode());
      }
      currentNode = currentNode.children.get(hashedKey);
    }

    currentNode.summary = summary;
    currentNode.embeddings = embeddings;
  }

  // Retrieve embeddings based on a path
  retrieveEmbeddings(path) {
    const keys = path.split('/');
    let currentNode = this.root;

    for (const key of keys) {
      const hashedKey = hashString(key);
      if (!currentNode.children.has(hashedKey)) {
        return null; // Path does not exist
      }
      currentNode = currentNode.children.get(hashedKey);
    }

    return currentNode.embeddings;
  }

  // Retrieve a summary for a given path
  retrieveSummary(path) {
    const keys = path.split('/');
    let currentNode = this.root;

    for (const key of keys) {
      const hashedKey = hashString(key);
      if (!currentNode.children.has(hashedKey)) {
        return null; // Path does not exist
      }
      currentNode = currentNode.children.get(hashedKey);
    }

    return currentNode.summary;
  }

  // Perform hierarchical summarization
  summarizeTree(node = this.root) {
    if (!node) return '';

    let combinedSummary = node.summary;
    for (const child of node.children.values()) {
      combinedSummary += ' ' + this.summarizeTree(child);
    }

    return combinedSummary.trim();
  }
}

// Export utility functions for generic use
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

export function vectorMean(vectors) {
  if (vectors.length === 0) {
    throw new Error('Input vector array cannot be empty');
  }

  const dimension = vectors[0].length;
  const meanVector = new Array(dimension).fill(0);

  for (const vector of vectors) {
    if (vector.length !== dimension) {
      throw new Error('All vectors must have the same dimension');
    }

    for (let i = 0; i < dimension; i++) {
      meanVector[i] += vector[i];
    }
  }

  return meanVector.map(val => val / vectors.length);
}

// Example usage (commented out for production use)
// const memoryManager = new HierarchicalMemoryManager();
// memoryManager.addData('science/physics', 'Physics summary', [0.1, 0.2, 0.3]);
// console.log(memoryManager.retrieveSummary('science/physics'));
// console.log(memoryManager.retrieveEmbeddings('science/physics'));
// console.log(memoryManager.summarizeTree());