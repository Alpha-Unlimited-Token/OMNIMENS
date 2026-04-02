/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextMemory
 * Written: 2026-04-02T13:30:04.202Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextMemory.mjs

import crypto from 'crypto';

/**
 * Utility to hash content for unique identification.
 * @param {string} content - The input string to hash.
 * @returns {string} - A SHA-256 hash of the content.
 */
export function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Node structure for hierarchical memory.
 * @typedef {Object} MemoryNode
 * @property {string} id - Unique identifier for the node.
 * @property {string} summary - Summarized content of the node.
 * @property {number} importance - Importance weight of the node.
 * @property {MemoryNode[]} children - Child nodes.
 */

/**
 * Creates a new memory node.
 * @param {string} summary - The summarized content.
 * @param {number} importance - The importance weight.
 * @returns {MemoryNode} - A new memory node.
 */
export function createMemoryNode(summary, importance) {
  return {
    id: hashContent(summary + importance),
    summary,
    importance,
    children: []
  };
}

/**
 * Recursively summarizes hierarchical memory.
 * @param {MemoryNode} node - The root node to summarize.
 * @returns {string} - A recursive summary of the memory tree.
 */
export function summarizeMemory(node) {
  let summary = `${node.summary} (Importance: ${node.importance})`;
  for (const child of node.children) {
    summary += `\n  ${summarizeMemory(child)}`;
  }
  return summary;
}

/**
 * Inserts a new node into the hierarchical memory tree.
 * @param {MemoryNode} root - The root node of the memory tree.
 * @param {MemoryNode} newNode - The new node to insert.
 * @param {number} threshold - Importance threshold for insertion.
 * @returns {boolean} - True if inserted, false otherwise.
 */
export function insertMemoryNode(root, newNode, threshold) {
  if (newNode.importance >= threshold) {
    root.children.push(newNode);
    return true;
  }
  for (const child of root.children) {
    if (insertMemoryNode(child, newNode, threshold)) {
      return true;
    }
  }
  return false;
}

/**
 * Queries memory nodes by content match.
 * @param {MemoryNode} root - The root node of the memory tree.
 * @param {string} query - The query string to search for.
 * @returns {MemoryNode[]} - List of matching nodes.
 */
export function queryMemory(root, query) {
  const matches = [];
  if (root.summary.includes(query)) {
    matches.push(root);
  }
  for (const child of root.children) {
    matches.push(...queryMemory(child, query));
  }
  return matches;
}

/**
 * Dynamically expands token window by retrieving relevant nodes.
 * @param {MemoryNode} root - The root node of the memory tree.
 * @param {string} query - Query string to expand context.
 * @returns {string} - Expanded context summary.
 */
export function expandContext(root, query) {
  const relevantNodes = queryMemory(root, query);
  return relevantNodes.map(node => summarizeMemory(node)).join('\n');
}

// Example usage:
// const root = createMemoryNode("Root summary", 10);
// const child1 = createMemoryNode("Child summary 1", 5);
// const child2 = createMemoryNode("Child summary 2", 8);
// insertMemoryNode(root, child1, 5);
// insertMemoryNode(root, child2, 7);
// console.log(summarizeMemory(root));
// console.log(expandContext(root, "Child"));