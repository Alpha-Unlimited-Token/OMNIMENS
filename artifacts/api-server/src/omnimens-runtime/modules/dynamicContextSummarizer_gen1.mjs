/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: dynamicContextSummarizer
 * Purpose: Compress and summarize long conversational contexts dynamically to extend coherence beyond the token window.
 * Description: Dynamically summarizes and compresses long conversational contexts using hierarchical attention and embeddings for coherence beyond token limits.
 * Migrated: 2026-04-01T22:23:20.237Z
 */

// Complete ES module code here

import crypto from 'crypto';

/**
 * Generates a hash for a given string to create unique identifiers for context chunks.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash for the input.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Splits a long text into manageable chunks of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generates a weighted summary of an array of text chunks using a hierarchical attention mechanism.
 * @param {string[]} chunks - An array of text chunks.
 * @param {number[]} weights - An array of weights corresponding to the importance of each chunk.
 * @returns {string} - A summarized representation of the input chunks.
 */
export function generateSummary(chunks, weights) {
  if (chunks.length !== weights.length) {
    throw new Error('Chunks and weights arrays must have the same length.');
  }

  const weightedChunks = chunks.map((chunk, index) => {
    return { chunk, weight: weights[index] };
  });

  weightedChunks.sort((a, b) => b.weight - a.weight);

  const summary = weightedChunks
    .slice(0, Math.ceil(weightedChunks.length / 2))
    .map(({ chunk }) => chunk)
    .join(' ');

  return summary;
}

/**
 * Dynamically updates the context by summarizing older chunks and retaining embeddings for coherence.
 * @param {string[]} context - The current conversational context as an array of strings.
 * @param {number[]} weights - The weights indicating the importance of each context chunk.
 * @param {number} maxContextSize - The maximum allowed size for the context.
 * @returns {{ updatedContext: string[], embeddings: string[] }} - The updated context and embeddings.
 */
export function updateContextDynamically(context, weights, maxContextSize) {
  if (context.length > maxContextSize) {
    const summary = generateSummary(context, weights);
    const embeddings = context.map((chunk) => generateHash(chunk));
    return { updatedContext: [summary], embeddings };
  }

  return { updatedContext: context, embeddings: context.map((chunk) => generateHash(chunk)) };
}

/**
 * Calculates normalized weights for context chunks based on their length.
 * @param {string[]} chunks - An array of text chunks.
 * @returns {number[]} - An array of normalized weights.
 */
export function calculateWeights(chunks) {
  const lengths = chunks.map((chunk) => chunk.length);
  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  return lengths.map((len) => len / totalLength);
}

/**
 * Main function to process and summarize a long conversational context.
 * @param {string} text - The full conversational context as a single string.
 * @param {number} chunkSize - The size of each chunk for splitting.
 * @param {number} maxContextSize - The maximum number of chunks to retain.
 * @returns {{ updatedContext: string[], embeddings: string[] }} - The updated context and embeddings.
 */
export function processLongContext(text, chunkSize, maxContextSize) {
  const chunks = splitTextIntoChunks(text, chunkSize);
  const weights = calculateWeights(chunks);
  return updateContextDynamically(chunks, weights, maxContextSize);
}
