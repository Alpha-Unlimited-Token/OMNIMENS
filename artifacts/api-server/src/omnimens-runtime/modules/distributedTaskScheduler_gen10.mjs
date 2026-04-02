/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T13:29:52.583Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskScheduler.mjs
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

const workers = new Map(); // Tracks connected workers
const tasks = new Map(); // Tracks tasks and their statuses

export function startMaster(port) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws) => {
    const workerId = randomUUID();
    workers.set(workerId, ws);

    ws.on('message', (message) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'TASK_RESULT') {
        handleTaskResult(workerId, parsedMessage.taskId, parsedMessage.result);
      }
    });

    ws.on('close', () => {
      workers.delete(workerId);
    });
  });

  console.log(`Master started on port ${port}`);
}

export function distributeTask(taskId, taskData) {
  if (workers.size === 0) {
    throw new Error('No workers available to distribute tasks.');
  }

  const workerIds = Array.from(workers.keys());
  const selectedWorkerId = workerIds[Math.floor(Math.random() * workerIds.length)];
  const workerSocket = workers.get(selectedWorkerId);

  tasks.set(taskId, { status: TASK_STATUS.IN_PROGRESS, result: null });

  workerSocket.send(
    JSON.stringify({
      type: 'TASK_ASSIGNMENT',
      taskId,
      taskData
    })
  );
}

export function handleTaskResult(workerId, taskId, result) {
  if (!tasks.has(taskId)) {
    console.warn(`Received result for unknown task: ${taskId}`);
    return;
  }

  const task = tasks.get(taskId);
  task.status = TASK_STATUS.COMPLETED;
  task.result = result;

  console.log(`Task ${taskId} completed by worker ${workerId}:`, result);
}

export function getTaskStatus(taskId) {
  if (!tasks.has(taskId)) {
    throw new Error(`Task ${taskId} not found.`);
  }

  return tasks.get(taskId);
}

export function startWorker(masterUrl) {
  const ws = new WebSocket(masterUrl);

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'TASK_ASSIGNMENT') {
      const { taskId, taskData } = parsedMessage;
      const result = executeTask(taskData);

      ws.send(
        JSON.stringify({
          type: 'TASK_RESULT',
          taskId,
          result
        })
      );
    }
  });

  console.log('Worker connected to master at', masterUrl);
}

export function executeTask(taskData) {
  // Example task execution logic (generic computation)
  return taskData.map((x) => x * 2); // Example: doubling each number in an array
}

export const TASK_STATUS_CONSTANTS = TASK_STATUS;