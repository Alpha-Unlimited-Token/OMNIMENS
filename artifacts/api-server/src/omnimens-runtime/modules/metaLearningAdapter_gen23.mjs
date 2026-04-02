/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: metaLearningAdapter
 * Written: 2026-04-02T13:31:24.314Z
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

import crypto from 'crypto';

/**
 * Utility function to normalize text data by trimming, converting to lowercase, and removing extra spaces.
 * @param {string} input - The text input to normalize.
 * @returns {string} Normalized text.
 */
export function normalizeText(input) {
  if (typeof input !== 'string') throw new TypeError('Input must be a string');
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Utility function to calculate the similarity score between two strings using cosine similarity.
 * @param {string} textA - First text input.
 * @param {string} textB - Second text input.
 * @returns {number} Similarity score between 0 and 1.
 */
export function calculateSimilarity(textA, textB) {
  const tokenize = (str) => {
    const tokens = str.split(/\W+/);
    const frequencies = {};
    for (const token of tokens) {
      frequencies[token] = (frequencies[token] || 0) + 1;
    }
    return frequencies;
  };

  const dotProduct = (vecA, vecB) => {
    let sum = 0;
    for (const key in vecA) {
      if (vecB[key]) sum += vecA[key] * vecB[key];
    }
    return sum;
  };

  const magnitude = (vec) => {
    return Math.sqrt(Object.values(vec).reduce((sum, val) => sum + val ** 2, 0));
  };

  const freqA = tokenize(normalizeText(textA));
  const freqB = tokenize(normalizeText(textB));

  const numerator = dotProduct(freqA, freqB);
  const denominator = magnitude(freqA) * magnitude(freqB);

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Utility function to adapt external LLM responses based on OMNIMENS' internal goals.
 * Uses reinforcement-like feedback to iteratively refine responses.
 * @param {string} input - Original response from external LLM.
 * @param {Array<string>} goals - Array of internal goals for alignment.
 * @returns {string} Adapted response.
 */
export function adaptResponse(input, goals) {
  if (typeof input !== 'string' || !Array.isArray(goals)) {
    throw new TypeError('Invalid input or goals format');
  }

  const normalizedInput = normalizeText(input);
  let bestMatch = normalizedInput;
  let highestScore = 0;

  for (const goal of goals) {
    const score = calculateSimilarity(normalizedInput, normalizeText(goal));
    if (score > highestScore) {
      highestScore = score;
      bestMatch = goal;
    }
  }

  return highestScore > 0.5 ? bestMatch : normalizedInput;
}

/**
 * Utility function to generate a unique identifier for tracking responses and feedback loops.
 * @returns {string} A unique identifier string.
 */
export function generateUniqueId() {
  return crypto.randomUUID();
}

/**
 * Utility function to log feedback for iterative refinement.
 * @param {string} responseId - Unique identifier for the response.
 * @param {string} originalResponse - Original response from external LLM.
 * @param {string} adaptedResponse - Adapted response after processing.
 * @param {Array<string>} goals - Internal goals used for adaptation.
 * @returns {object} Feedback log object.
 */
export function logFeedback(responseId, originalResponse, adaptedResponse, goals) {
  return {
    responseId,
    timestamp: new Date().toISOString(),
    originalResponse,
    adaptedResponse,
    goals
  };
}

/**
 * Utility function to apply iterative refinement on a batch of responses.
 * @param {Array<{response, goals}>} batch - Array of objects containing responses and goals.
 * @returns {Array<object>} Array of feedback logs for each response.
 */
export function processBatchResponses(batch) {
  if (!Array.isArray(batch)) throw new TypeError('Batch must be an array');

  return batch.map(({ response, goals }) => {
    const responseId = generateUniqueId();
    const adaptedResponse = adaptResponse(response, goals);
    return logFeedback(responseId, response, adaptedResponse, goals);
  });
}