// hierarchicalMemoryManager.js

/**
 * @module hierarchicalMemoryManager
 * @description This module maintains long-term context by summarizing and storing conversation chunks hierarchically.
 * It uses a sliding window approach to condense older context into compact representations for efficient memory management.
 */

/**
 * Summarizes a chunk of text using a naive summarization algorithm.
 * This function is a placeholder for GPT-based summarization logic.
 *
 * @param {string} text - The text to summarize.
 * @returns {string} - A summarized version of the input text.
 */
function summarizeText(text) {
  const sentences = text.split('.');
  const summary = sentences.slice(0, Math.ceil(sentences.length / 3)).join('.') + '.';
  return summary.trim();
}

/**
 * Manages hierarchical memory by summarizing and storing conversation chunks.
 */
class HierarchicalMemoryManager {
  /**
   * @constructor
   * @param {number} chunkSize - The size of each conversation chunk (in characters).
   * @param {number} maxChunks - The maximum number of chunks to retain in memory.
   */
  constructor(chunkSize = 1000, maxChunks = 10) {
    this.chunkSize = chunkSize;
    this.maxChunks = maxChunks;
    this.memory = [];
  }

  /**
   * Adds a new conversation chunk to memory.
   * If the memory exceeds the maximum number of chunks, older chunks are summarized and condensed.
   *
   * @param {string} chunk - The new conversation chunk to add.
   */
  addChunk(chunk) {
    if (chunk.length > this.chunkSize) {
      throw new Error(`Chunk size exceeds the maximum allowed size of ${this.chunkSize} characters.`);
    }

    this.memory.push(chunk);

    if (this.memory.length > this.maxChunks) {
      this._condenseMemory();
    }
  }

  /**
   * Retrieves the current memory hierarchy.
   *
   * @returns {Array<string>} - The hierarchical memory, with older chunks summarized.
   */
  getMemory() {
    return [...this.memory];
  }

  /**
   * Condenses the memory by summarizing older chunks and retaining the most recent ones.
   * This method is called automatically when memory exceeds the maximum allowed chunks.
   *
   * @private
   */
  _condenseMemory() {
    const half = Math.floor(this.memory.length / 2);
    const olderChunks = this.memory.slice(0, half);
    const summarizedChunk = summarizeText(olderChunks.join(' '));
    this.memory = [summarizedChunk, ...this.memory.slice(half)];

    // Ensure memory size does not exceed maxChunks after condensing
    while (this.memory.length > this.maxChunks) {
      this.memory.shift();
    }
  }
}

export { HierarchicalMemoryManager, summarizeText };