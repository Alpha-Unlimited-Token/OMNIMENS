/**
 * @module gpuAcceleratedMatrixOps
 * @description Provides GPU-accelerated matrix operations using TensorFlow.js with WebGL backend for lightweight ML tasks.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { readFileSync } = require('fs');
const { join } = require('path');

// Load TensorFlow.js from a bundled script to avoid npm dependencies
const tfjsScriptPath = join(__dirname, 'tf.min.js'); // Ensure tf.min.js is bundled with this module
const tfjsScript = readFileSync(tfjsScriptPath, 'utf8');

// Evaluate TensorFlow.js in the current context
const vm = require('vm');
vm.runInThisContext(tfjsScript);

/**
 * Multiplies two matrices using TensorFlow.js with WebGL backend.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If matrices cannot be multiplied due to dimension mismatch.
 */
export async function multiplyMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (colsA !== rowsB) {
    throw new Error('Matrix multiplication dimension mismatch: columns of A must match rows of B.');
  }

  // Use TensorFlow.js tensors for GPU-accelerated computation
  const tensorA = tf.tensor2d(matrixA, [rowsA, colsA]);
  const tensorB = tf.tensor2d(matrixB, [rowsB, colsB]);

  const resultTensor = tf.matMul(tensorA, tensorB);
  const result = await resultTensor.array();

  // Clean up tensors to free GPU memory
  tensorA.dispose();
  tensorB.dispose();
  resultTensor.dispose();

  return result;
}

/**
 * Calculates the dot product of two vectors using TensorFlow.js.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {Promise<number>} The dot product of the two vectors.
 * @throws {Error} If vectors are not of the same length.
 */
export async function dotProduct(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    throw new Error('Both inputs must be 1D arrays.');
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  // Use TensorFlow.js tensors for GPU-accelerated computation
  const tensorA = tf.tensor1d(vectorA);
  const tensorB = tf.tensor1d(vectorB);

  const resultTensor = tf.dot(tensorA, tensorB);
  const result = await resultTensor.dataSync()[0];

  // Clean up tensors to free GPU memory
  tensorA.dispose();
  tensorB.dispose();
  resultTensor.dispose();

  return result;
}

/**
 * Performs element-wise addition of two matrices using TensorFlow.js.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after addition.
 * @throws {Error} If matrices are not of the same dimensions.
 */
export async function addMatrices(matrixA, matrixB) {
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Both inputs must be 2D arrays.');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]?.length || 0;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]?.length || 0;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error('Matrices must have the same dimensions for addition.');
  }

  // Use TensorFlow.js tensors for GPU-accelerated computation
  const tensorA = tf.tensor2d(matrixA, [rowsA, colsA]);
  const tensorB = tf.tensor2d(matrixB, [rowsB, colsB]);

  const resultTensor = tf.add(tensorA, tensorB);
  const result = await resultTensor.array();

  // Clean up tensors to free GPU memory
  tensorA.dispose();
  tensorB.dispose();
  resultTensor.dispose();

  return result;
}
