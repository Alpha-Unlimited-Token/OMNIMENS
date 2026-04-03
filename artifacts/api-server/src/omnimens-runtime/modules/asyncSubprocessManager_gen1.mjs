/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: asyncSubprocessManager
 * Purpose: Enables long-running computations by chaining asynchronous subprocesses.
 * Description: Manages long-running computations by chaining asynchronous subprocesses with state persistence and chunked task division.
 * Migrated: 2026-04-03T02:20:50.781Z
 */

// asyncSubprocessManager.mjs
import { Worker } from 'node:worker_threads';

/**
 * Helper function to split tasks into smaller chunks.
 * @param {Array} data - The input data to be divided.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {Array[]} - Array of chunks.
 */
export function divideIntoChunks(data, chunkSize) {
  if (!Array.isArray(data)) throw new Error('Input data must be an array.');
  if (chunkSize <= 0) throw new Error('Chunk size must be greater than zero.');

  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Helper function to persist intermediate state.
 * @param {string} key - Unique key for the state.
 * @param {any} value - State value to persist.
 * @returns {void}
 */
export const persistState = (() => {
  const stateStore = new Map();
  return (key, value) => {
    if (typeof key !== 'string') throw new Error('Key must be a string.');
    stateStore.set(key, value);
  };
})();

/**
 * Helper function to retrieve persisted state.
 * @param {string} key - Unique key for the state.
 * @returns {any} - Retrieved state value.
 */
export const retrieveState = (() => {
  const stateStore = new Map();
  return (key) => {
    if (typeof key !== 'string') throw new Error('Key must be a string.');
    return stateStore.get(key);
  };
})();

/**
 * Executes a long-running computation in an asynchronous subprocess using Worker Threads.
 * @param {string} workerScriptPath - Path to the worker script.
 * @param {any} inputData - Input data for the worker.
 * @returns {Promise<any>} - Resolves with the worker's output.
 */
export async function runSubprocess(workerScriptPath, inputData) {
  if (typeof workerScriptPath !== 'string') throw new Error('Worker script path must be a string.');

  return new Promise((resolve, reject) => {
    const worker = new Worker(workerScriptPath, { workerData: inputData });

    worker.on('message', (message) => resolve(message));
    worker.on('error', (error) => reject(error));
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

/**
 * Reinitializes computation seamlessly across subprocess boundaries.
 * @param {Array} chunks - Array of task chunks.
 * @param {string} workerScriptPath - Path to the worker script.
 * @returns {Promise<Array>} - Resolves with an array of results.
 */
export async function chainSubprocesses(chunks, workerScriptPath) {
  if (!Array.isArray(chunks)) throw new Error('Chunks must be an array.');

  const results = [];
  for (const chunk of chunks) {
    const result = await runSubprocess(workerScriptPath, chunk);
    results.push(result);
  }
  return results;
}

/**
 * Generic utility for chaining computations across subprocesses.
 * @param {Array} data - Input data to process.
 * @param {number} chunkSize - Size of each chunk.
 * @param {string} workerScriptPath - Path to the worker script.
 * @returns {Promise<Array>} - Resolves with final processed results.
 */
export async function processDataInChunks(data, chunkSize, workerScriptPath) {
  const chunks = divideIntoChunks(data, chunkSize);
  return chainSubprocesses(chunks, workerScriptPath);
}