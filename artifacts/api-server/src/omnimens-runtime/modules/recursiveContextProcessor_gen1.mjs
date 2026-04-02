/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_13
 * Name: recursiveContextProcessor
 * Purpose: Processes large documents by recursively dividing them into smaller chunks and synthesizing insights hierarchically.
 * Description: Processes large documents by recursively dividing them into chunks and synthesizing hierarchical insights.
 * Migrated: 2026-04-02T14:08:14.880Z
 */

// recursiveContextProcessor.mjs

import crypto from 'crypto';

/**
 * Splits a large text document into smaller chunks of a specified size.
 * @param {string} text - The input document as a string.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitIntoChunks(text, chunkSize) {
  if (typeof text !== 'string' || chunkSize <= 0) {
    throw new Error('Invalid input: text must be a string and chunkSize must be a positive number.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Generates a summary for a given chunk of text.
 * @param {string} chunk - A chunk of text to summarize.
 * @returns {string} - A simple summary of the input chunk.
 */
export function summarizeChunk(chunk) {
  if (typeof chunk !== 'string') {
    throw new Error('Invalid input: chunk must be a string.');
  }

  const words = chunk.split(/\s+/);
  const wordCount = words.length;
  const hash = crypto.createHash('sha256').update(chunk).digest('hex').slice(0, 8);

  return `Summary: ${words.slice(0, 5).join(' ')}... (${wordCount} words, hash: ${hash})`;
}

/**
 * Recursively processes chunks and synthesizes insights hierarchically.
 * @param {string[]} chunks - An array of text chunks.
 * @returns {string[]} - A hierarchical summary of the input chunks.
 */
export function recursiveSummarize(chunks) {
  if (!Array.isArray(chunks) || chunks.some(chunk => typeof chunk !== 'string')) {
    throw new Error('Invalid input: chunks must be an array of strings.');
  }

  if (chunks.length === 1) {
    return [summarizeChunk(chunks[0])];
  }

  const mid = Math.ceil(chunks.length / 2);
  const leftSummary = recursiveSummarize(chunks.slice(0, mid));
  const rightSummary = recursiveSummarize(chunks.slice(mid));

  const combinedSummary = summarizeChunk(leftSummary.join(' ') + ' ' + rightSummary.join(' '));
  return [...leftSummary, ...rightSummary, combinedSummary];
}

/**
 * Processes a large document by splitting, summarizing, and recursively synthesizing insights.
 * @param {string} text - The input document as a string.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - A hierarchical summary of the document.
 */
export function processDocument(text, chunkSize = 1024) {
  if (typeof text !== 'string' || chunkSize <= 0) {
    throw new Error('Invalid input: text must be a string and chunkSize must be a positive number.');
  }

  const chunks = splitIntoChunks(text, chunkSize);
  return recursiveSummarize(chunks);
}

/**
 * Utility function to count words in a text.
 * @param {string} text - The input text.
 * @returns {number} - The word count.
 */
export function countWords(text) {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string.');
  }

  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Utility function to hash a text using SHA-256.
 * @param {string} text - The input text.
 * @returns {string} - The SHA-256 hash of the text.
 */
export function hashText(text) {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string.');
  }

  return crypto.createHash('sha256').update(text).digest('hex');
}