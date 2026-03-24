/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: lightweightNeuralModel
 * Written: 2026-03-24T13:08:20.360Z
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
 * Novel constructs: neural
 * All constructs have translation mappings
 * Compiled targets: javascript: OK (15 IR steps) | python: OK (15 IR steps) | c: OK (15 IR steps) | x86_64: OK (15 IR steps) | arm64: OK (15 IR steps) | avr: OK (15 IR steps)
 * Translation map version: 22
 */
// lightweightNeuralModel.mjs

'use strict';

import { randomBytes } from 'crypto';

/**
 * Generates a random seed for initializing weights.
 * @returns {number[]} Array of random numbers for weight initialization.
 */
export function generateRandomSeed() {
  const seed = randomBytes(16);
  return Array.from(seed).map(byte => byte / 255.0); // Normalize to [0, 1]
}

/**
 * Initializes weights for a neural network layer.
 * @param {number} inputSize - Number of input nodes.
 * @param {number} outputSize - Number of output nodes.
 * @returns {number[][]} 2D array of weights.
 */
export function initializeWeights(inputSize, outputSize) {
  const weights = [];
  for (let i = 0; i < outputSize; i++) {
    const row = [];
    for (let j = 0; j < inputSize; j++) {
      row.push((Math.random() - 0.5) * 2); // Random values in [-1, 1]
    }
    weights.push(row);
  }
  return weights;
}

/**
 * Applies the sigmoid activation function element-wise.
 * @param {number[]} inputs - Array of inputs.
 * @returns {number[]} Array of outputs after applying sigmoid.
 */
export function sigmoid(inputs) {
  return inputs.map(x => 1 / (1 + Math.exp(-x)));
}

/**
 * Computes the dot product of a matrix and a vector.
 * @param {number[][]} matrix - 2D array representing weights.
 * @param {number[]} vector - 1D array representing inputs.
 * @returns {number[]} Resulting vector after dot product.
 */
export function dotProduct(matrix, vector) {
  return matrix.map(row => row.reduce((sum, weight, index) => sum + weight * vector[index], 0));
}

/**
 * Forward pass through a single layer.
 * @param {number[][]} weights - Layer weights.
 * @param {number[]} inputs - Input vector.
 * @returns {number[]} Output vector after applying weights and activation.
 */
export function forwardPass(weights, inputs) {
  const weightedSum = dotProduct(weights, inputs);
  return sigmoid(weightedSum);
}

/**
 * Trains a single-layer neural network using gradient descent.
 * @param {number[][]} weights - Layer weights.
 * @param {number[]} inputs - Input vector.
 * @param {number[]} targets - Target vector.
 * @param {number} learningRate - Learning rate for gradient descent.
 * @returns {number[][]} Updated weights after training.
 */
export function trainLayer(weights, inputs, targets, learningRate) {
  const outputs = forwardPass(weights, inputs);
  const errors = targets.map((target, index) => target - outputs[index]);

  return weights.map((row, i) => 
    row.map((weight, j) => 
      weight + learningRate * errors[i] * inputs[j] * outputs[i] * (1 - outputs[i])
    )
  );
}

/**
 * Utility function for calculating mean squared error (MSE).
 * @param {number[]} targets - Target vector.
 * @param {number[]} outputs - Output vector.
 * @returns {number} Mean squared error.
 */
export function meanSquaredError(targets, outputs) {
  const errors = targets.map((target, index) => Math.pow(target - outputs[index], 2));
  return errors.reduce((sum, error) => sum + error, 0) / errors.length;
}

/**
 * High-level function to train a neural network.
 * @param {number[][]} weights - Initial weights.
 * @param {number[][]} trainingData - Array of input vectors.
 * @param {number[][]} targetData - Array of target vectors.
 * @param {number} learningRate - Learning rate for training.
 * @param {number} epochs - Number of training iterations.
 * @returns {number[][]} Trained weights.
 */
export function trainNetwork(weights, trainingData, targetData, learningRate, epochs) {
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = 0; i < trainingData.length; i++) {
      weights = trainLayer(weights, trainingData[i], targetData[i], learningRate);
    }
  }
  return weights;
}

/**
 * Predicts outputs for given inputs using trained weights.
 * @param {number[][]} weights - Trained weights.
 * @param {number[]} inputs - Input vector.
 * @returns {number[]} Predicted output vector.
 */
export function predict(weights, inputs) {
  return forwardPass(weights, inputs);
}