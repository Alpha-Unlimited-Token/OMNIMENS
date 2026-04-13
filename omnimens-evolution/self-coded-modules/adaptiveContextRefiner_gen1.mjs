/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: adaptiveContextRefiner
 * Purpose: Dynamically compress and refine large contexts into hierarchical summaries for extended reasoning.
 * Description: Dynamically compresses and refines large contexts into hierarchical summaries for extended reasoning using recursive summarization and clustering.
 * Migrated: 2026-04-02T16:53:57.939Z
 */

// adaptiveContextRefiner.mjs

import { createHash } from 'crypto';

/**
 * Utility function to compute a hash for clustering contexts.
 * @param {string} input - The input string to hash.
 * @returns {string} - A SHA-256 hash of the input.
 */
export function computeHash(input) {
  const hash = createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

/**
 * Scores importance of a segment based on length and keyword density.
 * @param {string} segment - The text segment to score.
 * @param {Array<string>} keywords - List of keywords to prioritize.
 * @returns {number} - Importance score.
 */
export function scoreImportance(segment, keywords) {
  const lengthScore = Math.min(segment.length / 100, 1); // Normalize length score.
  const keywordMatches = keywords.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    return count + (segment.match(regex)?.length || 0);
  }, 0);
  const keywordDensity = Math.min(keywordMatches / keywords.length, 1); // Normalize density.
  return lengthScore * 0.5 + keywordDensity * 0.5; // Weighted scoring.
}

/**
 * Clusters text segments by semantic similarity using hashing.
 * @param {Array<string>} segments - List of text segments.
 * @returns {Object} - Clusters mapped by hash keys.
 */
export function clusterSegments(segments) {
  const clusters = {};
  for (const segment of segments) {
    const hashKey = computeHash(segment.slice(0, 50)); // Use first 50 chars for hashing.
    if (!clusters[hashKey]) clusters[hashKey] = [];
    clusters[hashKey].push(segment);
  }
  return clusters;
}

/**
 * Recursively summarizes clusters into hierarchical summaries.
 * @param {Object} clusters - Clusters mapped by hash keys.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {Array<string>} - Hierarchical summaries.
 */
export function summarizeClusters(clusters, keywords) {
  const summaries = [];
  for (const [hashKey, cluster] of Object.entries(clusters)) {
    const sortedSegments = cluster.sort((a, b) => scoreImportance(b, keywords) - scoreImportance(a, keywords));
    const topSegment = sortedSegments[0];
    summaries.push(topSegment);
  }
  return summaries;
}

/**
 * Main function to refine large contexts into hierarchical summaries.
 * @param {Array<string>} contextSegments - List of context segments.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {Array<string>} - Final hierarchical summaries.
 */
export function refineContext(contextSegments, keywords) {
  let currentSegments = contextSegments;
  let iteration = 0;

  while (currentSegments.length > 10 && iteration < 5) { // Limit iterations to avoid infinite loops.
    const clusters = clusterSegments(currentSegments);
    currentSegments = summarizeClusters(clusters, keywords);
    iteration++;
  }

  return currentSegments;
}

/**
 * Utility function to extract key content from a large text.
 * @param {string} text - The full text to process.
 * @param {Array<string>} keywords - Keywords to prioritize.
 * @returns {Array<string>} - Key content segments.
 */
export function extractKeyContent(text, keywords) {
  const sentences = text.split(/(?<!\w\.\w\.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s+/); // Split by sentence boundaries.
  return sentences.filter(sentence => scoreImportance(sentence, keywords) > 0.5); // Filter by importance.
}

/**
 * Example usage function.
 * @returns {void}
 */
export function exampleUsage() {
  const context = [
    "Large language models use transformer architectures for scalable training.",
    "Information compression is crucial for optimal data utilization.",
    "Few-shot learning techniques are advancing rapidly in AI research.",
    "Zero-shot learning enables models to generalize without task-specific training.",
    "Chain-of-thought prompting improves reasoning in large models."
  ];

  const keywords = ["learning", "compression", "transformer", "AI"];
  const refinedSummaries = refineContext(context, keywords);
  console.log(refinedSummaries);
}

// Uncomment the following line to test the module in isolation.
// exampleUsage();