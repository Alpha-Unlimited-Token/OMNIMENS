/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextPreservationRL
 * Written: 2026-04-02T15:16:10.713Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextPreservationRL.mjs

import { randomUUID } from 'crypto';

/**
 * Scores context fragments based on their utility for downstream reasoning.
 * @param {Array<string>} fragments - Array of context fragments.
 * @param {Function} scoringFunction - A user-provided function to score each fragment.
 * @returns {Array<{ id, fragment, score}>}
 */
export function scoreContextFragments(fragments, scoringFunction) {
  if (!Array.isArray(fragments) || typeof scoringFunction !== 'function') {
    throw new TypeError('Invalid Array.from(/* args */{}): fragments must be an array and scoringFunction must be a function.');
  }

  return fragments.map(fragment => {
    const score = scoringFunction(fragment);
    if (typeof score !== 'number' || isNaN(score)) {
      throw new Error('Scoring function must return a valid number.');
    }
    return { id: randomUUID(), fragment, score };
  });
}

/**
 * Selects the top N context fragments based on their scores.
 * @param {Array<{ id, fragment, score}>} scoredFragments - Array of scored context fragments.
 * @param {number} topN - Number of top fragments to select.
 * @returns {Array<{ id, fragment, score}>}
 */
export function selectTopFragments(scoredFragments, topN) {
  if (!Array.isArray(scoredFragments) || typeof topN !== 'number' || topN <= 0) {
    throw new TypeError('Invalid Array.from(/* args */{}): scoredFragments must be an array and topN must be a positive number.');
  }

  return scoredFragments
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * Trains a policy to optimize context preservation using reinforcement learning.
 * @param {Array<string>} fragments - Array of context fragments.
 * @param {Function} rewardFunction - A user-provided function to calculate rewards for selected fragments.
 * @param {number} iterations - Number of training iterations.
 * @param {number} topN - Number of top fragments to select during training.
 * @returns {Function} - A trained policy function to score fragments.
 */
export function trainPolicy(fragments, rewardFunction, iterations, topN) {
  if (!Array.isArray(fragments) || typeof rewardFunction !== 'function' || typeof iterations !== 'number' || iterations <= 0 || typeof topN !== 'number' || topN <= 0) {
    throw new TypeError('Invalid Array.from(/* args */{}): ensure fragments is an array, rewardFunction is a function, and iterations/topN are positive numbers.');
  }

  let policyWeights = Array(fragments[0].length).fill(1); // Initialize weights for a simple linear policy.

  for (let i = 0; i < iterations; i++) {
    const scoredFragments = scoreContextFragments(fragments, fragment => {
      return fragment.split('').reduce((sum, char, idx) => sum + (policyWeights[idx] || 0) * char.charCodeAt(0), 0);
    });

    const topFragments = selectTopFragments(scoredFragments, topN);
    const reward = rewardFunction(topFragments);

    if (typeof reward !== 'number' || isNaN(reward)) {
      throw new Error('Reward function must return a valid number.');
    }

    // Update policy weights using a simple gradient ascent approach.
    for (let j = 0; j < policyWeights.length; j++) {
      policyWeights[j] += reward * 0.01; // Learning rate is 0.01.
    }
  }

  // Return the trained policy function.
  return fragment => {
    return fragment.split('').reduce((sum, char, idx) => sum + (policyWeights[idx] || 0) * char.charCodeAt(0), 0);
  };
}

/**
 * Utility function to normalize scores to a [0, 1] range.
 * @param {Array<{ id, fragment, score}>} scoredFragments - Array of scored context fragments.
 * @returns {Array<{ id, fragment, normalizedScore}>}
 */
export function normalizeScores(scoredFragments) {
  if (!Array.isArray(scoredFragments)) {
    throw new TypeError('Invalid argument: scoredFragments must be an array.');
  }

  const scores = scoredFragments.map(f => f.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  return scoredFragments.map(({ id, fragment, score }) => {
    const normalizedScore = (score - minScore) / (maxScore - minScore || 1);
    return { id, fragment, normalizedScore };
  });
}

/**
 * Utility function to shuffle an array randomly.
 * @param {Array<any>} array - Array to shuffle.
 * @returns {Array<any>} - Shuffled array.
 */
export function shuffleArray(array) {
  if (!Array.isArray(array)) {
    throw new TypeError('Invalid argument: array must be an array.');
  }

  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
