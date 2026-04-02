/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptiveCompressionModel
 * Written: 2026-04-02T14:53:44.667Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptiveCompressionModel.mjs

import crypto from 'crypto';

/**
 * Generates a hash-based unique ID for summarization tasks.
 * Useful for tracking tasks across agents.
 * @param {string} input - The input string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTaskId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Tokenizes a given text into words, preserving punctuation.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - An array of tokens.
 */
export function tokenizeText(text) {
  return text.match(/\b\w+\b|[.,!?;:]/g) || [];
}

/**
 * Groups tokens into hierarchical chunks for processing.
 * @param {string[]} tokens - An array of tokens to group.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {string[][]} - A 2D array of token chunks.
 */
export function chunkTokens(tokens, chunkSize) {
  const chunks = [];
  for (let i = 0; i < tokens.length; i += chunkSize) {
    chunks.push(tokens.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Summarizes a single chunk of tokens using a basic extractive algorithm.
 * @param {string[]} chunk - A chunk of tokens to summarize.
 * @returns {string} - A summarized string for the chunk.
 */
export function summarizeChunk(chunk) {
  const frequencyMap = chunk.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  const sortedTokens = Object.entries(frequencyMap)
    .sort(([, a], [, b]) => b - a)
    .map(([token]) => token);

  return sortedTokens.slice(0, Math.ceil(chunk.length / 4)).join(' ');
}

/**
 * Performs hierarchical summarization on a full text input.
 * @param {string} text - The input text to summarize.
 * @param {number} chunkSize - The size of each chunk for hierarchical processing.
 * @returns {string} - A summarized version of the input text.
 */
export function hierarchicalSummarization(text, chunkSize = 50) {
  const tokens = tokenizeText(text);
  const chunks = chunkTokens(tokens, chunkSize);
  const summaries = chunks.map(summarizeChunk);

  // Combine summaries and summarize again for hierarchical compression
  const combinedSummary = summaries.join(' ');
  const finalTokens = tokenizeText(combinedSummary);
  const finalChunks = chunkTokens(finalTokens, chunkSize);
  const finalSummaries = finalChunks.map(summarizeChunk);

  return finalSummaries.join(' ');
}

/**
 * Utility to calculate compression ratio of summarization.
 * @param {string} original - The original text.
 * @param {string} summarized - The summarized text.
 * @returns {number} - The compression ratio (0 to 1).
 */
export function calculateCompressionRatio(original, summarized) {
  const originalLength = tokenizeText(original).length;
  const summarizedLength = tokenizeText(summarized).length;
  return summarizedLength / originalLength;
}

/**
 * Adaptive summarization pipeline for multi-agent systems.
 * @param {string} text - The input text to process.
 * @param {number} chunkSize - The chunk size for hierarchical summarization.
 * @returns {object} - An object containing the task ID, summary, and compression ratio.
 */
export function adaptiveSummarizationPipeline(text, chunkSize = 50) {
  const taskId = generateTaskId(text);
  const summary = hierarchicalSummarization(text, chunkSize);
  const compressionRatio = calculateCompressionRatio(text, summary);

  return {
    taskId,
    summary,
    compressionRatio
  };
}