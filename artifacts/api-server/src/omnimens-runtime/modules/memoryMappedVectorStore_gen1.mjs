/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: memoryMappedVectorStore
 * Written: 2026-04-03T07:27:00.862Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// memoryMappedVectorStore.mjs

import { openSync, readSync, writeSync, ftruncateSync, closeSync } from 'fs';
import { resolve } from 'path';

const VECTOR_DIM = 128; // Fixed dimension for vectors
const VECTOR_SIZE = VECTOR_DIM * Float32Array.BYTES_PER_ELEMENT;
const MAX_VECTORS = 100000; // Maximum number of vectors in the store
const FILE_SIZE = VECTOR_SIZE * MAX_VECTORS;

/**
 * Creates or opens a memory-mapped file for storing vectors.
 * @param {string} filePath - Path to the memory-mapped file.
 * @returns {object} - File descriptor and buffer object.
 */
export function createMemoryMappedFile(filePath) {
  const resolvedPath = resolve(filePath);
  const fd = openSync(resolvedPath, 'w+');
  ftruncateSync(fd, FILE_SIZE);
  const buffer = Buffer.alloc(FILE_SIZE);
  return { fd, buffer };
}

/**
 * Writes a vector to the memory-mapped file.
 * @param {object} file - File descriptor and buffer object.
 * @param {number} index - Index to write the vector at.
 * @param {Float32Array} vector - Vector to write.
 */
export function writeVector(file, index, vector) {
  if (vector.length !== VECTOR_DIM) {
    throw new Error(`Vector must have dimension ${VECTOR_DIM}`);
  }
  const offset = index * VECTOR_SIZE;
  if (offset >= FILE_SIZE) {
    throw new Error('Index exceeds maximum capacity');
  }
  const floatBuffer = Buffer.from(vector.buffer);
  floatBuffer.copy(file.buffer, offset);
  writeSync(file.fd, file.buffer, 0, FILE_SIZE, 0);
}

/**
 * Reads a vector from the memory-mapped file.
 * @param {object} file - File descriptor and buffer object.
 * @param {number} index - Index to read the vector from.
 * @returns {Float32Array} - Retrieved vector.
 */
export function readVector(file, index) {
  const offset = index * VECTOR_SIZE;
  if (offset >= FILE_SIZE) {
    throw new Error('Index exceeds maximum capacity');
  }
  const floatBuffer = file.buffer.slice(offset, offset + VECTOR_SIZE);
  return new Float32Array(floatBuffer.buffer);
}

/**
 * Calculates the Euclidean distance between two vectors.
 * @param {Float32Array} vec1 - First vector.
 * @param {Float32Array} vec2 - Second vector.
 * @returns {number} - Euclidean distance.
 */
export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimension');
  }
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Finds the nearest neighbor of a given vector in the memory-mapped file.
 * @param {object} file - File descriptor and buffer object.
 * @param {Float32Array} queryVector - Query vector.
 * @param {number} count - Number of vectors stored.
 * @returns {object} - Nearest neighbor index and distance.
 */
export function findNearestNeighbor(file, queryVector, count) {
  let nearestIndex = -1;
  let nearestDistance = Infinity;

  for (let i = 0; i < count; i++) {
    const candidateVector = readVector(file, i);
    const distance = euclideanDistance(queryVector, candidateVector);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  return { index: nearestIndex, distance: nearestDistance };
}

/**
 * Closes the memory-mapped file.
 * @param {object} file - File descriptor and buffer object.
 */
export function closeMemoryMappedFile(file) {
  closeSync(file.fd);
}
