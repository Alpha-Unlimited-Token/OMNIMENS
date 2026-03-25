/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: adaptivePollingStream
 * Purpose: Simulates real-time data streams by adaptively polling APIs and aggregating results into a compressed time-series format.
 * Description: Simulates real-time data streams by adaptively polling APIs and compressing results into time-series format with metadata tagging.
 * Migrated: 2026-03-25T22:49:34.135Z
 */

// adaptivePollingStream.mjs

import { setTimeout } from 'timers/promises';

/**
 * Polls an API with exponential backoff and aggregates results into a compressed time-series format.
 * @param {Function} fetchDataFunction - A function that fetches data from the API.
 * @param {number} initialIntervalMs - Initial polling interval in milliseconds.
 * @param {number} maxIntervalMs - Maximum polling interval in milliseconds.
 * @param {number} slidingWindowSize - Size of the sliding window for compression.
 * @returns {AsyncGenerator} - An async generator yielding compressed time-series data.
 */
export async function* adaptivePollingStream(fetchDataFunction, initialIntervalMs, maxIntervalMs, slidingWindowSize) {
  let interval = initialIntervalMs;
  let buffer = [];

  while (true) {
    try {
      const data = await fetchDataFunction();
      buffer.push({ timestamp: Date.now(), data });

      // Compress buffer using sliding window
      if (buffer.length > slidingWindowSize) {
        buffer = compressSlidingWindow(buffer, slidingWindowSize);
      }

      yield buffer;

      // Reset interval on success
      interval = initialIntervalMs;
    } catch (error) {
      console.error('Polling error:', error);

      // Exponential backoff
      interval = Math.min(interval * 2, maxIntervalMs);
    }

    await setTimeout(interval);
  }
}

/**
 * Compresses a sliding window of time-series data.
 * @param {Array} buffer - Array of time-series data objects.
 * @param {number} windowSize - Size of the sliding window.
 * @returns {Array} - Compressed time-series data.
 */
export function compressSlidingWindow(buffer, windowSize) {
  const compressed = [];

  for (let i = 0; i < buffer.length; i += windowSize) {
    const window = buffer.slice(i, i + windowSize);

    const aggregated = {
      startTimestamp: window[0].timestamp,
      endTimestamp: window[window.length - 1].timestamp,
      data: aggregateData(window.map(entry => entry.data))
    };

    compressed.push(aggregated);
  }

  return compressed;
}

/**
 * Aggregates data within a sliding window.
 * @param {Array} dataArray - Array of data points.
 * @returns {*} - Aggregated data.
 */
export function aggregateData(dataArray) {
  if (dataArray.every(item => typeof item === 'number')) {
    return dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length; // Average for numeric data
  }

  return dataArray.reduce((acc, value) => {
    if (typeof value === 'object') {
      for (const key in value) {
        acc[key] = (acc[key] || 0) + value[key];
      }
    }
    return acc;
  }, {}); // Sum for object data
}

/**
 * Metadata tagging for efficient retrieval.
 * @param {Array} compressedData - Compressed time-series data.
 * @param {string} tag - Metadata tag.
 * @returns {Array} - Tagged data.
 */
export function tagMetadata(compressedData, tag) {
  return compressedData.map(entry => ({ ...entry, tag }));
}

/**
 * Example fetch function for testing.
 * @returns {Promise<*>} - Simulated API response.
 */
export async function exampleFetchFunction() {
  return Math.random(); // Simulates numeric data
}

/**
 * Example usage of adaptivePollingStream.
 */
export async function exampleUsage() {
  const stream = adaptivePollingStream(exampleFetchFunction, 1000, 16000, 5);

  for await (const compressedData of stream) {
    console.log('Compressed Data:', compressedData);
  }
}