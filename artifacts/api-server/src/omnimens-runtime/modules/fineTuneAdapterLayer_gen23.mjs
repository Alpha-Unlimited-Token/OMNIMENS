/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: fineTuneAdapterLayer
 * Written: 2026-04-02T14:11:30.782Z
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

import { createHash } from 'crypto';

/**
 * Generates a hash for a given input using SHA-256.
 * Useful for verifying integrity or creating unique identifiers.
 * @param {string} input - The input string to hash.
 * @returns {string} - The SHA-256 hash of the input.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Calculates a reward score based on alignment between generated output and user preferences.
 * Useful for reinforcement learning or feedback loops.
 * @param {string} generatedOutput - The AI-generated output.
 * @param {string} userPreference - The user's preferred output.
 * @returns {number} - A reward score between 0 and 1.
 */
export function calculateReward(generatedOutput, userPreference) {
  const normalizedOutput = generatedOutput.trim().toLowerCase();
  const normalizedPreference = userPreference.trim().toLowerCase();

  if (normalizedOutput === normalizedPreference) {
    return 1.0; // Perfect match
  }

  const commonLength = Math.min(normalizedOutput.length, normalizedPreference.length);
  let matchCount = 0;

  for (let i = 0; i < commonLength; i++) {
    if (normalizedOutput[i] === normalizedPreference[i]) {
      matchCount++;
    }
  }

  return matchCount / commonLength; // Proportional match
}

/**
 * Compresses long context data into a shorter representation using frequency analysis.
 * Useful for processing lengthy text inputs efficiently.
 * @param {string} context - The long context string.
 * @param {number} maxLength - The desired maximum length of the compressed output.
 * @returns {string} - The compressed context string.
 */
export function compressContext(context, maxLength) {
  const words = context.split(/\s+/);
  const frequencyMap = new Map();

  for (const word of words) {
    const normalizedWord = word.toLowerCase();
    frequencyMap.set(normalizedWord, (frequencyMap.get(normalizedWord) || 0) + 1);
  }

  const sortedWords = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const compressed = sortedWords.slice(0, maxLength).join(' ');
  return compressed;
}

/**
 * Applies reinforcement learning principles to refine AI outputs.
 * Useful for aligning generated outputs with internal reasoning and user preferences.
 * @param {string} generatedOutput - The AI-generated output.
 * @param {string} userPreference - The user's preferred output.
 * @param {number} learningRate - The rate at which the system adapts (0 to 1).
 * @returns {string} - The refined output.
 */
export function refineOutput(generatedOutput, userPreference, learningRate) {
  const reward = calculateReward(generatedOutput, userPreference);
  const adjustmentFactor = reward * learningRate;

  if (adjustmentFactor > 0.8) {
    return userPreference; // Strong alignment
  }

  const refinedOutput = generatedOutput.split('').map((char, index) => {
    if (index < userPreference.length && char !== userPreference[index]) {
      return Math.random() < adjustmentFactor ? userPreference[index] : char;
    }
    return char;
  }).join('');

  return refinedOutput;
}

/**
 * Utility function to normalize text by removing extra spaces and converting to lowercase.
 * Useful for preprocessing text data.
 * @param {string} text - The input text.
 * @returns {string} - The normalized text.
 */
export function normalizeText(text) {
  return text.trim().toLowerCase();
}
