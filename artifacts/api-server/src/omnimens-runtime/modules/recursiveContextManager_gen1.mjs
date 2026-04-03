/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-03T03:48:25.018Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextManager.mjs

import crypto from 'crypto';

/**
 * Generates a unique hash for a given string input.
 * Useful for identifying and managing context segments.
 * @param {string} input - The string to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Summarizes a text by reducing it to its most important sentences.
 * Uses a simple scoring mechanism based on sentence length and keyword presence.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - The maximum number of sentences in the summary.
 * @param {string[]} keywords - Keywords to prioritize in the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, maxSentences, keywords = []) {
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s/);
  const scoredSentences = sentences.map((sentence) => {
    const keywordScore = keywords.reduce((score, keyword) => {
      return score + (sentence.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    return { sentence, score: sentence.length + keywordScore * 10 };
  });
  scoredSentences.sort((a, b) => b.score - a.score);
  return scoredSentences.slice(0, maxSentences).map((item) => item.sentence).join(' ');
}

/**
 * Recursively summarizes a large text into hierarchical levels of summaries.
 * @param {string} text - The input text to recursively summarize.
 * @param {number} maxDepth - The maximum depth of recursive summarization.
 * @param {number} maxSentencesPerLevel - The maximum number of sentences per summary level.
 * @param {string[]} keywords - Keywords to prioritize in the summaries.
 * @returns {object} - A hierarchical summary object.
 */
export function recursiveSummarize(text, maxDepth, maxSentencesPerLevel, keywords = []) {
  if (maxDepth <= 0 || text.length === 0) {
    return { summary: text, children: [] };
  }
  const summary = summarizeText(text, maxSentencesPerLevel, keywords);
  const remainingText = text.replace(summary, '').trim();
  return {
    summary,
    children: remainingText ? [recursiveSummarize(remainingText, maxDepth - 1, maxSentencesPerLevel, keywords)] : []
  };
}

/**
 * Assigns reinforcement scores to context segments based on their importance.
 * @param {object[]} segments - Array of context segments with text and metadata.
 * @param {function} scoringFunction - A custom function to calculate importance scores.
 * @returns {object[]} - The segments with updated scores.
 */
export function reinforceContext(segments, scoringFunction) {
  return segments.map((segment) => {
    const score = scoringFunction(segment.text);
    return { ...segment, score };
  });
}

/**
 * Default scoring function based on text length and keyword density.
 * @param {string} text - The text to score.
 * @param {string[]} keywords - Keywords to prioritize in scoring.
 * @returns {number} - The calculated score.
 */
export function defaultScoringFunction(text, keywords = []) {
  const keywordMatches = keywords.reduce((count, keyword) => {
    return count + (text.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);
  return text.length + keywordMatches * 10;
}

/**
 * Utility to manage and prioritize extended token windows for multi-agent systems.
 * Combines summarization, recursive processing, and reinforcement scoring.
 * @param {string} text - The input text to process.
 * @param {number} maxDepth - Maximum summarization depth.
 * @param {number} maxSentencesPerLevel - Max sentences per summary level.
 * @param {string[]} keywords - Keywords for prioritization.
 * @param {function} scoringFunction - Custom scoring function for reinforcement.
 * @returns {object} - Processed hierarchical context with scores.
 */
export function manageContext(text, maxDepth, maxSentencesPerLevel, keywords = [], scoringFunction = defaultScoringFunction) {
  const hierarchicalSummary = recursiveSummarize(text, maxDepth, maxSentencesPerLevel, keywords);
  const flattenedSegments = flattenHierarchy(hierarchicalSummary);
  return reinforceContext(flattenedSegments, (segmentText) => scoringFunction(segmentText, keywords));
}

/**
 * Flattens a hierarchical summary into an array of text segments.
 * @param {object} hierarchy - The hierarchical summary object.
 * @returns {object[]} - Flattened array of text segments.
 */
function flattenHierarchy(hierarchy) {
  const segments = [];
  function traverse(node) {
    segments.push({ text: node.summary });
    node.children.forEach(traverse);
  }
  traverse(hierarchy);
  return segments;
}