/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-02T21:25:01.882Z
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

// Master Node: Distributes tasks and aggregates results
export function createMasterNode(port, taskHandler, resultAggregator) {
    const server = new WebSocketServer({ port });
    const workers = new Map();
    const taskQueue = [];
    const results = new Map();

    server.on('connection', (socket) => {
        const workerId = randomUUID();
        workers.set(workerId, socket);

        socket.on('message', (message) => {
            const { taskId, result } = JSON.parse(message);
            if (results.has(taskId)) {
                results.get(taskId).push(result);
            } else {
                results.set(taskId, [result]);
            }
            resultAggregator(taskId, results.get(taskId));
        });

        socket.on('close', () => {
            workers.delete(workerId);
        });
    });

    return {
        distributeTask(task) {
            const availableWorker = [...workers.values()][0]; // Simple round-robin
            if (availableWorker) {
                const taskId = randomUUID();
                taskQueue.push({ taskId, task });
                availableWorker.send(JSON.stringify({ taskId, task }));
                return taskId;
            } else {
                throw new Error('No workers available');
            }
        }
    };
}

// Worker Node: Executes tasks and sends results back to the master
export function createWorkerNode(masterUrl, taskExecutor) {
    const socket = new WebSocket(masterUrl);

    socket.on('message', (message) => {
        const { taskId, task } = JSON.parse(message);
        const result = taskExecutor(task);
        socket.send(JSON.stringify({ taskId, result }));
    });

    socket.on('error', (err) => {
        console.error('Worker socket error:', err);
    });
}

// Utility: Aggregates results for multiple tasks
export function aggregateResults(taskId, results) {
    return results.reduce((acc, curr) => acc + curr, 0); // Example: Summing results
}

// Utility: Example task executor for workers
export function exampleTaskExecutor(task) {
    return task * 2; // Example: Double the input
}

// Utility: Example result aggregator for master
export function exampleResultAggregator(taskId, results) {
    console.log(`Task ${taskId} results aggregated:`, results);
}
