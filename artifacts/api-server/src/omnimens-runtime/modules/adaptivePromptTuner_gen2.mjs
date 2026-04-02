/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptivePromptTuner
 * Written: 2026-04-02T22:07:59.670Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptivePromptTuner.mjs

import { createHash } from 'crypto';

/**
 * Hashes a string to create a unique identifier for a prompt.
 * Useful for tracking and comparing prompt adjustments.
 * @param {string} input - The string to hash.
 * @returns {string} - A unique hash of the input string.
 */
export function hashPrompt(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates a weighted score based on feedback for a prompt.
 * @param {Array<number>} feedbackScores - Array of feedback scores (e.g., [1, -1, 1]).
 * @param {number} decayFactor - A decay factor to reduce the weight of older feedback (0 < decayFactor <= 1).
 * @returns {number} - The weighted score.
 */
export function calculateWeightedScore(feedbackScores, decayFactor = 0.9) {
  if (!Array.isArray(feedbackScores) || feedbackScores.length === 0) return 0;
  let weightedScore = 0;
  let weight = 1;

  for (let i = feedbackScores.length - 1; i >= 0; i--) {
    weightedScore += feedbackScores[i] * weight;
    weight *= decayFactor;
  }

  return weightedScore;
}

/**
 * Dynamically adjusts a prompt based on feedback and context.
 * @param {string} basePrompt - The initial prompt template.
 * @param {Object} context - Key-value pairs representing conversational context.
 * @param {Array<number>} feedbackScores - Array of feedback scores for prior prompt iterations.
 * @returns {string} - The adjusted prompt.
 */
export function adjustPrompt(basePrompt, context, feedbackScores) {
  const weightedScore = calculateWeightedScore(feedbackScores);
  const contextString = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `${basePrompt} (Context: ${contextString}, Score: ${weightedScore.toFixed(2)})`;
}

/**
 * Simulates reinforcement learning by iteratively refining a prompt.
 * @param {string} basePrompt - The initial prompt template.
 * @param {Object} context - Key-value pairs representing conversational context.
 * @param {Array<Array<number>>} feedbackIterations - Array of feedback score arrays for each iteration.
 * @returns {Array<string>} - Array of adjusted prompts for each iteration.
 */
export function simulatePromptTuning(basePrompt, context, feedbackIterations) {
  return feedbackIterations.map((feedbackScores, iteration) => {
    const iterationContext = { ...context, iteration };
    return adjustPrompt(basePrompt, iterationContext, feedbackScores);
  });
}

/**
 * Utility to normalize feedback scores to a standard range (-1 to 1).
 * @param {Array<number>} scores - Array of raw feedback scores.
 * @returns {Array<number>} - Normalized feedback scores.
 */
export function normalizeFeedback(scores) {
  const maxAbsValue = Math.max(...scores.map(Math.abs), 1);
  return scores.map(score => score / maxAbsValue);
}

/**
 * Example usage of the module's functionality.
 * Uncomment to test in a Node.js environment.
 */
// const basePrompt = "Generate a summary of the following:";
// const context = { topic: "multimodal reasoning", year: 2025 };
// const feedbackIterations = [
//   [1, -1, 1],
//   [1, 1, 1],
//   [-1, -1, 1]
// ];
// console.log(simulatePromptTuning(basePrompt, context, feedbackIterations));