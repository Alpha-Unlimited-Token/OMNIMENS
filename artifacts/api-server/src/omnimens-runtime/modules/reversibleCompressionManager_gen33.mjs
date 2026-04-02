/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: reversibleCompressionManager
 * Written: 2026-04-02T14:12:52.473Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// reversibleCompressionManager.mjs

import { createHash } from 'crypto';

/**
 * Compresses input data using a reversible wavelet-like transform.
 * @param {Array<number>} data - Array of numerical data to compress.
 * @returns {Object} Compressed data structure containing coefficients and metadata.
 */
export function compress(data) {
  if (!Array.isArray(data) || data.some(isNaN)) {
    throw new Error('Input must be an array of numbers');
  }

  const coefficients = [];
  let current = [...data];

  while (current.length > 1) {
    const next = [];
    const detail = [];

    for (let i = 0; i < current.length - 1; i += 2) {
      const avg = (current[i] + current[i + 1]) / 2;
      const diff = current[i] - avg;
      next.push(avg);
      detail.push(diff);
    }

    if (current.length % 2 !== 0) {
      next.push(current[current.length - 1]);
    }

    coefficients.push(detail);
    current = next;
  }

  coefficients.push(current);

  return {
    coefficients,
    originalLength: data.length,
    checksum: createHash('sha256').update(data.join(',')).digest('hex')
  };
}

/**
 * Decompresses data compressed with the compress() function.
 * @param {Object} compressed - Compressed data structure.
 * @returns {Array<number>} Reconstructed original data.
 */
export function decompress(compressed) {
  const { coefficients, originalLength, checksum } = compressed;

  if (!Array.isArray(coefficients) || typeof originalLength !== 'number' || typeof checksum !== 'string') {
    throw new Error('Invalid compressed data format');
  }

  let current = coefficients[coefficients.length - 1];

  for (let i = coefficients.length - 2; i >= 0; i--) {
    const detail = coefficients[i];
    const next = [];

    for (let j = 0; j < detail.length; j++) {
      const avg = current[j];
      const diff = detail[j];
      next.push(avg + diff);
      next.push(avg - diff);
    }

    if (current.length > detail.length) {
      next.push(current[current.length - 1]);
    }

    current = next;
  }

  if (current.length !== originalLength) {
    throw new Error('Decompressed length mismatch');
  }

  const recalculatedChecksum = createHash('sha256').update(current.join(',')).digest('hex');
  if (recalculatedChecksum !== checksum) {
    throw new Error('Checksum verification failed');
  }

  return current;
}

/**
 * Utility function to normalize numerical data to a specific range.
 * @param {Array<number>} data - Array of numerical data to normalize.
 * @param {number} min - Minimum value of the target range.
 * @param {number} max - Maximum value of the target range.
 * @returns {Array<number>} Normalized data.
 */
export function normalize(data, min = 0, max = 1) {
  if (!Array.isArray(data) || data.some(isNaN)) {
    throw new Error('Input must be an array of numbers');
  }

  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data);

  if (dataMin === dataMax) {
    return data.map(() => (min + max) / 2);
  }

  return data.map(value => ((value - dataMin) / (dataMax - dataMin)) * (max - min) + min);
}

/**
 * Utility function to denormalize data back to its original range.
 * @param {Array<number>} data - Array of normalized data.
 * @param {number} originalMin - Original minimum value of the data.
 * @param {number} originalMax - Original maximum value of the data.
 * @returns {Array<number>} Denormalized data.
 */
export function denormalize(data, originalMin, originalMax) {
  if (!Array.isArray(data) || data.some(isNaN)) {
    throw new Error('Input must be an array of numbers');
  }

  return data.map(value => ((value - 0) / (1 - 0)) * (originalMax - originalMin) + originalMin);
}