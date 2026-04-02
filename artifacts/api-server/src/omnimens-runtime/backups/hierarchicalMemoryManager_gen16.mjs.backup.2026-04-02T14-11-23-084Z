/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:19:44.357Z
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

// Utility to create unique IDs for memory nodes
export function generateUniqueId() {
  return crypto.randomUUID();
}

// Core hierarchical memory structure
const memoryHierarchy = new Map(); // Root-level memory

// Add a memory node to the hierarchy
export function addMemoryNode(parentId, data) {
  const nodeId = generateUniqueId();
  const node = { id: nodeId, parentId, data, children: [] };

  if (!parentId) {
    // Add to root level if no parentId is provided
    memoryHierarchy.set(nodeId, node);
  } else {
    // Add to the parent's children
    const parent = findMemoryNode(parentId);
    if (!parent) {
      throw new Error(`Parent node with ID ${parentId} not found.`);
    }
    parent.children.push(node);
  }

  return nodeId;
}

// Retrieve a memory node by ID
export function findMemoryNode(nodeId) {
  const stack = [...memoryHierarchy.values()];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node.id === nodeId) {
      return node;
    }
    stack.push(...node.children);
  }

  return null; // Node not found
}

// Traverse the hierarchy and apply a function to each node
export function traverseMemoryHierarchy(callback) {
  const stack = [...memoryHierarchy.values()];

  while (stack.length > 0) {
    const node = stack.pop();
    callback(node);
    stack.push(...node.children);
  }
}

// Retrieve all ancestors of a node
export function getAncestors(nodeId) {
  const ancestors = [];
  let currentNode = findMemoryNode(nodeId);

  while (currentNode && currentNode.parentId) {
    currentNode = findMemoryNode(currentNode.parentId);
    if (currentNode) {
      ancestors.push(currentNode);
    }
  }

  return ancestors;
}

// Retrieve all descendants of a node
export function getDescendants(nodeId) {
  const descendants = [];
  const node = findMemoryNode(nodeId);

  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found.`);
  }

  const stack = [...node.children];

  while (stack.length > 0) {
    const child = stack.pop();
    descendants.push(child);
    stack.push(...child.children);
  }

  return descendants;
}

// Search for nodes by a matching function
export function searchMemoryNodes(matchFunction) {
  const results = [];
  traverseMemoryHierarchy((node) => {
    if (matchFunction(node)) {
      results.push(node);
    }
  });
  return results;
}

// Example usage function for testing
export function exampleUsage() {
  const rootId = addMemoryNode(null, { name: 'Root Memory' });
  const child1Id = addMemoryNode(rootId, { name: 'Child 1' });
  const child2Id = addMemoryNode(rootId, { name: 'Child 2' });
  addMemoryNode(child1Id, { name: 'Grandchild 1.1' });
  addMemoryNode(child1Id, { name: 'Grandchild 1.2' });

  const ancestors = getAncestors(child2Id);
  const descendants = getDescendants(rootId);

  return { ancestors, descendants };
}
