/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: sparseLanguageModel
 * Written: 2026-04-02T15:18:12.453Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * TRANSLATION STATUS:
 * Novel constructs: attention
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (27 IR steps) | python: OK (27 IR steps) | c: OK (27 IR steps) | x86_64: OK (27 IR steps) | arm64: OK (27 IR steps) | avr: OK (27 IR steps)
 * Translation map version: 22
 */
// sparseLanguageModel.mjs

import crypto from 'crypto';

/**
 * Generates a sparse attention mask for transformers to optimize memory usage.
 * @param {number} seqLength - The sequence length of the input.
 * @param {number} sparsityFactor - The fraction of attention connections to retain (0 < sparsityFactor <= 1).
 * @returns {Array<Array<number>>} Sparse attention mask.
 */
export function generateSparseAttentionMask(seqLength, sparsityFactor) {
  if (sparsityFactor <= 0 || sparsityFactor > 1) {
    throw new Error("sparsityFactor must be between 0 and 1 (exclusive)");
  }

  const mask = Array.from({ length: seqLength }, () => Array(seqLength).fill(0));
  const connectionsPerRow = Math.max(1, Math.floor(seqLength * sparsityFactor));

  for (let i = 0; i < seqLength; i++) {
    const indices = Array.from({ length: seqLength }, (_, idx) => idx);
    shuffleArray(indices);
    for (let j = 0; j < connectionsPerRow; j++) {
      mask[i][indices[j]] = 1;
    }
  }

  return mask;
}

/**
 * Applies sparse attention to a sequence of vectors.
 * @param {Array<Array<number>>} input - Input sequence of vectors.
 * @param {Array<Array<number>>} mask - Sparse attention mask.
 * @returns {Array<Array<number>>} Transformed sequence after applying sparse attention.
 */
export function applySparseAttention(input, mask) {
  const seqLength = input.length;
  const vectorSize = input[0].length;

  if (mask.length !== seqLength || mask[0].length !== seqLength) {
    throw new Error("Mask dimensions must match input sequence length.");
  }

  const output = Array.from({ length: seqLength }, () => Array(vectorSize).fill(0));

  for (let i = 0; i < seqLength; i++) {
    for (let j = 0; j < seqLength; j++) {
      if (mask[i][j] === 1) {
        for (let k = 0; k < vectorSize; k++) {
          output[i][k] += input[j][k];
        }
      }
    }
  }

  return output;
}

/**
 * Normalizes a sequence of vectors using softmax.
 * @param {Array<number>} input - Input vector.
 * @returns {Array<number>} Softmax-normalized vector.
 */
export function softmax(input) {
  const maxVal = Math.max(...input);
  const expValues = input.map((x) => Math.exp(x - maxVal));
  const sumExp = expValues.reduce((a, b) => a + b, 0);
  return expValues.map((x) => x / sumExp);
}

/**
 * Utility function to shuffle an array in place (Fisher-Yates algorithm).
 * @param {Array} array - The array to shuffle.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Encodes input text into a sequence of numerical vectors using a simple tokenization scheme.
 * @param {string} text - Input text.
 * @param {Object} vocab - Vocabulary mapping tokens to indices.
 * @returns {Array<number>} Encoded sequence of token indices.
 */
export function tokenize(text, vocab) {
  const tokens = text.split(/\s+/);
  return tokens.map((token) => vocab[token] || vocab["<UNK>"]);
}

/**
 * Decodes a sequence of token indices back into text.
 * @param {Array<number>} indices - Sequence of token indices.
 * @param {Object} reverseVocab - Reverse vocabulary mapping indices to tokens.
 * @returns {string} Decoded text.
 */
export function detokenize(indices, reverseVocab) {
  return indices.map((index) => reverseVocab[index] || "<UNK>").join(" ");
}

/**
 * Creates a simple vocabulary for tokenization.
 * @param {Array<string>} corpus - Array of text samples.
 * @returns {Object} Vocabulary mapping tokens to indices.
 */
export function buildVocabulary(corpus) {
  const vocabSet = new Set();
  corpus.forEach((text) => {
    text.split(/\s+/).forEach((token) => vocabSet.add(token));
  });

  const vocab = {};
  let index = 0;
  vocabSet.forEach((token) => {
    vocab[token] = index++;
  });
  vocab["<UNK>"] = index; // Add unknown token

  return vocab;
}
