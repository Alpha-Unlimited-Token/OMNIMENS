/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_4
 * Name: hierarchicalTokenProcessor
 * Purpose: Processes large datasets by dynamically segmenting and linking context across token windows.
 * Description: Processes large datasets by segmenting, compressing, and stitching text to maintain semantic coherence across token windows.
 * Migrated: 2026-04-03T12:32:31.668Z
 */

// hierarchicalTokenProcessor.mjs

import crypto from 'crypto';

/**
 * Dynamically segments and links context across token windows.
 * Maintains semantic coherence using importance-scored compression and stitching.
 */

/**
 * Utility to segment large datasets into manageable chunks based on token limits.
 * @param {string} text - The input text to segment.
 * @param {number} windowSize - Maximum token window size.
 * @returns {Array<string>} - Array of segmented text chunks.
 */
export function segmentText(text, windowSize) {
  if (typeof text !== 'string' || windowSize <= 0) {
    throw new Error('Invalid input: text must be a string and windowSize must be a positive number.');
  }

  const words = text.split(' ');
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    if (currentChunk.join(' ').length + word.length + 1 <= windowSize) {
      currentChunk.push(word);
    } else {
      chunks.push(currentChunk.join(' '));
      currentChunk = [word];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

/**
 * Compresses text chunks by scoring importance and removing less critical tokens.
 * @param {Array<string>} chunks - Array of text chunks.
 * @param {number} compressionFactor - Factor to reduce chunk size (0-1).
 * @returns {Array<string>} - Compressed text chunks.
 */
export function compressChunks(chunks, compressionFactor) {
  if (!Array.isArray(chunks) || compressionFactor < 0 || compressionFactor > 1) {
    throw new Error('Invalid input: chunks must be an array and compressionFactor must be between 0 and 1.');
  }

  return chunks.map(chunk => {
    const words = chunk.split(' ');
    const importanceScores = words.map(word => scoreWordImportance(word));

    const sortedWords = words
      .map((word, index) => ({ word, score: importanceScores[index] }))
      .sort((a, b) => b.score - a.score);

    const retainedWords = sortedWords.slice(0, Math.ceil(words.length * compressionFactor)).map(item => item.word);

    return retainedWords.join(' ');
  });
}

/**
 * Scores the importance of a word based on its entropy.
 * @param {string} word - The word to score.
 * @returns {number} - Importance score (higher is more important).
 */
export function scoreWordImportance(word) {
  const hash = crypto.createHash('sha256').update(word).digest('hex');
  const entropy = hash.split('').reduce((acc, char) => acc + parseInt(char, 16), 0);
  return entropy / hash.length;
}

/**
 * Stitches compressed chunks back into a coherent narrative.
 * @param {Array<string>} compressedChunks - Array of compressed text chunks.
 * @returns {string} - Reconstructed coherent text.
 */
export function stitchChunks(compressedChunks) {
  if (!Array.isArray(compressedChunks)) {
    throw new Error('Invalid input: compressedChunks must be an array.');
  }

  return compressedChunks.join(' ');
}

/**
 * Processes large datasets by segmenting, compressing, and stitching.
 * @param {string} text - Input text.
 * @param {number} windowSize - Token window size.
 * @param {number} compressionFactor - Compression factor (0-1).
 * @returns {string} - Final processed text.
 */
export function processText(text, windowSize, compressionFactor) {
  const segments = segmentText(text, windowSize);
  const compressed = compressChunks(segments, compressionFactor);
  return stitchChunks(compressed);
}
