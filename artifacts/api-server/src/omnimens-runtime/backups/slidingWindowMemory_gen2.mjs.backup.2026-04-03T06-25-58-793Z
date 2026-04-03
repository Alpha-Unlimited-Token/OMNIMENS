/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: slidingWindowMemory
 * Written: 2026-04-01T22:11:04.839Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// slidingWindowMemory.mjs

import crypto from 'crypto';

/**
 * Generates a hash for a given string to track unique memory entries.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash of the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a block of text using a simple frequency-based keyword extraction algorithm.
 * @param {string} text - The input text to summarize.
 * @param {number} maxKeywords - The maximum number of keywords to extract.
 * @returns {string} - A compressed summary of the input text.
 */
export function summarizeText(text, maxKeywords = 5) {
  const wordFrequency = {};
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];

  for (const word of words) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  }

  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sortedWords.join(' ');
}

/**
 * Compresses memory blocks into a graph structure to retain essential relationships.
 * @param {Array<{ id, content}>} memoryBlocks - Array of memory blocks with unique IDs and content.
 * @returns {Map<string, Set<string>>} - A graph where nodes are memory block IDs and edges represent content similarity.
 */
export function compressMemory(memoryBlocks) {
  const graph = new Map();

  for (let i = 0; i < memoryBlocks.length; i++) {
    const { id: idA, content: contentA } = memoryBlocks[i];
    graph.set(idA, new Set());

    for (let j = i + 1; j < memoryBlocks.length; j++) {
      const { id: idB, content: contentB } = memoryBlocks[j];
      const similarity = calculateSimilarity(contentA, contentB);

      if (similarity > 0.5) { // Threshold for similarity
        graph.get(idA).add(idB);
        if (!graph.has(idB)) graph.set(idB, new Set());
        graph.get(idB).add(idA);
      }
    }
  }

  return graph;
}

/**
 * Calculates similarity between two pieces of text using Jaccard similarity.
 * @param {string} textA - The first text input.
 * @param {string} textB - The second text input.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSimilarity(textA, textB) {
  const setA = new Set(textA.toLowerCase().match(/\b\w+\b/g) || []);
  const setB = new Set(textB.toLowerCase().match(/\b\w+\b/g) || []);

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Maintains a sliding window of memory by summarizing older entries and keeping recent ones intact.
 * @param {Array<{ id, content}>} memoryBlocks - Array of memory blocks with unique IDs and content.
 * @param {number} windowSize - The number of recent memory blocks to keep in full detail.
 * @returns {Array<{ id, content}>} - Updated memory blocks with older entries summarized.
 */
export function slidingWindow(memoryBlocks, windowSize) {
  if (memoryBlocks.length <= windowSize) return memoryBlocks;

  const recent = memoryBlocks.slice(-windowSize);
  const older = memoryBlocks.slice(0, -windowSize);

  const summarizedOlder = older.map(block => ({
    id: block.id,
    content: summarizeText(block.content)
  }));

  return [...summarizedOlder, ...recent];
}

/**
 * Adds a new memory block to the sliding window while maintaining size constraints.
 * @param {Array<{ id, content}>} memoryBlocks - Current memory blocks.
 * @param {string} newContent - The content of the new memory block.
 * @param {number} windowSize - The maximum size of the memory window.
 * @returns {Array<{ id, content}>} - Updated memory blocks.
 */
export function addMemoryBlock(memoryBlocks, newContent, windowSize) {
  const newBlock = {
    id: generateHash(newContent),
    content: newContent
  };

  const updatedBlocks = [...memoryBlocks, newBlock];
  return slidingWindow(updatedBlocks, windowSize);
}