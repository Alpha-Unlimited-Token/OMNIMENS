/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: gpuMatrixEngine
 * Written: 2026-04-01T22:02:40.830Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// gpuMatrixEngine.mjs

import { randomUUID } from 'crypto';

/**
 * Generates a unique identifier for GPU operations.
 * Useful for tracking tasks across modules.
 */
export function generateOperationId() {
  return randomUUID();
}

/**
 * Creates a 2D matrix with specified dimensions and fills it with a given value.
 * @param {number} rows - Number of rows in the matrix.
 * @param {number} cols - Number of columns in the matrix.
 * @param {number} fillValue - Value to fill the matrix with.
 * @returns {number[][]} - Generated matrix.
 */
export function createMatrix(rows, cols, fillValue = 0) {
  if (rows <= 0 || cols <= 0) throw new Error('Matrix dimensions must be positive integers.');
  return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

/**
 * Multiplies two matrices using a naive algorithm.
 * @param {number[][]} matrixA - First matrix.
 * @param {number[][]} matrixB - Second matrix.
 * @returns {number[][]} - Resulting matrix after multiplication.
 */
export function multiplyMatrices(matrixA, matrixB) {
  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) throw new Error('Matrix dimensions do not align for multiplication.');

  const result = createMatrix(rowsA, colsB);

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

/**
 * Applies a Hopfield-style memory update to a state vector.
 * @param {number[][]} weightMatrix - Symmetric weight matrix.
 * @param {number[]} stateVector - Current state vector.
 * @returns {number[]} - Updated state vector.
 */
export function hopfieldUpdate(weightMatrix, stateVector) {
  const size = weightMatrix.length;

  if (size !== weightMatrix[0].length || size !== stateVector.length) {
    throw new Error('Weight matrix and state vector dimensions must match.');
  }

  const updatedState = new Array(size).fill(0);

  for (let i = 0; i < size; i++) {
    let sum = 0;
    for (let j = 0; j < size; j++) {
      sum += weightMatrix[i][j] * stateVector[j];
    }
    updatedState[i] = sum >= 0 ? 1 : -1; // Binary threshold activation
  }

  return updatedState;
}

/**
 * Normalizes a vector to unit length.
 * @param {number[]} vector - Input vector.
 * @returns {number[]} - Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) throw new Error('Cannot normalize a zero vector.');
  return vector.map(val => val / magnitude);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity (range: -1 to 1).
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) throw new Error('Vectors must be of the same length.');

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) throw new Error('Cannot compute similarity with a zero vector.');

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates a random matrix with values between -1 and 1.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @returns {number[][]} - Randomly generated matrix.
 */
export function generateRandomMatrix(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() * 2 - 1));
}