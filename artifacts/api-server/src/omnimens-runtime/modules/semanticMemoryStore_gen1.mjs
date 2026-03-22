/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticMemoryStore
 * Written: 2026-03-22T18:58:40.734Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticMemoryStore.js

/**
 * @module semanticMemoryStore
 * @description Retains conversational memory by storing semantic embeddings of context in memory,
 * periodically summarizing older context to compress and retain relevance.
 */

/**
 * Generates a semantic embedding for a given text input using a simplified vectorization algorithm.
 * @param {string} text - The input text to be embedded.
 * @returns {number[]} - A fixed-length vector representing the semantic embedding of the text.
 */
export function generateEmbedding(text) {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const words = normalizedText.split(" ");
  const vectorLength = 128;
  const embedding = new Array(vectorLength).fill(0);

  for (const word of words) {
    const hash = crypto.createHash("md5").update(word).digest("hex");
    for (let i = 0; i < vectorLength; i++) {
      embedding[i] += parseInt(hash[i % hash.length], 16);
    }
  }

  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / magnitude);
}

/**
 * Calculates the cosine similarity between two semantic embeddings.
 * @param {number[]} embeddingA - The first embedding vector.
 * @param {number[]} embeddingB - The second embedding vector.
 * @returns {number} - The cosine similarity score between the two embeddings.
 */
export function calculateSimilarity(embeddingA, embeddingB) {
  if (embeddingA.length !== embeddingB.length) {
    throw new Error("Embedding vectors must have the same length.");
  }

  const dotProduct = embeddingA.reduce((sum, val, idx) => sum + val * embeddingB[idx], 0);
  const magnitudeA = Math.sqrt(embeddingA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(embeddingB.reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Summarizes a list of text entries by selecting the most relevant based on semantic similarity.
 * @param {string[]} texts - An array of text entries to summarize.
 * @returns {string} - A summarized text combining the most relevant entries.
 */
export function summarizeContext(texts) {
  if (texts.length === 0) return "";

  const embeddings = texts.map(generateEmbedding);
  const similarityMatrix = embeddings.map((embeddingA) =>
    embeddings.map((embeddingB) => calculateSimilarity(embeddingA, embeddingB))
  );

  const relevanceScores = similarityMatrix.map((row) => row.reduce((sum, val) => sum + val, 0));
  const mostRelevantIndex = relevanceScores.indexOf(Math.max(...relevanceScores));

  return texts[mostRelevantIndex];
}

/**
 * Stores and manages semantic memory in a simple in-memory database.
 */
export class SemanticMemoryStore {
  constructor() {
    this.memory = [];
  }

  /**
   * Adds a new text entry to the memory store.
   * @param {string} text - The text to add to the memory.
   */
  addMemory(text) {
    this.memory.push({ text, embedding: generateEmbedding(text) });
  }

  /**
   * Retrieves the most relevant memory entry based on a given query.
   * @param {string} query - The query text to search for relevant memory.
   * @returns {string} - The most relevant memory entry.
   */
  retrieveMemory(query) {
    const queryEmbedding = generateEmbedding(query);
    let bestMatch = null;
    let bestScore = -Infinity;

    for (const { text, embedding } of this.memory) {
      const score = calculateSimilarity(queryEmbedding, embedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = text;
      }
    }

    return bestMatch || "No relevant memory found.";
  }

  /**
   * Periodically summarizes older memory to compress and retain relevance.
   */
  summarizeMemory() {
    const texts = this.memory.map((entry) => entry.text);
    const summarizedText = summarizeContext(texts);
    this.memory = [{ text: summarizedText, embedding: generateEmbedding(summarizedText) }];
  }
}

/**
 * Example usage:
 * const memoryStore = new SemanticMemoryStore();
 * memoryStore.addMemory("Hello world!");
 * memoryStore.addMemory("How are you?");
 * console.log(memoryStore.retrieveMemory("Greetings"));
 * memoryStore.summarizeMemory();
 */