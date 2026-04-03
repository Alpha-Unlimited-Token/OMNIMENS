/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: conversationContextManager
 * Written: 2026-04-03T09:09:56.083Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// conversationContextManager.mjs

import crypto from 'crypto';

/**
 * Generates a unique identifier for nodes in the conversation tree.
 * @returns {string} A unique identifier.
 */
export function generateUniqueId() {
  return crypto.randomUUID();
}

/**
 * Represents a node in the conversation tree.
 * @typedef {Object} TreeNode
 * @property {string} id - Unique identifier for the node.
 * @property {string} summary - Summary of the conversation segment.
 * @property {TreeNode[]} children - Child nodes representing sub-conversations.
 */

/**
 * Creates a new tree node.
 * @param {string} summary - The summary for the node.
 * @returns {TreeNode} A new tree node.
 */
export function createTreeNode(summary) {
  return {
    id: generateUniqueId(),
    summary,
    children: []
  };
}

/**
 * Adds a child node to a parent node.
 * @param {TreeNode} parentNode - The parent node.
 * @param {TreeNode} childNode - The child node to add.
 */
export function addChildNode(parentNode, childNode) {
  parentNode.children.push(childNode);
}

/**
 * Summarizes a list of conversation segments.
 * @param {string[]} segments - Array of conversation segments.
 * @returns {string} A summarized string combining key details.
 */
export function summarizeSegments(segments) {
  if (segments.length === 0) return "";

  // Simple summarization: concatenate first and last segments with a count.
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const middleSummary = segments.length > 2 ? `...(${segments.length - 2} more segments)...` : "";

  return `${firstSegment} ${middleSummary} ${lastSegment}`;
}

/**
 * Builds a hierarchical conversation tree from segments.
 * @param {string[]} segments - Array of conversation segments.
 * @returns {TreeNode} Root node of the conversation tree.
 */
export function buildConversationTree(segments) {
  const rootNode = createTreeNode("Root Conversation Context");

  let currentNode = rootNode;
  let buffer = [];

  for (const segment of segments) {
    buffer.push(segment);

    // Summarize and create a new node every 5 segments.
    if (buffer.length === 5) {
      const summary = summarizeSegments(buffer);
      const newNode = createTreeNode(summary);
      addChildNode(currentNode, newNode);
      currentNode = newNode;
      buffer = [];
    }
  }

  // Handle remaining buffer.
  if (buffer.length > 0) {
    const summary = summarizeSegments(buffer);
    const newNode = createTreeNode(summary);
    addChildNode(currentNode, newNode);
  }

  return rootNode;
}

/**
 * Traverses the conversation tree and retrieves all summaries.
 * @param {TreeNode} node - The root node to traverse.
 * @returns {string[]} Array of summaries from the tree.
 */
export function getAllSummaries(node) {
  const summaries = [];

  function traverse(currentNode) {
    summaries.push(currentNode.summary);
    for (const child of currentNode.children) {
      traverse(child);
    }
  }

  traverse(node);
  return summaries;
}

/**
 * Finds a node in the tree by its unique identifier.
 * @param {TreeNode} node - The root node to search.
 * @param {string} id - The unique identifier of the node.
 * @returns {TreeNode|null} The node if found, otherwise null.
 */
export function findNodeById(node, id) {
  if (node.id === id) return node;

  for (const child of node.children) {
    const result = findNodeById(child, id);
    if (result) return result;
  }

  return null;
}

/**
 * Example usage:
 * const segments = ["Hello", "How are you?", "I'm fine", "What's new?", "Not much", "Let's discuss", "AI advancements", "Sounds good"];
 * const tree = buildConversationTree(segments);
 * console.log(getAllSummaries(tree));
 */