/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: asyncComputationManager
 * Written: 2026-04-01T22:09:03.325Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// asyncComputationManager.mjs

// Utility function to split a long-running computation into smaller tasks
export function splitComputation(generatorFunction, chunkSize = 100) {
    if (typeof generatorFunction !== 'function') {
        throw new TypeError('Expected a generator function as the first argument');
    }

    if (typeof chunkSize !== 'number' || chunkSize <= 0) {
        throw new RangeError('chunkSize must be a positive number');
    }

    return async function executeChunks(...args) {
        const generator = generatorFunction(...args);
        if (typeof generator.next !== 'function') {
            throw new TypeError('Provided generatorFunction must return a generator');
        }

        let result = generator.next();
        const results = [];

        while (!result.done) {
            // Execute in chunks to avoid blocking the event loop
            const chunk = [];
            for (let i = 0; i < chunkSize && !result.done; i++) {
                chunk.push(result.value);
                result = generator.next();
            }

            results.push(...chunk);
            await new Promise(resolve => setImmediate(resolve)); // Yield to the event loop
        }

        return results;
    };
}

// Example generator function for testing (e.g., processing large arrays)
export function* exampleGenerator(array) {
    for (const item of array) {
        yield item * item; // Example computation: squaring each item
    }
}

// Utility function to execute computations in parallel
export async function parallelizeTasks(tasks, concurrency = 4) {
    if (!Array.isArray(tasks)) {
        throw new TypeError('Expected tasks to be an array');
    }

    if (typeof concurrency !== 'number' || concurrency <= 0) {
        throw new RangeError('concurrency must be a positive number');
    }

    const results = [];
    const executing = new Set();

    for (const task of tasks) {
        const promise = task().then(result => {
            results.push(result);
            executing.delete(promise);
        });

        executing.add(promise);

        if (executing.size >= concurrency) {
            await Promise.race(executing); // Wait for at least one task to complete
        }
    }

    await Promise.all(executing); // Wait for all remaining tasks to complete
    return results;
}

// Example task function for testing
export function createTask(duration, result) {
    return async () => {
        await new Promise(resolve => setTimeout(resolve, duration));
        return result;
    };
}

// Utility function to handle errors in async operations
export async function safeExecute(asyncFunction, ...args) {
    try {
        return { result: await asyncFunction(...args), error: null };
    } catch (error) {
        return { result: null, error };
    }
}