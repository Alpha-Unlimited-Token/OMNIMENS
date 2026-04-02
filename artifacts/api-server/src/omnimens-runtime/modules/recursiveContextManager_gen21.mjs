/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-02T15:14:42.487Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextManager.mjs

import crypto from 'crypto';

/**
 * Utility function to score importance of a memory chunk based on its length and keyword density.
 * @param {string} chunk - The memory chunk to score.
 * @param {Array<string>} keywords - Array of keywords to prioritize.
 * @returns {number} - Importance score.
 */
export function scoreImportance(chunk, keywords) {
  const lengthScore = chunk.length / 1000; // Normalize length (longer chunks are more important).
  const keywordDensity = keywords.reduce((count, keyword) => count + (chunk.match(new RegExp(keyword, 'gi')) || []).length, 0);
  return lengthScore + keywordDensity;
}

/**
 * Summarizes a memory chunk into a shorter, meaningful representation.
 * @param {string} chunk - The memory chunk to summarize.
 * @returns {string} - Summarized version of the chunk.
 */
export function summarizeChunk(chunk) {
  const sentences = chunk.split('.');
  const summary = sentences.slice(0, Math.min(3, sentences.length)).join('.');
  return summary.trim() + (sentences.length > 3 ? '...' : '');
}

/**
 * Recursively summarizes and reconstructs ultra-long contexts.
 * @param {Array<string>} chunks - Array of memory chunks.
 * @param {Array<string>} keywords - Keywords to prioritize during summarization.
 * @returns {string} - Fully reconstructed context summary.
 */
export function recursiveContextManager(chunks, keywords) {
  if (chunks.length === 1) return chunks[0];

  const scoredChunks = chunks.map(chunk => ({
    chunk,
    score: scoreImportance(chunk, keywords)
  })).sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, Math.ceil(chunks.length / 2)).map(item => summarizeChunk(item.chunk));

  return recursiveContextManager(topChunks, keywords);
}

/**
 * Generates a unique hash for a memory chunk to prevent duplication.
 * @param {string} chunk - The memory chunk to hash.
 * @returns {string} - Unique hash.
 */
export function generateMemoryHash(chunk) {
  return crypto.createHash('sha256').update(chunk).digest('hex');
}

/**
 * Combines multiple context summaries into a coherent narrative.
 * @param {Array<string>} summaries - Array of summarized contexts.
 * @returns {string} - Combined narrative.
 */
export function stitchSummaries(summaries) {
  return summaries.join(' ').trim();
}

/**
 * Handles edge cases for empty or invalid inputs.
 * @param {Array<string>} chunks - Array of memory chunks.
 * @returns {Array<string>} - Validated and sanitized chunks.
 */
export function sanitizeChunks(chunks) {
  return chunks.filter(chunk => typeof chunk === 'string' && chunk.trim().length > 0);
}

/**
 * Main entry point for managing ultra-long contexts.
 * @param {Array<string>} chunks - Array of memory chunks.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {string} - Final reconstructed context summary.
 */
export function manageContext(chunks, keywords = []) {
  const sanitizedChunks = sanitizeChunks(chunks);
  if (sanitizedChunks.length === 0) return '';

  const recursiveSummary = recursiveContextManager(sanitizedChunks, keywords);
  return stitchSummaries([recursiveSummary]);
}