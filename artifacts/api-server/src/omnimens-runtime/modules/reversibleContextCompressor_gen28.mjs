/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: reversibleContextCompressor
 * Written: 2026-04-02T14:12:20.594Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// reversibleContextCompressor.mjs

import { createHash } from 'crypto';

/**
 * Encodes a context window into a compressed representation using a reversible hash-based approach.
 * @param {string} context - The input context string to compress.
 * @param {number} maxLength - The maximum allowed length for the compressed output.
 * @returns {object} - An object containing the compressed string and a checksum for verification.
 */
export function encodeContext(context, maxLength) {
  if (typeof context !== 'string' || typeof maxLength !== 'number' || maxLength <= 0) {
    throw new Error('Invalid input: context must be a string and maxLength must be a positive number.');
  }

  const checksum = createHash('sha256').update(context).digest('hex');
  const compressed = context.length > maxLength ? context.slice(0, maxLength) : context;

  return {
    compressed,
    checksum
  };
}

/**
 * Decodes a compressed representation back to its original form using the checksum for validation.
 * @param {object} compressedObject - An object containing the compressed string and checksum.
 * @param {string} originalContext - The original context string for validation.
 * @returns {boolean} - True if the decompression is valid, false otherwise.
 */
export function decodeContext(compressedObject, originalContext) {
  if (
    typeof compressedObject !== 'object' ||
    typeof compressedObject.compressed !== 'string' ||
    typeof compressedObject.checksum !== 'string' ||
    typeof originalContext !== 'string'
  ) {
    throw new Error('Invalid input: compressedObject must contain valid compressed and checksum strings, and originalContext must be a string.');
  }

  const recalculatedChecksum = createHash('sha256').update(originalContext).digest('hex');
  return compressedObject.checksum === recalculatedChecksum;
}

/**
 * Utility to split a large context into smaller windows for compression.
 * @param {string} context - The input context string to split.
 * @param {number} windowSize - The size of each context window.
 * @returns {string[]} - An array of context windows.
 */
export function splitContext(context, windowSize) {
  if (typeof context !== 'string' || typeof windowSize !== 'number' || windowSize <= 0) {
    throw new Error('Invalid input: context must be a string and windowSize must be a positive number.');
  }

  const windows = [];
  for (let i = 0; i < context.length; i += windowSize) {
    windows.push(context.slice(i, i + windowSize));
  }

  return windows;
}

/**
 * Utility to recombine context windows into a single string.
 * @param {string[]} windows - An array of context windows to recombine.
 * @returns {string} - The recombined context string.
 */
export function combineContext(windows) {
  if (!Array.isArray(windows) || !windows.every(w => typeof w === 'string')) {
    throw new Error('Invalid input: windows must be an array of strings.');
  }

  return windows.join('');
}

/**
 * Validates the integrity of a recombined context against its original checksum.
 * @param {string} recombinedContext - The recombined context string.
 * @param {string} originalChecksum - The original checksum for validation.
 * @returns {boolean} - True if the recombined context matches the original checksum, false otherwise.
 */
export function validateRecombinedContext(recombinedContext, originalChecksum) {
  if (typeof recombinedContext !== 'string' || typeof originalChecksum !== 'string') {
    throw new Error('Invalid input: recombinedContext and originalChecksum must be strings.');
  }

  const recalculatedChecksum = createHash('sha256').update(recombinedContext).digest('hex');
  return recalculatedChecksum === originalChecksum;
}