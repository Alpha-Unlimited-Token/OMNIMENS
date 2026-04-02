/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticHashSummarizer
 * Written: 2026-04-02T13:31:31.229Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticHashSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generates a semantic hash for a given text input.
 * @param {string} text - The input text to hash.
 * @returns {string} - A compact semantic hash of the input text.
 */
export function generateSemanticHash(text) {
  const normalizedText = text.trim().toLowerCase().replace(/\s+/g, ' ');
  const hash = createHash('sha256');
  hash.update(normalizedText);
  return hash.digest('hex').slice(0, 16); // Return a compact hash (16 characters)
}

/**
 * Extracts the most semantically relevant sentences from a given text.
 * @param {string} text - The input text to summarize.
 * @param {number} sentenceCount - Number of sentences to extract.
 * @returns {string} - A condensed summary of the input text.
 */
export function extractiveSummarize(text, sentenceCount = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || []; // Split text into sentences
  const rankedSentences = sentences.map((sentence, index) => ({
    sentence,
    score: calculateSentenceScore(sentence, index)
  }));

  rankedSentences.sort((a, b) => b.score - a.score); // Sort by relevance score
  const topSentences = rankedSentences.slice(0, sentenceCount).map(item => item.sentence);

  return topSentences.join(' ');
}

/**
 * Calculates a simple relevance score for a sentence based on length and position.
 * @param {string} sentence - The sentence to score.
 * @param {number} index - The position of the sentence in the text.
 * @returns {number} - The computed relevance score.
 */
function calculateSentenceScore(sentence, index) {
  const lengthScore = Math.min(sentence.length / 100, 1); // Longer sentences get higher scores
  const positionScore = 1 / (index + 1); // Earlier sentences get higher scores
  return lengthScore + positionScore;
}

/**
 * Recursively condenses text by combining semantic hashing and summarization.
 * @param {string} text - The input text to condense.
 * @param {number} iterations - Number of recursive condensing steps.
 * @returns {Object} - An object containing the final condensed text and its semantic hash.
 */
export function recursiveCondense(text, iterations = 2) {
  let condensedText = text;

  for (let i = 0; i < iterations; i++) {
    condensedText = extractiveSummarize(condensedText);
  }

  const semanticHash = generateSemanticHash(condensedText);
  return { condensedText, semanticHash };
}

/**
 * Utility function to process multiple texts and return their condensed representations.
 * @param {Array<string>} texts - Array of input texts.
 * @param {number} iterations - Number of recursive condensing steps.
 * @returns {Array<Object>} - Array of objects containing condensed texts and their semantic hashes.
 */
export function processBatchTexts(texts, iterations = 2) {
  return texts.map(text => recursiveCondense(text, iterations));
}