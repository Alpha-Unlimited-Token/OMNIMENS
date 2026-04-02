/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-02T22:08:47.103Z
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

/**
 * Generate a unique hash for a given input to identify nodes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Create a hierarchical memory tree structure for organizing embeddings and summaries.
 * @param {Array} data - Array of data objects to organize.
 * @param {number} compressionFactor - Number of items to summarize per level.
 * @returns {Object} - The root node of the hierarchical memory tree.
 */
export function createMemoryTree(data, compressionFactor = 5) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array.');
  }
  if (compressionFactor < 2) {
    throw new Error('Compression factor must be at least 2.');
  }

  const buildTree = (nodes) => {
    if (nodes.length <= compressionFactor) {
      return {
        id: generateHash(JSON.stringify(nodes)),
        summary: summarizeNodes(nodes),
        children: nodes
      };
    }

    const groupedNodes = [];
    for (let i = 0; i < nodes.length; i += compressionFactor) {
      groupedNodes.push(nodes.slice(i, i + compressionFactor));
    }

    const parentNodes = groupedNodes.map(group => ({
      id: generateHash(JSON.stringify(group)),
      summary: summarizeNodes(group),
      children: group
    }));

    return buildTree(parentNodes);
  };

  return buildTree(data.map(item => ({ id: generateHash(JSON.stringify(item)), data: item })));
}

/**
 * Summarize a group of nodes into a single summary string.
 * @param {Array} nodes - Array of nodes to summarize.
 * @returns {string} - A summary of the nodes.
 */
export function summarizeNodes(nodes) {
  return nodes.map(node => node.data || node.summary).join(' | ');
}

/**
 * Retrieve relevant data from the memory tree based on a query.
 * @param {Object} tree - The hierarchical memory tree.
 * @param {Function} relevanceFunction - A function to evaluate relevance of nodes.
 * @returns {Array} - Relevant data nodes.
 */
export function queryMemoryTree(tree, relevanceFunction) {
  const results = [];

  const traverse = (node) => {
    if (relevanceFunction(node)) {
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverse);
      } else {
        results.push(node.data);
      }
    }
  };

  traverse(tree);
  return results;
}

/**
 * Example relevance function to match nodes containing a specific keyword.
 * @param {string} keyword - The keyword to match.
 * @returns {Function} - A relevance function for use in queryMemoryTree.
 */
export function createKeywordRelevanceFunction(keyword) {
  return (node) => {
    const content = node.data || node.summary;
    return content && content.toLowerCase().includes(keyword.toLowerCase());
  };
}

/**
 * Flatten the hierarchical memory tree into a single array of nodes.
 * @param {Object} tree - The hierarchical memory tree.
 * @returns {Array} - Flattened array of all nodes in the tree.
 */
export function flattenMemoryTree(tree) {
  const nodes = [];

  const traverse = (node) => {
    nodes.push(node);
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  };

  traverse(tree);
  return nodes;
}
