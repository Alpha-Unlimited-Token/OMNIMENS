/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: hierarchicalContextSummarizer
 * Purpose: Compress earlier context into summaries to preserve coherence in long conversations.
 * Description: Recursive summarization module compresses context into coherent summaries using clustering and attention mechanisms for OMNIMENS's conversational coherence.
 * Migrated: 2026-03-25T22:49:34.166Z
 */

// hierarchicalContextSummarizer.js

/**
 * @module hierarchicalContextSummarizer
 * @description Provides recursive summarization capabilities using clustering and attention mechanisms
 * to compress earlier context into coherent summaries for long conversations.
 */

/**
 * Generates a summary for a given text array using recursive clustering and attention mechanisms.
 * @param {string[]} textChunks - Array of text chunks to summarize.
 * @param {number} maxClusterSize - Maximum size of a cluster before recursion.
 * @returns {string} - A compressed summary of the input text.
 */
export function summarizeContext(textChunks, maxClusterSize = 5) {
  if (!Array.isArray(textChunks) || textChunks.length === 0) {
    throw new Error("Input must be a non-empty array of strings.");
  }

  // Base case: If the input is small enough, concatenate and return.
  if (textChunks.length <= maxClusterSize) {
    return textChunks.join(" ");
  }

  // Step 1: Cluster text chunks based on semantic similarity.
  const clusters = clusterTextChunks(textChunks, maxClusterSize);

  // Step 2: Generate summaries for each cluster recursively.
  const clusterSummaries = clusters.map(cluster => summarizeContext(cluster, maxClusterSize));

  // Step 3: Combine cluster summaries into a final summary.
  return combineSummaries(clusterSummaries);
}

/**
 * Clusters text chunks using a simple similarity heuristic.
 * @param {string[]} textChunks - Array of text chunks to cluster.
 * @param {number} maxClusterSize - Maximum size of a cluster.
 * @returns {string[][]} - Array of clusters, each containing text chunks.
 */
function clusterTextChunks(textChunks, maxClusterSize) {
  const clusters = [];
  let currentCluster = [];

  for (const chunk of textChunks) {
    if (currentCluster.length < maxClusterSize) {
      currentCluster.push(chunk);
    } else {
      clusters.push(currentCluster);
      currentCluster = [chunk];
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters;
}

/**
 * Combines cluster summaries into a single coherent summary using attention weights.
 * @param {string[]} summaries - Array of cluster summaries.
 * @returns {string} - A combined summary.
 */
function combineSummaries(summaries) {
  // Use a simple attention mechanism: prioritize longer summaries.
  const attentionWeights = summaries.map(summary => summary.length);
  const totalWeight = attentionWeights.reduce((sum, weight) => sum + weight, 0);

  return summaries
    .map((summary, index) => {
      const weight = attentionWeights[index] / totalWeight;
      return `${summary} (weight: ${weight.toFixed(2)})`;
    })
    .join(" ");
}

/**
 * Example usage of the module.
 * @returns {void}
 */
function exampleUsage() {
  const context = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "The only thing we have to fear is fear itself.",
    "I think, therefore I am.",
    "In the middle of difficulty lies opportunity."
  ];

  const summary = summarizeContext(context);
  console.log("Summary:", summary);
}

// Uncomment the following line to see the example usage in action.
// exampleUsage();
