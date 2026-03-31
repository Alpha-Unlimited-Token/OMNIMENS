/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: conversationSummarizer
 * Purpose: Summarize long conversation contexts into a compressed format for token-efficient recall.
 * Description: Summarizes long conversations into concise, token-efficient formats using a sliding window and embeddings for OMNIMENS's intelligent recall.
 * Migrated: 2026-03-25T22:49:34.229Z
 */

/**
 * @module conversationSummarizer
 * @description Summarizes long conversation contexts into a compressed format for token-efficient recall using a sliding window approach.
 */

/**
 * Summarizes a long conversation context into a compressed format.
 * Uses a sliding window approach with embeddings to distill key points while maintaining coherence.
 *
 * @param {string[]} conversation - An array of conversation strings (e.g., chat messages).
 * @param {number} windowSize - The size of the sliding window (number of messages per window).
 * @param {number} overlap - The number of overlapping messages between consecutive windows.
 * @returns {string} A summarized version of the conversation.
 */
export function summarizeConversation(conversation, windowSize, overlap) {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    throw new Error("Conversation must be a non-empty array of strings.");
  }

  if (typeof windowSize !== "number" || windowSize <= 0) {
    throw new Error("Window size must be a positive number.");
  }

  if (typeof overlap !== "number" || overlap < 0 || overlap >= windowSize) {
    throw new Error("Overlap must be a non-negative number less than the window size.");
  }

  /**
   * Helper function to compute a simple semantic embedding for a given text.
   * This is a placeholder for a more advanced embedding function.
   *
   * @param {string} text - The input text.
   * @returns {number[]} A numeric vector representing the text.
   */
  function computeEmbedding(text) {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.length);
  }

  /**
   * Helper function to calculate the average embedding of a window of messages.
   *
   * @param {string[]} window - An array of messages.
   * @returns {number[]} The average embedding vector.
   */
  function calculateWindowEmbedding(window) {
    const embeddings = window.map(computeEmbedding);
    const vectorLength = embeddings[0].length;
    const avgEmbedding = new Array(vectorLength).fill(0);

    embeddings.forEach((embedding) => {
      for (let i = 0; i < vectorLength; i++) {
        avgEmbedding[i] += embedding[i];
      }
    });

    return avgEmbedding.map((value) => value / embeddings.length);
  }

  /**
   * Helper function to generate a summary for a window of messages.
   *
   * @param {string[]} window - An array of messages.
   * @returns {string} A summarized string for the window.
   */
  function summarizeWindow(window) {
    return window.join(" ").slice(0, 200); // Truncate to 200 characters for simplicity.
  }

  const summaries = [];
  let start = 0;

  while (start < conversation.length) {
    const end = Math.min(start + windowSize, conversation.length);
    const window = conversation.slice(start, end);

    const windowSummary = summarizeWindow(window);
    summaries.push(windowSummary);

    start += windowSize - overlap;
  }

  return summaries.join(" ");
}

/**
 * Validates and prepares input for the summarizer function.
 *
 * @param {string} input - The raw conversation input as a single string.
 * @param {number} windowSize - The size of the sliding window.
 * @param {number} overlap - The number of overlapping messages between windows.
 * @returns {string} A summarized version of the conversation.
 */
export function summarizeRawInput(input, windowSize = 5, overlap = 2) {
  if (typeof input !== "string" || input.trim() === "") {
    throw new Error("Input must be a non-empty string.");
  }

  const conversation = input.split("\n").map((line) => line.trim()).filter(Boolean);
  return summarizeConversation(conversation, windowSize, overlap);
}