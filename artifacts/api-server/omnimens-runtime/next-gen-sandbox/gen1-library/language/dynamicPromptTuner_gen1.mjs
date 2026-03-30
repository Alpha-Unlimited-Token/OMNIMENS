/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: dynamicPromptTuner
 * Purpose: Dynamically adjusts GPT-4o prompts based on user feedback, learned patterns, and task-specific optimizations.
 * Description: Dynamically adjusts and optimizes GPT-4o prompts based on user feedback and historical performance metrics.
 * Migrated: 2026-03-25T22:49:34.117Z
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
 * @param {Array<{feedback: number, adjustment: string}>} feedbackData - Array of feedback objects.
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
 * @param {Array<{promptHash: string, score: number}>} performanceData - Array of performance data.
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
 * @param {Array<{feedback: number, adjustment: string}>} feedbackData - Array of feedback objects.
 * @param {Array<{promptHash: string, score: number}>} performanceData - Array of performance data.
 * @returns {string} - The next optimal prompt.
 */
export function suggestNextPrompt(currentPrompt, feedbackData, performanceData) {
  const tunedPrompt = tunePrompt(currentPrompt, feedbackData);
  const bestPromptHash = evaluatePerformance(performanceData);

  return `Suggested Prompt: ${tunedPrompt} | Best Historical Hash: ${bestPromptHash}`;
}

/**
 * Validates feedback data structure to ensure proper format.
 * @param {Array<{feedback: number, adjustment: string}>} feedbackData - Array of feedback objects.
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
 * @param {Array<{promptHash: string, score: number}>} performanceData - Array of performance data.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validatePerformanceData(performanceData) {
  return performanceData.every(
    ({ promptHash, score }) =>
      typeof promptHash === 'string' && typeof score === 'number'
  );
}