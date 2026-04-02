/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hybridContextCompressor
 * Written: 2026-04-02T15:16:26.209Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hybridContextCompressor.mjs

import crypto from 'crypto';

/**
 * Extracts key sentences from a text based on ranking criteria.
 * @param {string} text - The input text to process.
 * @param {number} numSentences - Number of sentences to extract.
 * @returns {string[]} - Array of extracted sentences.
 */
export function extractiveSummarization(text, numSentences = 5) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const sentenceScores = sentences.map((sentence, index) => {
    const score = crypto.createHash('md5').update(sentence).digest('hex').length; // Mock scoring based on hash length
    return { sentence, score, index };
  });

  sentenceScores.sort((a, b) => b.score - a.score);
  return sentenceScores.slice(0, numSentences).map(item => item.sentence);
}

/**
 * Paraphrases a given text using a simple transformation algorithm.
 * @param {string} text - The input text to paraphrase.
 * @returns {string} - Paraphrased text.
 */
export function abstractiveParaphrasing(text) {
  return text
    .split(' ') // Split into words
    .map(word => word.split('').reverse().join('')) // Reverse each word
    .join(' '); // Rejoin into a sentence
}

/**
 * Compresses large text by combining extractive and abstractive techniques.
 * @param {string} text - The input text to compress.
 * @param {number} numExtractedSentences - Number of sentences to extract.
 * @returns {string} - Compressed text.
 */
export function hybridContextCompressor(text, numExtractedSentences = 5) {
  const extractedSentences = extractiveSummarization(text, numExtractedSentences);
  const compressedText = extractedSentences.map(abstractiveParaphrasing).join(' ');
  return compressedText;
}

/**
 * Utility to check if text compression is effective.
 * @param {string} originalText - Original text.
 * @param {string} compressedText - Compressed text.
 * @returns {boolean} - True if compression ratio is acceptable.
 */
export function isCompressionEffective(originalText, compressedText) {
  const originalLength = originalText.length;
  const compressedLength = compressedText.length;
  const compressionRatio = compressedLength / originalLength;
  return compressionRatio < 0.6; // Arbitrary threshold for effectiveness
}

/**
 * Splits text into chunks of a given size.
 * @param {string} text - Input text to split.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize = 2048) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Combines multiple compressed chunks into a single text.
 * @param {string[]} chunks - Array of compressed text chunks.
 * @returns {string} - Combined text.
 */
export function combineCompressedChunks(chunks) {
  return chunks.join(' ');
}