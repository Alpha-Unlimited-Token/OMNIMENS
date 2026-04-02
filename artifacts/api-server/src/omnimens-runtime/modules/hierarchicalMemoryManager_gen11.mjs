/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:52:55.350Z
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

import crypto from 'crypto';

/**
 * Utility to manage hierarchical memory structures with fine-grained details and abstracted summaries.
 */

// Helper function: Generate a unique identifier for memory blocks
export function generateMemoryId() {
  return crypto.randomUUID();
}

// Helper function: Normalize importance weights (ensures they sum to 1)
export function normalizeWeights(weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map(weight => weight / total);
}

// Core function: Create a hierarchical memory structure
export function createMemoryHierarchy(layers = 3) {
  if (layers < 1) throw new Error("Memory hierarchy must have at least one layer.");

  const hierarchy = [];
  for (let i = 0; i < layers; i++) {
    hierarchy.push({
      id: generateMemoryId(),
      layer: i,
      memoryBlocks: []
    });
  }
  return hierarchy;
}

// Core function: Add memory to a specific layer
export function addMemory(hierarchy, layerIndex, memoryContent, importance = 1) {
  if (layerIndex < 0 || layerIndex >= hierarchy.length) {
    throw new Error("Invalid layer index.");
  }

  const layer = hierarchy[layerIndex];
  const memoryBlock = {
    id: generateMemoryId(),
    content: memoryContent,
    importance,
    timestamp: Date.now()
  };

  layer.memoryBlocks.push(memoryBlock);
}

// Core function: Retrieve summarized memory from a layer
export function summarizeLayer(layer, maxSummaries = 3) {
  if (!layer.memoryBlocks.length) return [];

  // Sort by importance, descending
  const sortedBlocks = [...layer.memoryBlocks].sort((a, b) => b.importance - a.importance);

  // Select top blocks based on maxSummaries
  const summaries = sortedBlocks.slice(0, maxSummaries).map(block => ({
    id: block.id,
    summary: block.content.slice(0, 100), // Truncate content for summary
    importance: block.importance
  }));

  return summaries;
}

// Core function: Adjust importance weights dynamically
export function adjustMemoryImportance(layer, adjustmentFunction) {
  if (typeof adjustmentFunction !== "function") {
    throw new Error("adjustmentFunction must be a valid function.");
  }

  layer.memoryBlocks.forEach(block => {
    block.importance = adjustmentFunction(block.importance);
  });

  // Normalize importance weights after adjustment
  const weights = layer.memoryBlocks.map(block => block.importance);
  const normalizedWeights = normalizeWeights(weights);

  layer.memoryBlocks.forEach((block, index) => {
    block.importance = normalizedWeights[index];
  });
}

// Core function: Retrieve memory across all layers
export function retrieveMemory(hierarchy, filterFunction) {
  if (typeof filterFunction !== "function") {
    throw new Error("filterFunction must be a valid function.");
  }

  const results = [];
  hierarchy.forEach(layer => {
    const filteredBlocks = layer.memoryBlocks.filter(filterFunction);
    results.push(...filteredBlocks);
  });

  return results;
}

// Example adjustment function: Decay importance over time
export function decayImportance(importance, decayRate = 0.95) {
  return importance * decayRate;
}

// Example filter function: Retrieve recent memories within a time window
export function filterRecentMemories(memoryBlock, timeWindowMs = 3600000) {
  return Date.now() - memoryBlock.timestamp <= timeWindowMs;
}

// Example usage:
// const hierarchy = createMemoryHierarchy(3);
// addMemory(hierarchy, 0, "Detailed memory content", 0.8);
// const summaries = summarizeLayer(hierarchy[0]);
// adjustMemoryImportance(hierarchy[0], importance => decayImportance(importance));
// const recentMemories = retrieveMemory(hierarchy, block => filterRecentMemories(block));