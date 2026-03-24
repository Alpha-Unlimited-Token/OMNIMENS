/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: localKnowledgeAugmentor
 * Written: 2026-03-24T12:47:42.447Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// localKnowledgeAugmentor.mjs

import { createHash } from 'crypto';

// Utility function to compute cosine similarity between two vectors
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must have the same dimensions');
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

// Locality Sensitive Hashing (LSH) for approximate nearest neighbors
export function lshHash(vector, numBuckets = 10) {
  const hash = createHash('sha256');
  vector.forEach((val) => hash.update(val.toString()));
  const fullHash = hash.digest('hex');
  return Array.from({ length: numBuckets }, (_, i) => fullHash.slice(i * 6, (i + 1) * 6));
}

// Adaptive vector pruning to manage memory usage
export function pruneVectors(vectors, maxVectors, similarityThreshold = 0.9) {
  if (vectors.length <= maxVectors) return vectors;

  const pruned = [];
  for (const vec of vectors) {
    if (!pruned.some((pVec) => cosineSimilarity(vec, pVec) > similarityThreshold)) {
      pruned.push(vec);
    }
    if (pruned.length >= maxVectors) break;
  }
  return pruned;
}

// In-memory LSH-based vector index
export class VectorIndex {
  constructor(numBuckets = 10, maxVectors = 1000) {
    this.numBuckets = numBuckets;
    this.maxVectors = maxVectors;
    this.buckets = new Map();
  }

  addVector(id, vector) {
    const hashes = lshHash(vector, this.numBuckets);
    hashes.forEach((hash) => {
      if (!this.buckets.has(hash)) this.buckets.set(hash, []);
      this.buckets.get(hash).push({ id, vector });
    });
    this._prune();
  }

  query(vector, topK = 5) {
    const hashes = lshHash(vector, this.numBuckets);
    const candidates = new Map();

    hashes.forEach((hash) => {
      if (this.buckets.has(hash)) {
        this.buckets.get(hash).forEach(({ id, vector: candidateVector }) => {
          if (!candidates.has(id)) {
            candidates.set(id, { id, vector: candidateVector });
          }
        });
      }
    });

    const results = Array.from(candidates.values())
      .map(({ id, vector: candidateVector }) => ({
        id,
        similarity: cosineSimilarity(vector, candidateVector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return results;
  }

  _prune() {
    this.buckets.forEach((vectors, hash) => {
      if (vectors.length > this.maxVectors) {
        const prunedVectors = pruneVectors(
          vectors.map((v) => v.vector),
          this.maxVectors
        );
        this.buckets.set(
          hash,
          prunedVectors.map((vector, i) => ({ id: vectors[i].id, vector }))
        );
      }
    });
  }
}

// Example usage of the module
export function exampleUsage() {
  const index = new VectorIndex(10, 100);
  index.addVector('vec1', [1, 0, 0]);
  index.addVector('vec2', [0, 1, 0]);
  index.addVector('vec3', [1, 1, 0]);

  const results = index.query([1, 0.5, 0]);
  return results;
}