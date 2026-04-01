/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizer
 * Written: 2026-04-01T22:18:44.158Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextSummarizer.mjs

import crypto from 'crypto';

/**
 * Summarizes a long text context into a hierarchical summary.
 * @param {string} context - The full conversational context to summarize.
 * @param {number} maxDepth - Maximum depth of the hierarchical summary.
 * @param {number} maxLength - Maximum length of each summary segment.
 * @returns {object} - A hierarchical summary object.
 */
export function summarizeContext(context, maxDepth = 3, maxLength = 200) {
  if (typeof context !== 'string' || context.trim() === '') {
    throw new Error('Context must be a non-empty string.');
  }

  const sentences = splitIntoSentences(context);
  const summaryTree = recursiveSummarize(sentences, maxDepth, maxLength);
  return summaryTree;
}

/**
 * Splits a text into sentences using basic punctuation rules.
 * @param {string} text - The text to split.
 * @returns {string[]} - An array of sentences.
 */
export function splitIntoSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
}

/**
 * Recursively summarizes sentences into a hierarchical structure.
 * @param {string[]} sentences - Array of sentences to summarize.
 * @param {number} depth - Current depth of recursion.
 * @param {number} maxLength - Maximum length of each summary segment.
 * @returns {object} - A hierarchical summary node.
 */
function recursiveSummarize(sentences, depth, maxLength) {
  if (depth === 0 || sentences.length === 0) {
    return { summary: joinAndTrim(sentences, maxLength), children: [] };
  }

  const midpoint = Math.ceil(sentences.length / 2);
  const left = sentences.slice(0, midpoint);
  const right = sentences.slice(midpoint);

  return {
    summary: joinAndTrim(sentences, maxLength),
    children: [
      recursiveSummarize(left, depth - 1, maxLength),
      recursiveSummarize(right, depth - 1, maxLength)
    ]
  };
}

/**
 * Joins sentences and trims the result to a maximum length.
 * @param {string[]} sentences - Array of sentences to join.
 * @param {number} maxLength - Maximum allowed length of the result.
 * @returns {string} - A trimmed summary string.
 */
function joinAndTrim(sentences, maxLength) {
  const joined = sentences.join(' ');
  return joined.length > maxLength ? joined.slice(0, maxLength) + '...' : joined;
}

/**
 * Extracts key entities from a text using a simple word frequency analysis.
 * @param {string} text - The text to analyze.
 * @param {number} topN - Number of top entities to extract.
 * @returns {string[]} - An array of key entities.
 */
export function extractKeyEntities(text, topN = 5) {
  const words = text
    .toLowerCase()
    .match(/\b[a-z]{3}\b/g) || [];

  const frequencyMap = words.reduce((freq, word) => {
    freq[word] = (freq[word] || 0) + 1;
    return freq;
  }, {});

  return Object.entries(frequencyMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Generates a unique hash for a given text, useful for caching summaries.
 * @param {string} text - The text to hash.
 * @returns {string} - A unique hash string.
 */
export function generateTextHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Identifies unresolved questions in a text based on question marks.
 * @param {string} text - The text to analyze.
 * @returns {string[]} - An array of unresolved questions.
 */
export function findUnresolvedQuestions(text) {
  return text
    .split('?')
    .map(question => question.trim())
    .filter(question => question.length > 0 && !question.endsWith('.'));
}
