/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: onlineLearningAdapter
 * Written: 2026-04-02T13:57:42.690Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// onlineLearningAdapter.mjs
import { randomUUID } from 'crypto';

/**
 * Generates a random floating-point number between min and max.
 * @param {number} min - Minimum value (inclusive).
 * @param {number} max - Maximum value (exclusive).
 * @returns {number} Random float between min and max.
 */
export function generateRandomFloat(min, max) {
  if (min >= max) throw new Error("min must be less than max");
  return Math.random() * (max - min) + min;
}

/**
 * Initializes a reservoir for reservoir computing.
 * @param {number} size - Number of reservoir nodes.
 * @returns {Array<number>} Initialized reservoir state.
 */
export function initializeReservoir(size) {
  if (size <= 0 || !Number.isInteger(size)) throw new Error("Size must be a positive integer");
  return Array.from({ length: size }, () => generateRandomFloat(-1, 1));
}

/**
 * Updates reservoir state using input and a simple activation function.
 * @param {Array<number>} reservoir - Current reservoir state.
 * @param {Array<number>} input - Input vector.
 * @param {number} alpha - Scaling factor for input.
 * @returns {Array<number>} Updated reservoir state.
 */
export function updateReservoir(reservoir, input, alpha = 0.1) {
  if (!Array.isArray(reservoir) || !Array.isArray(input)) throw new Error("Reservoir and input must be arrays");
  if (reservoir.length !== input.length) throw new Error("Reservoir and input must have the same length");

  return reservoir.map((state, index) => {
    const newState = state + alpha * input[index];
    return Math.tanh(newState); // Activation function
  });
}

/**
 * Applies stochastic gradient descent (SGD) to update weights.
 * @param {Array<number>} weights - Current weights.
 * @param {Array<number>} gradients - Gradient vector.
 * @param {number} learningRate - Learning rate for SGD.
 * @returns {Array<number>} Updated weights.
 */
export function stochasticGradientDescent(weights, gradients, learningRate = 0.01) {
  if (!Array.isArray(weights) || !Array.isArray(gradients)) throw new Error("Weights and gradients must be arrays");
  if (weights.length !== gradients.length) throw new Error("Weights and gradients must have the same length");

  return weights.map((weight, index) => weight - learningRate * gradients[index]);
}

/**
 * Generates a unique identifier for tracking model updates.
 * @returns {string} UUID string.
 */
export function generateUpdateID() {
  return randomUUID();
}

/**
 * Computes the mean squared error (MSE) between predictions and targets.
 * @param {Array<number>} predictions - Predicted values.
 * @param {Array<number>} targets - Target values.
 * @returns {number} Mean squared error.
 */
export function computeMSE(predictions, targets) {
  if (!Array.isArray(predictions) || !Array.isArray(targets)) throw new Error("Predictions and targets must be arrays");
  if (predictions.length !== targets.length) throw new Error("Predictions and targets must have the same length");

  const squaredErrors = predictions.map((pred, index) => {
    const error = pred - targets[index];
    return error * error;
  });

  return squaredErrors.reduce((sum, val) => sum + val, 0) / predictions.length;
}

/**
 * Normalizes an array of numbers to a specified range [newMin, newMax].
 * @param {Array<number>} array - Array of numbers to normalize.
 * @param {number} newMin - New minimum value.
 * @param {number} newMax - New maximum value.
 * @returns {Array<number>} Normalized array.
 */
export function normalizeArray(array, newMin = 0, newMax = 1) {
  if (!Array.isArray(array)) throw new Error("Input must be an array");
  const min = Math.min(...array);
  const max = Math.max(...array);
  if (min === max) throw new Error("Array elements must not be all the same");

  return array.map(value => ((value - min) / (max - min)) * (newMax - newMin) + newMin);
}
