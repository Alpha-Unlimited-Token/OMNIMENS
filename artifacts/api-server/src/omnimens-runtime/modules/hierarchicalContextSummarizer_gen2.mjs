/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextSummarizer
 * Written: 2026-04-03T09:44:29.640Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based unique identifier for a given input string.
 * Useful for embedding and referencing summarized contexts.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Summarizes a given text input using a hierarchical approach.
 * Breaks long text into chunks, summarizes each, and combines results.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - The maximum size of each chunk (default: 500 chars).
 * @returns {string} - A condensed summary of the input text.
 */
export function hierarchicalSummarize(text, chunkSize = 500) {
  if (typeof text !== 'string' || text.length === 0) return '';

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const summaries = chunks.map(chunk => simpleSummarizer(chunk));
  return simpleSummarizer(summaries.join(' '));
}

/**
 * A simple summarizer function that reduces text length by extracting key sentences.
 * Note: This is a placeholder for a more advanced transformer-based summarizer.
 * @param {string} text - The input text to summarize.
 * @returns {string} - A basic summary of the input text.
 */
export function simpleSummarizer(text) {
  const sentences = text.split('.').map(s => s.trim()).filter(Boolean);
  const keySentences = sentences.slice(0, Math.max(1, Math.floor(sentences.length / 3)));
  return keySentences.join('. ') + (keySentences.length < sentences.length ? '...' : '');
}

/**
 * Embeds summarized context into a reusable format.
 * Generates a hash for the summary and returns both the hash and summary.
 * @param {string} context - The input context to embed.
 * @returns {{ hash, summary}} - An object containing the hash and summary.
 */
export function embedContext(context) {
  const summary = hierarchicalSummarize(context);
  const hash = generateHash(summary);
  return { hash, summary };
}

/**
 * Merges multiple summarized contexts into a single summary.
 * Useful for combining knowledge from multiple agents or sources.
 * @param {Array<{ hash, summary}>} contexts - Array of summarized contexts.
 * @returns {string} - A unified summary of all contexts.
 */
export function mergeSummarizedContexts(contexts) {
  if (!Array.isArray(contexts) || contexts.length === 0) return '';

  const combinedText = contexts.map(ctx => ctx.summary).join(' ');
  return hierarchicalSummarize(combinedText);
}

/**
 * Validates the integrity of a context using its hash.
 * Ensures that a given summary matches its original hash.
 * @param {string} summary - The summarized text.
 * @param {string} hash - The hash to validate against.
 * @returns {boolean} - True if the hash matches the summary, false otherwise.
 */
export function validateContextIntegrity(summary, hash) {
  return generateHash(summary) === hash;
}
