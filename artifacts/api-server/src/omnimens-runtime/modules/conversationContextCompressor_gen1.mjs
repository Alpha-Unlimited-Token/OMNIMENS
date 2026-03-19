/**
 * @module conversationContextCompressor
 * @description Summarizes and compresses conversation history using hierarchical clustering and semantic similarity scoring.
 */

/**
 * Compresses conversation history by extracting key points based on semantic similarity and clustering.
 * @param {Array<string>} conversationHistory - Array of conversation strings in chronological order.
 * @param {number} maxSummaryLength - Maximum number of key points to retain in the summary.
 * @returns {Array<string>} Compressed summary of the conversation.
 */
export function compressConversationHistory(conversationHistory, maxSummaryLength) {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) {
    throw new Error("conversationHistory must be a non-empty array of strings.");
  }

  if (typeof maxSummaryLength !== "number" || maxSummaryLength <= 0) {
    throw new Error("maxSummaryLength must be a positive number.");
  }

  // Step 1: Tokenize and vectorize conversation entries using a simple word frequency approach
  const tokenize = (text) => text.toLowerCase().split(/\W+/).filter(Boolean);

  const vectorize = (tokens) => {
    const frequencyMap = {};
    tokens.forEach((token) => {
      frequencyMap[token] = (frequencyMap[token] || 0) + 1;
    });
    return frequencyMap;
  };

  const vectorizedEntries = conversationHistory.map((entry) => vectorize(tokenize(entry)));

  // Step 2: Compute semantic similarity between entries using cosine similarity
  const cosineSimilarity = (vecA, vecB) => {
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    allKeys.forEach((key) => {
      const valA = vecA[key] || 0;
      const valB = vecB[key] || 0;
      dotProduct += valA * valB;
      magnitudeA += valA ** 2;
      magnitudeB += valB ** 2;
    });

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  };

  // Step 3: Hierarchical clustering based on similarity scores
  const clusters = conversationHistory.map((entry, index) => ({
    id: index,
    text: entry,
    members: [index],
  }));

  while (clusters.length > maxSummaryLength) {
    let maxSimilarity = -1;
    let mergeIndexA = -1;
    let mergeIndexB = -1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const similarity = cosineSimilarity(
          vectorizedEntries[clusters[i].members[0]],
          vectorizedEntries[clusters[j].members[0]]
        );

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mergeIndexA = i;
          mergeIndexB = j;
        }
      }
    }

    if (mergeIndexA !== -1 && mergeIndexB !== -1) {
      const mergedCluster = {
        id: clusters[mergeIndexA].id,
        text: clusters[mergeIndexA].text + " " + clusters[mergeIndexB].text,
        members: [...clusters[mergeIndexA].members, ...clusters[mergeIndexB].members],
      };

      clusters.splice(mergeIndexB, 1);
      clusters.splice(mergeIndexA, 1, mergedCluster);
    }
  }

  // Step 4: Extract key points from the final clusters
  const summary = clusters.map((cluster) => {
    const representativeIndex = cluster.members[0];
    return conversationHistory[representativeIndex];
  });

  return summary;
}

/**
 * Example usage of the module.
 * Uncomment the following lines to test the function in Node.js.
 */
// const history = [
//   "What is the latest in AI research?",
//   "Tell me about AI safety techniques.",
//   "What are the advancements in AI reasoning?",
//   "Explain AI metacognition and self-reflection.",
// ];
// console.log(compressConversationHistory(history, 2));