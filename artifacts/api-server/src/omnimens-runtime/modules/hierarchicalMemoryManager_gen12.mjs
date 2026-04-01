/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:14:19.725Z
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

// Utility function to generate a unique hash for a given string
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

// Node structure for the hierarchical memory tree
class MemoryNode {
  constructor(data = null) {
    this.data = data; // Stores the context chunk
    this.children = new Map(); // Maps hash keys to child nodes
  }
}

// Root node of the memory tree
const memoryRoot = new MemoryNode();

// Function to add a context chunk to the memory tree
export function addContextChunk(contextChunk) {
  const words = contextChunk.split(' ');
  let currentNode = memoryRoot;

  for (const word of words) {
    const wordHash = generateHash(word);
    if (!currentNode.children.has(wordHash)) {
      currentNode.children.set(wordHash, new MemoryNode(word));
    }
    currentNode = currentNode.children.get(wordHash);
  }

  // Store the full context chunk at the final node
  currentNode.data = contextChunk;
}

// Function to retrieve semantically similar context chunks
export function retrieveContextChunks(query, maxResults = 5) {
  const queryWords = query.split(' ');
  const results = new Map();

  // Recursive function to traverse the tree and find matches
  function traverse(node, depth = 0) {
    if (node.data) {
      const similarityScore = calculateSimilarity(query, node.data);
      results.set(node.data, similarityScore);
    }

    for (const child of node.children.values()) {
      traverse(child, depth + 1);
    }
  }

  traverse(memoryRoot);

  // Sort results by similarity score and return the top matches
  return Array.from(results.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults)
    .map(([chunk]) => chunk);
}

// Function to calculate a basic similarity score between two strings
export function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  return intersection.size / Math.max(set1.size, set2.size);
}

// Function to clear the memory tree (useful for testing or resetting)
export function clearMemory() {
  memoryRoot.children.clear();
}

// Example usage (can be removed in production):
// addContextChunk("The quick brown fox jumps over the lazy dog");
// addContextChunk("The quick brown fox is fast and clever");
// console.log(retrieveContextChunks("quick brown fox"));