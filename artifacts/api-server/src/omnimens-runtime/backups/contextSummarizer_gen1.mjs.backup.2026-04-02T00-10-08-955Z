/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextSummarizer
 * Written: 2026-03-23T07:11:12.158Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * @module contextSummarizer
 * @description Summarizes and compresses long conversations into a compact representation using a hybrid extractive-abstractive approach.
 */

/**
 * Summarizes a long conversation into key points.
 * @param {string[]} conversation - Array of conversation strings.
 * @param {number} maxSummaryLength - Maximum number of key points to extract.
 * @returns {string[]} Array of summarized key points.
 */
export function summarizeConversation(conversation, maxSummaryLength) {
  if (!Array.isArray(conversation) || typeof maxSummaryLength !== 'number' || maxSummaryLength <= 0) {
    throw new Error("Invalid input: conversation must be an array of strings and maxSummaryLength must be a positive number.");
  }

  // Step 1: Tokenize conversation into sentences.
  const sentences = conversation.flatMap(text => text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/));

  // Step 2: Extractive summarization using frequency analysis.
  const wordFrequency = {};
  sentences.forEach(sentence => {
    sentence.split(/\W+/).forEach(word => {
      const normalizedWord = word.toLowerCase();
      if (normalizedWord) {
        wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
      }
    });
  });

  const sentenceScores = sentences.map(sentence => {
    const words = sentence.split(/\W+/);
    const score = words.reduce((sum, word) => sum + (wordFrequency[word.toLowerCase()] || 0), 0);
    return { sentence, score };
  });

  // Sort sentences by score in descending order.
  sentenceScores.sort((a, b) => b.score - a.score);

  // Select top sentences up to maxSummaryLength.
  const extractiveSummary = sentenceScores.slice(0, maxSummaryLength).map(item => item.sentence);

  // Step 3: Abstractive compression (simple embedding-like abstraction).
  const abstractedSummary = extractiveSummary.map(sentence => compressSentence(sentence));

  return abstractedSummary;
}

/**
 * Compresses a sentence by reducing redundancy and normalizing structure.
 * @param {string} sentence - A sentence to compress.
 * @returns {string} Compressed sentence.
 */
function compressSentence(sentence) {
  // Normalize whitespace and remove redundant words (basic example).
  return sentence
    .replace(/\s+/g, ' ')
    .replace(/\b(very|really|actually|basically|just)\b/gi, '')
    .trim();
}

/**
 * Encodes summarized key points into a numeric embedding representation.
 * This is a simplified embedding generator using character codes.
 * @param {string[]} summary - Array of summarized key points.
 * @returns {number[][]} Array of numeric embeddings for each key point.
 */
export function encodeSummary(summary) {
  if (!Array.isArray(summary)) {
    throw new Error("Invalid input: summary must be an array of strings.");
  }

  return summary.map(point => {
    const embedding = new Array(128).fill(0);
    for (let i = 0; i < point.length; i++) {
      const charCode = point.charCodeAt(i);
      embedding[charCode % 128] += 1; // Simple hash into 128 dimensions.
    }
    return embedding;
  });
}

/**
 * Summarizes and encodes a conversation into compact embeddings.
 * @param {string[]} conversation - Array of conversation strings.
 * @param {number} maxSummaryLength - Maximum number of key points to extract.
 * @returns {number[][]} Array of numeric embeddings representing the summarized conversation.
 */
export function summarizeAndEncode(conversation, maxSummaryLength) {
  const summary = summarizeConversation(conversation, maxSummaryLength);
  return encodeSummary(summary);
}