/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyComputeBridge
 * Written: 2026-04-02T15:15:38.173Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// webAssemblyComputeBridge.mjs

import { readFile } from 'fs/promises';
import { resolve } from 'path';

/**
 * Dynamically loads a WebAssembly module and returns its exports.
 * @param {string} wasmFilePath - Path to the WebAssembly file.
 * @returns {Promise<WebAssembly.Exports>} - The exported functions/objects from the WASM module.
 */
export async function loadWasmModule(wasmFilePath) {
  try {
    const absolutePath = resolve(wasmFilePath);
    const wasmBuffer = await readFile(absolutePath);
    const wasmModule = await WebAssembly.instantiate(wasmBuffer);
    return wasmModule.instance.exports;
  } catch (error) {
    throw new Error(`Failed to load WebAssembly module: ${error.message}`);
  }
}

/**
 * Executes a computation using a WebAssembly module.
 * @param {string} wasmFilePath - Path to the WebAssembly file.
 * @param {string} functionName - Name of the exported function to invoke.
 * @param {Array<number>} args - Arguments to pass to the WASM function.
 * @returns {number} - The result of the computation.
 */
export async function computeWithWasm(wasmFilePath, functionName, args) {
  try {
    const wasmExports = await loadWasmModule(wasmFilePath);
    if (typeof wasmExports[functionName] !== 'function') {
      throw new Error(`Function '${functionName}' not found in the WebAssembly module.`);
    }
    return wasmExports[functionName](...args);
  } catch (error) {
    throw new Error(`Failed to compute with WebAssembly: ${error.message}`);
  }
}

/**
 * Validates and prepares numerical inputs for WebAssembly computations.
 * @param {Array<number>} inputs - The array of numbers to validate.
 * @returns {Array<number>} - The sanitized array of numbers.
 */
export function sanitizeInputs(inputs) {
  if (!Array.isArray(inputs)) {
    throw new TypeError('Inputs must be an array of numbers.');
  }
  return inputs.map((input) => {
    if (typeof input !== 'number' || !Number.isFinite(input)) {
      throw new TypeError(`Invalid input: ${input} is not a finite number.`);
    }
    return input;
  });
}

/**
 * Example utility to perform matrix multiplication using a WebAssembly module.
 * @param {string} wasmFilePath - Path to the WebAssembly file.
 * @param {Array<number>} matrixA - Flattened array representing matrix A.
 * @param {Array<number>} matrixB - Flattened array representing matrix B.
 * @param {number} size - The dimension (N) of the NxN matrices.
 * @returns {Array<number>} - The resulting flattened matrix C.
 */
export async function matrixMultiply(wasmFilePath, matrixA, matrixB, size) {
  try {
    sanitizeInputs(matrixA);
    sanitizeInputs(matrixB);

    if (matrixA.length !== size * size || matrixB.length !== size * size) {
      throw new Error('Matrix dimensions do not match the specified size.');
    }

    const wasmExports = await loadWasmModule(wasmFilePath);
    if (typeof wasmExports.matrixMultiply !== 'function') {
      throw new Error("The WebAssembly module doesn't export a 'matrixMultiply' function.");
    }

    const resultPointer = wasmExports.matrixMultiply(matrixA, matrixB, size);
    const resultArray = new Float64Array(wasmExports.memory.buffer, resultPointer, size * size);
    return Array.from(resultArray);
  } catch (error) {
    throw new Error(`Matrix multiplication failed: ${error.message}`);
  }
}