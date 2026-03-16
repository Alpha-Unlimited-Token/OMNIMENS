/**
 * Hierarchical Memory Manager Module
 * This module implements a recursive summarization algorithm to condense older context into vector embeddings,
 * enabling reasoning across long conversations.
 */

/**
 * Summarizes an array of context strings into a condensed embedding-like representation.
 * @param {string[]} contexts - Array of context strings to be summarized.
 * @param {number} maxDepth - Maximum depth for recursive summarization.
 * @param {number} [currentDepth=0] - Current depth of recursion (used internally).
 * @returns {string} - A single summarized representation of the input contexts.
 */
export function summarizeContexts(contexts, maxDepth, currentDepth = 0) {
  if (!Array.isArray(contexts) || contexts.length === 0) {
    throw new Error("Input must be a non-empty array of strings.");
  }

  if (typeof maxDepth !== "number" || maxDepth <= 0) {
    throw new Error("maxDepth must be a positive integer.");
  }

  if (currentDepth >= maxDepth || contexts.length === 1) {
    // Base case: return a single summarized string
    return contexts.join(" ").slice(0, 512); // Truncate to 512 characters to simulate embedding-like compression
  }

  // Divide contexts into smaller chunks for recursive summarization
  const chunkSize = Math.ceil(contexts.length / 2);
  const chunk1 = contexts.slice(0, chunkSize);
  const chunk2 = contexts.slice(chunkSize);

  // Recursively summarize each chunk
  const summary1 = summarizeContexts(chunk1, maxDepth, currentDepth + 1);
  const summary2 = summarizeContexts(chunk2, maxDepth, currentDepth + 1);

  // Combine the two summaries into a single representation
  return `${summary1} ${summary2}`.slice(0, 512); // Truncate to maintain embedding-like size
}

/**
 * Generates a vector-like numeric representation of a summarized context.
 * @param {string} summary - The summarized context string.
 * @returns {number[]} - A fixed-length array of numbers representing the summary.
 */
export function generateEmbedding(summary) {
  if (typeof summary !== "string" || summary.length === 0) {
    throw new Error("Summary must be a non-empty string.");
  }

  const embedding = new Array(128).fill(0); // Fixed-length array for embedding
  for (let i = 0; i < summary.length; i++) {
    const charCode = summary.charCodeAt(i);
    embedding[i % 128] += charCode; // Distribute character codes across the embedding
  }

  // Normalize the embedding values
  const maxVal = Math.max(...embedding);
  return embedding.map((val) => val / maxVal);
}

/**
 * Main function to manage hierarchical memory summarization and embedding generation.
 * @param {string[]} contexts - Array of context strings to be processed.
 * @param {number} maxDepth - Maximum depth for recursive summarization.
 * @returns {{summary: string, embedding: number[]}} - Object containing the final summary and its embedding.
 */
export function hierarchicalMemoryManager(contexts, maxDepth) {
  const summary = summarizeContexts(contexts, maxDepth);
  const embedding = generateEmbedding(summary);
  return { summary, embedding };
}

/**
 * Example usage:
 * const contexts = ["This is the first context.", "Here is another piece of context.", "Final context string."];
 * const result = hierarchicalMemoryManager(contexts, 3);
 * console.log(result);
 */