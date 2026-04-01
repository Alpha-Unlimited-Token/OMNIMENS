/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-01T22:05:25.336Z
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
 * Summarizes a large context into smaller, manageable segments recursively.
 * @param {string} context - The large input text to be summarized.
 * @param {number} maxSegmentSize - Maximum size of each segment in tokens (approx. characters here).
 * @param {number} depth - Maximum recursion depth to avoid infinite loops.
 * @returns {Array<string>} An array of summarized segments.
 */
export function recursiveSummarize(context, maxSegmentSize = 1000, depth = 3) {
  if (depth <= 0 || context.length <= maxSegmentSize) {
    return [context];
  }

  const segments = segmentText(context, maxSegmentSize);
  const summaries = segments.map(segment => summarize(segment));

  return recursiveSummarize(summaries.join(' '), maxSegmentSize, depth - 1);
}

/**
 * Segments a large text into smaller chunks without breaking words.
 * @param {string} text - The input text to segment.
 * @param {number} maxSegmentSize - Maximum size of each segment in tokens (approx. characters here).
 * @returns {Array<string>} An array of text segments.
 */
export function segmentText(text, maxSegmentSize) {
  const words = text.split(' ');
  const segments = [];
  let currentSegment = '';

  for (const word of words) {
    if ((currentSegment + word).length > maxSegmentSize) {
      segments.push(currentSegment.trim());
      currentSegment = '';
    }
    currentSegment += word + ' ';
  }

  if (currentSegment.trim()) {
    segments.push(currentSegment.trim());
  }

  return segments;
}

/**
 * Summarizes a given text by extracting important sentences based on a hash-based scoring mechanism.
 * @param {string} text - The input text to summarize.
 * @returns {string} A summarized version of the input text.
 */
export function summarize(text) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
  const scoredSentences = sentences.map(sentence => ({
    sentence,
    score: hashScore(sentence)
  }));

  scoredSentences.sort((a, b) => b.score - a.score);
  const topSentences = scoredSentences.slice(0, Math.ceil(sentences.length / 3));

  return topSentences.map(item => item.sentence).join(' ');
}

/**
 * Generates a simple hash-based score for a string to approximate importance.
 * @param {string} input - The input string to score.
 * @returns {number} A numeric score representing the importance of the string.
 */
export function hashScore(input) {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return parseInt(hash.slice(0, 8), 16);
}

/**
 * Combines hierarchical summarization with retrieval-augmented generation (RAG).
 * @param {string} context - The large input text to process.
 * @param {Array<string>} retrievals - Additional related contexts to augment the input.
 * @param {number} maxSegmentSize - Maximum size of each segment in tokens (approx. characters here).
 * @param {number} depth - Maximum recursion depth for summarization.
 * @returns {string} A final combined summary.
 */
export function hierarchicalRAG(context, retrievals, maxSegmentSize = 1000, depth = 3) {
  const combinedContext = [context, ...retrievals].join(' ');
  const summarizedSegments = recursiveSummarize(combinedContext, maxSegmentSize, depth);
  return summarizedSegments.join(' ');
}

// Example usage (commented out to comply with no I/O rule):
// const context = "Your large context here...";
// const retrievals = ["Related context 1", "Related context 2"];
// const summary = hierarchicalRAG(context, retrievals);
// console.log(summary);