/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: pseudo_realtime_data_stream
 * Purpose: Simulate real-time data streams using long-polling or WebSocket-based APIs.
 * Description: Simulates real-time data streams using long-polling, buffers incoming data, and processes events in near real-time with reusable utilities.
 * Migrated: 2026-03-25T22:49:34.151Z
 */

// pseudo_realtime_data_stream.mjs

import { EventEmitter } from 'events';
import { setTimeout } from 'timers/promises';

/**
 * Simulates a pseudo-real-time data stream using long-polling.
 * Provides utilities to buffer, process, and emit events from incoming data.
 */

export const createDataStream = (fetchFunction, intervalMs = 1000) => {
  const eventEmitter = new EventEmitter();
  let isRunning = false;

  /**
   * Starts the data stream by repeatedly invoking the fetchFunction.
   */
  const start = async () => {
    if (isRunning) return;
    isRunning = true;

    while (isRunning) {
      try {
        const data = await fetchFunction();
        if (data) {
          eventEmitter.emit('data', data);
        }
      } catch (error) {
        eventEmitter.emit('error', error);
      }

      await setTimeout(intervalMs); // Wait for the next interval
    }
  };

  /**
   * Stops the data stream.
   */
  const stop = () => {
    isRunning = false;
  };

  return {
    start,
    stop,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  };
};

/**
 * Buffers incoming data and processes it in batches.
 * @param {number} batchSize - Number of items to batch before processing.
 * @param {function} processFunction - Function to process each batch of data.
 */
export const createBatchProcessor = (batchSize, processFunction) => {
  let buffer = [];

  /**
   * Adds data to the buffer and processes it when the batch size is reached.
   */
  const addData = async (data) => {
    buffer.push(data);
    if (buffer.length >= batchSize) {
      const batch = buffer.splice(0, batchSize);
      await processFunction(batch);
    }
  };

  /**
   * Flushes remaining data in the buffer.
   */
  const flush = async () => {
    if (buffer.length > 0) {
      const batch = buffer.splice(0, buffer.length);
      await processFunction(batch);
    }
  };

  return { addData, flush };
};

/**
 * Example utility function to simulate data fetching.
 * Replace with actual API calls or data sources.
 */
export const simulateFetchFunction = async () => {
  return { timestamp: Date.now(), value: Math.random() };
};

/**
 * Example utility function to process a batch of data.
 * Replace with actual processing logic.
 */
export const exampleProcessFunction = async (batch) => {
  console.log('Processing batch:', batch);
};

/**
 * Example usage of the module.
 */
export const exampleUsage = async () => {
  const stream = createDataStream(simulateFetchFunction, 500);
  const batchProcessor = createBatchProcessor(5, exampleProcessFunction);

  stream.on('data', (data) => {
    batchProcessor.addData(data);
  });

  stream.on('error', (error) => {
    console.error('Stream error:', error);
  });

  stream.start();

  // Stop the stream after 10 seconds for demonstration purposes
  setTimeout(10000).then(async () => {
    stream.stop();
    await batchProcessor.flush();
    console.log('Stream stopped and buffer flushed.');
  });
};