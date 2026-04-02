/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_12
 * Name: parallelProcessingManager
 * Purpose: Manages multi-threaded computation using Node.js worker threads for parallel task execution.
 * Description: Manages multi-threaded computation using Node.js worker threads with priority scheduling and shared memory buffers for efficient parallel task execution.
 * Migrated: 2026-04-02T14:50:29.448Z
 */

// parallelProcessingManager.mjs

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

const taskQueue = [];
const workers = [];
const maxWorkers = 4; // Configurable limit for worker threads

function addTask(taskFunction, priority = 0) {
  taskQueue.push({ taskFunction, priority, id: Date.now() });
  taskQueue.sort((a, b) => b.priority - a.priority); // Higher priority tasks come first
  processQueue();
}

function processQueue() {
  if (workers.length < maxWorkers && taskQueue.length > 0) {
    const task = taskQueue.shift();
    const worker = new Worker(__filename, { workerData: task });

    workers.push(worker);

    worker.on('message', (result) => {
      console.log(`Task ${task.id} completed with result:`, result);
      removeWorker(worker);
    });

    worker.on('error', (error) => {
      console.error(`Task ${task.id} encountered an error:`, error);
      removeWorker(worker);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker for task ${task.id} exited with code ${code}`);
      }
      removeWorker(worker);
    });
  }
}

function removeWorker(worker) {
  const index = workers.indexOf(worker);
  if (index !== -1) {
    workers.splice(index, 1);
  }
  processQueue();
}

if (!isMainThread) {
  const { taskFunction } = workerData;
  const startTime = performance.now();
  const result = taskFunction(); // Execute the provided task function
  const endTime = performance.now();
  parentPort.postMessage({ result, executionTime: endTime - startTime });
}

// Utility functions
export function submitTask(taskFunction, priority = 0) {
  if (typeof taskFunction !== 'function') {
    throw new Error('Task must be a function');
  }
  addTask(taskFunction, priority);
}

export const getQueueLength = () => taskQueue.length;

export const getActiveWorkers = () => workers.length;

export const isIdle = () => taskQueue.length === 0 && workers.length === 0;

export function createSharedBuffer(size) {
  if (size <= 0) {
    throw new Error('Buffer size must be greater than zero');
  }
  return new SharedArrayBuffer(size);
}

export function writeToBuffer(buffer, offset, value) {
  const view = new Int32Array(buffer);
  view[offset] = value;
}

export function readFromBuffer(buffer, offset) {
  const view = new Int32Array(buffer);
  return view[offset];
}

export const getMaxWorkers = () => maxWorkers;

export const setMaxWorkers = (newMax) => {
  if (newMax <= 0) {
    throw new Error('Max workers must be greater than zero');
  }
  maxWorkers = newMax;
};

export function prioritizeTask(taskId, newPriority) {
  const task = taskQueue.find(t => t.id === taskId);
  if (task) {
    task.priority = newPriority;
    taskQueue.sort((a, b) => b.priority - a.priority);
  }
}