/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: episodicMemoryManager
 * Written: 2026-04-02T14:25:02.878Z
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

import { createHash } from 'crypto';

/**
 * Generates a hash for clustering episodic embeddings.
 * Useful for identifying similar contexts efficiently.
 */
export function generateHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Applies temporal decay weights to memory embeddings.
 * Older memories are weighted less to prioritize recent context.
 */
export function applyTemporalDecay(embeddings, decayRate = 0.95) {
  return embeddings.map((embedding, index) => {
    const weight = Math.pow(decayRate, index);
    return embedding.map(value => value * weight);
  });
}

/**
 * Clusters episodic embeddings based on similarity.
 * Groups embeddings into clusters to compress less relevant data.
 */
export function clusterEmbeddings(embeddings, similarityThreshold = 0.8) {
  const clusters = [];

  embeddings.forEach(embedding => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const similarity = calculateCosineSimilarity(cluster.centroid, embedding);
      if (similarity >= similarityThreshold) {
        cluster.members.push(embedding);
        cluster.centroid = updateCentroid(cluster.members);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        members: [embedding],
        centroid: embedding
      });
    }
  });

  return clusters;
}

/**
 * Calculates cosine similarity between two vectors.
 */
export function calculateCosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, value) => sum + value * value, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Updates the centroid of a cluster.
 * Calculates the mean vector from all cluster members.
 */
export function updateCentroid(members) {
  const numMembers = members.length;
  const dimension = members[0].length;

  const centroid = new Array(dimension).fill(0);
  members.forEach(member => {
    member.forEach((value, index) => {
      centroid[index] += value;
    });
  });

  return centroid.map(value => value / numMembers);
}

/**
 * Utility to normalize embeddings.
 * Ensures consistent scale for all vectors.
 */
export function normalizeEmbeddings(embeddings) {
  return embeddings.map(embedding => {
    const magnitude = Math.sqrt(embedding.reduce((sum, value) => sum + value * value, 0));
    return embedding.map(value => value / magnitude);
  });
}

/**
 * Episodic memory manager: orchestrates memory hierarchy.
 * Combines decay, clustering, and normalization for context retention.
 */
export function manageEpisodicMemory(embeddings, decayRate = 0.95, similarityThreshold = 0.8) {
  const normalizedEmbeddings = normalizeEmbeddings(embeddings);
  const decayedEmbeddings = applyTemporalDecay(normalizedEmbeddings, decayRate);
  return clusterEmbeddings(decayedEmbeddings, similarityThreshold);
}
