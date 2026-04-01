/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveSummarizationManager
 * Written: 2026-04-01T22:04:52.186Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveSummarizationManager.mjs

import crypto from 'crypto';

/**
 * Recursively summarizes large contexts into hierarchical layers.
 * @param {string[]} data - Array of strings representing the context.
 * @param {number} maxLength - Maximum length of each summary.
 * @returns {object} - Hierarchical tree of summarized data.
 */
export function recursiveSummarizationTree(data, maxLength = 500) {
  if (data.length === 0) return { summary: "", children: [] };

  // Helper: Generate a hash-based importance score for each string
  const importanceScore = (str) => {
    const hash = crypto.createHash('sha256').update(str).digest('hex');
    return parseInt(hash.slice(0, 8), 16) % 100;
  };

  // Sort data by importance
  const sortedData = data.map((item) => ({ text: item, score: importanceScore(item) }))
                         .sort((a, b) => b.score - a.score);

  // Extract top items for summarization
  const topItems = sortedData.slice(0, Math.min(data.length, maxLength / 50)).map((item) => item.text);

  // Create a summary from the top items
  const summary = topItems.join(' ').slice(0, maxLength);

  // Split remaining data into chunks for recursion
  const chunks = chunkArray(sortedData.slice(topItems.length).map((item) => item.text), Math.ceil(data.length / 2));

  // Recursively summarize each chunk
  const children = chunks.map((chunk) => recursiveSummarizationTree(chunk, maxLength));

  return { summary, children };
}

/**
 * Splits an array into smaller chunks.
 * @param {string[]} array - Array to split.
 * @param {number} chunkSize - Size of each chunk.
 * @returns {string[][]} - Array of chunks.
 */
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Flattens a hierarchical summary tree into a single-level summary.
 * @param {object} tree - Hierarchical summary tree.
 * @returns {string} - Flattened summary.
 */
export function flattenSummaryTree(tree) {
  if (!tree || !tree.children || tree.children.length === 0) return tree.summary;
  return tree.summary + ' ' + tree.children.map(flattenSummaryTree).join(' ');
}

/**
 * Extracts key phrases from a summary using basic frequency analysis.
 * @param {string} text - Summary text.
 * @returns {string[]} - Array of key phrases.
 */
export function extractKeyPhrases(text) {
  const words = text.toLowerCase().match(/\b[a-z]{3}\b/g) || [];
  const frequency = words.reduce((freq, word) => {
    freq[word] = (freq[word] || 0) + 1;
    return freq;
  }, {});

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Combines multiple summaries into a single cohesive summary.
 * @param {string[]} summaries - Array of summaries.
 * @param {number} maxLength - Maximum length of the combined summary.
 * @returns {string} - Combined summary.
 */
export function aggregateSummaries(summaries, maxLength = 500) {
  const combined = summaries.join(' ').slice(0, maxLength);
  return combined;
}