/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: symbolicReasoningEngine
 * Written: 2026-04-02T16:30:46.286Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// symbolicReasoningEngine.mjs

import { createHash } from 'crypto';

/**
 * Represents a graph-based knowledge structure for symbolic reasoning.
 * Nodes represent concepts, edges represent relationships.
 */
const knowledgeGraph = new Map();

/**
 * Adds a node to the knowledge graph.
 * @param {string} id - Unique identifier for the node.
 * @param {object} data - Metadata or properties of the node.
 */
export function addNode(id, data = {}) {
  if (!id || typeof id !== 'string') {
    throw new Error('Node ID must be a non-empty string.');
  }
  if (knowledgeGraph.has(id)) {
    throw new Error(`Node with ID '${id}' already exists.`);
  }
  knowledgeGraph.set(id, { data, edges: new Map() });
}

/**
 * Adds a directed edge between two nodes in the knowledge graph.
 * @param {string} from - ID of the source node.
 * @param {string} to - ID of the target node.
 * @param {object} relation - Metadata describing the relationship.
 */
export function addEdge(from, to, relation = {}) {
  if (!knowledgeGraph.has(from) || !knowledgeGraph.has(to)) {
    throw new Error('Both nodes must exist in the graph.');
  }
  knowledgeGraph.get(from).edges.set(to, relation);
}

/**
 * Performs forward chaining to infer new facts based on existing rules.
 * @param {Function} ruleFunction - A function that takes a node and its edges, and returns inferred facts.
 * @returns {Array} - Array of inferred facts.
 */
export function forwardChaining(ruleFunction) {
  if (typeof ruleFunction !== 'function') {
    throw new Error('Rule function must be a valid function.');
  }
  const inferredFacts = [];
  for (const [id, { data, edges }] of knowledgeGraph.entries()) {
    const newFacts = ruleFunction(id, data, edges);
    if (Array.isArray(newFacts)) {
      inferredFacts.push(...newFacts);
    }
  }
  return inferredFacts;
}

/**
 * Performs backward chaining to determine if a goal can be satisfied.
 * @param {string} goal - The target node or condition to satisfy.
 * @param {Function} conditionFunction - A function that evaluates if a node satisfies the goal.
 * @returns {boolean} - True if the goal is satisfied, otherwise false.
 */
export function backwardChaining(goal, conditionFunction) {
  if (typeof goal !== 'string' || typeof conditionFunction !== 'function') {
    throw new Error('Invalid Array.from(/* args */{}): goal must be a string, and conditionFunction must be a function.');
  }

  const visited = new Set();

  function search(nodeId) {
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    const { data, edges } = knowledgeGraph.get(nodeId) || {};
    if (conditionFunction(nodeId, data)) return true;

    for (const [neighbor] of edges) {
      if (search(neighbor)) return true;
    }
    return false;
  }

  return search(goal);
}

/**
 * Utility function to compute a hash of a node's data for integrity checks.
 * @param {object} data - The data object to hash.
 * @returns {string} - A SHA-256 hash of the data.
 */
export function computeDataHash(data) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be a non-null object.');
  }
  const jsonString = JSON.stringify(data);
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Clears the entire knowledge graph. Use with caution.
 */
export function clearKnowledgeGraph() {
  knowledgeGraph.clear();
}

/**
 * Retrieves the current state of the knowledge graph.
 * @returns {Map} - A deep copy of the knowledge graph.
 */
export function getKnowledgeGraph() {
  return new Map(knowledgeGraph);
}
