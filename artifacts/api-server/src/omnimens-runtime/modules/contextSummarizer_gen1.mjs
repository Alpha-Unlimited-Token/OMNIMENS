/**
 * @module contextSummarizer
 * @description Summarizes earlier context into a compact representation using semantic embeddings and extractive summarization.
 */

/**
 * Generates a semantic embedding for a given text using a simple bag-of-words approach.
 * @param {string} text - The input text to embed.
 * @returns {Object} A frequency map representing the semantic embedding of the text.
 */
function generateSemanticEmbedding(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return words.reduce((embedding, word) => {
    embedding[word] = (embedding[word] || 0) + 1;
    return embedding;
  }, {});
}

/**
 * Calculates the cosine similarity between two semantic embeddings.
 * @param {Object} embeddingA - The first semantic embedding.
 * @param {Object} embeddingB - The second semantic embedding.
 * @returns {number} The cosine similarity between the two embeddings (0 to 1).
 */
function calculateCosineSimilarity(embeddingA, embeddingB) {
  const allKeys = new Set([...Object.keys(embeddingA), ...Object.keys(embeddingB)]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of allKeys) {
    const valueA = embeddingA[key] || 0;
    const valueB = embeddingB[key] || 0;
    dotProduct += valueA * valueB;
    magnitudeA += valueA ** 2;
    magnitudeB += valueB ** 2;
  }

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Extracts key sentences from the input text based on semantic similarity to the overall context.
 * @param {string} text - The input text to summarize.
 * @param {number} maxSentences - The maximum number of sentences to include in the summary.
 * @returns {string} A compact summary of the input text.
 */
function extractiveSummarization(text, maxSentences = 3) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  if (sentences.length <= maxSentences) return text;

  const contextEmbedding = generateSemanticEmbedding(text);
  const scoredSentences = sentences.map(sentence => {
    const sentenceEmbedding = generateSemanticEmbedding(sentence);
    const similarity = calculateCosineSimilarity(contextEmbedding, sentenceEmbedding);
    return { sentence, similarity };
  });

  scoredSentences.sort((a, b) => b.similarity - a.similarity);
  return scoredSentences.slice(0, maxSentences).map(s => s.sentence.trim()).join(' ');
}

/**
 * Summarizes a series of context entries into a compact representation.
 * @param {string[]} contexts - An array of context strings to summarize.
 * @param {number} maxTokens - The maximum token length for the summary.
 * @returns {string} A compact summary of the provided contexts.
 */
function summarizeContexts(contexts, maxTokens = 500) {
  const combinedContext = contexts.join(' ');
  const summary = extractiveSummarization(combinedContext);

  // Truncate the summary to fit within the token limit
  if (summary.length > maxTokens) {
    return summary.slice(0, maxTokens) + '...';
  }
  return summary;
}

// Exported functions
export { generateSemanticEmbedding, calculateCosineSimilarity, extractiveSummarization, summarizeContexts };