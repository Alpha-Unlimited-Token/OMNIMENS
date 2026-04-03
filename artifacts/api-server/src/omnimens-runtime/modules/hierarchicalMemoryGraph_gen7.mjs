/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryGraph
 * Written: 2026-04-03T09:45:59.882Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryGraph.mjs

import { createHash } from 'crypto';

// Utility to generate unique node IDs based on content
export function generateNodeId(content) {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

// Node structure for the graph
export function createNode(content, embedding) {
  return {
    id: generateNodeId(content),
    content,
    embedding,
    links: [],
    summary: null
  };
}

// Add a semantic link between two nodes
export function linkNodes(nodeA, nodeB, weight = 1) {
  nodeA.links.push({ target: nodeB.id, weight });
  nodeB.links.push({ target: nodeA.id, weight });
}

// Recursive summarization algorithm for hierarchical reasoning
export function summarizeNode(node, graph, depth = 2) {
  if (depth === 0 || node.links.length === 0) {
    return node.content;
  }

  const linkedNodes = node.links.map(link => graph[link.target]);
  const summaries = linkedNodes.map(linkedNode => summarizeNode(linkedNode, graph, depth - 1));

  node.summary = summaries.join(' ');
  return node.summary;
}

// Create a hierarchical memory graph
export function createGraph() {
  return {
    nodes: {},

    addNode(content, embedding) {
      const node = createNode(content, embedding);
      this.nodes[node.id] = node;
      return node;
    },

    link(nodeAId, nodeBId, weight = 1) {
      const nodeA = this.nodes[nodeAId];
      const nodeB = this.nodes[nodeBId];
      if (nodeA && nodeB) {
        linkNodes(nodeA, nodeB, weight);
      }
    },

    summarize(nodeId, depth = 2) {
      const node = this.nodes[nodeId];
      if (node) {
        return summarizeNode(node, this.nodes, depth);
      }
      return null;
    }
  };
}

// Example usage
export function exampleUsage() {
  const graph = createGraph();

  const nodeA = graph.addNode('Node A content', [0.1, 0.2, 0.3]);
  const nodeB = graph.addNode('Node B content', [0.4, 0.5, 0.6]);
  const nodeC = graph.addNode('Node C content', [0.7, 0.8, 0.9]);

  graph.link(nodeA.id, nodeB.id, 0.9);
  graph.link(nodeB.id, nodeC.id, 0.8);

  const summary = graph.summarize(nodeA.id, 2);
  return summary;
}