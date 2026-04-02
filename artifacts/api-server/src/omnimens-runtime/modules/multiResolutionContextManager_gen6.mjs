/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: multiResolutionContextManager
 * Written: 2026-04-02T22:12:26.236Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// multiResolutionContextManager.mjs

import crypto from 'crypto';

/**
 * Generate a hash to uniquely identify content blocks.
 * @param {string} content - The content to hash.
 * @returns {string} - A unique hash string.
 */
export function generateContentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create a multi-resolution representation of a document.
 * @param {string} document - The input document.
 * @param {number} summaryRatio - Ratio (0-1) for high-level summary compression.
 * @param {number} detailWindowSize - Number of tokens for fine-grained detail windows.
 * @returns {Object} - Multi-resolution representation with summaries and details.
 */
export function createMultiResolutionRepresentation(document, summaryRatio = 0.2, detailWindowSize = 50) {
  if (typeof document !== 'string' || document.trim() === '') {
    throw new Error('Invalid document: must be a non-empty string.');
  }

  if (summaryRatio <= 0 || summaryRatio > 1) {
    throw new Error('Invalid summaryRatio: must be between 0 and 1.');
  }

  if (detailWindowSize <= 0 || !Number.isInteger(detailWindowSize)) {
    throw new Error('Invalid detailWindowSize: must be a positive integer.');
  }

  const tokens = document.split(/\s+/);
  const totalTokens = tokens.length;

  // Generate high-level summary
  const summaryTokens = Math.max(1, Math.floor(totalTokens * summaryRatio));
  const summary = tokens.slice(0, summaryTokens).join(' ');

  // Generate fine-grained detail windows
  const detailWindows = [];
  for (let i = 0; i < totalTokens; i += detailWindowSize) {
    const window = tokens.slice(i, i + detailWindowSize).join(' ');
    detailWindows.push({
      start: i,
      end: Math.min(i + detailWindowSize, totalTokens),
      content: window,
      hash: generateContentHash(window)
    });
  }

  return {
    summary,
    details: detailWindows
  };
}

/**
 * Merge multi-resolution representations into a unified view.
 * @param {Array<Object>} representations - Array of multi-resolution representations.
 * @returns {Object} - Unified representation with combined summaries and details.
 */
export function mergeRepresentations(representations) {
  if (!Array.isArray(representations) || representations.length === 0) {
    throw new Error('Invalid input: must be a non-empty array of representations.');
  }

  const unifiedSummary = representations.map(rep => rep.summary).join(' ');

  const unifiedDetails = [];
  representations.forEach(rep => {
    if (rep.details && Array.isArray(rep.details)) {
      unifiedDetails.push(...rep.details);
    }
  });

  return {
    summary: unifiedSummary,
    details: unifiedDetails
  };
}

/**
 * Extract relevant details from a multi-resolution representation based on a query.
 * @param {Object} representation - Multi-resolution representation.
 * @param {string} query - Query to match against.
 * @returns {Array<Object>} - Array of detail windows matching the query.
 */
export function extractRelevantDetails(representation, query) {
  if (!representation || typeof representation !== 'object') {
    throw new Error('Invalid representation: must be an object.');
  }

  if (typeof query !== 'string' || query.trim() === '') {
    throw new Error('Invalid query: must be a non-empty string.');
  }

  const lowerQuery = query.toLowerCase();

  return (representation.details || []).filter(detail =>
    detail.content.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Utility to tokenize a document into chunks of a fixed size.
 * @param {string} document - The input document.
 * @param {number} chunkSize - Number of tokens per chunk.
 * @returns {Array<string>} - Tokenized chunks.
 */
export function tokenizeDocument(document, chunkSize) {
  if (typeof document !== 'string' || document.trim() === '') {
    throw new Error('Invalid document: must be a non-empty string.');
  }

  if (chunkSize <= 0 || !Number.isInteger(chunkSize)) {
    throw new Error('Invalid chunkSize: must be a positive integer.');
  }

  const tokens = document.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < tokens.length; i += chunkSize) {
    chunks.push(tokens.slice(i, i + chunkSize).join(' '));
  }

  return chunks;
}
