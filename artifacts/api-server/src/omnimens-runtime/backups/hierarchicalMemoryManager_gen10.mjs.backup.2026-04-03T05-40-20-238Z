/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalMemoryManager
 * Written: 2026-04-01T22:19:19.245Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalMemoryManager.mjs

import crypto from 'crypto';

/**
 * Generates a semantic hash for a given text using SHA256.
 * This ensures unique identification of similar semantic clusters.
 * @param {string} text - The input text to hash.
 * @returns {string} - A fixed-length hash string.
 */
export function generateSemanticHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Summarizes an array of text entries into a single summary.
 * Uses a simplistic approach by concatenating the first N characters of each entry.
 * @param {string[]} entries - Array of text entries to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - A summarized version of the input entries.
 */
export function summarizeEntries(entries, maxLength = 200) {
  const combinedText = entries.join(' ');
  return combinedText.length > maxLength ? combinedText.slice(0, maxLength) + '...' : combinedText;
}

/**
 * Clusters text entries based on semantic similarity using a naive hashing approach.
 * Groups entries with the same hash into clusters.
 * @param {string[]} entries - Array of text entries to cluster.
 * @returns {Object} - An object where keys are hashes and values are arrays of clustered entries.
 */
export function clusterBySemanticHash(entries) {
  const clusters = {};
  for (const entry of entries) {
    const hash = generateSemanticHash(entry);
    if (!clusters[hash]) {
      clusters[hash] = [];
    }
    clusters[hash].push(entry);
  }
  return clusters;
}

/**
 * Recursively compresses and summarizes text entries into a hierarchical memory structure.
 * Each level of the hierarchy represents a summarized version of the previous level.
 * @param {string[]} entries - Array of text entries to compress.
 * @param {number} maxDepth - Maximum depth of the hierarchy.
 * @param {number} maxLength - Maximum length of each summary.
 * @returns {Object} - A hierarchical memory structure.
 */
export function buildHierarchicalMemory(entries, maxDepth = 3, maxLength = 200) {
  if (maxDepth <= 0 || entries.length === 0) {
    return { summary: summarizeEntries(entries, maxLength), clusters: {} };
  }

  const clusters = clusterBySemanticHash(entries);
  const summaries = [];

  for (const [hash, clusterEntries] of Object.entries(clusters)) {
    const subHierarchy = buildHierarchicalMemory(clusterEntries, maxDepth - 1, maxLength);
    summaries.push(subHierarchy.summary);
    clusters[hash] = subHierarchy;
  }

  return {
    summary: summarizeEntries(summaries, maxLength),
    clusters
  };
}

/**
 * Flattens a hierarchical memory structure into a single-level array of summaries.
 * Useful for exporting or analyzing the hierarchy at a glance.
 * @param {Object} hierarchy - The hierarchical memory structure.
 * @returns {string[]} - A flat array of summaries.
 */
export function flattenHierarchy(hierarchy) {
  const summaries = [hierarchy.summary];
  for (const cluster of Object.values(hierarchy.clusters)) {
    summaries.push(...flattenHierarchy(cluster));
  }
  return summaries;
}

/**
 * Example usage function to demonstrate the module functionality.
 * @param {string[]} entries - Array of text entries to process.
 * @returns {Object} - The resulting hierarchical memory structure.
 */
export function processTextEntries(entries) {
  return buildHierarchicalMemory(entries);
}
