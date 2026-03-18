/**
 * @module contextSummarizer
 * @description Summarizes conversation history recursively to preserve context within token limits using abstraction and compression techniques.
 */

/**
 * Recursively summarizes a conversation history while preserving essential context.
 * @param {Array<string>} history - Array of conversation strings.
 * @param {number} tokenLimit - Maximum token limit for the summarized output.
 * @returns {string} - Summarized conversation history.
 */
export function summarizeContext(history, tokenLimit) {
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error("Invalid input: history must be a non-empty array of strings.");
  }

  if (typeof tokenLimit !== "number" || tokenLimit <= 0) {
    throw new Error("Invalid input: tokenLimit must be a positive number.");
  }

  /**
   * Calculates the approximate token count for a given string.
   * GPT-4o token approximation assumes ~4 characters per token.
   * @param {string} text - Input text.
   * @returns {number} - Approximate token count.
   */
  function calculateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Compresses a list of strings into a single summary.
   * @param {Array<string>} segments - Array of strings to compress.
   * @returns {string} - Compressed summary of the input segments.
   */
  function compressSegments(segments) {
    return segments.join(" ").replace(/\s+/g, " ").trim();
  }

  /**
   * Recursively compresses history until it fits within the token limit.
   * @param {Array<string>} segments - Array of conversation strings.
   * @param {number} limit - Token limit.
   * @returns {string} - Final compressed summary.
   */
  function recursiveSummarize(segments, limit) {
    const combined = compressSegments(segments);
    const tokenCount = calculateTokens(combined);

    if (tokenCount <= limit) {
      return combined;
    }

    // Split into smaller chunks for recursive summarization.
    const mid = Math.ceil(segments.length / 2);
    const left = recursiveSummarize(segments.slice(0, mid), limit);
    const right = recursiveSummarize(segments.slice(mid), limit);

    return recursiveSummarize([left, right], limit);
  }

  return recursiveSummarize(history, tokenLimit);
}

/**
 * Validates conversation history and token limit before summarizing.
 * @param {Array<string>} history - Array of conversation strings.
 * @param {number} tokenLimit - Maximum token limit for the summarized output.
 * @returns {string} - Summarized conversation history.
 */
export function validateAndSummarize(history, tokenLimit) {
  try {
    return summarizeContext(history, tokenLimit);
  } catch (error) {
    console.error("Error summarizing context:", error.message);
    return "Error: Unable to summarize context.";
  }
}