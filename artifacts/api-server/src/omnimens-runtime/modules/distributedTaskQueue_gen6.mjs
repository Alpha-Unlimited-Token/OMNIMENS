/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskQueue
 * Written: 2026-04-02T14:10:42.637Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskQueue.mjs

import { randomUUID } from 'crypto';

// Task Queue Management
const taskQueue = [];
const taskResults = new Map();
const instanceId = randomUUID();

// Paxos-like Consensus Variables
let leaderId = null;
let proposalNumber = 0;
let acceptedProposal = null;

/**
 * Proposes a new leader for task coordination.
 * @param {string} candidateId - The ID of the candidate instance.
 * @returns {boolean} Whether the proposal was accepted.
 */
export function proposeLeader(candidateId) {
  proposalNumber++;
  if (!acceptedProposal || proposalNumber > acceptedProposal.number) {
    acceptedProposal = { number: proposalNumber, leader: candidateId };
    leaderId = candidateId;
    return true;
  }
  return false;
}

/**
 * Checks if the current instance is the leader.
 * @returns {boolean} True if the current instance is the leader.
 */
export function isLeader() {
  return leaderId === instanceId;
}

/**
 * Adds a task to the distributed queue.
 * @param {Function} taskFunction - The task to be executed.
 * @param {Array} args - Arguments for the task function.
 * @returns {string} Task ID.
 */
export function addTask(taskFunction, args) {
  const taskId = randomUUID();
  taskQueue.push({ taskId, taskFunction, args });
  return taskId;
}

/**
 * Executes tasks from the queue if the instance is the leader.
 */
export function executeTasks() {
  if (!isLeader()) return;

  while (taskQueue.length > 0) {
    const { taskId, taskFunction, args } = taskQueue.shift();
    try {
      const result = taskFunction(...args);
      taskResults.set(taskId, { success: true, result });
    } catch (error) {
      taskResults.set(taskId, { success: false, error: error.message });
    }
  }
}

/**
 * Retrieves the result of a completed task.
 * @param {string} taskId - The ID of the task.
 * @returns {Object|null} Task result or null if not found.
 */
export function getTaskResult(taskId) {
  return taskResults.get(taskId) || null;
}

/**
 * Utility function to simulate distributed consensus during leader election.
 * @param {Array<string>} instanceIds - Array of instance IDs in the system.
 * @returns {string} Elected leader ID.
 */
export function simulateLeaderElection(instanceIds) {
  let maxId = instanceIds[0];
  for (const id of instanceIds) {
    if (id > maxId) maxId = id;
  }
  proposeLeader(maxId);
  return maxId;
}

/**
 * Resets the internal state for testing or re-initialization.
 */
export function resetState() {
  leaderId = null;
  proposalNumber = 0;
  acceptedProposal = null;
  taskQueue.length = 0;
  taskResults.clear();
}

/**
 * Example utility task for demonstration purposes.
 * @param {number} a - First number.
 * @param {number} b - Second number.
 * @returns {number} Sum of a and b.
 */
export function exampleTask(a, b) {
  return a + b;
}