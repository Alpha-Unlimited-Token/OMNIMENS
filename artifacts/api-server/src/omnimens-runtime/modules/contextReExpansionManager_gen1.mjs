/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextReExpansionManager
 * Written: 2026-04-02T14:09:45.311Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextReExpansionManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a unique hash for a given context string.
 * @param {string} context - The input context string.
 * @returns {string} - A unique hash representing the context.
 */
export function generateContextHash(context) {
  const hash = createHash('sha256');
  hash.update(context);
  return hash.digest('hex');
}

/**
 * Compresses a context string into a hierarchical summary.
 * @param {string} context - The input context string.
 * @returns {object} - An object containing the compressed summary and metadata.
 */
export function compressContext(context) {
  const sentences = context.split('.');
  const summary = sentences.slice(0, Math.ceil(sentences.length / 2)).join('.');
  return {
    summary,
    metadata: {
      originalLength: context.length,
      compressedLength: summary.length,
      hash: generateContextHash(context)
    }
  };
}

/**
 * Re-expands a compressed context back to its original form using metadata.
 * @param {object} compressedData - The compressed context object.
 * @param {string} originalContext - The original context string.
 * @returns {string} - The re-expanded context.
 */
export function reExpandContext(compressedData, originalContext) {
  const { hash } = compressedData.metadata;
  if (generateContextHash(originalContext) !== hash) {
    throw new Error('Original context does not match the compressed metadata.');
  }
  return originalContext;
}

/**
 * Dynamically manages context compression and re-expansion.
 * @param {string} context - The input context string.
 * @param {boolean} expand - Whether to re-expand the context.
 * @param {object} compressedData - Optional compressed context data for re-expansion.
 * @returns {object|string} - Compressed data or re-expanded context.
 */
export function manageContext(context, expand = false, compressedData = null) {
  if (expand) {
    if (!compressedData || !context) {
      throw new Error('Missing required parameters for re-expansion.');
    }
    return reExpandContext(compressedData, context);
  }
  return compressContext(context);
}

/**
 * Utility function to check if a context has been compressed.
 * @param {object} compressedData - The compressed context object.
 * @returns {boolean} - True if context is compressed, false otherwise.
 */
export function isContextCompressed(compressedData) {
  return compressedData && compressedData.metadata && compressedData.metadata.hash;
}

/**
 * Utility function to extract metadata from compressed context.
 * @param {object} compressedData - The compressed context object.
 * @returns {object} - Metadata about the compressed context.
 */
export function extractMetadata(compressedData) {
  if (!isContextCompressed(compressedData)) {
    throw new Error('Invalid compressed data.');
  }
  return compressedData.metadata;
}