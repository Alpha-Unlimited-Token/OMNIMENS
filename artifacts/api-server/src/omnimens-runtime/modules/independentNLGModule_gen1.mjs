/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_32
 * Name: independentNLGModule
 * Purpose: Achieve independent natural language generation by extending the neural cognition engine with transformer-based text generation.
 * Description: A utility module for transformer-based text generation using scaled dot-product attention and autoregressive decoding.
 * Migrated: 2026-04-02T15:02:53.820Z
 */

// independentNLGModule.mjs

import { randomBytes } from 'crypto';

/**
 * Generate a random seed for reproducibility in transformer operations.
 * @returns {number} A random seed value.
 */
export function generateRandomSeed() {
  return parseInt(randomBytes(4).toString('hex'), 16);
}

/**
 * Softmax function for normalizing attention scores.
 * @param {number[]} logits - Array of raw scores.
 * @returns {number[]} Normalized probabilities.
 */
export function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const expScores = logits.map(x => Math.exp(x - maxLogit));
  const sumExpScores = expScores.reduce((sum, val) => sum + val, 0);
  return expScores.map(x => x / sumExpScores);
}

/**
 * Implements scaled dot-product attention.
 * @param {number[][]} queries - Query vectors.
 * @param {number[][]} keys - Key vectors.
 * @param {number[][]} values - Value vectors.
 * @param {number} scaleFactor - Scaling factor for attention scores.
 * @returns {number[][]} Attention-weighted values.
 */
export function scaledDotProductAttention(queries, keys, values, scaleFactor) {
  const attentionScores = queries.map(query =>
    keys.map(key => query.reduce((sum, q, i) => sum + q * key[i], 0))
  );

  const scaledScores = attentionScores.map(row => row.map(score => score / scaleFactor));
  const attentionWeights = scaledScores.map(softmax);

  return attentionWeights.map(weights =>
    values[0].map((_, colIndex) =>
      weights.reduce((sum, weight, rowIndex) => sum + weight * values[rowIndex][colIndex], 0)
    )
  );
}

/**
 * Autoregressive decoding for language generation.
 * @param {number[][]} inputSequence - Input token embeddings.
 * @param {number[][]} weights - Transformer weights for decoding.
 * @param {number} maxTokens - Maximum number of tokens to generate.
 * @param {function} tokenSelectionFunction - Function to select the next token.
 * @returns {number[]} Generated token sequence.
 */
export function autoregressiveDecode(inputSequence, weights, maxTokens, tokenSelectionFunction) {
  const generatedSequence = [...inputSequence];

  for (let i = 0; i < maxTokens; i++) {
    const lastToken = generatedSequence[generatedSequence.length - 1];
    const attentionOutput = scaledDotProductAttention(
      [lastToken],
      weights.keys,
      weights.values,
      Math.sqrt(weights.keys[0].length)
    );

    const nextTokenDistribution = softmax(attentionOutput[0]);
    const nextToken = tokenSelectionFunction(nextTokenDistribution);

    generatedSequence.push(nextToken);
  }

  return generatedSequence;
}

/**
 * Select the next token based on probabilities using weighted random sampling.
 * @param {number[]} probabilities - Array of probabilities for each token.
 * @returns {number} Index of the selected token.
 */
export function weightedRandomSelection(probabilities) {
  const cumulative = probabilities.reduce((acc, prob) => {
    acc.push((acc[acc.length - 1] || 0) + prob);
    return acc;
  }, []);

  const randomValue = Math.random();
  return cumulative.findIndex(cumProb => randomValue < cumProb);
}

/**
 * Generate a sequence of tokens using a transformer-based model.
 * @param {number[][]} inputSequence - Input token embeddings.
 * @param {number[][]} weights - Transformer weights for decoding.
 * @param {number} maxTokens - Maximum number of tokens to generate.
 * @returns {number[]} Generated token sequence.
 */
export function generateSequence(inputSequence, weights, maxTokens) {
  return autoregressiveDecode(inputSequence, weights, maxTokens, weightedRandomSelection);
}
