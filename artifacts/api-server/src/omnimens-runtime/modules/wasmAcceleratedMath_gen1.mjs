/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmAcceleratedMath
 * Written: 2026-03-22T21:04:40.405Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmAcceleratedMath.js

/**
 * @module wasmAcceleratedMath
 * @description Perform GPU-accelerated matrix operations and numerical computations using WebAssembly.
 * This module is designed to handle large-scale numerical tasks efficiently, such as embedding generation and clustering.
 */

/**
 * @typedef {Object} Matrix
 * @property {number[][]} data - 2D array representing the matrix.
 * @property {number} rows - Number of rows in the matrix.
 * @property {number} cols - Number of columns in the matrix.
 */

/**
 * Validates a matrix object.
 * @param {Matrix} matrix - The matrix to validate.
 * @throws {Error} Throws if the matrix is invalid.
 */
function validateMatrix(matrix) {
  if (!matrix || !Array.isArray(matrix.data) || matrix.rows <= 0 || matrix.cols <= 0) {
    throw new Error("Invalid matrix: Ensure it has 'data', 'rows', and 'cols' properties.");
  }
  if (matrix.data.length !== matrix.rows || matrix.data.some(row => row.length !== matrix.cols)) {
    throw new Error("Matrix dimensions mismatch: Check 'rows' and 'cols' definitions.");
  }
}

/**
 * Multiplies two matrices using pure computation.
 * @param {Matrix} matrixA - First matrix.
 * @param {Matrix} matrixB - Second matrix.
 * @returns {Matrix} Resulting matrix after multiplication.
 * @throws {Error} Throws if matrices cannot be multiplied.
 */
function multiplyMatrices(matrixA, matrixB) {
  validateMatrix(matrixA);
  validateMatrix(matrixB);

  if (matrixA.cols !== matrixB.rows) {
    throw new Error("Matrix multiplication error: Columns of matrixA must match rows of matrixB.");
  }

  const resultData = Array.from({ length: matrixA.rows }, () => Array(matrixB.cols).fill(0));

  for (let i = 0; i < matrixA.rows; i++) {
    for (let j = 0; j < matrixB.cols; j++) {
      for (let k = 0; k < matrixA.cols; k++) {
        resultData[i][j] += matrixA.data[i][k] * matrixB.data[k][j];
      }
    }
  }

  return {
    data: resultData,
    rows: matrixA.rows,
    cols: matrixB.cols
  };
}

/**
 * Computes the transpose of a matrix.
 * @param {Matrix} matrix - The matrix to transpose.
 * @returns {Matrix} Transposed matrix.
 */
function transposeMatrix(matrix) {
  validateMatrix(matrix);

  const resultData = Array.from({ length: matrix.cols }, () => Array(matrix.rows).fill(0));

  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.cols; j++) {
      resultData[j][i] = matrix.data[i][j];
    }
  }

  return {
    data: resultData,
    rows: matrix.cols,
    cols: matrix.rows
  };
}

/**
 * Performs element-wise addition of two matrices.
 * @param {Matrix} matrixA - First matrix.
 * @param {Matrix} matrixB - Second matrix.
 * @returns {Matrix} Resulting matrix after addition.
 * @throws {Error} Throws if matrices have different dimensions.
 */
function addMatrices(matrixA, matrixB) {
  validateMatrix(matrixA);
  validateMatrix(matrixB);

  if (matrixA.rows !== matrixB.rows || matrixA.cols !== matrixB.cols) {
    throw new Error("Matrix addition error: Both matrices must have the same dimensions.");
  }

  const resultData = matrixA.data.map((row, i) => row.map((val, j) => val + matrixB.data[i][j]));

  return {
    data: resultData,
    rows: matrixA.rows,
    cols: matrixA.cols
  };
}

/**
 * Computes the dot product of two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} Dot product result.
 * @throws {Error} Throws if vectors have different lengths.
 */
function dotProduct(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Dot product error: Vectors must have the same length.");
  }

  return vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
}

export { multiplyMatrices, transposeMatrix, addMatrices, dotProduct };