/**
 * @module hierarchicalMemoryManager
 * @description This module manages hierarchical memory by summarizing and chunking older context for efficient long-conversation retrieval.
 * It uses recursive summarization and embedding-based similarity search to organize and retrieve relevant information.
 */

/**
 * Summarizes a block of text into a shorter representation.
 * @param {string} text - The input text to summarize.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - The summarized text.
 */
export function summarizeText(text, maxLength) {
  if (typeof text !== 'string' || typeof maxLength !== 'number' || maxLength <= 0) {
    throw new Error('Invalid input: text must be a string and maxLength must be a positive number.');
  }

  if (text.length <= maxLength) {
    return text; // No summarization needed if text is already short.
  }

  const sentences = text.split(/(?<=[.!?])\s+/); // Split text into sentences.
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) {
      break;
    }
    summary += sentence + ' ';
  }

  return summary.trim();
}

/**
 * Chunks a large text into smaller pieces of specified size.
 * @param {string} text - The input text to chunk.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {string[]} - Array of text chunks.
 */
export function chunkText(text, chunkSize) {
  if (typeof text !== 'string' || typeof chunkSize !== 'number' || chunkSize <= 0) {
    throw new Error('Invalid input: text must be a string and chunkSize must be a positive number.');
  }

  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Calculates a simple embedding vector for a text based on character code sums.
 * @param {string} text - The input text to embed.
 * @returns {number[]} - A simple embedding vector.
 */
export function calculateEmbedding(text) {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string.');
  }

  const embedding = Array(128).fill(0); // Fixed size vector for simplicity.

  for (const char of text) {
    const index = char.charCodeAt(0) % 128;
    embedding[index] += 1;
  }

  return embedding;
}

/**
 * Finds the most similar text chunk based on embedding similarity.
 * @param {string} query - The query text to match.
 * @param {string[]} chunks - Array of text chunks to search.
 * @returns {string} - The most similar chunk.
 */
export function findMostSimilarChunk(query, chunks) {
  if (typeof query !== 'string' || !Array.isArray(chunks)) {
    throw new Error('Invalid input: query must be a string and chunks must be an array of strings.');
  }

  const queryEmbedding = calculateEmbedding(query);

  let bestMatch = null;
  let highestSimilarity = -Infinity;

  for (const chunk of chunks) {
    const chunkEmbedding = calculateEmbedding(chunk);
    const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = chunk;
    }
  }

  return bestMatch;
}

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vectorA - First vector.
 * @param {number[]} vectorB - Second vector.
 * @returns {number} - Cosine similarity score.
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length.');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] ** 2;
    magnitudeB += vectorB[i] ** 2;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

/**
 * Hierarchically manages memory by summarizing and chunking older context.
 * @param {string[]} contextBlocks - Array of context blocks to process.
 * @param {number} maxSummaryLength - Maximum length of each summary.
 * @param {number} chunkSize - Maximum size of each chunk.
 * @returns {Object} - Object containing summarized and chunked context.
 */
export function hierarchicalMemoryManager(contextBlocks, maxSummaryLength, chunkSize) {
  if (!Array.isArray(contextBlocks) || typeof maxSummaryLength !== 'number' || typeof chunkSize !== 'number') {
    throw new Error('Invalid input: contextBlocks must be an array, maxSummaryLength and chunkSize must be numbers.');
  }

  const summarizedBlocks = contextBlocks.map(block => summarizeText(block, maxSummaryLength));
  const allChunks = summarizedBlocks.flatMap(block => chunkText(block, chunkSize));

  return {
    summaries: summarizedBlocks,
    chunks: allChunks
  };
}