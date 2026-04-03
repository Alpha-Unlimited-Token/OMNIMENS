/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_7
 * Name: hierarchicalMemoryNetwork
 * Purpose: Efficiently segment and retrieve long contexts by clustering them into thematic hierarchies.
 * Description: A utility module for hierarchical memory segmentation, clustering, and retrieval using cosine similarity and metadata tagging.
 * Migrated: 2026-04-03T02:20:50.782Z
 */

// hierarchicalMemoryNetwork.mjs

import { createHash } from 'crypto';

/**
 * Calculates cosine similarity between two vectors.
 * @param {number[]} vecA - First vector.
 * @param {number[]} vecB - Second vector.
 * @returns {number} - Cosine similarity score (-1 to 1).
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) throw new Error('Vectors must be of the same length');

  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Generates a unique hash for a given input string.
 * @param {string} input - Input string to hash.
 * @returns {string} - SHA-256 hash of the input.
 */
export function generateHash(input) {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Clusters context entries into thematic groups based on cosine similarity.
 * @param {Object[]} contexts - Array of context objects with { id, vector, metadata }.
 * @param {number} threshold - Similarity threshold for clustering (0 to 1).
 * @returns {Object[]} - Hierarchical clusters of contexts.
 */
export function clusterContexts(contexts, threshold = 0.8) {
  const clusters = [];

  contexts.forEach((context) => {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const similarity = cosineSimilarity(context.vector, cluster.representative.vector);
      if (similarity >= threshold) {
        cluster.members.push(context);
        cluster.representative.vector = cluster.members
          .reduce((sumVec, member) => sumVec.map((val, i) => val + member.vector[i]), Array(context.vector.length).fill(0))
          .map((val) => val / cluster.members.length);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        representative: { ...context },
        members: [context]
      });
    }
  });

  return clusters;
}

/**
 * Recursively builds a hierarchical memory structure from context data.
 * @param {Object[]} contexts - Array of context objects with { id, vector, metadata }.
 * @param {number} threshold - Similarity threshold for clustering (0 to 1).
 * @returns {Object} - Hierarchical memory structure.
 */
export function buildHierarchicalMemory(contexts, threshold = 0.8) {
  if (contexts.length <= 1) return contexts;

  const clusters = clusterContexts(contexts, threshold);

  return clusters.map((cluster) => {
    if (cluster.members.length > 1) {
      return {
        id: generateHash(cluster.representative.id),
        metadata: cluster.representative.metadata,
        children: buildHierarchicalMemory(cluster.members, threshold)
      };
    } else {
      return cluster.members[0];
    }
  });
}

/**
 * Retrieves relevant contexts from the hierarchical memory structure.
 * @param {Object} hierarchy - Hierarchical memory structure.
 * @param {number[]} queryVector - Query vector for similarity comparison.
 * @param {number} threshold - Similarity threshold for retrieval (0 to 1).
 * @returns {Object[]} - Array of relevant context objects.
 */
export function retrieveContexts(hierarchy, queryVector, threshold = 0.8) {
  const results = [];

  function traverse(node) {
    if (node.children) {
      const similarity = cosineSimilarity(queryVector, node.children[0].vector);
      if (similarity >= threshold) {
        node.children.forEach(traverse);
      }
    } else {
      const similarity = cosineSimilarity(queryVector, node.vector);
      if (similarity >= threshold) results.push(node);
    }
  }

  hierarchy.forEach(traverse);
  return results;
}

/**
 * Segments and processes raw text into context objects with metadata and vectors.
 * @param {string} text - Raw input text.
 * @param {Function} vectorizeFunction - Function to convert text into vectors.
 * @returns {Object[]} - Array of context objects with { id, vector, metadata }.
 */
export function segmentTextToContexts(text, vectorizeFunction) {
  const segments = text.split(/\n\n|\.\s+/).filter(Boolean);

  return segments.map((segment, index) => ({
    id: `segment-${index}-${generateHash(segment)}`,
    vector: vectorizeFunction(segment),
    metadata: { length: segment.length, index }
  }));
}