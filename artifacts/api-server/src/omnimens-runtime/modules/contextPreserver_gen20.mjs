/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextPreserver
 * Written: 2026-04-02T14:11:36.356Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextPreserver.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash for a given text to uniquely identify it.
 * @param {string} text - The input text to hash.
 * @returns {string} - The SHA-256 hash of the text.
 */
export function generateHash(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}

/**
 * Scores the importance of a text segment based on its length and keyword density.
 * @param {string} text - The input text segment.
 * @param {string[]} keywords - Array of keywords to prioritize.
 * @returns {number} - Importance score of the text.
 */
export function scoreImportance(text, keywords) {
  const keywordMatches = keywords.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    return count + (text.match(regex)?.length || 0);
  }, 0);
  return keywordMatches / Math.sqrt(text.length + 1);
}

/**
 * Summarizes a large text by recursively breaking it into smaller sections.
 * @param {string} text - The input text to summarize.
 * @param {string[]} keywords - Keywords to focus on during summarization.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - Hierarchical summary of the text.
 */
export function hierarchicalSummarize(text, keywords, maxLength) {
  if (text.length <= maxLength) return text;

  const sections = text.split(/(?<=\.)\s+/); // Split by sentences.
  const scoredSections = sections.map(section => ({
    text: section,
    score: scoreImportance(section, keywords)
  }));

  scoredSections.sort((a, b) => b.score - a.score);

  const topSections = scoredSections.slice(0, Math.ceil(sections.length / 2));
  const combinedText = topSections.map(s => s.text).join(' ');

  return hierarchicalSummarize(combinedText, keywords, maxLength);
}

/**
 * Checks similarity between two texts using cosine similarity of word embeddings.
 * @param {string} textA - First text input.
 * @param {string} textB - Second text input.
 * @returns {number} - Similarity score between 0 and 1.
 */
export function checkSimilarity(textA, textB) {
  const tokenize = text => text.toLowerCase().split(/\W+/);
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  const allTokens = Array.from(new Set([...tokensA, ...tokensB]));

  const vectorize = tokens => allTokens.map(token => tokens.filter(t => t === token).length);
  const vectorA = vectorize(tokensA);
  const vectorB = vectorize(tokensB);

  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  return dotProduct / (magnitudeA * magnitudeB || 1);
}

/**
 * Refines a summary by adjusting based on similarity to the original text.
 * @param {string} originalText - The original input text.
 * @param {string} summary - The generated summary.
 * @param {number} threshold - Similarity threshold for refinement.
 * @returns {string} - Refined summary.
 */
export function refineSummary(originalText, summary, threshold) {
  const similarity = checkSimilarity(originalText, summary);
  if (similarity >= threshold) return summary;

  const additionalContent = originalText.split(/(?<=\.)\s+/).filter(sentence =>
    checkSimilarity(sentence, summary) < threshold
  ).join(' ');

  return `${summary} ${additionalContent}`.slice(0, originalText.length);
}

/**
 * Main function to preserve context in ultra-large token windows.
 * @param {string} text - The input text.
 * @param {string[]} keywords - Keywords to focus on.
 * @param {number} maxLength - Maximum length for the summary.
 * @param {number} similarityThreshold - Similarity threshold for refinement.
 * @returns {string} - Final refined hierarchical summary.
 */
export function preserveContext(text, keywords, maxLength, similarityThreshold) {
  const initialSummary = hierarchicalSummarize(text, keywords, maxLength);
  return refineSummary(text, initialSummary, similarityThreshold);
}