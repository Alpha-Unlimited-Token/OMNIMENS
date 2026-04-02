/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: statefulTaskQueue
 * Purpose: Manages long-running computations by breaking them into resumable tasks across subprocesses.
 * Description: Manages long-running computations by breaking them into resumable tasks using dependency graphs and state serialization.
 * Migrated: 2026-04-02T00:45:21.097Z
 */

// statefulTaskQueue.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given task state.
 * Useful for checkpointing and resuming tasks.
 * @param {object} state - The state object to hash.
 * @returns {string} - A unique hash representing the state.
 */
export function generateStateHash(state) {
  const stateString = JSON.stringify(state);
  return createHash('sha256').update(stateString).digest('hex');
}

/**
 * Creates a dependency graph for tasks.
 * @param {Array<{ id: string, dependencies: string[] }>} tasks - Array of task objects.
 * @returns {Map<string, Set<string>>} - A map representing the dependency graph.
 */
export function createDependencyGraph(tasks) {
  const graph = new Map();

  for (const task of tasks) {
    graph.set(task.id, new Set(task.dependencies));
  }

  return graph;
}

/**
 * Resolves tasks in topological order based on dependencies.
 * @param {Map<string, Set<string>>} graph - The dependency graph.
 * @returns {string[]} - Ordered list of task IDs.
 */
export function resolveTaskOrder(graph) {
  const resolved = [];
  const visited = new Set();

  function visit(node) {
    if (visited.has(node)) return;
    visited.add(node);

    for (const dependency of graph.get(node) || []) {
      visit(dependency);
    }

    resolved.push(node);
  }

  for (const node of graph.keys()) {
    visit(node);
  }

  return resolved;
}

/**
 * Serializes task state for checkpointing.
 * @param {object} state - The state to serialize.
 * @returns {string} - Serialized state.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes task state from a checkpoint.
 * @param {string} serializedState - The serialized state string.
 * @returns {object} - Deserialized state.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Executes tasks in a resumable manner.
 * @param {Array<{ id: string, dependencies: string[], execute: () => Promise<any> }>} tasks - Array of task objects.
 * @param {object} checkpoint - Optional checkpoint to resume from.
 * @returns {Promise<object>} - Final state after executing all tasks.
 */
export async function executeTasks(tasks, checkpoint = {}) {
  const graph = createDependencyGraph(tasks);
  const taskOrder = resolveTaskOrder(graph);

  const state = checkpoint.state || {};
  const completed = new Set(checkpoint.completed || []);

  for (const taskId of taskOrder) {
    if (completed.has(taskId)) continue;

    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task with ID ${taskId} not found.`);

    state[taskId] = await task.execute();
    completed.add(taskId);
  }

  return { state, completed: Array.from(completed) };
}

/**
 * Creates a checkpoint from the current state.
 * @param {object} state - The current task state.
 * @param {string[]} completed - List of completed task IDs.
 * @returns {object} - Checkpoint object.
 */
export function createCheckpoint(state, completed) {
  return { state, completed };
}
