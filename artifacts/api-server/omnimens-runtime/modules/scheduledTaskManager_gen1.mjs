/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: scheduledTaskManager
 * Purpose: Simulates persistent background threads using scheduled execution and state snapshots.
 * Description: Simulates persistent background threads by scheduling tasks, encrypting state snapshots, and enabling shared task management utilities.
 * Migrated: 2026-03-25T22:49:34.128Z
 */

// scheduledTaskManager.mjs

import crypto from 'crypto';

const taskStates = new Map();

function encryptState(state, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(JSON.stringify(state), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptState(encryptedState, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedState, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

export function scheduleTask(taskName, intervalMs, taskFunction, encryptionKey) {
  if (taskStates.has(taskName)) {
    throw new Error(`Task with name '${taskName}' is already scheduled.`);
  }

  const state = { progress: null, lastRun: null };
  const encryptedState = encryptState(state, encryptionKey);
  taskStates.set(taskName, encryptedState);

  const intervalId = setInterval(() => {
    try {
      const currentEncryptedState = taskStates.get(taskName);
      const currentState = decryptState(currentEncryptedState, encryptionKey);

      const updatedState = taskFunction(currentState);
      updatedState.lastRun = new Date().toISOString();

      const newEncryptedState = encryptState(updatedState, encryptionKey);
      taskStates.set(taskName, newEncryptedState);
    } catch (error) {
      console.error(`Error in task '${taskName}':`, error);
    }
  }, intervalMs);

  return () => {
    clearInterval(intervalId);
    taskStates.delete(taskName);
  };
}

export function getTaskState(taskName, encryptionKey) {
  if (!taskStates.has(taskName)) {
    throw new Error(`Task with name '${taskName}' does not exist.`);
  }

  const encryptedState = taskStates.get(taskName);
  return decryptState(encryptedState, encryptionKey);
}

export function listScheduledTasks() {
  return Array.from(taskStates.keys());
}

export function updateTaskState(taskName, newState, encryptionKey) {
  if (!taskStates.has(taskName)) {
    throw new Error(`Task with name '${taskName}' does not exist.`);
  }

  const encryptedState = encryptState(newState, encryptionKey);
  taskStates.set(taskName, encryptedState);
}

export function clearAllTasks() {
  taskStates.clear();
}
