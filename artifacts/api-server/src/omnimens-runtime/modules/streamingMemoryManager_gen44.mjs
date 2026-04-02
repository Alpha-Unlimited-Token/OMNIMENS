/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: streamingMemoryManager
 * Written: 2026-04-02T14:13:27.043Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// streamingMemoryManager.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given chunk using SHA-256 for locality-sensitive hashing.
 * @param {string} chunk - The data chunk to hash.
 * @returns {string} - The hash of the chunk.
 */
export function generateChunkHash(chunk) {
  const hash = createHash('sha256');
  hash.update(chunk);
  return hash.digest('hex');
}

/**
 * Compresses a given chunk using a simple reversible algorithm (e.g., base64 encoding).
 * @param {string} chunk - The data chunk to compress.
 * @returns {string} - The compressed chunk.
 */
export function compressChunk(chunk) {
  return Buffer.from(chunk).toString('base64');
}

/**
 * Decompresses a previously compressed chunk.
 * @param {string} compressedChunk - The compressed chunk to decompress.
 * @returns {string} - The original chunk.
 */
export function decompressChunk(compressedChunk) {
  return Buffer.from(compressedChunk, 'base64').toString('utf-8');
}

/**
 * Manages streaming memory by storing chunks in a hierarchical structure.
 * @class
 */
export class StreamingMemoryManager {
  constructor() {
    this.memoryHierarchy = new Map(); // Top-level memory hierarchy
  }

  /**
   * Stores a chunk in the memory hierarchy.
   * @param {string} chunk - The data chunk to store.
   */
  storeChunk(chunk) {
    const hash = generateChunkHash(chunk);
    const compressedChunk = compressChunk(chunk);
    this.memoryHierarchy.set(hash, compressedChunk);
  }

  /**
   * Retrieves a chunk from the memory hierarchy.
   * @param {string} hash - The hash of the chunk to retrieve.
   * @returns {string|null} - The original chunk or null if not found.
   */
  retrieveChunk(hash) {
    const compressedChunk = this.memoryHierarchy.get(hash);
    return compressedChunk ? decompressChunk(compressedChunk) : null;
  }

  /**
   * Deletes a chunk from the memory hierarchy.
   * @param {string} hash - The hash of the chunk to delete.
   */
  deleteChunk(hash) {
    this.memoryHierarchy.delete(hash);
  }

  /**
   * Lists all stored chunk hashes.
   * @returns {string[]} - An array of all stored chunk hashes.
   */
  listChunkHashes() {
    return Array.from(this.memoryHierarchy.keys());
  }
}

/**
 * Utility function to split large context into manageable chunks.
 * @param {string} context - The large context to split.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {string[]} - An array of context chunks.
 */
export function splitContextIntoChunks(context, chunkSize) {
  const chunks = [];
  for (let i = 0; i < context.length; i += chunkSize) {
    chunks.push(context.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Utility function to reconstruct context from chunks.
 * @param {string[]} chunks - The array of context chunks.
 * @returns {string} - The reconstructed context.
 */
export function reconstructContextFromChunks(chunks) {
  return chunks.join('');
}