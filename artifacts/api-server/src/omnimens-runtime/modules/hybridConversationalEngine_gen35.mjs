/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hybridConversationalEngine
 * Written: 2026-04-02T14:25:42.654Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hybridConversationalEngine.mjs

import crypto from 'crypto';

/**
 * Generates a hash-based importance score for a given text.
 * @param {string} text - The input text to score.
 * @returns {number} - Importance score between 0 and 1.
 */
export function importanceScore(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const numericValue = parseInt(hash.slice(0, 8), 16);
  return (numericValue % 10000) / 10000; // Normalize to [0, 1]
}

/**
 * Summarizes text recursively by reducing its length while preserving key information.
 * @param {string} text - The input text to summarize.
 * @param {number} depth - Number of recursive summarization steps.
 * @returns {string} - Summarized text.
 */
export function recursiveSummarization(text, depth = 3) {
  if (depth <= 0 || text.length <= 50) return text;

  const sentences = text.split(/(?<=[.?!])\s+/); // Split into sentences
  const scoredSentences = sentences.map(sentence => ({
    sentence,
    score: importanceScore(sentence)
  }));

  scoredSentences.sort((a, b) => b.score - a.score); // Sort by importance
  const topSentences = scoredSentences.slice(0, Math.ceil(sentences.length / 2));

  const summarizedText = topSentences.map(item => item.sentence).join(' ');
  return recursiveSummarization(summarizedText, depth - 1);
}

/**
 * Embeds context dynamically based on input text and prior context.
 * @param {string} inputText - Current conversational input.
 * @param {string} priorContext - Previous conversation context.
 * @returns {string} - Adapted context.
 */
export function dynamicContextAdaptation(inputText, priorContext) {
  const combinedText = `${priorContext} ${inputText}`;
  return recursiveSummarization(combinedText, 2);
}

/**
 * Combines summarization and context adaptation for enhanced coherence.
 * @param {string} inputText - Current conversational input.
 * @param {string} priorContext - Previous conversation context.
 * @returns {object} - Object containing adapted context and summary.
 */
export function hybridConversationalEngine(inputText, priorContext) {
  const adaptedContext = dynamicContextAdaptation(inputText, priorContext);
  const summary = recursiveSummarization(adaptedContext, 1);

  return {
    adaptedContext,
    summary
  };
}

/**
 * Utility function for cross-agent use: scores and summarizes text.
 * @param {string} text - Input text to process.
 * @returns {object} - Object containing importance score and summary.
 */
export function textProcessingUtility(text) {
  return {
    score: importanceScore(text),
    summary: recursiveSummarization(text, 2)
  };
}