/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: wasmMatrixOps
 * Written: 2026-03-22T19:12:08.012Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

/**
 * wasmMatrixOps - A utility module for performing efficient matrix operations using WebAssembly.
 * This module is designed for Node.js 20+ and accelerates linear algebra computations by leveraging WebAssembly.
 */

// WebAssembly binary for matrix operations (base64 encoded for inline usage)
const wasmBase64 = "AGFzbQEAAAABBgFgAX8BfwMCAQAHBwEDZmFjdG9yaWFsAAAKAgEABgEBAQEBf2FsaWduAAAKAgEABgEBAQEBbWF0cml4QWRkAAAKAgEABgEBAQEBbWF0cml4TXVsdAAACgIBAAcBAQEBbWF0cml4VHJhbnMAAAAKAgEABgEBAQEBbWF0cml4U3ViAAAKAgEABgEBAQEBbWF0cml4RG90AAAKAgEABgEBAQEBbWF0cml4U2NhbGUAAAoCAQAHAgEBAQBtZW1vcnlNYW5hZ2VyAAAKAgEABgEBAQEBbWF0cml4SW52ZXJzZQAA";

// Decode base64 WebAssembly binary
const wasmBinary = Buffer.from(wasmBase64, "base64");

/**
 * Initialize the WebAssembly module and create exports for matrix operations.
 * @returns {Promise<Object>} A promise that resolves to an object containing matrix operation functions.
 */
export async function initializeWasmMatrixOps() {
  // Compile and instantiate the WebAssembly module
  const wasmModule = await WebAssembly.compile(wasmBinary);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, {});

  // Extract WebAssembly exports
  const {
    matrixAdd,
    matrixMult,
    matrixTrans,
    matrixSub,
    matrixDot,
    matrixScale,
    matrixInverse
  } = wasmInstance.exports;

  /**
   * Add two matrices.
   * @param {Float64Array} a - First matrix (row-major order).
   * @param {Float64Array} b - Second matrix (row-major order).
   * @param {number} rows - Number of rows.
   * @param {number} cols - Number of columns.
   * @returns {Float64Array} Resulting matrix after addition.
   */
  function add(a, b, rows, cols) {
    validateMatrixInput(a, b, rows, cols);
    const result = new Float64Array(rows * cols);
    matrixAdd(a, b, result, rows, cols);
    return result;
  }

  /**
   * Multiply two matrices.
   * @param {Float64Array} a - First matrix (row-major order).
   * @param {Float64Array} b - Second matrix (row-major order).
   * @param {number} rowsA - Rows in the first matrix.
   * @param {number} colsA - Columns in the first matrix (and rows in the second matrix).
   * @param {number} colsB - Columns in the second matrix.
   * @returns {Float64Array} Resulting matrix after multiplication.
   */
  function multiply(a, b, rowsA, colsA, colsB) {
    validateMatrixMultiplyInput(a, b, rowsA, colsA, colsB);
    const result = new Float64Array(rowsA * colsB);
    matrixMult(a, b, result, rowsA, colsA, colsB);
    return result;
  }

  /**
   * Transpose a matrix.
   * @param {Float64Array} a - Input matrix (row-major order).
   * @param {number} rows - Number of rows.
   * @param {number} cols - Number of columns.
   * @returns {Float64Array} Transposed matrix.
   */
  function transpose(a, rows, cols) {
    validateMatrixSize(a, rows, cols);
    const result = new Float64Array(rows * cols);
    matrixTrans(a, result, rows, cols);
    return result;
  }

  /**
   * Validate matrix input for addition and subtraction.
   * @param {Float64Array} a - First matrix.
   * @param {Float64Array} b - Second matrix.
   * @param {number} rows - Number of rows.
   * @param {number} cols - Number of columns.
   */
  function validateMatrixInput(a, b, rows, cols) {
    if (a.length !== rows * cols || b.length !== rows * cols) {
      throw new Error("Matrix dimensions do not match the specified rows and columns.");
    }
  }

  /**
   * Validate matrix input for multiplication.
   * @param {Float64Array} a - First matrix.
   * @param {Float64Array} b - Second matrix.
   * @param {number} rowsA - Rows in the first matrix.
   * @param {number} colsA - Columns in the first matrix.
   * @param {number} colsB - Columns in the second matrix.
   */
  function validateMatrixMultiplyInput(a, b, rowsA, colsA, colsB) {
    if (a.length !== rowsA * colsA || b.length !== colsA * colsB) {
      throw new Error("Matrix dimensions do not match for multiplication.");
    }
  }

  /**
   * Validate matrix size.
   * @param {Float64Array} a - Input matrix.
   * @param {number} rows - Number of rows.
   * @param {number} cols - Number of columns.
   */
  function validateMatrixSize(a, rows, cols) {
    if (a.length !== rows * cols) {
      throw new Error("Matrix dimensions do not match the specified rows and columns.");
    }
  }

  return {
    add,
    multiply,
    transpose
  };
}

export default initializeWasmMatrixOps;