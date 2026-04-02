/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: webAssemblyIntegration
 * Written: 2026-04-02T15:38:50.744Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { TextDecoder, TextEncoder } from 'util';

/**
 * Compile WebAssembly from a provided binary buffer.
 * @param {Uint8Array} wasmBuffer - The binary buffer of the WebAssembly module.
 * @returns {Promise<WebAssembly.Instance>} The compiled WebAssembly instance.
 */
export async function compileWasm(wasmBuffer) {
  if (!(wasmBuffer instanceof Uint8Array)) {
    throw new TypeError('Expected wasmBuffer to be a Uint8Array');
  }
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule);
  return wasmInstance;
}

/**
 * Perform matrix multiplication using WebAssembly.
 * @param {WebAssembly.Instance} wasmInstance - The WebAssembly instance with matrix multiplication logic.
 * @param {Float32Array} matrixA - The first matrix in row-major order.
 * @param {Float32Array} matrixB - The second matrix in row-major order.
 * @param {number} rowsA - Number of rows in matrix A.
 * @param {number} colsA - Number of columns in matrix A (must match rowsB).
 * @param {number} colsB - Number of columns in matrix B.
 * @returns {Float32Array} The resulting matrix in row-major order.
 */
export function wasmMatrixMultiply(wasmInstance, matrixA, matrixB, rowsA, colsA, colsB) {
  if (!wasmInstance || typeof wasmInstance.exports.multiply !== 'function') {
    throw new Error('Invalid WebAssembly instance or missing multiply export');
  }
  if (
    !(matrixA instanceof Float32Array) ||
    !(matrixB instanceof Float32Array) ||
    typeof rowsA !== 'number' ||
    typeof colsA !== 'number' ||
    typeof colsB !== 'number'
  ) {
    throw new TypeError('Invalid input types for matrix multiplication');
  }

  const result = new Float32Array(rowsA * colsB);
  wasmInstance.exports.multiply(
    matrixA.byteOffset,
    matrixB.byteOffset,
    result.byteOffset,
    rowsA,
    colsA,
    colsB
  );
  return result;
}

/**
 * Utility to convert a string to a Uint8Array for WebAssembly input.
 * @param {string} str - The input string.
 * @returns {Uint8Array} The UTF-8 encoded byte array.
 */
export function stringToUint8Array(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Utility to convert a Uint8Array to a string for WebAssembly output.
 * @param {Uint8Array} uint8Array - The input byte array.
 * @returns {string} The decoded string.
 */
export function uint8ArrayToString(uint8Array) {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
}

/**
 * Validate WebAssembly memory bounds for input/output buffers.
 * @param {WebAssembly.Memory} memory - The WebAssembly memory object.
 * @param {number} byteOffset - The starting byte offset.
 * @param {number} byteLength - The length of the buffer.
 * @returns {boolean} Whether the buffer is within memory bounds.
 */
export function validateMemoryBounds(memory, byteOffset, byteLength) {
  if (!(memory instanceof WebAssembly.Memory)) {
    throw new TypeError('Expected memory to be a WebAssembly.Memory instance');
  }
  const memorySize = memory.buffer.byteLength;
  return byteOffset >= 0 && byteOffset + byteLength <= memorySize;
}

/**
 * Create a shared memory buffer for WebAssembly operations.
 * @param {number} size - The size of the buffer in bytes.
 * @returns {SharedArrayBuffer} The created shared memory buffer.
 */
export function createSharedMemory(size) {
  if (typeof size !== 'number' || size <= 0) {
    throw new TypeError('Size must be a positive number');
  }
  return new SharedArrayBuffer(size);
}
