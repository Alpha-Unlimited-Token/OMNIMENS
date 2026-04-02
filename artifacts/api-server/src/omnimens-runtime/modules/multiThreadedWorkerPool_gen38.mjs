/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multiThreadedWorkerPool
 * Written: 2026-04-02T14:54:59.971Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multiThreadedWorkerPool.mjs

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { performance } from 'perf_hooks';

// Utility to create a worker pool for parallel task execution
export function createWorkerPool(workerScript, poolSize = 4) {
    if (!workerScript) throw new Error('Worker script path is required');
    if (typeof poolSize !== 'number' || poolSize <= 0) throw new Error('Pool size must be a positive number');

    const taskQueue = [];
    const workers = [];
    const workerStates = new Map(); // Tracks if a worker is busy or idle

    // Initialize workers
    for (let i = 0; i < poolSize; i++) {
        const worker = new Worker(workerScript);
        workers.push(worker);
        workerStates.set(worker, false);

        worker.on('message', (result) => {
            const { resolve } = workerStates.get(worker);
            workerStates.set(worker, false); // Mark worker as idle
            if (resolve) resolve(result);
            processTaskQueue(); // Process the next task in the queue
        });

        worker.on('error', (err) => {
            const { reject } = workerStates.get(worker);
            workerStates.set(worker, false); // Mark worker as idle
            if (reject) reject(err);
            processTaskQueue();
        });
    }

    // Process the task queue
    function processTaskQueue() {
        for (const worker of workers) {
            if (!workerStates.get(worker)) { // If worker is idle
                const task = taskQueue.shift();
                if (task) {
                    const { data, resolve, reject } = task;
                    workerStates.set(worker, { resolve, reject });
                    worker.postMessage(data);
                } else {
                    break; // No more tasks to process
                }
            }
        }
    }

    // Add a task to the queue
    function runTask(data) {
        return new Promise((resolve, reject) => {
            taskQueue.push({ data, resolve, reject });
            processTaskQueue();
        });
    }

    // Terminate all workers
    function terminatePool() {
        workers.forEach(worker => worker.terminate());
    }

    return { runTask, terminatePool };
}

// Example worker script
export function workerThreadLogic() {
    if (!isMainThread) {
        parentPort.on('message', (data) => {
            try {
                const result = performComputation(data);
                parentPort.postMessage(result);
            } catch (err) {
                parentPort.postMessage({ error: err.message });
            }
        });

        function performComputation(data) {
            // Example computation: factorial
            if (typeof data !== 'number' || data < 0) throw new Error('Invalid input for computation');
            let result = 1;
            for (let i = 2; i <= data; i++) result *= i;
            return result;
        }
    }
}

// Utility for timing tasks
export function measureExecutionTime(taskFunction, ...args) {
    const start = performance.now();
    const result = taskFunction(...args);
    const end = performance.now();
    return { result, time: end - start };
}

// Utility to divide an array into chunks for parallel processing
export function chunkArray(array, chunkSize) {
    if (!Array.isArray(array)) throw new Error('Input must be an array');
    if (typeof chunkSize !== 'number' || chunkSize <= 0) throw new Error('Chunk size must be a positive number');

    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}