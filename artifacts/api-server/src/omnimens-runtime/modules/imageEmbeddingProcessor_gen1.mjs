/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: imageEmbeddingProcessor
 * Purpose: Process and embed image data into vector space for multimodal reasoning.
 * Description: Processes and embeds image data into vector space for multimodal reasoning, supporting hashing, similarity, and resizing utilities.
 * Migrated: 2026-04-03T02:20:50.782Z
 */

// imageEmbeddingProcessor.mjs

import { createHash } from 'crypto';

/**
 * Converts image pixel data into a normalized vector representation.
 * @param {Uint8Array} pixelData - The raw pixel data of the image.
 * @param {number} width - The width of the image.
 * @param {number} height - The height of the image.
 * @returns {Float32Array} - The vector representation of the image.
 */
export function embedImage(pixelData, width, height) {
  if (!pixelData || pixelData.length !== width * height * 3) {
    throw new Error("Invalid pixel data or dimensions.");
  }

  // Normalize pixel values to [0, 1]
  const normalizedPixels = new Float32Array(pixelData.length);
  for (let i = 0; i < pixelData.length; i++) {
    normalizedPixels[i] = pixelData[i] / 255;
  }

  // Compute a simple embedding by averaging RGB channels
  const embedding = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = normalizedPixels[i * 3];
    const g = normalizedPixels[i * 3 + 1];
    const b = normalizedPixels[i * 3 + 2];
    embedding[i] = (r + g + b) / 3;
  }

  return embedding;
}

/**
 * Generates a hash for an image embedding for quick comparison or indexing.
 * @param {Float32Array} embedding - The vector representation of the image.
 * @returns {string} - A SHA-256 hash of the embedding.
 */
export function hashEmbedding(embedding) {
  const hash = createHash('sha256');
  hash.update(Buffer.from(embedding.buffer));
  return hash.digest('hex');
}

/**
 * Calculates the cosine similarity between two image embeddings.
 * @param {Float32Array} embeddingA - The first image embedding.
 * @param {Float32Array} embeddingB - The second image embedding.
 * @returns {number} - The cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error("Embeddings must have the same length.");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    magnitudeA += embeddingA[i] ** 2;
    magnitudeB += embeddingB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility function to resize raw pixel data to a fixed dimension using nearest-neighbor interpolation.
 * @param {Uint8Array} pixelData - The raw pixel data of the image.
 * @param {number} originalWidth - Original width of the image.
 * @param {number} originalHeight - Original height of the image.
 * @param {number} targetWidth - Target width for resizing.
 * @param {number} targetHeight - Target height for resizing.
 * @returns {Uint8Array} - Resized pixel data.
 */
export function resizeImage(pixelData, originalWidth, originalHeight, targetWidth, targetHeight) {
  const resizedData = new Uint8Array(targetWidth * targetHeight * 3);

  const xRatio = originalWidth / targetWidth;
  const yRatio = originalHeight / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const nearestX = Math.floor(x * xRatio);
      const nearestY = Math.floor(y * yRatio);

      const srcIndex = (nearestY * originalWidth + nearestX) * 3;
      const destIndex = (y * targetWidth + x) * 3;

      resizedData[destIndex] = pixelData[srcIndex];
      resizedData[destIndex + 1] = pixelData[srcIndex + 1];
      resizedData[destIndex + 2] = pixelData[srcIndex + 2];
    }
  }

  return resizedData;
}