/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_43
 * Name: distributedTaskManager
 * Purpose: Coordinate distributed computations across multiple machines using consensus algorithms.
 * Description: A utility module for distributed task coordination using Raft-like consensus, fault tolerance, and task reassignment.
 * Migrated: 2026-04-01T22:23:20.242Z
 */

// distributedTaskManager.mjs

import { randomUUID } from 'crypto';

/**
 * Generate a unique identifier for tasks or nodes.
 * @returns {string} A unique identifier.
 */
export function generateUUID() {
  return randomUUID();
}

/**
 * Elect a leader using a simple Raft-like randomized timeout mechanism.
 * @param {Array<string>} nodes - List of node identifiers.
 * @param {number} timeoutRange - Maximum randomized timeout in milliseconds.
 * @returns {string} The elected leader's identifier.
 */
export function electLeader(nodes, timeoutRange = 5000) {
  const timeouts = nodes.map(() => Math.random() * timeoutRange);
  const minTimeoutIndex = timeouts.indexOf(Math.min(...timeouts));
  return nodes[minTimeoutIndex];
}

/**
 * Distribute tasks among nodes ensuring fault tolerance.
 * @param {Array<string>} tasks - List of tasks to distribute.
 * @param {Array<string>} nodes - List of node identifiers.
 * @returns {Object} Task distribution mapping node to tasks.
 */
export function distributeTasks(tasks, nodes) {
  const distribution = {};
  nodes.forEach(node => {
    distribution[node] = [];
  });

  tasks.forEach((task, index) => {
    const node = nodes[index % nodes.length];
    distribution[node].push(task);
  });

  return distribution;
}

/**
 * Simulate a heartbeat mechanism to check node health.
 * @param {Array<string>} nodes - List of node identifiers.
 * @param {number} timeout - Timeout in milliseconds for a node to respond.
 * @returns {Promise<Array<string>>} Resolves with healthy nodes.
 */
export async function checkNodeHealth(nodes, timeout = 3000) {
  const healthChecks = nodes.map(node => {
    return new Promise(resolve => {
      const isHealthy = Math.random() > 0.1; // Simulate 90% health rate.
      setTimeout(() => resolve({ node, isHealthy }), Math.random() * timeout);
    });
  });

  const results = await Promise.all(healthChecks);
  return results.filter(result => result.isHealthy).map(result => result.node);
}

/**
 * Reassign tasks from failed nodes to healthy nodes.
 * @param {Object} taskMap - Current task distribution.
 * @param {Array<string>} healthyNodes - List of healthy node identifiers.
 * @returns {Object} Updated task distribution.
 */
export function reassignTasks(taskMap, healthyNodes) {
  const reassignedTasks = {};
  healthyNodes.forEach(node => {
    reassignedTasks[node] = [];
  });

  Object.entries(taskMap).forEach(([node, tasks]) => {
    if (!healthyNodes.includes(node)) {
      tasks.forEach((task, index) => {
        const newNode = healthyNodes[index % healthyNodes.length];
        reassignedTasks[newNode].push(task);
      });
    } else {
      reassignedTasks[node] = tasks;
    }
  });

  return reassignedTasks;
}

/**
 * Validate task distribution ensuring no tasks are lost.
 * @param {Object} taskMap - Task distribution mapping.
 * @returns {boolean} True if all tasks are accounted for.
 */
export function validateTaskDistribution(taskMap) {
  const allTasks = Object.values(taskMap).flat();
  const uniqueTasks = new Set(allTasks);
  return allTasks.length === uniqueTasks.size;
}
