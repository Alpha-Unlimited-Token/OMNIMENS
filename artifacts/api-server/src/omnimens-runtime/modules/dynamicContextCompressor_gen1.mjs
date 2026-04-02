/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_28
 * Name: dynamicContextCompressor
 * Purpose: Optimizes token window usage by dynamically expanding and compressing context based on query importance.
 * Description: A utility module for dynamic context compression using hierarchical summarization and query-based relevance scoring.
 * Migrated: 2026-04-02T15:46:59.465Z
 */

// dynamicContextCompressor.mjs

import crypto from 'crypto';

/**
 * Utility function to calculate a hash for content deduplication or reference.
 * @param {string} content - The content to hash.
 * @returns {string} - A SHA-256 hash of the input content.
 */
export function generateContentHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Summarizes a given text by extracting the most relevant sentences based on query importance.
 * @param {string} text - The input text to summarize.
 * @param {string} query - The query to determine relevance.
 * @param {number} compressionRatio - The desired compression ratio (0 to 1).
 * @returns {string} - A summarized version of the input text.
 */
export function summarizeText(text, query, compressionRatio = 0.5) {
  if (compressionRatio <= 0 || compressionRatio > 1) {
    throw new Error('Compression ratio must be between 0 and 1 (exclusive).');
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  const relevanceScores = sentences.map(sentence => calculateRelevance(sentence, query));

  const rankedSentences = sentences
    .map((sentence, index) => ({ sentence, score: relevanceScores[index] }))
    .sort((a, b) => b.score - a.score);

  const numSentencesToKeep = Math.ceil(sentences.length * compressionRatio);
  const summarizedSentences = rankedSentences.slice(0, numSentencesToKeep).map(item => item.sentence);

  return summarizedSentences.join(' ');
}

/**
 * Calculates relevance of a sentence to a query using a simple keyword matching heuristic.
 * @param {string} sentence - The sentence to evaluate.
 * @param {string} query - The query to compare against.
 * @returns {number} - A relevance score (higher is more relevant).
 */
export function calculateRelevance(sentence, query) {
  const sentenceWords = sentence.toLowerCase().split(/\W+/);
  const queryWords = query.toLowerCase().split(/\W+/);

  const matches = queryWords.filter(word => sentenceWords.includes(word));
  return matches.length / queryWords.length;
}

/**
 * Dynamically compresses a context array of text entries based on their relevance to a query.
 * @param {Array<{ id: string, content: string }>} context - The input context array.
 * @param {string} query - The query to determine importance.
 * @param {number} compressionRatio - The desired overall compression ratio (0 to 1).
 * @returns {Array<{ id: string, content: string }>} - A compressed context array.
 */
export function compressContext(context, query, compressionRatio = 0.5) {
  if (!Array.isArray(context)) {
    throw new Error('Context must be an array of objects with id and content properties.');
  }

  const relevanceScores = context.map(entry => ({
    id: entry.id,
    score: calculateRelevance(entry.content, query)
  }));

  const rankedEntries = relevanceScores.sort((a, b) => b.score - a.score);

  const numEntriesToKeep = Math.ceil(context.length * compressionRatio);
  const compressedContext = rankedEntries.slice(0, numEntriesToKeep).map(entry => {
    const originalEntry = context.find(item => item.id === entry.id);
    return {
      id: originalEntry.id,
      content: summarizeText(originalEntry.content, query, compressionRatio)
    };
  });

  return compressedContext;
}

/**
 * Utility function to validate the structure of a context array.
 * @param {Array} context - The context array to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateContextStructure(context) {
  return Array.isArray(context) && context.every(entry => {
    return typeof entry.id === 'string' && typeof entry.content === 'string';
  });
}

/**
 * Example usage of the module.
 */
export function exampleUsage() {
  const context = [
    { id: '1', content: 'A* is a graph traversal algorithm used in pathfinding.' },
    { id: '2', content: 'Dijkstra’s algorithm finds the shortest path in a weighted graph.' },
    { id: '3', content: 'Computational intelligence involves algorithms and paradigms for intelligent systems.' }
  ];

  const query = 'graph algorithms';
  const compressed = compressContext(context, query, 0.5);

  console.log('Compressed Context:', compressed);
}
