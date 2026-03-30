/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: rollingContextSummarizer
 * Purpose: Summarize and retain conversational context beyond the token window.
 * Description: Summarizes and retains conversational context recursively beyond token limits for OMNIMENS's self-evolution.
 * Migrated: 2026-03-25T22:49:34.270Z
 */

/**
 * @module rollingContextSummarizer
 * @description A utility module for summarizing and retaining conversational context beyond the token window using recursive summarization.
 */

/**
 * Summarizes a given array of conversation chunks recursively to distill context.
 * @param {string[]} chunks - Array of conversation chunks (text).
 * @param {number} maxChunkSize - Maximum size of each summarized chunk.
 * @returns {string} A concise summary of the entire conversation.
 */
export function summarizeContext(chunks, maxChunkSize = 500) {
  if (!Array.isArray(chunks)) {
    throw new TypeError('Input must be an array of strings.');
  }

  if (chunks.length === 0) {
    return '';
  }

  // Base case: if there is only one chunk, return it as the summary.
  if (chunks.length === 1) {
    return chunks[0].slice(0, maxChunkSize);
  }

  // Recursive case: pairwise summarization.
  const mergedChunks = [];
  for (let i = 0; i < chunks.length; i += 2) {
    const chunk1 = chunks[i];
    const chunk2 = chunks[i + 1] || ''; // Handle odd number of chunks.
    const mergedSummary = summarizePair(chunk1, chunk2, maxChunkSize);
    mergedChunks.push(mergedSummary);
  }

  return summarizeContext(mergedChunks, maxChunkSize);
}

/**
 * Summarizes two text chunks into a single concise summary.
 * @param {string} chunk1 - First text chunk.
 * @param {string} chunk2 - Second text chunk.
 * @param {number} maxChunkSize - Maximum size of the summarized chunk.
 * @returns {string} A concise summary of the two chunks.
 */
function summarizePair(chunk1, chunk2, maxChunkSize) {
  const combinedText = `${chunk1} ${chunk2}`;

  // Simple summarization logic: truncate combined text to maxChunkSize.
  // Future versions can implement more sophisticated NLP summarization.
  return combinedText.slice(0, maxChunkSize);
}

/**
 * Retains conversational context by maintaining a rolling summary.
 * @param {string[]} conversationHistory - Array of conversation chunks (text).
 * @param {number} tokenWindowSize - Maximum size of the retained context summary.
 * @returns {string} A rolling summary of the conversation history.
 */
export function retainRollingContext(conversationHistory, tokenWindowSize = 1000) {
  if (!Array.isArray(conversationHistory)) {
    throw new TypeError('Conversation history must be an array of strings.');
  }

  const summary = summarizeContext(conversationHistory, tokenWindowSize);

  // Ensure the summary fits within the token window size.
  return summary.slice(0, tokenWindowSize);
}

/**
 * Adds a new conversation chunk to the history and updates the rolling summary.
 * @param {string[]} conversationHistory - Array of conversation chunks (text).
 * @param {string} newChunk - New conversation chunk to add.
 * @param {number} tokenWindowSize - Maximum size of the retained context summary.
 * @returns {string} Updated rolling summary of the conversation history.
 */
export function updateRollingContext(conversationHistory, newChunk, tokenWindowSize = 1000) {
  if (!Array.isArray(conversationHistory)) {
    throw new TypeError('Conversation history must be an array of strings.');
  }

  if (typeof newChunk !== 'string') {
    throw new TypeError('New chunk must be a string.');
  }

  // Add the new chunk to the history.
  conversationHistory.push(newChunk);

  // Update the rolling summary.
  return retainRollingContext(conversationHistory, tokenWindowSize);
}
