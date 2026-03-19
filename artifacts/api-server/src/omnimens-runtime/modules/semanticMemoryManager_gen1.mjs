// semanticMemoryManager.js

/**
 * @module semanticMemoryManager
 * @description Manages rolling context and long-term memory for conversations using a priority-based memory retention system.
 */

/**
 * Represents a single memory entry.
 * @typedef {Object} MemoryEntry
 * @property {string} token - The token or piece of information.
 * @property {number} relevance - The relevance score of the token (0-1).
 * @property {number} utility - The utility score of the token (0-1).
 * @property {Date} timestamp - The timestamp when the token was added.
 */

/**
 * MemoryManager class to manage rolling context and long-term memory.
 */
class MemoryManager {
  constructor() {
    /**
     * @private
     * @type {MemoryEntry[]}
     */
    this.memory = [];

    /**
     * @private
     * @type {number}
     */
    this.maxMemorySize = 1000; // Maximum number of tokens to retain in memory.

    /**
     * @private
     * @type {number}
     */
    this.relevanceThreshold = 0.5; // Minimum relevance score for retention.

    /**
     * @private
     * @type {number}
     */
    this.utilityThreshold = 0.5; // Minimum utility score for retention.
  }

  /**
   * Adds a new memory entry.
   * @param {string} token - The token or piece of information.
   * @param {number} relevance - The relevance score of the token (0-1).
   * @param {number} utility - The utility score of the token (0-1).
   */
  addMemory(token, relevance, utility) {
    if (typeof token !== 'string' || typeof relevance !== 'number' || typeof utility !== 'number') {
      throw new TypeError('Invalid input types for addMemory.');
    }

    const entry = {
      token,
      relevance,
      utility,
      timestamp: new Date()
    };

    this.memory.push(entry);
    this._trimMemory();
  }

  /**
   * Retrieves the most relevant and useful tokens.
   * @param {number} count - Number of tokens to retrieve.
   * @returns {MemoryEntry[]} - Array of memory entries sorted by relevance and utility.
   */
  getTopMemory(count = 10) {
    if (typeof count !== 'number' || count <= 0) {
      throw new TypeError('Invalid count parameter for getTopMemory.');
    }

    return this.memory
      .filter(entry => entry.relevance >= this.relevanceThreshold && entry.utility >= this.utilityThreshold)
      .sort((a, b) => (b.relevance + b.utility) - (a.relevance + a.utility))
      .slice(0, count);
  }

  /**
   * Clears all memory.
   */
  clearMemory() {
    this.memory = [];
  }

  /**
   * Trims the memory to fit within maxMemorySize.
   * @private
   */
  _trimMemory() {
    if (this.memory.length > this.maxMemorySize) {
      this.memory = this.memory
        .sort((a, b) => (b.relevance + b.utility) - (a.relevance + a.utility))
        .slice(0, this.maxMemorySize);
    }
  }
}

/**
 * Creates a new MemoryManager instance.
 * @returns {MemoryManager} - A new MemoryManager instance.
 */
function createMemoryManager() {
  return new MemoryManager();
}

module.exports = {
  createMemoryManager
};