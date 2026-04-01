/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: iterativeComputationHandler
 * Purpose: Enables complex iterative computations across subprocess timeouts by checkpointing intermediate states.
 * Description: Enables resumable iterative computations with state checkpointing, useful for tasks like graph traversal or long-running algorithms.
 * Migrated: 2026-04-01T22:23:20.240Z
 */

// iterativeComputationHandler.mjs

import { setTimeout } from 'timers/promises';

/**
 * Serializes the state of a computation for checkpointing.
 * @param {any} state - The current state of the computation.
 * @returns {string} Serialized state as a JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes the state of a computation from a checkpoint.
 * @param {string} serializedState - The serialized state as a JSON string.
 * @returns {any} Deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Splits a long-running computation into resumable chunks using async/await.
 * @param {Function} computeStep - A function performing one step of the computation.
 * @param {any} initialState - The initial state of the computation.
 * @param {number} timeoutMs - Maximum time (in milliseconds) for each chunk.
 * @returns {Promise<any>} Final state after completing all chunks.
 */
export async function iterativeComputationHandler(computeStep, initialState, timeoutMs) {
  let state = initialState;
  let startTime = Date.now();

  while (!state.done) {
    state = computeStep(state);

    // Check if the timeout has been reached
    if (Date.now() - startTime >= timeoutMs) {
      await setTimeout(0); // Yield control to prevent blocking
      startTime = Date.now(); // Reset the timer for the next chunk
    }
  }

  return state;
}

/**
 * Example utility function for iterative graph traversal (e.g., BFS or DFS).
 * @param {Object} graph - The graph represented as an adjacency list.
 * @param {string} startNode - The starting node for traversal.
 * @returns {Function} A computeStep function for iterativeComputationHandler.
 */
export function createGraphTraversalStep(graph, startNode) {
  const visited = new Set();
  const queue = [startNode];

  return (state) => {
    if (!state.initialized) {
      state.initialized = true;
      state.queue = queue;
      state.visited = visited;
      state.result = [];
    }

    if (state.queue.length === 0) {
      state.done = true;
      return state;
    }

    const currentNode = state.queue.shift();

    if (!state.visited.has(currentNode)) {
      state.visited.add(currentNode);
      state.result.push(currentNode);

      for (const neighbor of graph[currentNode] || []) {
        if (!state.visited.has(neighbor)) {
          state.queue.push(neighbor);
        }
      }
    }

    return state;
  };
}

/**
 * Example usage of the module for a graph traversal task.
 * @param {Object} graph - The graph represented as an adjacency list.
 * @param {string} startNode - The starting node for traversal.
 * @param {number} timeoutMs - Timeout for each computation chunk.
 * @returns {Promise<string[]>} The traversal order of nodes.
 */
export async function traverseGraph(graph, startNode, timeoutMs) {
  const computeStep = createGraphTraversalStep(graph, startNode);
  const initialState = { initialized: false, done: false };

  const finalState = await iterativeComputationHandler(computeStep, initialState, timeoutMs);
  return finalState.result;
}