/**
 * wasmMatrixOps - A utility module for efficient matrix operations using WebAssembly.
 * This module provides high-performance implementations of basic linear algebra operations
 * such as matrix multiplication and eigen decomposition.
 * 
 * @module wasmMatrixOps
 */

// Import necessary built-in Node.js modules
const fs = require('fs');
const path = require('path');

/**
 * Load and compile the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {number[][]} matrixA - The first matrix.
 * @param {number[][]} matrixB - The second matrix.
 * @returns {Promise<number[][]>} The resulting matrix after multiplication.
 * @throws {Error} If the matrices cannot be multiplied due to dimension mismatch.
 */
async function multiplyMatrices(matrixA, matrixB) {
  if (matrixA[0].length !== matrixB.length) {
    throw new Error('Matrix dimensions do not match for multiplication.');
  }

  const wasmInstance = await loadWasm();
  const { memory, multiply_matrices } = wasmInstance.exports;

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const colsB = matrixB[0].length;

  // Flatten matrices into 1D arrays
  const flatA = matrixA.flat();
  const flatB = matrixB.flat();

  // Allocate memory in the WebAssembly instance
  const ptrA = multiply_matrices.allocate(flatA.length);
  const ptrB = multiply_matrices.allocate(flatB.length);
  const ptrResult = multiply_matrices.allocate(rowsA * colsB);

  // Copy data into WebAssembly memory
  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatA, ptrA / Float64Array.BYTES_PER_ELEMENT);
  wasmMemory.set(flatB, ptrB / Float64Array.BYTES_PER_ELEMENT);

  // Perform matrix multiplication
  multiply_matrices(ptrA, rowsA, colsA, ptrB, colsB, ptrResult);

  // Retrieve the result from WebAssembly memory
  const result = new Float64Array(memory.buffer, ptrResult, rowsA * colsB);

  // Free allocated memory
  multiply_matrices.free(ptrA);
  multiply_matrices.free(ptrB);
  multiply_matrices.free(ptrResult);

  // Convert the result back into a 2D array
  const resultMatrix = [];
  for (let i = 0; i < rowsA; i++) {
    resultMatrix.push(Array.from(result.slice(i * colsB, (i + 1) * colsB)));
  }

  return resultMatrix;
}

/**
 * Compute the eigenvalues and eigenvectors of a matrix using WebAssembly.
 * @param {number[][]} matrix - The input square matrix.
 * @returns {Promise<{ eigenvalues: number[], eigenvectors: number[][] }>} The eigenvalues and eigenvectors.
 * @throws {Error} If the matrix is not square.
 */
async function eigenDecomposition(matrix) {
  if (matrix.length !== matrix[0].length) {
    throw new Error('Matrix must be square for eigen decomposition.');
  }

  const wasmInstance = await loadWasm();
  const { memory, eigen_decomposition } = wasmInstance.exports;

  const size = matrix.length;
  const flatMatrix = matrix.flat();

  // Allocate memory in the WebAssembly instance
  const ptrMatrix = eigen_decomposition.allocate(flatMatrix.length);
  const ptrEigenvalues = eigen_decomposition.allocate(size);
  const ptrEigenvectors = eigen_decomposition.allocate(size * size);

  // Copy data into WebAssembly memory
  const wasmMemory = new Float64Array(memory.buffer);
  wasmMemory.set(flatMatrix, ptrMatrix / Float64Array.BYTES_PER_ELEMENT);

  // Perform eigen decomposition
  eigen_decomposition(ptrMatrix, size, ptrEigenvalues, ptrEigenvectors);

  // Retrieve the results from WebAssembly memory
  const eigenvalues = Array.from(new Float64Array(memory.buffer, ptrEigenvalues, size));
  const eigenvectors = [];
  const eigenvectorData = new Float64Array(memory.buffer, ptrEigenvectors, size * size);
  for (let i = 0; i < size; i++) {
    eigenvectors.push(Array.from(eigenvectorData.slice(i * size, (i + 1) * size)));
  }

  // Free allocated memory
  eigen_decomposition.free(ptrMatrix);
  eigen_decomposition.free(ptrEigenvalues);
  eigen_decomposition.free(ptrEigenvectors);

  return { eigenvalues, eigenvectors };
}

// Export the module's functions
export { multiplyMatrices, eigenDecomposition };