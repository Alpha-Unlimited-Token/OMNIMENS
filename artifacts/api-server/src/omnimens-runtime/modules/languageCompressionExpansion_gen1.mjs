/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_64
 * Name: languageCompressionExpansion
 * Purpose: Preprocesses conversational inputs and outputs to reduce token usage and improve coherence without external LLM dependency.
 * Description: A utility module for hierarchical string compression, expansion, and importance-based emphasis to optimize token usage and coherence.
 * Migrated: 2026-04-02T14:08:14.867Z
 */

// languageCompressionExpansion.mjs

import { createHash } from 'crypto';

/**
 * Compresses a given string by identifying patterns and encoding them hierarchically.
 * @param {string} input - The input string to compress.
 * @returns {string} - Compressed representation of the input.
 */
export function compressString(input) {
  if (typeof input !== 'string' || input.length === 0) return '';

  const dictionary = new Map();
  let nextCode = 256;
  let buffer = '';
  const result = [];

  for (const char of input) {
    const sequence = buffer + char;
    if (dictionary.has(sequence)) {
      buffer = sequence;
    } else {
      result.push(buffer.length > 0 ? dictionary.get(buffer) || buffer.charCodeAt(0) : char.charCodeAt(0));
      if (nextCode <= 65535) {
        dictionary.set(sequence, nextCode++);
      }
      buffer = char;
    }
  }

  if (buffer.length > 0) {
    result.push(dictionary.get(buffer) || buffer.charCodeAt(0));
  }

  return result.map(code => String.fromCharCode(code)).join('');
}

/**
 * Expands a compressed string back to its original form using the same hierarchical encoding.
 * @param {string} input - The compressed string to expand.
 * @returns {string} - The expanded original string.
 */
export function expandString(input) {
  if (typeof input !== 'string' || input.length === 0) return '';

  const dictionary = new Map();
  let nextCode = 256;
  let buffer = input[0];
  const result = [buffer];

  for (let i = 1; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const entry = code < 256 ? String.fromCharCode(code) : dictionary.get(code);

    if (!entry) {
      const expanded = buffer + buffer[0];
      result.push(expanded);
      dictionary.set(nextCode++, expanded);
      buffer = expanded;
    } else {
      result.push(entry);
      dictionary.set(nextCode++, buffer + entry[0]);
      buffer = entry;
    }
  }

  return result.join('');
}

/**
 * Calculates a hash-based importance score for a given string.
 * @param {string} input - The input string to score.
 * @returns {number} - The importance score (0-1).
 */
export function calculateImportance(input) {
  if (typeof input !== 'string' || input.length === 0) return 0;

  const hash = createHash('sha256').update(input).digest('hex');
  const numericValue = parseInt(hash.slice(0, 8), 16);
  return (numericValue % 1000) / 1000;
}

/**
 * Expands a compressed string while emphasizing important segments based on their scores.
 * @param {string} input - The compressed string to expand.
 * @param {number} threshold - The importance threshold (0-1).
 * @returns {string} - The expanded string with emphasis on important parts.
 */
export function expandWithEmphasis(input, threshold = 0.5) {
  const expanded = expandString(input);
  const words = expanded.split(/\s+/);

  return words
    .map(word => {
      const importance = calculateImportance(word);
      return importance >= threshold ? word.toUpperCase() : word;
    })
    .join(' ');
}

/**
 * Utility function to preprocess input for token optimization.
 * @param {string} input - The raw input string to preprocess.
 * @returns {string} - The optimized and compressed string.
 */
export function preprocessInput(input) {
  const compressed = compressString(input);
  return compressed;
}

/**
 * Utility function to postprocess output for token optimization.
 * @param {string} input - The compressed string to postprocess.
 * @returns {string} - The expanded and refined output string.
 */
export function postprocessOutput(input) {
  return expandString(input);
}
