/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskManager
 * Written: 2026-04-03T18:58:11.229Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskManager.mjs

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

// Task Queue
const taskQueue = [];
const workers = new Map();

// Utility: Add task to queue
export function addTask(taskData) {
  const taskId = randomUUID();
  taskQueue.push({ taskId, taskData, status: 'pending' });
  return taskId;
}

// Utility: Get task status
export function getTaskStatus(taskId) {
  const task = taskQueue.find(t => t.taskId === taskId);
  return task ? task.status : 'not_found';
}

// Master Node: Distribute tasks
export function startMasterNode(port = 8080) {
  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on('connection', ws => {
    const workerId = randomUUID();
    workers.set(workerId, ws);

    ws.on('message', message => {
      const { taskId, result, error } = JSON.parse(message);
      const task = taskQueue.find(t => t.taskId === taskId);

      if (task) {
        task.status = error ? 'failed' : 'completed';
        task.result = result;
      }
    });

    ws.on('close', () => {
      workers.delete(workerId);
    });
  });

  server.listen(port, () => {
    console.log(`Master node running on port ${port}`);
  });

  setInterval(() => {
    for (const task of taskQueue.filter(t => t.status === 'pending')) {
      const availableWorker = Array.from(workers.values()).find(ws => ws.readyState === ws.OPEN);

      if (availableWorker) {
        availableWorker.send(JSON.stringify({ taskId: task.taskId, taskData: task.taskData }));
        task.status = 'in_progress';
      }
    }
  }, 1000);
}

// Worker Node: Process tasks
export function startWorkerNode(masterUrl) {
  const ws = new WebSocket(masterUrl);

  ws.on('message', async message => {
    const { taskId, taskData } = JSON.parse(message);

    try {
      const result = await processTask(taskData);
      ws.send(JSON.stringify({ taskId, result }));
    } catch (error) {
      ws.send(JSON.stringify({ taskId, error: error.message }));
    }
  });

  ws.on('open', () => {
    console.log('Connected to master node');
  });

  ws.on('close', () => {
    console.log('Disconnected from master node');
  });
}

// Utility: Process task (generic example function)
export async function processTask(taskData) {
  // Example computation: Simulate heavy processing
  return new Promise(resolve => {
    setTimeout(() => resolve(`Processed: ${JSON.stringify(taskData)}`), 2000);
  });
}

// Utility: Checkpointing (fault tolerance)
export function checkpointTasks() {
  return taskQueue.map(({ taskId, status, taskData }) => ({ taskId, status, taskData }));
}

// Utility: Restore from checkpoint
export function restoreFromCheckpoint(checkpoint) {
  taskQueue.length = 0;
  taskQueue.push(...checkpoint);
}
