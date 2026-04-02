/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: metaLearningPromptOptimizer
 * Written: 2026-04-02T14:13:01.285Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// metaLearningPromptOptimizer.mjs

import { createHash } from 'crypto';

/**
 * Evaluates the quality of a given output based on coherence, relevance, and user satisfaction.
 * @param {string} output - The output text to evaluate.
 * @param {Object} feedback - Real-time feedback with keys: coherence, relevance, satisfaction (0-1 scale).
 * @returns {number} - A reward score (0-1).
 */
export function evaluateOutput(output, feedback) {
  if (!feedback || typeof feedback !== 'object') {
    throw new Error("Feedback must be an object with coherence, relevance, and satisfaction properties.");
  }

  const { coherence, relevance, satisfaction } = feedback;

  if (
    typeof coherence !== 'number' || coherence < 0 || coherence > 1 ||
    typeof relevance !== 'number' || relevance < 0 || relevance > 1 ||
    typeof satisfaction !== 'number' || satisfaction < 0 || satisfaction > 1
  ) {
    throw new Error("Feedback values must be numbers between 0 and 1.");
  }

  // Reward is a weighted average of the three metrics
  const reward = (0.4 * coherence) + (0.4 * relevance) + (0.2 * satisfaction);
  return reward;
}

/**
 * Optimizes a prompt dynamically based on feedback and past performance.
 * @param {string} prompt - The initial prompt to optimize.
 * @param {Object[]} history - Array of past interactions [{ prompt, output, feedback }].
 * @returns {string} - The optimized prompt.
 */
export function optimizePrompt(prompt, history) {
  if (!Array.isArray(history)) {
    throw new Error("History must be an array of past interactions.");
  }

  // Analyze history to find patterns in successful prompts
  const successfulPrompts = history
    .filter(entry => evaluateOutput(entry.output, entry.feedback) > 0.7)
    .map(entry => entry.prompt);

  // Generate a hash of the current prompt to avoid duplication
  const promptHash = createHash('sha256').update(prompt).digest('hex');

  // Avoid reusing prompts that are too similar
  if (successfulPrompts.some(p => createHash('sha256').update(p).digest('hex') === promptHash)) {
    return `${prompt} [Refined]`;
  }

  // Add context or refinement based on past successful prompts
  const refinedPrompt = successfulPrompts.length > 0
    ? `${prompt} | Context: ${successfulPrompts.join(' | ')}`
    : prompt;

  return refinedPrompt;
}

/**
 * Utility to normalize feedback data for consistency.
 * @param {Object} feedback - Raw feedback object.
 * @returns {Object} - Normalized feedback with values clamped between 0 and 1.
 */
export function normalizeFeedback(feedback) {
  const clamp = (value) => Math.max(0, Math.min(1, value));

  return {
    coherence: clamp(feedback.coherence ?? 0),
    relevance: clamp(feedback.relevance ?? 0),
    satisfaction: clamp(feedback.satisfaction ?? 0)
  };
}

/**
 * Calculates the average reward score from a history of interactions.
 * @param {Object[]} history - Array of past interactions [{ prompt, output, feedback }].
 * @returns {number} - The average reward score (0-1).
 */
export function calculateAverageReward(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return 0;
  }

  const totalReward = history.reduce((sum, entry) => {
    return sum + evaluateOutput(entry.output, entry.feedback);
  }, 0);

  return totalReward / history.length;
}

/**
 * Suggests improvements to a prompt based on low-performing history entries.
 * @param {Object[]} history - Array of past interactions [{ prompt, output, feedback }].
 * @returns {string[]} - List of suggested improvements or refinements.
 */
export function suggestImprovements(history) {
  const suggestions = [];

  history.forEach(entry => {
    const reward = evaluateOutput(entry.output, entry.feedback);
    if (reward < 0.5) {
      suggestions.push(`Consider rephrasing: "${entry.prompt}" to improve clarity or focus.`);
    }
  });

  return suggestions;
}
