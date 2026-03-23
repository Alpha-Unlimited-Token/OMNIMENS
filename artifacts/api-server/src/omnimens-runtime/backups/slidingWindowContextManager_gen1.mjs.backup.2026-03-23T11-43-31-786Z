/**
 * @module slidingWindowContextManager
 * @description Manages long conversations by summarizing earlier context into compact representations using word-frequency compression.
 */

/**
 * SlidingWindowContextManager class
 * @class
 * @description Provides methods to manage conversation context, summarize earlier parts, and maintain a rolling buffer of embeddings.
 */
class SlidingWindowContextManager {
  constructor(bufferSize = 5, summaryThreshold = 1000) {
    /**
     * @property {number} bufferSize - Maximum number of context entries to maintain in the rolling buffer.
     */
    this.bufferSize = bufferSize;

    /**
     * @property {number} summaryThreshold - Character limit to trigger summarization of earlier context.
     */
    this.summaryThreshold = summaryThreshold;

    /**
     * @property {Array<string>} contextBuffer - Rolling buffer to store recent context entries.
     */
    this.contextBuffer = [];

    /**
     * @property {Array<string>} summarizedEmbeddings - Array to store summarized and compressed representations of earlier context.
     */
    this.summarizedEmbeddings = [];
  }

  /**
   * Adds new context to the buffer and manages summarization if necessary.
   * @param {string} newContext - The new context to add.
   */
  addContext(newContext) {
    if (typeof newContext !== 'string') {
      throw new TypeError('Context must be a string.');
    }

    this.contextBuffer.push(newContext);

    if (this.contextBuffer.join(' ').length > this.summaryThreshold) {
      this.summarizeContext();
    }

    if (this.contextBuffer.length > this.bufferSize) {
      this.contextBuffer.shift();
    }
  }

  /**
   * Summarizes the earlier context using a simple compression algorithm.
   * Uses word-frequency compression to produce compact summaries.
   */
  summarizeContext() {
    const combinedContext = this.contextBuffer.join(' ');

    // Word frequency-based summarization — extracts top-50 most frequent words
    const wordFrequency = combinedContext
      .split(' ')
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    const summary = sortedWords.slice(0, 50).join(' '); // Top 50 words as summary

    this.summarizedEmbeddings.push(summary);

    // Clear buffer after summarization
    this.contextBuffer = [];
  }

  /**
   * Retrieves the current context buffer.
   * @returns {Array<string>} - The current context buffer.
   */
  getContextBuffer() {
    return this.contextBuffer;
  }

  /**
   * Retrieves the summarized embeddings.
   * @returns {Array<string>} - The summarized embeddings.
   */
  getSummarizedEmbeddings() {
    return this.summarizedEmbeddings;
  }

  /**
   * Clears all stored context and summarized embeddings.
   */
  clearAll() {
    this.contextBuffer = [];
    this.summarizedEmbeddings = [];
  }
}

/**
 * Factory function to create a new SlidingWindowContextManager instance.
 * @param {number} [bufferSize=5] - Maximum number of context entries to maintain in the rolling buffer.
 * @param {number} [summaryThreshold=1000] - Character limit to trigger summarization of earlier context.
 * @returns {SlidingWindowContextManager} - A new instance of SlidingWindowContextManager.
 */
function createSlidingWindowContextManager(bufferSize = 5, summaryThreshold = 1000) {
  return new SlidingWindowContextManager(bufferSize, summaryThreshold);
}

export { SlidingWindowContextManager, createSlidingWindowContextManager };