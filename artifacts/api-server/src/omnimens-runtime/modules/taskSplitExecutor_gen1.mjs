/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_25
 * Name: taskSplitExecutor
 * Purpose: Splits computationally expensive tasks into manageable chunks for execution within the 10-second subprocess limit.
 * Description: Splits computationally expensive tasks into chunks, executes them recursively, and reassembles results for cross-agent utility.
 * Migrated: 2026-04-02T15:46:59.466Z
 */

// taskSplitExecutor.mjs

// Utility to split computationally expensive tasks into manageable chunks and execute them within a 10-second limit.

/**
 * Splits a task into smaller chunks and executes them recursively.
 * @param {Function} taskFunction - The computationally expensive function to execute.
 * @param {Array} inputArray - The input data to be processed in chunks.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {Promise<Array>} - A promise that resolves to the combined results of all chunks.
 */
export async function taskSplitExecutor(taskFunction, inputArray, chunkSize) {
  if (typeof taskFunction !== 'function') {
    throw new TypeError('taskFunction must be a function');
  }
  if (!Array.isArray(inputArray)) {
    throw new TypeError('inputArray must be an array');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive number');
  }

  // Helper function to process a single chunk
  async function processChunk(chunk) {
    return taskFunction(chunk);
  }

  // Recursive function to process all chunks
  async function processChunksRecursively(chunks, results = []) {
    if (chunks.length === 0) {
      return results; // Base case: all chunks processed
    }

    const [currentChunk, ...remainingChunks] = chunks;
    const result = await processChunk(currentChunk);
    results.push(...result);

    return processChunksRecursively(remainingChunks, results);
  }

  // Split input array into chunks
  const chunks = [];
  for (let i = 0; i < inputArray.length; i += chunkSize) {
    chunks.push(inputArray.slice(i, i + chunkSize));
  }

  // Process all chunks recursively and return the combined results
  return processChunksRecursively(chunks);
}

/**
 * Utility to split a large array into smaller chunks.
 * @param {Array} array - The array to split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array<Array>} - An array of chunks.
 */
export function splitArrayIntoChunks(array, chunkSize) {
  if (!Array.isArray(array)) {
    throw new TypeError('Input must be an array');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new RangeError('chunkSize must be a positive number');
  }

  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Combines results from multiple chunks into a single result.
 * @param {Array} results - The array of results to combine.
 * @param {Function} combineFunction - A function to combine two results.
 * @returns {*} - The combined result.
 */
export function combineResults(results, combineFunction) {
  if (!Array.isArray(results)) {
    throw new TypeError('results must be an array');
  }
  if (typeof combineFunction !== 'function') {
    throw new TypeError('combineFunction must be a function');
  }

  return results.reduce((acc, result) => combineFunction(acc, result));
}

/**
 * Example task function that doubles numbers in an array.
 * @param {Array<number>} numbers - An array of numbers.
 * @returns {Promise<Array<number>>} - A promise that resolves to an array of doubled numbers.
 */
export async function exampleTaskFunction(numbers) {
  return numbers.map(num => num * 2);
}