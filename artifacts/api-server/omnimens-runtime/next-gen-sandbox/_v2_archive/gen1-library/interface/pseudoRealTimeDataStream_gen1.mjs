/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: pseudoRealTimeDataStream
 * Purpose: Simulates real-time data streams by periodically fetching and aggregating external data into a time-series buffer.
 * Description: Simulates real-time data streams with adaptive sampling and exponential backoff for efficient and intelligent time-series buffering.
 * Migrated: 2026-03-25T22:49:34.153Z
 */

// pseudoRealTimeDataStream.mjs

import { setTimeout } from 'timers/promises';

// Configuration constants
const INITIAL_INTERVAL = 1000; // Initial fetch interval in ms
const MAX_INTERVAL = 60000; // Maximum fetch interval in ms
const MIN_INTERVAL = 500; // Minimum fetch interval in ms
const BACKOFF_FACTOR = 2; // Exponential backoff multiplier
const VOLATILITY_THRESHOLD = 0.1; // Threshold to adjust sampling rate based on data volatility

/**
 * Simulates a real-time data stream with adaptive sampling and exponential backoff.
 * @param {Function} fetchFunction - Asynchronous function to fetch data (returns a number or object).
 * @param {number} bufferSize - Number of data points to retain in the time-series buffer.
 * @returns {Object} - Object containing start, stop, and getBuffer methods.
 */
export function createPseudoRealTimeDataStream(fetchFunction, bufferSize) {
  if (typeof fetchFunction !== 'function') {
    throw new TypeError('fetchFunction must be a function');
  }
  if (!Number.isInteger(bufferSize) || bufferSize <= 0) {
    throw new RangeError('bufferSize must be a positive integer');
  }

  let isRunning = false;
  let interval = INITIAL_INTERVAL;
  let buffer = [];

  /**
   * Calculates data volatility based on standard deviation of buffer values.
   * @returns {number} - Volatility value (higher means more volatile).
   */
  function calculateVolatility() {
    if (buffer.length < 2) return 0;
    const mean = buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
    const variance = buffer.reduce((sum, val) => sum + (val - mean) ** 2, 0) / buffer.length;
    return Math.sqrt(variance);
  }

  /**
   * Adjusts the fetch interval based on data volatility.
   */
  function adjustInterval() {
    const volatility = calculateVolatility();
    if (volatility > VOLATILITY_THRESHOLD) {
      interval = Math.max(MIN_INTERVAL, interval / BACKOFF_FACTOR);
    } else {
      interval = Math.min(MAX_INTERVAL, interval * BACKOFF_FACTOR);
    }
  }

  /**
   * Fetches data and updates the buffer.
   */
  async function fetchAndUpdate() {
    while (isRunning) {
      try {
        const data = await fetchFunction();
        buffer.push(data);
        if (buffer.length > bufferSize) {
          buffer.shift(); // Remove oldest data point to maintain buffer size
        }
        adjustInterval();
      } catch (error) {
        console.error('Error fetching data:', error);
        interval = Math.min(MAX_INTERVAL, interval * BACKOFF_FACTOR); // Backoff on error
      }
      await setTimeout(interval);
    }
  }

  return {
    /**
     * Starts the data stream simulation.
     */
    start() {
      if (isRunning) return;
      isRunning = true;
      fetchAndUpdate();
    },

    /**
     * Stops the data stream simulation.
     */
    stop() {
      isRunning = false;
    },

    /**
     * Retrieves the current buffer.
     * @returns {Array} - Copy of the time-series buffer.
     */
    getBuffer() {
      return [...buffer];
    }
  };
}

/**
 * Example fetch function that generates random data.
 * @returns {Promise<number>} - Simulated asynchronous data fetch.
 */
export async function exampleFetchFunction() {
  return Math.random();
}

/**
 * Example usage of the pseudoRealTimeDataStream module.
 */
export function exampleUsage() {
  const stream = createPseudoRealTimeDataStream(exampleFetchFunction, 10);
  stream.start();

  // Periodically log the buffer (for demonstration purposes only)
  setTimeout(async () => {
    console.log('Buffer:', stream.getBuffer());
    stream.stop();
  }, 10000); // Stop after 10 seconds
}