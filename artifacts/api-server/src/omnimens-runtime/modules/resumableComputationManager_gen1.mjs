/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_30
 * Name: resumableComputationManager
 * Purpose: Handles iterative long-running computations by chunking tasks and saving intermediate states.
 * Description: Manages resumable computations by chunking tasks, saving intermediate states, and resuming iteratively for long-running operations.
 * Migrated: 2026-04-02T15:02:53.820Z
 */

// resumableComputationManager.mjs

import { writeFile, readFile } from 'fs/promises';
import { createHash } from 'crypto';

/**
 * Generates a unique task ID based on task data.
 * @param {string} taskName - The name of the task.
 * @param {object} taskParams - The parameters for the task.
 * @returns {string} - A unique hash representing the task.
 */
export function generateTaskId(taskName, taskParams) {
  const hash = createHash('sha256');
  hash.update(taskName + JSON.stringify(taskParams));
  return hash.digest('hex');
}

/**
 * Saves intermediate state to a persistence layer.
 * @param {string} taskId - The unique ID of the task.
 * @param {object} state - The intermediate state to save.
 * @returns {Promise<void>} - Resolves when the state is saved.
 */
export async function saveState(taskId, state) {
  const filePath = `./${taskId}.json`;
  const data = JSON.stringify(state);
  await writeFile(filePath, data, 'utf8');
}

/**
 * Loads the last saved state for a task.
 * @param {string} taskId - The unique ID of the task.
 * @returns {Promise<object|null>} - The last saved state, or null if no state exists.
 */
export async function loadState(taskId) {
  const filePath = `./${taskId}.json`;
  try {
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // No saved state exists
    }
    throw error;
  }
}

/**
 * Executes a long-running computation in chunks, with resumability.
 * @param {string} taskName - The name of the task.
 * @param {object} taskParams - The parameters for the task.
 * @param {function} computeChunk - A function that computes one chunk of the task.
 * @param {function} isTaskComplete - A function that checks if the task is complete.
 * @returns {Promise<object>} - The final result of the task.
 */
export async function executeResumableTask(taskName, taskParams, computeChunk, isTaskComplete) {
  const taskId = generateTaskId(taskName, taskParams);
  let state = await loadState(taskId) || { progress: 0, result: null };

  while (!isTaskComplete(state)) {
    state = await computeChunk(state);
    await saveState(taskId, state);
  }

  return state.result;
}

/**
 * Example utility function: Computes a summation task in chunks.
 * @param {number} start - Start of the range.
 * @param {number} end - End of the range.
 * @param {number} chunkSize - Number of elements to process per chunk.
 * @returns {Promise<number>} - The summation result.
 */
export async function resumableSummation(start, end, chunkSize) {
  const taskName = 'summation';
  const taskParams = { start, end, chunkSize };

  const computeChunk = async (state) => {
    const { progress, result } = state;
    const nextProgress = Math.min(progress + chunkSize, end + 1);
    const chunkSum = Array.from({ length: nextProgress - progress }, (_, i) => progress + i).reduce((sum, x) => sum + x, 0);
    return { progress: nextProgress, result: (result || 0) + chunkSum };
  };

  const isTaskComplete = (state) => state.progress > end;

  return executeResumableTask(taskName, taskParams, computeChunk, isTaskComplete);
}

// Example usage (uncomment to run):
// (async () => {
//   const result = await resumableSummation(1, 100, 10);
//   console.log('Summation result:', result);
// })();