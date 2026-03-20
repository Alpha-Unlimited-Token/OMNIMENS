// contextCompression.js

/**
 * Utility module for compressing earlier conversation context into embeddings to maintain coherence within token window limits.
 * Implements a simple sentence embedding model using cosine similarity to retrieve relevant parts of the context.
 */

const crypto = require('crypto');

/**
 * Generate a simple vector representation of a sentence using a hash-based embedding technique.
 * This is a placeholder for a more advanced embedding model like MiniLM.
 * @param {string} sentence - The sentence to embed.
 * @returns {number[]} - A fixed-length vector representation of the sentence.
 */
function embedSentence(sentence) {
  const hash = crypto.createHash('sha256').update(sentence).digest('hex');
  const vector = [];
  for (let i = 0; i < hash.length; i += 8) {
    vector.push(parseInt(hash.substring(i, i + 8), 16) / 0xffffffff);
  }
  return vector;
}

/**
 * Calculate cosine similarity between two vectors.
 * @param {number[]} vectorA - The first vector.
 * @param {number[]} vectorB - The second vector.
 * @returns {number} - The cosine similarity between the two vectors.
 */
function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Compress earlier conversation context by embedding sentences and retrieving the most relevant parts.
 * @param {string[]} context - Array of earlier conversation sentences.
 * @param {string} currentInput - The current input sentence to maintain coherence with.
 * @param {number} maxSentences - Maximum number of sentences to retrieve.
 * @returns {string[]} - The most relevant sentences from the context.
 */
function compressContext(context, currentInput, maxSentences) {
  const inputEmbedding = embedSentence(currentInput);
  const scoredContext = context.map((sentence) => {
    const sentenceEmbedding = embedSentence(sentence);
    const similarity = cosineSimilarity(inputEmbedding, sentenceEmbedding);
    return { sentence, similarity };
  });

  scoredContext.sort((a, b) => b.similarity - a.similarity);
  return scoredContext.slice(0, maxSentences).map((item) => item.sentence);
}

/**
 * Exported functions.
 */
module.exports = {
  embedSentence,
  cosineSimilarity,
  compressContext
};