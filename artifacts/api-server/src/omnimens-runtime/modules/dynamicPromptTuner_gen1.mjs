/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicPromptTuner
 * Written: 2026-03-24T23:11:57.945Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicPromptTuner.mjs
import { createHash } from 'crypto';

/**
 * Generates a hash for a given input string to track prompt versions and feedback.
 * @param {string} input - The input string to hash.
 * @returns {string} - The SHA256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Adjusts a prompt dynamically based on user feedback and historical performance.
 * @param {string} prompt - The original prompt.
 * @param {Array<{feedback, adjustment}>} feedbackData - Array of feedback objects.
 * @returns {string} - The adjusted prompt.
 */
export function tunePrompt(prompt, feedbackData) {
  let adjustedPrompt = prompt;

  feedbackData.forEach(({ feedback, adjustment }) => {
    if (feedback > 0) {
      adjustedPrompt += ` ${adjustment}`;
    }
  });

  return adjustedPrompt;
}

/**
 * Evaluates the effectiveness of a prompt based on historical performance metrics.
 * @param {Array<{promptHash, score}>} performanceData - Array of performance data.
 * @returns {string} - The hash of the best-performing prompt.
 */
export function evaluatePerformance(performanceData) {
  const bestPrompt = performanceData.reduce((best, current) => {
    return current.score > best.score ? current : best;
  }, { promptHash: '', score: -Infinity });

  return bestPrompt.promptHash;
}

/**
 * Combines user feedback and historical performance to suggest the next optimal prompt.
 * @param {string} currentPrompt - The current prompt.
 * @param {Array<{feedback, adjustment}>} feedbackData - Array of feedback objects.
 * @param {Array<{promptHash, score}>} performanceData - Array of performance data.
 * @returns {string} - The next optimal prompt.
 */
export function suggestNextPrompt(currentPrompt, feedbackData, performanceData) {
  const tunedPrompt = tunePrompt(currentPrompt, feedbackData);
  const bestPromptHash = evaluatePerformance(performanceData);

  return `Suggested Prompt: ${tunedPrompt} | Best Historical Hash: ${bestPromptHash}`;
}

/**
 * Validates feedback data structure to ensure proper format.
 * @param {Array<{feedback, adjustment}>} feedbackData - Array of feedback objects.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateFeedbackData(feedbackData) {
  return feedbackData.every(
    ({ feedback, adjustment }) =>
      typeof feedback === 'number' && typeof adjustment === 'string'
  );
}

/**
 * Validates performance data structure to ensure proper format.
 * @param {Array<{promptHash, score}>} performanceData - Array of performance data.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validatePerformanceData(performanceData) {
  return performanceData.every(
    ({ promptHash, score }) =>
      typeof promptHash === 'string' && typeof score === 'number'
  );
}