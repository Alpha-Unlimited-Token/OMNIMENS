/**
 * wasmMatrixOps - A module for efficient matrix operations and lightweight neural network inference using WebAssembly in Node.js.
 * 
 * This module provides a WebAssembly-backed implementation of matrix multiplication and other basic linear algebra operations.
 * It is designed for high performance and can be used for lightweight neural network inference tasks.
 */

// Import the WebAssembly utilities from the Node.js built-in 'fs' and 'path' modules
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Load and compile the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} A promise that resolves to the WebAssembly instance.
 */
async function loadWasmModule() {
  const wasmPath = resolve(__dirname, 'matrix_ops.wasm');
  const wasmBuffer = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  return WebAssembly.instantiate(wasmModule);
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {Float32Array} matrixA - The first matrix (flattened, row-major order).
 * @param {Float32Array} matrixB - The second matrix (flattened, row-major order).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA (and rows in matrixB).
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Float32Array} The result of the matrix multiplication (flattened, row-major order).
 */
export async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  if (matrixA.length !== rowsA * colsA || matrixB.length !== colsA * colsB) {
    throw new Error('Matrix dimensions do not match the provided sizes.');
  }

  const wasmInstance = await loadWasmModule();
  const { memory, matrix_multiply } = wasmInstance.exports;

  // Allocate memory in the WebAssembly instance
  const aOffset = 0;
  const bOffset = aOffset + matrixA.length * 4; // Float32Array -> 4 bytes per element
  const cOffset = bOffset + matrixB.length * 4;
  const cLength = rowsA * colsB;

  // Write matrices into WebAssembly memory
  const wasmMemory = new Float32Array(memory.buffer);
  wasmMemory.set(matrixA, aOffset / 4);
  wasmMemory.set(matrixB, bOffset / 4);

  // Perform the matrix multiplication
  matrix_multiply(aOffset, bOffset, cOffset, rowsA, colsA, colsB);

  // Read the result from WebAssembly memory
  return new Float32Array(memory.buffer, cOffset, cLength);
}

/**
 * A lightweight neural network inference function.
 * @param {Float32Array} inputVector - The input vector for the neural network.
 * @param {Array<Float32Array>} weights - An array of weight matrices (flattened, row-major order).
 * @param {Array<number>} biases - An array of bias vectors for each layer.
 * @param {Function} activationFn - The activation function to apply (e.g., ReLU, sigmoid).
 * @returns {Float32Array} The output vector after running inference.
 */
export async function neuralNetworkInference(inputVector, weights, biases, activationFn) {
  if (weights.length !== biases.length) {
    throw new Error('The number of weight matrices must match the number of bias vectors.');
  }

  let currentOutput = inputVector;

  for (let i = 0; i < weights.length; i++) {
    const weightMatrix = weights[i];
    const biasVector = biases[i];
    const rows = biasVector.length;
    const cols = currentOutput.length;

    // Perform matrix multiplication
    const layerOutput = await matrixMultiply(weightMatrix, currentOutput, rows, cols, 1);

    // Add bias and apply activation function
    currentOutput = layerOutput.map((value, index) => activationFn(value + biasVector[index]));
  }

  return currentOutput;
}

/**
 * A simple ReLU activation function.
 * @param {number} x - The input value.
 * @returns {number} The output value after applying ReLU.
 */
export function relu(x) {
  return Math.max(0, x);
}

/**
 * A simple sigmoid activation function.
 * @param {number} x - The input value.
 * @returns {number} The output value after applying the sigmoid function.
 */
export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
