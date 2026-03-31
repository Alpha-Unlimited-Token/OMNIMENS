/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_2
 * Name: localNeuralNetworkTrainer
 * Purpose: Enables training and inference of lightweight neural networks locally in JavaScript to address fine-tuning needs.
 * Description: Enables local training and inference of lightweight neural networks using pure JavaScript matrix operations and gradient descent.
 * Migrated: 2026-03-25T22:49:34.140Z
 */

// localNeuralNetworkTrainer.mjs

import { randomBytes } from 'crypto';

/**
 * Generate a random matrix with specified dimensions.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Randomly initialized matrix.
 */
export function generateRandomMatrix(rows, cols) {
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push((randomBytes(4).readUInt32BE() / 0xFFFFFFFF) * 2 - 1); // Random values between -1 and 1
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Perform element-wise addition of two matrices.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after addition.
 */
export function addMatrices(matrixA, matrixB) {
  if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
    throw new Error('Matrix dimensions must match for addition.');
  }
  return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
}

/**
 * Perform matrix multiplication.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions must align for multiplication.');
  }
  const result = [];
  for (let i = 0; i < matrixA.length; i++) {
    const row = [];
    for (let j = 0; j < matrixB[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < matrixA[0].length; k++) {
        sum += matrixA[i][k] * matrixB[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

/**
 * Apply an activation function element-wise to a matrix.
 * @param {number[][]} matrix - Input matrix.
 * @param {Function} activationFunction - Activation function (e.g., sigmoid, relu).
 * @returns {number[][]} - Matrix after applying the activation function.
 */
export function applyActivation(matrix, activationFunction) {
  return matrix.map(row => row.map(val => activationFunction(val)));
}

/**
 * Sigmoid activation function.
 * @param {number} x - Input value.
 * @returns {number} - Sigmoid output.
 */
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Train a simple neural network using gradient descent.
 * @param {number[][]} inputs - Input data matrix.
 * @param {number[][]} targets - Target output matrix.
 * @param {number} learningRate - Learning rate for gradient descent.
 * @param {number} epochs - Number of iterations.
 * @returns {Object} - Trained weights and biases.
 */
export function trainNeuralNetwork(inputs, targets, learningRate, epochs) {
  const inputSize = inputs[0].length;
  const outputSize = targets[0].length;

  let weights = generateRandomMatrix(inputSize, outputSize);
  let biases = generateRandomMatrix(1, outputSize);

  for (let epoch = 0; epoch < epochs; epoch++) {
    // Forward pass
    const weightedInputs = addMatrices(multiplyMatrices(inputs, weights), biases);
    const activations = applyActivation(weightedInputs, sigmoid);

    // Compute error
    const errors = addMatrices(targets, activations.map(row => row.map(val => -val)));

    // Backpropagation (gradient descent)
    const gradients = applyActivation(weightedInputs, x => x * (1 - x));
    const weightDeltas = multiplyMatrices(inputs.map(row => row.map(val => val * learningRate)), gradients);
    weights = addMatrices(weights, weightDeltas);
    biases = addMatrices(biases, gradients.map(row => row.map(val => val * learningRate)));
  }

  return { weights, biases };
}

/**
 * Perform inference using trained neural network.
 * @param {number[][]} inputs - Input data matrix.
 * @param {Object} model - Trained model (weights and biases).
 * @returns {number[][]} - Output predictions.
 */
export function infer(inputs, model) {
  const weightedInputs = addMatrices(multiplyMatrices(inputs, model.weights), model.biases);
  return applyActivation(weightedInputs, sigmoid);
}