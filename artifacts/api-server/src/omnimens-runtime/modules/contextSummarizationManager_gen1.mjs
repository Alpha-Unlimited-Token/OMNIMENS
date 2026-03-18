// contextSummarizationManager.js

/**
 * @module contextSummarizationManager
 * @description Summarizes and retains early context in long conversations using a sliding window summarization algorithm with semantic embedding compression.
 */

/**
 * Maintains conversation context and summarizes older parts dynamically.
 * @class
 */
class ContextSummarizationManager {
  constructor(windowSize = 5, embeddingCompressionFactor = 0.5) {
    /**
     * @type {number} The maximum number of recent messages to retain before summarization.
     */
    this.windowSize = windowSize;

    /**
     * @type {number} Factor for reducing semantic embedding size during compression (0 < factor <= 1).
     */
    this.embeddingCompressionFactor = embeddingCompressionFactor;

    /**
     * @type {Array<string>} Stores the recent conversation messages.
     */
    this.recentMessages = [];

    /**
     * @type {Array<string>} Stores summarized context.
     */
    this.summarizedContext = [];
  }

  /**
   * Adds a new message to the conversation context.
   * @param {string} message - The message to add.
   */
  addMessage(message) {
    if (typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message must be a non-empty string.');
    }

    this.recentMessages.push(message);

    if (this.recentMessages.length > this.windowSize) {
      this.summarizeContext();
    }
  }

  /**
   * Summarizes the oldest messages in the recentMessages array.
   * Uses a semantic embedding compression simulation.
   */
  summarizeContext() {
    const messagesToSummarize = this.recentMessages.splice(0, Math.floor(this.windowSize / 2));
    const summarized = this.simulateSemanticCompression(messagesToSummarize);
    this.summarizedContext.push(summarized);
  }

  /**
   * Simulates semantic embedding compression for a set of messages.
   * @param {Array<string>} messages - The messages to compress.
   * @returns {string} A single summarized string.
   */
  simulateSemanticCompression(messages) {
    const combinedText = messages.join(' ');
    const compressedLength = Math.max(1, Math.floor(combinedText.length * this.embeddingCompressionFactor));

    // Simulate compression by truncating and appending ellipsis.
    return combinedText.substring(0, compressedLength) + (compressedLength < combinedText.length ? '...' : '');
  }

  /**
   * Retrieves the full conversation context, including summarized and recent messages.
   * @returns {string} The complete conversation context as a single string.
   */
  getFullContext() {
    return [...this.summarizedContext, ...this.recentMessages].join(' ');
  }

  /**
   * Clears all stored context.
   */
  clearContext() {
    this.recentMessages = [];
    this.summarizedContext = [];
  }
}

/**
 * Factory function to create a new ContextSummarizationManager instance.
 * @param {number} [windowSize=5] - The maximum number of recent messages to retain.
 * @param {number} [embeddingCompressionFactor=0.5] - Factor for reducing semantic embedding size during compression.
 * @returns {ContextSummarizationManager} A new instance of the manager.
 */
function createContextSummarizationManager(windowSize = 5, embeddingCompressionFactor = 0.5) {
  return new ContextSummarizationManager(windowSize, embeddingCompressionFactor);
}

export { createContextSummarizationManager };