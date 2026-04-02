/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T14:12:33.534Z
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

// Utility to create a hash for node IDs
export function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Node structure for the hierarchical tree
class MemoryNode {
  constructor(content = null, parent = null) {
    this.id = hashContent(content || 'root');
    this.content = content; // Raw content or summary
    this.parent = parent;   // Parent node reference
    this.children = [];     // Child nodes
    this.summary = null;    // Cached summary
  }

  // Add a child node
  addChild(content) {
    const childNode = new MemoryNode(content, this);
    this.children.push(childNode);
    return childNode;
  }

  // Generate a summary for the current node
  summarize() {
    if (this.children.length === 0) {
      this.summary = this.content;
    } else {
      this.summary = this.children.map(child => child.summarize()).join(' ');
    }
    return this.summary;
  }

  // Expand a node by retrieving its content and children
  expand() {
    return {
      id: this.id,
      content: this.content,
      children: this.children.map(child => child.expand())
    };
  }
}

// Create a new hierarchical memory tree
export function createMemoryTree(rootContent = "Root") {
  return new MemoryNode(rootContent);
}

// Traverse the tree to find a node by ID
export function findNodeById(node, id) {
  if (node.id === id) return node;
  for (const child of node.children) {
    const result = findNodeById(child, id);
    if (result) return result;
  }
  return null;
}

// Add content to a specific node by ID
export function addContentToNode(tree, nodeId, content) {
  const node = findNodeById(tree, nodeId);
  if (!node) throw new Error(`Node with ID ${nodeId} not found.`);
  return node.addChild(content);
}

// Generate a hierarchical summary for the entire tree
export function generateTreeSummary(tree) {
  return tree.summarize();
}

// Expand the entire tree structure into a nested object
export function expandTree(tree) {
  return tree.expand();
}

// Example usage (commented out for production modules)
// const root = createMemoryTree("Root Content");
// const child1 = addContentToNode(root, root.id, "Child 1 Content");
// const child2 = addContentToNode(root, root.id, "Child 2 Content");
// addContentToNode(root, child1.id, "Grandchild 1 Content");
// console.log(generateTreeSummary(root));
// console.log(expandTree(root));