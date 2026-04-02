/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_44
 * Name: statefulCoroutineManager
 * Purpose: Enables long-running computations by breaking them into resumable segments.
 * Description: Provides utilities for managing and running stateful coroutines, enabling resumable computations for diverse use cases.
 * Migrated: 2026-04-02T14:50:29.439Z
 */

// statefulCoroutineManager.mjs

/**
 * Enables long-running computations by breaking them into resumable segments using generator functions.
 * Provides utilities for managing stateful coroutines across diverse use cases.
 */

/**
 * Creates a generator-based coroutine from a given function.
 * @param {Function} generatorFunction - A function that returns a generator (e.g., function* () {}).
 * @returns {Object} - An object with methods to start, resume, and check the coroutine state.
 */
export function createCoroutine(generatorFunction) {
  if (typeof generatorFunction !== 'function') {
    throw new TypeError('Expected a generator function.');
  }

  let generator = null;
  let isCompleted = false;

  return {
    /**
     * Starts or restarts the coroutine.
     * @param {...any} args - Arguments to pass to the generator function.
     */
    start(...args) {
      generator = generatorFunction(...args);
      isCompleted = false;
    },

    /**
     * Resumes the coroutine from the last checkpoint.
     * @returns {Object} - The result of the next generator step ({ value, done }).
     */
    resume() {
      if (!generator) {
        throw new Error('Coroutine has not been started. Call start() first.');
      }

      if (isCompleted) {
        return { value: undefined, done: true };
      }

      const result = generator.next();
      isCompleted = result.done;
      return result;
    },

    /**
     * Checks if the coroutine has completed execution.
     * @returns {boolean} - True if the coroutine is done, false otherwise.
     */
    isDone() {
      return isCompleted;
    }
  };
}

/**
 * Runs a coroutine to completion, collecting all yielded values.
 * @param {Function} generatorFunction - A function that returns a generator.
 * @param {...any} args - Arguments to pass to the generator function.
 * @returns {Array} - An array of all yielded values.
 */
export function runToCompletion(generatorFunction, ...args) {
  const coroutine = createCoroutine(generatorFunction);
  coroutine.start(...args);

  const results = [];
  while (!coroutine.isDone()) {
    const { value } = coroutine.resume();
    if (value !== undefined) {
      results.push(value);
    }
  }

  return results;
}

/**
 * Creates an async iterator from a generator function for asynchronous workflows.
 * @param {Function} generatorFunction - A function that returns a generator.
 * @param {...any} args - Arguments to pass to the generator function.
 * @returns {AsyncIterable} - An async iterable object.
 */
export function createAsyncIterator(generatorFunction, ...args) {
  const coroutine = createCoroutine(generatorFunction);
  coroutine.start(...args);

  return {
    async next() {
      if (coroutine.isDone()) {
        return { value: undefined, done: true };
      }

      return Promise.resolve(coroutine.resume());
    },

    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

/**
 * Example generator function for demonstration purposes.
 * Yields numbers from 1 to n with a delay between each.
 * @param {number} n - The maximum number to yield.
 * @param {number} delayMs - Delay in milliseconds between yields.
 */
export async function* delayedCounter(n, delayMs) {
  for (let i = 1; i <= n; i++) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    yield i;
  }
}
