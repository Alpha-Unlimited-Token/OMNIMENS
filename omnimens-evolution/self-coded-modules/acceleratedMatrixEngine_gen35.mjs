/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: acceleratedMatrixEngine
 * Written: 2026-04-13T08:06:32.558Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// acceleratedMatrixEngine.mjs

// Utility function to split a matrix into blocks
export function splitMatrix(matrix, blockSize) {
  const blocks = [];
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 0; i < rows; i += blockSize) {
    for (let j = 0; j < cols; j += blockSize) {
      const block = [];
      for (let bi = 0; bi < blockSize && i + bi < rows; bi++) {
        block.push(matrix[i + bi].slice(j, j + blockSize));
      }
      blocks.push(block);
    }
  }

  return blocks;
}

// Utility function to combine blocks back into a matrix
export function combineBlocks(blocks, originalRows, originalCols, blockSize) {
  const result = Array.from({ length: originalRows }, () => Array(originalCols).fill(0));

  let blockIndex = 0;
  for (let i = 0; i < originalRows; i += blockSize) {
    for (let j = 0; j < originalCols; j += blockSize) {
      const block = blocks[blockIndex++];
      for (let bi = 0; bi < block.length; bi++) {
        for (let bj = 0; bj < block[bi].length; bj++) {
          result[i + bi][j + bj] = block[bi][bj];
        }
      }
    }
  }

  return result;
}

// Strassen's algorithm for matrix multiplication
export function strassenMultiply(A, B) {
  const n = A.length;

  if (n === 1) {
    return [[A[0][0] * B[0][0]]];
  }

  const mid = Math.floor(n / 2);

  const A11 = A.slice(0, mid).map(row => row.slice(0, mid));
  const A12 = A.slice(0, mid).map(row => row.slice(mid));
  const A21 = A.slice(mid).map(row => row.slice(0, mid));
  const A22 = A.slice(mid).map(row => row.slice(mid));

  const B11 = B.slice(0, mid).map(row => row.slice(0, mid));
  const B12 = B.slice(0, mid).map(row => row.slice(mid));
  const B21 = B.slice(mid).map(row => row.slice(0, mid));
  const B22 = B.slice(mid).map(row => row.slice(mid));

  const M1 = strassenMultiply(addMatrices(A11, A22), addMatrices(B11, B22));
  const M2 = strassenMultiply(addMatrices(A21, A22), B11);
  const M3 = strassenMultiply(A11, subtractMatrices(B12, B22));
  const M4 = strassenMultiply(A22, subtractMatrices(B21, B11));
  const M5 = strassenMultiply(addMatrices(A11, A12), B22);
  const M6 = strassenMultiply(subtractMatrices(A21, A11), addMatrices(B11, B12));
  const M7 = strassenMultiply(subtractMatrices(A12, A22), addMatrices(B21, B22));

  const C11 = addMatrices(subtractMatrices(addMatrices(M1, M4), M5), M7);
  const C12 = addMatrices(M3, M5);
  const C21 = addMatrices(M2, M4);
  const C22 = addMatrices(subtractMatrices(addMatrices(M1, M3), M2), M6);

  return combineQuadrants(C11, C12, C21, C22);
}

// Utility function to add matrices
export function addMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

// Utility function to subtract matrices
export function subtractMatrices(A, B) {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

// Utility function to combine quadrants into a single matrix
export function combineQuadrants(C11, C12, C21, C22) {
  const n = C11.length;
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push([...C11[i], ...C12[i]]);
  }

  for (let i = 0; i < n; i++) {
    result.push([...C21[i], ...C22[i]]);
  }

  return result;
}

// Blocked matrix multiplication with cache optimization
export function blockedMultiply(A, B, blockSize) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i += blockSize) {
    for (let j = 0; j < colsB; j += blockSize) {
      for (let k = 0; k < colsA; k += blockSize) {
        const blockA = A.slice(i, i + blockSize).map(row => row.slice(k, k + blockSize));
        const blockB = B.slice(k, k + blockSize).map(row => row.slice(j, j + blockSize));
        const blockResult = multiplyBlocks(blockA, blockB);

        for (let bi = 0; bi < blockResult.length; bi++) {
          for (let bj = 0; bj < blockResult[bi].length; bj++) {
            result[i + bi][j + bj] += blockResult[bi][bj];
          }
        }
      }
    }
  }

  return result;
}

// Utility function to multiply small blocks
export function multiplyBlocks(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;

  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}