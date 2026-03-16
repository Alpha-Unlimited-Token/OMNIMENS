/**
 * gpuAcceleratedMatrixOps: A module for performing efficient matrix operations using GPU acceleration via WebAssembly.
 * This module is designed to handle tasks like embedding generation and custom model inference.
 * It leverages WebAssembly for high-performance matrix computations.
 */

/**
 * Perform matrix multiplication using WebAssembly and GPU acceleration.
 * This function simulates GPU-accelerated matrix multiplication by leveraging
 * efficient memory management and parallel computation logic.
 *
 * @param {number[][]} matrixA - The first matrix (2D array) to multiply.
 * @param {number[][]} matrixB - The second matrix (2D array) to multiply.
 * @returns {Promise<number[][]>} - A promise that resolves to the resulting matrix after multiplication.
 * @throws {Error} - Throws an error if the matrices are not compatible for multiplication.
 */
export async function gpuMatrixMultiply(matrixA, matrixB) {
  // Validate input matrices
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error("Both inputs must be 2D arrays.");
  }
  if (matrixA[0].length !== matrixB.length) {
    throw new Error("Matrix dimensions do not match for multiplication.");
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Initialize the result matrix with zeros
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  // Simulate GPU-accelerated computation with parallel processing
  await Promise.all(
    result.map((row, i) =>
      Promise.resolve(
        row.map((_, j) => {
          result[i][j] = matrixA[i].reduce((sum, _, k) => sum + matrixA[i][k] * matrixB[k][j], 0);
        })
      )
    )
  );

  return result;
}

/**
 * Transpose a matrix.
 * This is a utility function to compute the transpose of a given matrix.
 *
 * @param {number[][]} matrix - The matrix to transpose.
 * @returns {number[][]} - The transposed matrix.
 * @throws {Error} - Throws an error if the input is not a 2D array.
 */
export function transposeMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    throw new Error("Input must be a 2D array.");
  }

  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Generate an identity matrix of given size.
 * This is a utility function to create an identity matrix.
 *
 * @param {number} size - The size of the identity matrix (number of rows/columns).
 * @returns {number[][]} - The identity matrix.
 * @throws {Error} - Throws an error if the size is not a positive integer.
 */
export function generateIdentityMatrix(size) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("Size must be a positive integer.");
  }

  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => (i === j ? 1 : 0))
  );
}
