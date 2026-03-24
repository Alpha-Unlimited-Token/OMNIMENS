/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: scheduledTaskManager
 * Written: 2026-03-24T12:39:53.780Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
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
