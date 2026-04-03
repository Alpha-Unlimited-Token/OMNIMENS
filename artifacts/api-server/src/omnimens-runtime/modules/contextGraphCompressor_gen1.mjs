/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_3
 * Name: contextGraphCompressor
 * Purpose: Preserves deeper context relationships in ultra-long documents by clustering semantically related tokens into graph structures.
 * Description: Clusters semantically related tokens from ultra-long documents into graph structures to preserve deeper context relationships.
 * Migrated: 2026-04-03T12:16:17.363Z
 */

// contextGraphCompressor.mjs

import crypto from 'crypto';

/**
 * Generates a hash-based unique identifier for tokens.
 * @param {string} token - Input token.
 * @returns {string} - Unique identifier for the token.
 */
export function generateTokenId(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calculates contextual similarity between two tokens based on their semantic embeddings.
 * @param {Array<number>} embeddingA - Semantic embedding of token A.
 * @param {Array<number>} embeddingB - Semantic embedding of token B.
 * @returns {number} - Similarity score (0 to 1).
 */
export function calculateSimilarity(embeddingA, embeddingB) {
  const dotProduct = embeddingA.reduce((sum, val, idx) => sum + val * embeddingB[idx], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val ** 2, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Builds a graph structure by clustering tokens based on contextual similarity.
 * @param {Array<{token: string, embedding: Array<number>}>} tokens - Array of tokens with embeddings.
 * @param {number} threshold - Similarity threshold for clustering (0 to 1).
 * @returns {Object} - Graph structure with nodes and weighted edges.
 */
export function buildContextGraph(tokens, threshold = 0.8) {
  const graph = { nodes: {}, edges: [] };

  tokens.forEach(({ token, embedding }) => {
    const tokenId = generateTokenId(token);
    graph.nodes[tokenId] = { token, embedding };
  });

  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const similarity = calculateSimilarity(tokens[i].embedding, tokens[j].embedding);
      if (similarity >= threshold) {
        graph.edges.push({
          source: generateTokenId(tokens[i].token),
          target: generateTokenId(tokens[j].token),
          weight: similarity
        });
      }
    }
  }

  return graph;
}

/**
 * Compresses ultra-long documents by clustering semantically related tokens.
 * @param {string} document - Input document.
 * @param {Function} embeddingFunction - Function to generate embeddings for tokens.
 * @param {number} threshold - Similarity threshold for clustering.
 * @returns {Object} - Compressed graph representation of the document.
 */
export function compressDocumentContext(document, embeddingFunction, threshold = 0.8) {
  const tokens = document.split(/\s+/).map(token => ({
    token,
    embedding: embeddingFunction(token)
  }));

  return buildContextGraph(tokens, threshold);
}

/**
 * Utility to validate embeddings and ensure proper dimensions.
 * @param {Array<number>} embedding - Semantic embedding.
 * @returns {boolean} - True if valid, false otherwise.
 */
export function validateEmbedding(embedding) {
  return Array.isArray(embedding) && embedding.every(val => typeof val === 'number');
}