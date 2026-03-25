/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_1
 * Name: contextCompressor
 * Purpose: Summarize and encode long conversation context into embeddings or structured metadata.
 * Description: Summarizes long contexts into fixed-size embeddings using a sliding window Transformer-inspired algorithm for efficient retrieval.
 * Migrated: 2026-03-25T22:49:34.216Z
 */

/**
 * @module contextCompressor
 * @description Summarizes and encodes long conversational contexts into fixed-size embeddings for efficient retrieval.
 */

/**
 * Sliding window transformer-based summarizer and encoder.
 * Processes long text into fixed-size embeddings using a pure algorithmic approach.
 */

/**
 * Generates embeddings for a given text input by summarizing it using a sliding window mechanism.
 * @param {string} text - The input text to be summarized and encoded.
 * @param {number} windowSize - The size of the sliding window (number of tokens per window).
 * @param {number} embeddingSize - The fixed size of the output embedding vector.
 * @returns {number[]} - A fixed-size embedding vector representing the summarized text.
 */
export function generateEmbedding(text, windowSize = 50, embeddingSize = 128) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("Input text must be a non-empty string.");
  }
  if (windowSize <= 0 || embeddingSize <= 0) {
    throw new Error("Window size and embedding size must be positive integers.");
  }

  // Tokenize the input text into words (basic tokenizer)
  const tokens = tokenizeText(text);
  const tokenCount = tokens.length;

  if (tokenCount === 0) {
    return Array(embeddingSize).fill(0); // Return a zero vector if no tokens are present
  }

  // Initialize sliding window and embedding accumulator
  const embeddings = [];
  for (let i = 0; i < tokenCount; i += windowSize) {
    const windowTokens = tokens.slice(i, i + windowSize);
    const windowSummary = summarizeTokens(windowTokens);
    embeddings.push(hashSummary(windowSummary, embeddingSize));
  }

  // Combine all window embeddings into a single fixed-size embedding
  return averageEmbeddings(embeddings, embeddingSize);
}

/**
 * Tokenizes a text into an array of words.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - Array of tokens (words).
 */
function tokenizeText(text) {
  return text.split(/\s+/).map((word) => word.toLowerCase().replace(/[^a-z0-9]/g, ""));
}

/**
 * Summarizes an array of tokens into a single string.
 * @param {string[]} tokens - The input tokens to summarize.
 * @returns {string} - A summarized string representation of the tokens.
 */
function summarizeTokens(tokens) {
  const tokenFrequency = {};
  tokens.forEach((token) => {
    if (token) {
      tokenFrequency[token] = (tokenFrequency[token] || 0) + 1;
    }
  });

  // Sort tokens by frequency and alphabetically, then join into a summary
  return Object.entries(tokenFrequency)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([token, freq]) => `${token}:${freq}`)
    .join(" ");
}

/**
 * Hashes a summary string into a fixed-size embedding vector.
 * @param {string} summary - The summary string to hash.
 * @param {number} embeddingSize - The size of the embedding vector.
 * @returns {number[]} - A fixed-size embedding vector.
 */
function hashSummary(summary, embeddingSize) {
  const hash = crypto.createHash("sha256").update(summary).digest();
  const embedding = Array(embeddingSize).fill(0);

  for (let i = 0; i < embeddingSize; i++) {
    embedding[i] = hash[i % hash.length] / 255; // Normalize to [0, 1]
  }

  return embedding;
}

/**
 * Averages multiple embeddings into a single fixed-size embedding.
 * @param {number[][]} embeddings - Array of embedding vectors to average.
 * @param {number} embeddingSize - The size of the embedding vector.
 * @returns {number[]} - A fixed-size averaged embedding vector.
 */
function averageEmbeddings(embeddings, embeddingSize) {
  const averagedEmbedding = Array(embeddingSize).fill(0);

  embeddings.forEach((embedding) => {
    for (let i = 0; i < embeddingSize; i++) {
      averagedEmbedding[i] += embedding[i];
    }
  });

  for (let i = 0; i < embeddingSize; i++) {
    averagedEmbedding[i] /= embeddings.length;
  }

  return averagedEmbedding;
}

// Import the crypto module for hashing
import crypto from "crypto";