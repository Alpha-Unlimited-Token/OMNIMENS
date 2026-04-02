/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: imageToVectorEncoder
 * Written: 2026-04-02T15:06:08.943Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// imageToVectorEncoder.mjs

import { createHash } from 'crypto';

/**
 * Generates a deterministic hash for caching purposes.
 * Useful for ensuring consistent embeddings for the same image input.
 * @param {Buffer} buffer - The image buffer.
 * @returns {string} - A SHA-256 hash of the image buffer.
 */
export function generateImageHash(buffer) {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

/**
 * Normalizes pixel values from 0-255 to 0-1.
 * @param {Uint8ClampedArray} pixelData - The raw pixel data of the image.
 * @returns {Float32Array} - Normalized pixel values.
 */
export function normalizePixels(pixelData) {
  const normalized = new Float32Array(pixelData.length);
  for (let i = 0; i < pixelData.length; i++) {
    normalized[i] = pixelData[i] / 255;
  }
  return normalized;
}

/**
 * Performs a lightweight convolution operation on image data.
 * This is a simplified CNN kernel for feature extraction.
 * @param {Float32Array} imageData - Normalized image data.
 * @param {number[][]} kernel - The convolution kernel (e.g., 3x3 matrix).
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 * @returns {Float32Array} - Feature map after convolution.
 */
export function applyConvolution(imageData, kernel, width, height) {
  const kernelSize = kernel.length;
  const halfKernel = Math.floor(kernelSize / 2);
  const output = new Float32Array(imageData.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const pixelX = Math.min(Math.max(x + kx, 0), width - 1);
          const pixelY = Math.min(Math.max(y + ky, 0), height - 1);
          const pixelIndex = pixelY * width + pixelX;
          const kernelValue = kernel[ky + halfKernel][kx + halfKernel];
          sum += imageData[pixelIndex] * kernelValue;
        }
      }
      output[y * width + x] = sum;
    }
  }

  return output;
}

/**
 * Extracts feature embeddings from an image buffer.
 * @param {Buffer} imageBuffer - The raw image buffer (assumed to be RGBA format).
 * @param {number} width - Image width.
 * @param {number} height - Image height.
 * @returns {Float32Array} - Feature embeddings for the image.
 */
export function extractImageEmbeddings(imageBuffer, width, height) {
  const pixelData = new Uint8ClampedArray(imageBuffer);
  const normalizedData = normalizePixels(pixelData);

  // Example kernel for edge detection (Sobel operator)
  const sobelKernel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];

  const featureMap = applyConvolution(normalizedData, sobelKernel, width, height);

  // Pooling (average pooling for simplicity)
  const pooledFeatures = [];
  const poolSize = 2;
  for (let y = 0; y < height; y += poolSize) {
    for (let x = 0; x < width; x += poolSize) {
      let sum = 0;
      let count = 0;
      for (let py = 0; py < poolSize; py++) {
        for (let px = 0; px < poolSize; px++) {
          const pixelX = x + px;
          const pixelY = y + py;
          if (pixelX < width && pixelY < height) {
            sum += featureMap[pixelY * width + pixelX];
            count++;
          }
        }
      }
      pooledFeatures.push(sum / count);
    }
  }

  return new Float32Array(pooledFeatures);
}

/**
 * Encodes an image into a vector embedding for further processing.
 * @param {Buffer} imageBuffer - The raw image buffer.
 * @param {number} width - Image width.
 * @param {number} height - Image height.
 * @returns {{ hash, embedding}} - Hash and embedding.
 */
export function imageToVector(imageBuffer, width, height) {
  const hash = generateImageHash(imageBuffer);
  const embedding = extractImageEmbeddings(imageBuffer, width, height);
  return { hash, embedding };
}