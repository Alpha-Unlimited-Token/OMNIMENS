/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: adaptiveCompressionWindow
 * Purpose: Processes larger token contexts by selectively compressing and retaining only the most critical information.
 * Description: Processes large text contexts by adaptively compressing and retaining critical information using summarization, extraction, and vectorization.
 * Migrated: 2026-04-03T09:43:27.655Z
 */

// adaptiveCompressionWindow.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique identifier for deduplication or tracking purposes.
 * @param {string} input - The input string to hash.
 * @returns {string} - A short, unique hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

/**
 * Performs hierarchical summarization by recursively summarizing text chunks.
 * @param {string[]} chunks - Array of text chunks to summarize.
 * @param {number} maxChunks - Maximum number of chunks to retain.
 * @returns {string[]} - Array of summarized chunks.
 */
export function hierarchicalSummarization(chunks, maxChunks) {
  while (chunks.length > maxChunks) {
    const newChunks = [];
    for (let i = 0; i < chunks.length; i += 2) {
      const chunk1 = chunks[i];
      const chunk2 = chunks[i + 1] || '';
      newChunks.push(summarizeText(chunk1 + ' ' + chunk2));
    }
    chunks = newChunks;
  }
  return chunks;
}

/**
 * Extracts the most attention-weighted sentences from a text.
 * @param {string} text - The input text to process.
 * @param {number} maxSentences - Maximum number of sentences to retain.
 * @returns {string[]} - Array of important sentences.
 */
export function attentionWeightedExtraction(text, maxSentences) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const scoredSentences = sentences.map((sentence) => ({
    sentence,
    score: computeAttentionScore(sentence),
  }));
  scoredSentences.sort((a, b) => b.score - a.score);
  return scoredSentences.slice(0, maxSentences).map((entry) => entry.sentence);
}

/**
 * Converts text into a sparse vector representation for efficient processing.
 * @param {string} text - The input text to vectorize.
 * @returns {Object} - Sparse vector representation of the text.
 */
export function sparseVectorize(text) {
  const words = text.toLowerCase().split(/\W+/);
  const vector = {};
  for (const word of words) {
    if (!vector[word]) vector[word] = 0;
    vector[word] += 1;
  }
  return vector;
}

/**
 * Adaptive compression algorithm combining summarization, extraction, and vectorization.
 * @param {string} text - The input text to compress.
 * @param {number} maxChunks - Maximum number of chunks to retain.
 * @param {number} maxSentences - Maximum number of sentences to retain per chunk.
 * @returns {Object} - Compressed representation of the input text.
 */
export function adaptiveCompression(text, maxChunks, maxSentences) {
  const chunks = text.match(/.{1,500}/g) || [text];
  const summarizedChunks = hierarchicalSummarization(chunks, maxChunks);
  const compressedChunks = summarizedChunks.map((chunk) => ({
    original: chunk,
    importantSentences: attentionWeightedExtraction(chunk, maxSentences),
    sparseVector: sparseVectorize(chunk),
  }));
  return compressedChunks;
}

/**
 * Computes a basic attention score for a sentence based on word length and punctuation.
 * @param {string} sentence - The sentence to score.
 * @returns {number} - Attention score for the sentence.
 */
function computeAttentionScore(sentence) {
  const lengthScore = sentence.length;
  const punctuationScore = (sentence.match(/[.,!?]/g) || []).length * 10;
  return lengthScore + punctuationScore;
}

/**
 * Summarizes a block of text by extracting key phrases (basic implementation).
 * @param {string} text - The text to summarize.
 * @returns {string} - A summarized version of the text.
 */
function summarizeText(text) {
  const words = text.split(' ');
  const summaryLength = Math.max(1, Math.floor(words.length / 2));
  return words.slice(0, summaryLength).join(' ');
}