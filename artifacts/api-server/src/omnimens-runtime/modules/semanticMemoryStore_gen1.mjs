/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryStore
 * Written: 2026-03-22T18:19:44.984Z
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
 * @module semanticMemoryStore
 * @description A semantic memory store for storing and retrieving semantically similar data points using KD-tree and cosine similarity.
 */

/**
 * Generates a normalized vector (embedding) for a given input array.
 * @param {number[]} vector - An array of numbers representing the input vector.
 * @returns {number[]} A normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitude === 0) throw new Error("Cannot normalize a zero vector.");
  return vector.map((val) => val / magnitude);
}

/**
 * Computes the cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimensions.");
  }
  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));
  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Cannot compute similarity with a zero vector.");
  }
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * A KD-tree node class for storing data points and their embeddings.
 */
class KDTreeNode {
  constructor(point, embedding, axis) {
    this.point = point;
    this.embedding = embedding;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

/**
 * KD-tree class for efficient nearest neighbor search.
 */
export class KDTree {
  /**
   * Creates a KDTree instance.
   * @param {{point: any, embedding: number[]}[]} data - Array of objects with `point` and `embedding` properties.
   */
  constructor(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Data must be a non-empty array.");
    }
    this.root = this.buildTree(data, 0);
  }

  /**
   * Builds the KD-tree recursively.
   * @param {{point: any, embedding: number[]}[]} data - Data to build the tree.
   * @param {number} depth - Current depth in the tree.
   * @returns {KDTreeNode} Root node of the KD-tree.
   */
  buildTree(data, depth) {
    if (data.length === 0) return null;

    const axis = depth % data[0].embedding.length;
    data.sort((a, b) => a.embedding[axis] - b.embedding[axis]);
    const medianIndex = Math.floor(data.length / 2);

    const node = new KDTreeNode(
      data[medianIndex].point,
      data[medianIndex].embedding,
      axis
    );

    node.left = this.buildTree(data.slice(0, medianIndex), depth + 1);
    node.right = this.buildTree(data.slice(medianIndex + 1), depth + 1);

    return node;
  }

  /**
   * Searches for the nearest neighbor to a given embedding.
   * @param {number[]} targetEmbedding - The embedding to search for.
   * @returns {any} The point with the nearest embedding.
   */
  nearestNeighbor(targetEmbedding) {
    if (!Array.isArray(targetEmbedding)) {
      throw new Error("Target embedding must be an array.");
    }

    let best = { node: null, distance: Infinity };

    const search = (node, depth) => {
      if (!node) return;

      const axis = depth % targetEmbedding.length;
      const distance = 1 - cosineSimilarity(targetEmbedding, node.embedding);

      if (distance < best.distance) {
        best = { node, distance };
      }

      const diff = targetEmbedding[axis] - node.embedding[axis];
      const [near, far] = diff <= 0 ? [node.left, node.right] : [node.right, node.left];

      search(near, depth + 1);
      if (Math.abs(diff) < best.distance) {
        search(far, depth + 1);
      }
    };

    search(this.root, 0);
    return best.node ? best.node.point : null;
  }
}

/**
 * Stores and retrieves semantically similar data points.
 */
export class SemanticMemoryStore {
  constructor() {
    this.data = [];
    this.tree = null;
  }

  /**
   * Adds a data point and its embedding to the memory store.
   * @param {any} point - The data point to store.
   * @param {number[]} embedding - The embedding representing the data point.
   */
  add(point, embedding) {
    if (!Array.isArray(embedding)) {
      throw new Error("Embedding must be an array.");
    }
    this.data.push({ point, embedding: normalizeVector(embedding) });
    this.tree = new KDTree(this.data);
  }

  /**
   * Retrieves the most semantically similar data point to the given embedding.
   * @param {number[]} embedding - The embedding to search for.
   * @returns {any} The most similar data point.
   */
  retrieve(embedding) {
    if (!this.tree) {
      throw new Error("Memory store is empty.");
    }
    return this.tree.nearestNeighbor(normalizeVector(embedding));
  }
}