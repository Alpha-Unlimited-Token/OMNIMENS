/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmComputeEngine
 * Written: 2026-03-23T04:30:24.695Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// wasmComputeEngine.js

/**
 * @module wasmComputeEngine
 * @description Provides accelerated matrix operations using WebAssembly for computationally heavy tasks.
 * This module uses AssemblyScript-generated WebAssembly to perform numerical computations efficiently.
 */

/**
 * @function generateMatrixMultiplicationWasm
 * @description Generates a WebAssembly binary for matrix multiplication using AssemblyScript source code.
 * @returns {Uint8Array} A WebAssembly binary for matrix multiplication.
 */
function generateMatrixMultiplicationWasm() {
  // AssemblyScript source code for matrix multiplication
  const assemblyScriptSource = `
    export function multiplyMatrices(
      a,
      b,
      rowsA: i32,
      colsA: i32,
      colsB: i32
    ) {
      const result = new Float64Array(rowsA * colsB);
      for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
          let sum = 0.0;
          for (let k = 0; k < colsA; k++) {
            sum += a[i * colsA + k] * b[k * colsB + j];
          }
          result[i * colsB + j] = sum;
        }
      }
      return result;
    }
  `;

  // Convert AssemblyScript source code into WebAssembly binary
  const { compile } = require("webassembly");
  const wasmBinary = compile(assemblyScriptSource);

  return wasmBinary;
}

/**
 * @function loadWasmModule
 * @description Loads a WebAssembly module from a binary and returns its exported functions.
 * @param {Uint8Array} wasmBinary - The WebAssembly binary to load.
 * @returns {Promise} A promise resolving to the WebAssembly module's exports.
 */
async function loadWasmModule(wasmBinary) {
  const wasmModule = await WebAssembly.instantiate(wasmBinary);
  return wasmModule.instance.exports;
}

/**
 * @function matrixMultiply
 * @description Multiplies two matrices using WebAssembly.
 * @param {Float64Array} matrixA - The first matrix (flattened).
 * @param {Float64Array} matrixB - The second matrix (flattened).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise} A promise resolving to the result matrix (flattened).
 */
async function matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB) {
  const wasmBinary = generateMatrixMultiplicationWasm();
  const wasmExports = await loadWasmModule(wasmBinary);

  if (!wasmExports.multiplyMatrices) {
    throw new Error("WebAssembly module does not export multiplyMatrices function.");
  }

  return wasmExports.multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB);
}

/**
 * @function validateMatrixDimensions
 * @description Validates matrix dimensions for multiplication compatibility.
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} rowsB - Number of rows in matrixB.
 * @param {number} colsB - Number of columns in matrixB.
 * @throws {Error} If matrices cannot be multiplied due to incompatible dimensions.
 */
function validateMatrixDimensions(rowsA, colsA, rowsB, colsB) {
  if (colsA !== rowsB) {
    throw new Error("Matrix dimensions are incompatible for multiplication.");
  }
}

/**
 * @function multiply
 * @description Public interface for matrix multiplication.
 * @param {Float64Array} matrixA - The first matrix (flattened).
 * @param {Float64Array} matrixB - The second matrix (flattened).
 * @param {number} rowsA - Number of rows in matrixA.
 * @param {number} colsA - Number of columns in matrixA.
 * @param {number} colsB - Number of columns in matrixB.
 * @returns {Promise} A promise resolving to the result matrix (flattened).
 */
async function multiply(matrixA, matrixB, rowsA, colsA, colsB) {
  validateMatrixDimensions(rowsA, colsA, matrixB.length / colsB, colsB);
  return matrixMultiply(matrixA, matrixB, rowsA, colsA, colsB);
}

export { multiply };