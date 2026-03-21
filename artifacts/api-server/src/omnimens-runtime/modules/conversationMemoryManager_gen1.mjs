/**
 * @module conversationMemoryManager
 * @description Maintains long-term conversation coherence by compressing context into hierarchical summaries.
 * Uses embeddings to represent earlier context and periodically summarizes conversations into a persistent memory store.
 */

import crypto from "crypto";

/**
 * Generates an embedding-like representation of a text input by hashing it.
 * This is a lightweight stand-in for actual embeddings.
 * @param {string} text - The text to generate an embedding for.
 * @returns {string} A hash representation of the input text.
 */
export function generateEmbedding(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Summarizes a list of conversation chunks into a single summary.
 * @param {string[]} chunks - Array of conversation chunks.
 * @returns {string} A summarized version of the conversation chunks.
 */
export function summarizeChunks(chunks) {
  if (!chunks || chunks.length === 0) return '';
  return chunks.join(' ').slice(0, 500) + '...'; // Simple truncation-based summary for demonstration.
}

/**
 * Manages conversation memory by maintaining a hierarchical summary of past interactions.
 * @class
 */
export class ConversationMemoryManager {
  constructor() {
    /**
     * Persistent memory store for conversation summaries.
     * @type {Object<string, {summary: string, embedding: string}>}
     */
    this.memoryStore = {};

    /**
     * Temporary buffer to hold recent conversation chunks before summarization.
     * @type {string[]}
     */
    this.buffer = [];

    /**
     * Maximum buffer size before summarization is triggered.
     * @type {number}
     */
    this.bufferSize = 5;
  }

  /**
   * Adds a new conversation chunk to the memory manager.
   * @param {string} chunk - A single piece of conversation text.
   */
  addChunk(chunk) {
    if (typeof chunk !== 'string' || chunk.trim() === '') {
      throw new Error('Invalid chunk: must be a non-empty string.');
    }

    this.buffer.push(chunk);

    if (this.buffer.length >= this.bufferSize) {
      this.summarizeBuffer();
    }
  }

  /**
   * Summarizes the current buffer and stores it in the memory store.
   */
  summarizeBuffer() {
    const summary = summarizeChunks(this.buffer);
    const embedding = generateEmbedding(summary);

    this.memoryStore[embedding] = {
      summary,
      embedding
    };

    this.buffer = []; // Clear the buffer after summarization.
  }

  /**
   * Retrieves the entire memory store.
   * @returns {Object<string, {summary: string, embedding: string}>} The memory store.
   */
  getMemoryStore() {
    return this.memoryStore;
  }

  /**
   * Retrieves the most recent summary from the memory store.
   * @returns {{summary: string, embedding: string}|null} The most recent summary or null if memory is empty.
   */
  getLatestSummary() {
    const keys = Object.keys(this.memoryStore);
    if (keys.length === 0) return null;
    return this.memoryStore[keys[keys.length - 1]];
  }
}

