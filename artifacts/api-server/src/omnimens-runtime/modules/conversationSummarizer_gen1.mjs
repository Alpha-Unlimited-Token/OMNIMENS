/**
 * @module conversationSummarizer
 * @description Summarizes and embeds earlier conversational context dynamically to extend coherence beyond token window limitations.
 */

/**
 * Performs sentiment analysis on a given text.
 * @param {string} text - The input text to analyze.
 * @returns {string} - Sentiment of the text ('positive', 'neutral', 'negative').
 */
function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy', 'success'];
  const negativeWords = ['bad', 'poor', 'terrible', 'negative', 'sad', 'failure'];

  let positiveCount = 0;
  let negativeCount = 0;

  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Clusters conversational context into key points based on semantic similarity.
 * @param {Array<string>} contextArray - Array of conversational strings.
 * @returns {Array<string>} - Array of condensed key points.
 */
function clusterContext(contextArray) {
  const clusters = [];

  for (const text of contextArray) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      if (areSemanticallySimilar(text, cluster[0])) {
        cluster.push(text);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) clusters.push([text]);
  }

  return clusters.map(cluster => summarizeCluster(cluster));
}

/**
 * Determines if two texts are semantically similar.
 * @param {string} text1 - First text.
 * @param {string} text2 - Second text.
 * @returns {boolean} - True if semantically similar, false otherwise.
 */
function areSemanticallySimilar(text1, text2) {
  const commonWordsThreshold = 0.3;

  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const commonWords = [...words1].filter(word => words2.has(word));
  const similarityRatio = commonWords.length / Math.min(words1.size, words2.size);

  return similarityRatio >= commonWordsThreshold;
}

/**
 * Summarizes a cluster of texts into a single key point.
 * @param {Array<string>} cluster - Array of texts in the cluster.
 * @returns {string} - Condensed summary of the cluster.
 */
function summarizeCluster(cluster) {
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };

  for (const text of cluster) {
    const sentiment = analyzeSentiment(text);
    sentimentCounts[sentiment]++;
  }

  const dominantSentiment = Object.keys(sentimentCounts).reduce((a, b) => sentimentCounts[a] > sentimentCounts[b] ? a : b);

  return `Cluster Summary: ${cluster.join(' ')} | Sentiment: ${dominantSentiment}`;
}

/**
 * Summarizes and embeds earlier conversational context.
 * @param {Array<string>} contextArray - Array of conversational strings.
 * @returns {Array<string>} - Array of summarized key points.
 */
function summarizeAndEmbedContext(contextArray) {
  return clusterContext(contextArray);
}

module.exports = {
  analyzeSentiment,
  clusterContext,
  summarizeAndEmbedContext
};