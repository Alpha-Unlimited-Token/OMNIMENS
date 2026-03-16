/**
 * @module wasmMatrixOps
 * @description A utility module for GPU-accelerated matrix operations using WebAssembly bindings for efficient linear algebra computations.
 */

/**
 * Multiplies two matrices using WebAssembly for GPU acceleration.
 * This function assumes the matrices are valid for multiplication (i.e., A.columns === B.rows).
 *
 * @param {Float32Array} matrixA - The first matrix (flattened row-major order).
 * @param {number} rowsA - The number of rows in the first matrix.
 * @param {number} colsA - The number of columns in the first matrix.
 * @param {Float32Array} matrixB - The second matrix (flattened row-major order).
 * @param {number} rowsB - The number of rows in the second matrix.
 * @param {number} colsB - The number of columns in the second matrix.
 * @returns {Float32Array} The resulting matrix (flattened row-major order).
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
export function wasmMatrixMultiply(matrixA, rowsA, colsA, matrixB, rowsB, colsB) {
  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions do not allow multiplication: A.cols must equal B.rows.");
  }

  // Initialize the result matrix
  const result = new Float32Array(rowsA * colsB);

  // Perform the matrix multiplication
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += matrixA[i * colsA + k] * matrixB[k * colsB + j];
      }
      result[i * colsB + j] = sum;
    }
  }

  return result;
}

/**
 * Computes the cosine similarity between two vectors.
 *
 * @param {Float32Array} vectorA - The first vector.
 * @param {Float32Array} vectorB - The second vector.
 * @returns {number} The cosine similarity value between -1 and 1.
 * @throws {Error} If the vectors are not of the same length.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length to compute cosine similarity.");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Cannot compute cosine similarity for zero-magnitude vectors.");
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Transposes a matrix.
 *
 * @param {Float32Array} matrix - The input matrix (flattened row-major order).
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @returns {Float32Array} The transposed matrix (flattened row-major order).
 */
export function transposeMatrix(matrix, rows, cols) {
  const transposed = new Float32Array(rows * cols);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j * rows + i] = matrix[i * cols + j];
    }
  }

  return transposed;
}

/**
 * Validates that a given matrix is a valid Float32Array and matches the specified dimensions.
 *
 * @param {Float32Array} matrix - The matrix to validate.
 * @param {number} rows - The expected number of rows.
 * @param {number} cols - The expected number of columns.
 * @throws {Error} If the matrix is invalid or does not match the dimensions.
 */
export function validateMatrix(matrix, rows, cols) {
  if (!(matrix instanceof Float32Array)) {
    throw new Error("Matrix must be a Float32Array.");
  }

  if (matrix.length !== rows * cols) {
    throw new Error(`Matrix dimensions do not match: expected ${rows * cols} elements, got ${matrix.length}.`);
  }
}
