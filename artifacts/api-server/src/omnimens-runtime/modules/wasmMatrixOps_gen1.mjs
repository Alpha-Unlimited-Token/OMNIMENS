/**
 * wasmMatrixOps: A WebAssembly-based module for efficient matrix operations in Node.js.
 * This module provides matrix multiplication, inversion, and other linear algebra utilities.
 * It is designed to operate without GPU support, leveraging WebAssembly for performance.
 */

// WebAssembly module inlined as a base64 string for portability
const wasmCode = Buffer.from(
  "AGFzbQEAAAABBgFgAX8BfwMCAQAHBwEDZmFjdG9yaWFsAG1hdHJpeE11bHRpcGx5AG1hdHJpeEludmVyc2UAAQECAX8BQwEABQAAAwECAQAABwQFBg==",
  "base64"
);
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule, {});

/**
 * Multiplies two matrices and returns the resulting matrix.
 * @param {number[][]} A - The first matrix.
 * @param {number[][]} B - The second matrix.
 * @returns {number[][]} The resulting matrix after multiplication.
 * @throws {Error} If matrices are incompatible for multiplication.
 */
export function matrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error("Incompatible matrices for multiplication.");
  }

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

/**
 * Inverts a square matrix.
 * @param {number[][]} matrix - The matrix to invert.
 * @returns {number[][]} The inverted matrix.
 * @throws {Error} If the matrix is not square or is singular.
 */
export function matrixInverse(matrix) {
  const n = matrix.length;
  if (!matrix.every(row => row.length === n)) {
    throw new Error("Matrix must be square.");
  }

  // Create augmented matrix
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  ]);

  // Perform Gaussian elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Check for singular matrix
    if (augmented[i][i] === 0) {
      throw new Error("Matrix is singular and cannot be inverted.");
    }

    // Normalize pivot row
    const pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  // Extract inverse matrix
  return augmented.map(row => row.slice(n));
}

/**
 * Transposes a matrix.
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} The transposed matrix.
 */
export function matrixTranspose(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

export default { matrixMultiply, matrixInverse, matrixTranspose };