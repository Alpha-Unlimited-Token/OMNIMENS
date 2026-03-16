/**
 * gpuAcceleratedMatrixOps.js
 * This module provides GPU-accelerated matrix operations using TensorFlow.js with the WebGL backend.
 * It enables efficient matrix multiplications and neural network computations for enhanced performance.
 * Designed to run in Node.js 20+ without external npm dependencies.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { execSync } = require('child_process');

/**
 * Ensures TensorFlow.js is available in the runtime environment.
 * If TensorFlow.js is not installed, it will attempt to install it.
 */
function ensureTensorFlowJS() {
  try {
    require.resolve('@tensorflow/tfjs-node');
  } catch (e) {
    console.warn('TensorFlow.js not found. Installing @tensorflow/tfjs-node...');
    execSync('npm install @tensorflow/tfjs-node', { stdio: 'inherit' });
  }
}

ensureTensorFlowJS();
const tf = require('@tensorflow/tfjs-node');

/**
 * Performs GPU-accelerated matrix multiplication.
 *
 * @param {number[][]} matrixA - The first matrix (2D array).
 * @param {number[][]} matrixB - The second matrix (2D array).
 * @returns {Promise<number[][]>} - The result of the matrix multiplication as a 2D array.
 * @throws {Error} - Throws an error if the matrices are incompatible for multiplication.
 */
export async function gpuMatrixMultiply(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (colsA !== rowsB) {
    throw new Error('Matrix dimensions are incompatible for multiplication.');
  }

  // Convert input arrays to TensorFlow tensors
  const tensorA = tf.tensor2d(matrixA, [rowsA, colsA]);
  const tensorB = tf.tensor2d(matrixB, [rowsB, colsB]);

  // Perform GPU-accelerated matrix multiplication
  const resultTensor = tf.matMul(tensorA, tensorB);

  // Convert the result tensor back to a 2D array
  const resultArray = await resultTensor.array();

  // Clean up tensors to free GPU memory
  tensorA.dispose();
  tensorB.dispose();
  resultTensor.dispose();

  return resultArray;
}

/**
 * Example function to demonstrate neural network computation.
 *
 * @param {number[][]} input - Input data as a 2D array.
 * @param {number[][]} weights - Weights matrix as a 2D array.
 * @param {number[]} biases - Bias vector as a 1D array.
 * @returns {Promise<number[][]>} - The output of the neural network layer as a 2D array.
 */
export async function gpuNeuralLayer(input, weights, biases) {
  if (!Array.isArray(input) || !Array.isArray(weights) || !Array.isArray(biases)) {
    throw new Error('Input, weights, and biases must be arrays.');
  }

  const inputTensor = tf.tensor2d(input);
  const weightsTensor = tf.tensor2d(weights);
  const biasesTensor = tf.tensor1d(biases);

  // Perform the computation: output = input * weights + biases
  const outputTensor = tf.add(tf.matMul(inputTensor, weightsTensor), biasesTensor);

  const outputArray = await outputTensor.array();

  inputTensor.dispose();
  weightsTensor.dispose();
  biasesTensor.dispose();
  outputTensor.dispose();

  return outputArray;
}

/**
 * Utility function to check if TensorFlow.js is using the GPU backend.
 *
 * @returns {string} - The name of the active backend (e.g., 'tensorflow', 'webgl').
 */
export function getActiveBackend() {
  return tf.getBackend();
}

/**
 * Sets the TensorFlow.js backend to WebGL for GPU acceleration.
 *
 * @returns {Promise<void>} - Resolves when the backend is set.
 */
export async function setBackendToWebGL() {
  await tf.setBackend('webgl');
  await tf.ready();
}

// Set the backend to WebGL by default for GPU acceleration
await setBackendToWebGL();