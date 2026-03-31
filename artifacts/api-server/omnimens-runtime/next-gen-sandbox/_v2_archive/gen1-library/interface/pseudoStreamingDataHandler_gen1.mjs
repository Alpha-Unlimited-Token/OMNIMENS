/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: pseudoStreamingDataHandler
 * Purpose: Implements pseudo-streaming by polling APIs at high frequency and buffering results for real-time-like processing.
 * Description: Implements pseudo-streaming by polling APIs at high frequency, buffering results, and emitting events for real-time-like data processing.
 * Migrated: 2026-03-25T22:49:34.137Z
 */

// pseudoStreamingDataHandler.mjs

import { EventEmitter } from 'events';

// Circular buffer implementation
export class CircularBuffer {
  constructor(size) {
    if (size <= 0) throw new Error('Buffer size must be greater than 0');
    this.size = size;
    this.buffer = new Array(size);
    this.start = 0;
    this.end = 0;
    this.isFull = false;
  }

  add(item) {
    this.buffer[this.end] = item;
    this.end = (this.end + 1) % this.size;
    if (this.isFull) {
      this.start = (this.start + 1) % this.size;
    }
    this.isFull = this.end === this.start;
  }

  getAll() {
    if (!this.isFull && this.end === this.start) return [];
    if (this.isFull) {
      return [...this.buffer.slice(this.start), ...this.buffer.slice(0, this.start)];
    }
    return this.buffer.slice(this.start, this.end);
  }
}

// Event-driven pseudo-streaming data handler
export class PseudoStreamingDataHandler {
  constructor(apiPollFunction, pollIntervalMs, bufferSize) {
    if (typeof apiPollFunction !== 'function') {
      throw new Error('apiPollFunction must be a function');
    }
    if (pollIntervalMs <= 0) {
      throw new Error('pollIntervalMs must be greater than 0');
    }
    if (bufferSize <= 0) {
      throw new Error('bufferSize must be greater than 0');
    }

    this.apiPollFunction = apiPollFunction;
    this.pollIntervalMs = pollIntervalMs;
    this.buffer = new CircularBuffer(bufferSize);
    this.eventEmitter = new EventEmitter();
    this.polling = false;
  }

  start() {
    if (this.polling) return;
    this.polling = true;
    this._poll();
  }

  stop() {
    this.polling = false;
  }

  onData(callback) {
    this.eventEmitter.on('data', callback);
  }

  getBufferedData() {
    return this.buffer.getAll();
  }

  async _poll() {
    while (this.polling) {
      try {
        const data = await this.apiPollFunction();
        if (data) {
          this.buffer.add(data);
          this.eventEmitter.emit('data', data);
        }
      } catch (error) {
        this.eventEmitter.emit('error', error);
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
  }
}

// Utility function for creating a polling function
export function createApiPollFunction(fetchFunction, transformFunction = (data) => data) {
  if (typeof fetchFunction !== 'function') {
    throw new Error('fetchFunction must be a function');
  }

  return async function() {
    const rawData = await fetchFunction();
    return transformFunction(rawData);
  };
}

// Example utility function for delay (useful for testing)
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}