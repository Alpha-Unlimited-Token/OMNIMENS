/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedComputationManager
 * Written: 2026-04-02T14:14:09.531Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { createHash } from 'crypto';

/**
 * Utility function to generate a unique hash for task identifiers.
 * Useful for distributed systems to track tasks reliably.
 */
export function generateTaskHash(taskData) {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(taskData));
  return hash.digest('hex');
}

/**
 * Splits a large task into smaller chunks based on provided chunk size.
 * Useful for breaking down computations into manageable pieces.
 */
export function splitTask(taskData, chunkSize) {
  if (!Array.isArray(taskData)) {
    throw new Error('Task data must be an array to split into chunks.');
  }
  if (chunkSize <= 0) {
    throw new Error('Chunk size must be a positive integer.');
  }
  const chunks = [];
  for (let i = 0; i < taskData.length; i += chunkSize) {
    chunks.push(taskData.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Creates a checkpoint object to track task progress.
 * Useful for persisting state in long-running computations.
 */
export function createCheckpoint(taskId, totalChunks) {
  return {
    taskId,
    totalChunks,
    completedChunks: 0,
    progress: 0
  };
}

/**
 * Updates the checkpoint progress based on completed chunks.
 * Useful for tracking and resuming distributed computations.
 */
export function updateCheckpoint(checkpoint, completedChunks) {
  if (completedChunks < 0 || completedChunks > checkpoint.totalChunks) {
    throw new Error('Completed chunks must be within valid range.');
  }
  checkpoint.completedChunks = completedChunks;
  checkpoint.progress = (completedChunks / checkpoint.totalChunks) * 100;
  return checkpoint;
}

/**
 * Merges results from completed chunks into a single output.
 * Useful for combining distributed computation results.
 */
export function mergeResults(chunkResults) {
  if (!Array.isArray(chunkResults)) {
    throw new Error('Chunk results must be an array to merge.');
  }
  return chunkResults.flat();
}

/**
 * Validates task data integrity using a hash.
 * Useful for ensuring data consistency across distributed systems.
 */
export function validateTaskIntegrity(taskData, expectedHash) {
  const actualHash = generateTaskHash(taskData);
  return actualHash === expectedHash;
}