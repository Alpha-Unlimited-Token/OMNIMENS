/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: episodicMemoryManager
 * Written: 2026-04-01T22:04:04.079Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// episodicMemoryManager.mjs
import { createHash } from 'crypto';

/**
 * Generates a unique hash for a memory node based on its content.
 * @param {string} content - The content of the memory node.
 * @returns {string} - A unique hash string.
 */
export function generateNodeId(content) {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Represents the memory graph structure.
 */
const memoryGraph = {
  nodes: new Map(), // Map of nodeId -> { content, timestamp }
  edges: new Map()  // Map of nodeId -> Set of related nodeIds
};

/**
 * Adds an episodic memory to the graph.
 * @param {string} content - The content of the memory.
 */
export function addMemory(content) {
  const nodeId = generateNodeId(content);
  const timestamp = Date.now();

  if (!memoryGraph.nodes.has(nodeId)) {
    memoryGraph.nodes.set(nodeId, { content, timestamp });
    memoryGraph.edges.set(nodeId, new Set());
  } else {
    // Update timestamp if memory already exists
    memoryGraph.nodes.get(nodeId).timestamp = timestamp;
  }
}

/**
 * Links two memory nodes by their content.
 * @param {string} contentA - The content of the first memory.
 * @param {string} contentB - The content of the second memory.
 */
export function linkMemories(contentA, contentB) {
  const nodeIdA = generateNodeId(contentA);
  const nodeIdB = generateNodeId(contentB);

  if (memoryGraph.nodes.has(nodeIdA) && memoryGraph.nodes.has(nodeIdB)) {
    memoryGraph.edges.get(nodeIdA).add(nodeIdB);
    memoryGraph.edges.get(nodeIdB).add(nodeIdA);
  }
}

/**
 * Retrieves the most relevant memories based on recency and semantic links.
 * @param {string} content - The content to search for related memories.
 * @param {number} limit - The maximum number of memories to retrieve.
 * @returns {Array} - An array of related memory contents sorted by relevance.
 */
export function retrieveMemories(content, limit = 5) {
  const nodeId = generateNodeId(content);
  if (!memoryGraph.nodes.has(nodeId)) return [];

  const visited = new Set();
  const queue = [{ nodeId, relevance: 1 }];
  const results = [];

  while (queue.length > 0 && results.length < limit) {
    const { nodeId: currentId, relevance } = queue.shift();

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const node = memoryGraph.nodes.get(currentId);
      results.push({ content: node.content, relevance });

      // Add neighbors with decayed relevance
      for (const neighborId of memoryGraph.edges.get(currentId)) {
        if (!visited.has(neighborId)) {
          const neighborNode = memoryGraph.nodes.get(neighborId);
          const timeDecay = Math.exp(-(Date.now() - neighborNode.timestamp) / (1000 * 60 * 60)); // Decay over hours
          queue.push({ nodeId: neighborId, relevance: relevance * timeDecay });
        }
      }

      // Sort queue by relevance descending
      queue.sort((a, b) => b.relevance - a.relevance);
    }
  }

  return results.map(result => result.content);
}

/**
 * Removes old memories based on a time-to-live (TTL) threshold.
 * @param {number} ttl - The time-to-live in milliseconds.
 */
export function pruneOldMemories(ttl) {
  const now = Date.now();
  for (const [nodeId, { timestamp }] of memoryGraph.nodes) {
    if (now - timestamp > ttl) {
      memoryGraph.nodes.delete(nodeId);
      memoryGraph.edges.delete(nodeId);

      // Remove references to this node in other edges
      for (const neighbors of memoryGraph.edges.values()) {
        neighbors.delete(nodeId);
      }
    }
  }
}

/**
 * Returns the current state of the memory graph (for debugging or visualization).
 * @returns {Object} - The memory graph structure.
 */
export function getMemoryGraph() {
  return {
    nodes: Array.from(memoryGraph.nodes.entries()),
    edges: Array.from(memoryGraph.edges.entries()).map(([key, value]) => [key, Array.from(value)])
  };
}