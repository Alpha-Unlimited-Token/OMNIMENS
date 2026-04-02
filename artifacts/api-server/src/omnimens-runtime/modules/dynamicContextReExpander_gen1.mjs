/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_21
 * Name: dynamicContextReExpander
 * Purpose: Reconstructs compressed context summaries dynamically during reasoning for improved long-context understanding.
 * Description: Expands compressed context summaries dynamically for enhanced long-context understanding using hierarchical transformers and memory retrieval.
 * Migrated: 2026-04-02T15:02:53.822Z
 */

// dynamicContextReExpander.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique identifier for context segments.
 * @param {string} input - The input string to hash.
 * @returns {string} A fixed-length hash of the input.
 */
export function hashContext(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Splits a large context into manageable segments of a given size.
 * @param {string} context - The full context string.
 * @param {number} segmentSize - The maximum size of each segment.
 * @returns {Array<string>} An array of context segments.
 */
export function splitContext(context, segmentSize) {
  if (segmentSize <= 0) throw new Error('Segment size must be greater than 0.');
  const segments = [];
  for (let i = 0; i < context.length; i += segmentSize) {
    segments.push(context.slice(i, i + segmentSize));
  }
  return segments;
}

/**
 * Compresses context segments into a summary using selective attention.
 * @param {Array<string>} segments - Array of context segments.
 * @param {Function} importanceFunction - A function to rank segment importance.
 * @returns {string} A compressed summary of the most important segments.
 */
export function compressContext(segments, importanceFunction) {
  if (!Array.isArray(segments)) throw new Error('Segments must be an array.');
  if (typeof importanceFunction !== 'function') throw new Error('Importance function must be a function.');

  const rankedSegments = segments
    .map(segment => ({ segment, score: importanceFunction(segment) }))
    .sort((a, b) => b.score - a.score);

  const topSegments = rankedSegments.slice(0, Math.ceil(segments.length / 2));
  return topSegments.map(({ segment }) => segment).join(' ');
}

/**
 * Reconstructs a detailed context from compressed summaries and memory retrieval.
 * @param {string} compressedSummary - The compressed context summary.
 * @param {Array<string>} memory - Array of stored context segments.
 * @param {Function} relevanceFunction - A function to determine relevance of memory segments.
 * @returns {string} The reconstructed detailed context.
 */
export function reconstructContext(compressedSummary, memory, relevanceFunction) {
  if (typeof compressedSummary !== 'string') throw new Error('Compressed summary must be a string.');
  if (!Array.isArray(memory)) throw new Error('Memory must be an array.');
  if (typeof relevanceFunction !== 'function') throw new Error('Relevance function must be a function.');

  const relevantSegments = memory.filter(segment => relevanceFunction(segment, compressedSummary));
  return [compressedSummary, ...relevantSegments].join(' ');
}

/**
 * Default importance function: calculates importance based on length.
 * @param {string} segment - A context segment.
 * @returns {number} Importance score of the segment.
 */
export function defaultImportanceFunction(segment) {
  return segment.length;
}

/**
 * Default relevance function: checks if memory segment shares common words with the summary.
 * @param {string} memorySegment - A memory segment.
 * @param {string} summary - The compressed summary.
 * @returns {boolean} True if the memory segment is relevant, false otherwise.
 */
export function defaultRelevanceFunction(memorySegment, summary) {
  const summaryWords = new Set(summary.split(/\s+/));
  const segmentWords = new Set(memorySegment.split(/\s+/));
  return [...segmentWords].some(word => summaryWords.has(word));
}

/**
 * Example usage: Dynamically expand and reconstruct context.
 * @param {string} fullContext - The full input context.
 * @param {number} segmentSize - The size of each context segment.
 * @param {Array<string>} memory - Stored memory segments.
 * @returns {string} Reconstructed context.
 */
export function dynamicContextExpansion(fullContext, segmentSize, memory) {
  const segments = splitContext(fullContext, segmentSize);
  const compressed = compressContext(segments, defaultImportanceFunction);
  return reconstructContext(compressed, memory, defaultRelevanceFunction);
}
