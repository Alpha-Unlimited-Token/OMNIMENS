/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: adaptivePromptRewriter
 * Written: 2026-04-02T15:16:10.706Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// adaptivePromptRewriter.mjs

import crypto from 'crypto';

/**
 * Generates a hash-based unique identifier for a given prompt.
 * Useful for caching or tracking rewritten prompts.
 * @param {string} prompt - The input prompt string.
 * @returns {string} - A unique hash string.
 */
export function generatePromptHash(prompt) {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

/**
 * Optimizes a prompt by applying Bayesian-inspired scoring to select the best structure.
 * @param {string[]} promptVariants - Array of prompt variations.
 * @param {function} scoringFunction - A scoring function that evaluates the quality of a prompt.
 * @returns {string} - The highest-scoring prompt variant.
 */
export function optimizePrompt(promptVariants, scoringFunction) {
  if (!Array.isArray(promptVariants) || promptVariants.length === 0) {
    throw new Error('promptVariants must be a non-empty array of strings.');
  }

  if (typeof scoringFunction !== 'function') {
    throw new Error('scoringFunction must be a valid function.');
  }

  let bestPrompt = promptVariants[0];
  let bestScore = -Infinity;

  for (const variant of promptVariants) {
    const score = scoringFunction(variant);
    if (score > bestScore) {
      bestScore = score;
      bestPrompt = variant;
    }
  }

  return bestPrompt;
}

/**
 * Embeds contextual information into a prompt using a simple token replacement strategy.
 * @param {string} prompt - The base prompt template with placeholders (e.g., "Hello, {name}!").
 * @param {Object} context - Key-value pairs for replacing placeholders in the prompt.
 * @returns {string} - The contextually enriched prompt.
 */
export function embedContext(prompt, context) {
  if (typeof prompt !== 'string') {
    throw new Error('Prompt must be a string.');
  }

  if (typeof context !== 'object' || context === null) {
    throw new Error('Context must be a non-null object.');
  }

  return prompt.replace(/\{(\w+)\}/g, (match, key) => {
    return key in context ? context[key] : match;
  });
}

/**
 * Combines prompt optimization and context embedding into a single utility.
 * @param {string[]} promptVariants - Array of prompt variations.
 * @param {Object} context - Key-value pairs for replacing placeholders in the prompt.
 * @param {function} scoringFunction - A scoring function that evaluates the quality of a prompt.
 * @returns {string} - The final optimized and contextually enriched prompt.
 */
export function rewritePrompt(promptVariants, context, scoringFunction) {
  const optimizedPrompt = optimizePrompt(promptVariants, scoringFunction);
  return embedContext(optimizedPrompt, context);
}

/**
 * Example scoring function based on prompt length and keyword density.
 * @param {string} prompt - The prompt to score.
 * @returns {number} - A numerical score for the prompt.
 */
export function exampleScoringFunction(prompt) {
  const keywords = ['optimize', 'AI', 'intelligence'];
  const keywordCount = keywords.reduce((count, keyword) => {
    return count + (prompt.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);

  const lengthPenalty = Math.abs(prompt.length - 100); // Ideal length is 100 characters.

  return keywordCount * 10 - lengthPenalty;
}

// Example usage:
// const prompts = ["Optimize AI systems.", "Enhance intelligence with AI.", "AI optimization techniques."];
// const context = { system: "OMNIMENS" };
// const bestPrompt = rewritePrompt(prompts, context, exampleScoringFunction);
// console.log(bestPrompt);