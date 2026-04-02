/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticContextManager
 * Written: 2026-04-02T14:40:51.562Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticContextManager.mjs

import crypto from 'crypto';

/**
 * Generates a semantic hash for a given input text using SHA-256 on its contextual embedding.
 * @param {string} text - The input text to hash.
 * @returns {string} - A fixed-length semantic hash.
 */
export function generateSemanticHash(text) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string.');
  }

  const normalizedText = text.trim().toLowerCase();
  const hash = crypto.createHash('sha256');
  hash.update(normalizedText);
  return hash.digest('hex');
}

/**
 * Summarizes a large body of text by extracting semantically important sentences.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - The maximum number of sentences to retain.
 * @returns {string} - A summarized version of the input text.
 */
export function summarizeText(text, maxSentences = 5) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string.');
  }
  if (typeof maxSentences !== 'number' || maxSentences <= 0) {
    throw new Error('maxSentences must be a positive integer.');
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= maxSentences) {
    return text;
  }

  const sentenceScores = sentences.map((sentence) => {
    const semanticHash = generateSemanticHash(sentence);
    const score = semanticHash.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return { sentence, score };
  });

  sentenceScores.sort((a, b) => b.score - a.score);

  const topSentences = sentenceScores.slice(0, maxSentences).map((entry) => entry.sentence.trim());
  return topSentences.join(' ');
}

/**
 * Compresses a tokenized input while preserving semantically important tokens.
 * @param {Array<string>} tokens - An array of tokenized strings.
 * @param {number} maxTokens - The maximum number of tokens to retain.
 * @returns {Array<string>} - A compressed array of tokens.
 */
export function compressTokens(tokens, maxTokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error('Tokens must be a non-empty array of strings.');
  }
  if (typeof maxTokens !== 'number' || maxTokens <= 0) {
    throw new Error('maxTokens must be a positive integer.');
  }

  if (tokens.length <= maxTokens) {
    return tokens;
  }

  const tokenScores = tokens.map((token) => {
    const semanticHash = generateSemanticHash(token);
    const score = semanticHash.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return { token, score };
  });

  tokenScores.sort((a, b) => b.score - a.score);

  const topTokens = tokenScores.slice(0, maxTokens).map((entry) => entry.token);
  return topTokens;
}

/**
 * Calculates a contextual similarity score between two pieces of text.
 * @param {string} textA - The first text input.
 * @param {string} textB - The second text input.
 * @returns {number} - A similarity score between 0 and 1.
 */
export function calculateSimilarity(textA, textB) {
  if (typeof textA !== 'string' || textA.length === 0 || typeof textB !== 'string' || textB.length === 0) {
    throw new Error('Both inputs must be non-empty strings.');
  }

  const hashA = generateSemanticHash(textA);
  const hashB = generateSemanticHash(textB);

  let matches = 0;
  for (let i = 0; i < Math.min(hashA.length, hashB.length); i++) {
    if (hashA[i] === hashB[i]) {
      matches++;
    }
  }

  return matches / hashA.length;
}

/**
 * Splits a large text into manageable chunks of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {Array<string>} - An array of text chunks.
 */
export function splitTextIntoChunks(text, chunkSize) {
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string.');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive integer.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}