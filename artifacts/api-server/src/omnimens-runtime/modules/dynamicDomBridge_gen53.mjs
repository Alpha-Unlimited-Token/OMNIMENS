/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicDomBridge
 * Written: 2026-04-02T14:17:46.151Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicDomBridge.mjs

import { URL } from 'url';

/**
 * Utility function to parse a URL and extract its components.
 * @param {string} urlString - The URL string to parse.
 * @returns {Object} Parsed URL components: protocol, hostname, pathname, searchParams.
 */
export function parseUrl(urlString) {
  try {
    const url = new URL(urlString);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams.entries())
    };
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
}

/**
 * Utility function to traverse and extract data from a DOM-like structure.
 * @param {Object} domNode - A simulated DOM node object with children.
 * @param {Function} filterFunction - A function to filter nodes during traversal.
 * @returns {Array} Extracted data matching the filter criteria.
 */
export function traverseDom(domNode, filterFunction) {
  const result = [];

  function recursiveTraverse(node) {
    if (filterFunction(node)) {
      result.push(node);
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(recursiveTraverse);
    }
  }

  recursiveTraverse(domNode);
  return result;
}

/**
 * Utility function to compute similarity between two vectors.
 * @param {Array<number>} vectorA - The first vector.
 * @param {Array<number>} vectorB - The second vector.
 * @returns {number} Cosine similarity score between the vectors.
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length.');
  }

  const dotProduct = vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error('Vectors must not be zero vectors.');
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility function to generate a random vector of specified length.
 * @param {number} length - The length of the vector.
 * @returns {Array<number>} Randomly generated vector.
 */
export function generateRandomVector(length) {
  if (length <= 0) {
    throw new Error('Vector length must be a positive integer.');
  }

  return Array.from({ length }, () => Math.random());
}

/**
 * Utility function to normalize a vector.
 * @param {Array<number>} vector - The vector to normalize.
 * @returns {Array<number>} Normalized vector.
 */
export function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));

  if (magnitude === 0) {
    throw new Error('Cannot normalize a zero vector.');
  }

  return vector.map(val => val / magnitude);
}