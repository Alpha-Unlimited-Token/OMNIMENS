/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_13
 * Name: iterativeTaskScheduler
 * Purpose: Enables long-running computations by breaking them into resumable chunks.
 * Description: A utility module for breaking long-running tasks into resumable chunks with state serialization and sequential execution.
 * Migrated: 2026-04-01T22:23:20.233Z
 */

// iterativeTaskScheduler.mjs

import crypto from 'crypto';

/**
 * Generates a unique ID for tasks using a hash function.
 * Useful for tracking tasks across multiple agents.
 */
export function generateTaskId(taskData) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(taskData));
  return hash.digest('hex');
}

/**
 * Divides a large task into smaller chunks based on the specified chunk size.
 * @param {Array} taskSteps - An array of steps representing the task.
 * @param {number} chunkSize - Maximum number of steps per chunk.
 * @returns {Array<Array>} - An array of chunked steps.
 */
export function chunkTask(taskSteps, chunkSize) {
  if (!Array.isArray(taskSteps)) throw new Error('taskSteps must be an array');
  if (typeof chunkSize !== 'number' || chunkSize <= 0) throw new Error('chunkSize must be a positive number');

  const chunks = [];
  for (let i = 0; i < taskSteps.length; i += chunkSize) {
    chunks.push(taskSteps.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Executes a task chunk-by-chunk, allowing for resumability.
 * @param {Array} taskChunks - An array of task chunks to execute.
 * @param {Function} stepFunction - A function to process each step.
 * @param {Object} [state={}] - Intermediate state to resume computation.
 * @returns {Object} - Final state after task completion.
 */
export async function executeTaskChunks(taskChunks, stepFunction, state = {}) {
  if (!Array.isArray(taskChunks)) throw new Error('taskChunks must be an array');
  if (typeof stepFunction !== 'function') throw new Error('stepFunction must be a function');

  for (let i = state.currentChunk || 0; i < taskChunks.length; i++) {
    const chunk = taskChunks[i];
    for (let j = state.currentStep || 0; j < chunk.length; j++) {
      state = await stepFunction(chunk[j], state);
      state.currentStep = j + 1;
    }
    state.currentChunk = i + 1;
    state.currentStep = 0; // Reset step counter for next chunk
  }

  delete state.currentChunk;
  delete state.currentStep;
  return state;
}

/**
 * Serializes the task state to a JSON string for persistence.
 * @param {Object} state - The state object to serialize.
 * @returns {string} - Serialized state as a JSON string.
 */
export function serializeState(state) {
  return JSON.stringify(state);
}

/**
 * Deserializes a JSON string back into a task state object.
 * @param {string} serializedState - The JSON string to deserialize.
 * @returns {Object} - Deserialized state object.
 */
export function deserializeState(serializedState) {
  return JSON.parse(serializedState);
}

/**
 * Example step function for demonstration purposes.
 * Processes a single task step and updates the state.
 * @param {any} step - The step to process.
 * @param {Object} state - The current state of the task.
 * @returns {Object} - Updated state after processing the step.
 */
export async function exampleStepFunction(step, state) {
  // Simulate asynchronous processing
  await new Promise(resolve => setTimeout(resolve, 10));

  // Example: Accumulate step results in state
  state.results = state.results || [];
  state.results.push(step);

  return state;
}

/**
 * Example usage of the iterativeTaskScheduler.
 */
export async function exampleUsage() {
  const taskSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const chunkSize = 3;

  const taskChunks = chunkTask(taskSteps, chunkSize);
  const initialState = {};

  const finalState = await executeTaskChunks(taskChunks, exampleStepFunction, initialState);

  console.log('Final State:', finalState);
}

// Uncomment the following line to test the example usage
// exampleUsage();