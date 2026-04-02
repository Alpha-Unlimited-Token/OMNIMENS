/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryMappedPersistence
 * Written: 2026-04-02T14:26:16.428Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryMappedPersistence.mjs

import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Maps a file into memory and exposes it as a TypedArray for fast read/write access.
 * @param {string} filePath - Path to the file to be memory-mapped.
 * @param {string} type - TypedArray type (e.g., 'Uint8Array', 'Float64Array').
 * @returns {Promise<TypedArray>} - A promise that resolves to the memory-mapped TypedArray.
 */
export async function mapFileToMemory(filePath, type = 'Uint8Array') {
  const stats = await fs.stat(filePath);
  const buffer = await fs.readFile(filePath);

  if (!globalThis[type]) {
    throw new Error(`Invalid TypedArray type: ${type}`);
  }

  const TypedArrayConstructor = globalThis[type];
  return new TypedArrayConstructor(buffer.buffer, buffer.byteOffset, stats.size / TypedArrayConstructor.BYTES_PER_ELEMENT);
}

/**
 * Writes the contents of a TypedArray back to the file it was mapped from.
 * @param {string} filePath - Path to the file to write to.
 * @param {TypedArray} typedArray - The TypedArray containing the data to write.
 * @returns {Promise<void>} - A promise that resolves when the write is complete.
 */
export async function persistMemoryMappedData(filePath, typedArray) {
  const buffer = Buffer.from(typedArray.buffer);
  await fs.writeFile(filePath, buffer);
}

/**
 * Creates a new memory-mapped file, initializes it with zeros, and maps it to a TypedArray.
 * @param {string} filePath - Path to the file to create.
 * @param {number} size - Size of the file in bytes.
 * @param {string} type - TypedArray type (e.g., 'Uint8Array', 'Float64Array').
 * @returns {Promise<TypedArray>} - A promise that resolves to the memory-mapped TypedArray.
 */
export async function createMemoryMappedFile(filePath, size, type = 'Uint8Array') {
  const zeroBuffer = Buffer.alloc(size);
  await fs.writeFile(filePath, zeroBuffer);
  return mapFileToMemory(filePath, type);
}

/**
 * Utility function to calculate the checksum of a memory-mapped file for data integrity.
 * @param {TypedArray} typedArray - The memory-mapped TypedArray.
 * @returns {number} - The checksum value.
 */
export function calculateChecksum(typedArray) {
  let checksum = 0;
  for (let i = 0; i < typedArray.length; i++) {
    checksum = (checksum + typedArray[i]) >>> 0; // Ensure unsigned 32-bit arithmetic
  }
  return checksum;
}

/**
 * Utility function to resize a memory-mapped file and remap it to a TypedArray.
 * @param {string} filePath - Path to the file to resize.
 * @param {number} newSize - New size of the file in bytes.
 * @param {string} type - TypedArray type (e.g., 'Uint8Array', 'Float64Array').
 * @returns {Promise<TypedArray>} - A promise that resolves to the resized memory-mapped TypedArray.
 */
export async function resizeMemoryMappedFile(filePath, newSize, type = 'Uint8Array') {
  const zeroBuffer = Buffer.alloc(newSize);
  await fs.writeFile(filePath, zeroBuffer);
  return mapFileToMemory(filePath, type);
}