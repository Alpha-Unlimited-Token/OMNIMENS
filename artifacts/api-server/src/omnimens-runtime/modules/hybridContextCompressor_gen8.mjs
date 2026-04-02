/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hybridContextCompressor
 * Written: 2026-04-02T15:04:49.899Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hybridContextCompressor.mjs

import crypto from 'crypto';

/**
 * Generates a weighted graph from a document for extractive summarization.
 * @param {string} text - The input document.
 * @returns {Map<string, Map<string, number>>} - Weighted graph representation.
 */
export function generateWeightedGraph(text) {
  const sentences = text.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s+/);
  const graph = new Map();

  for (let i = 0; i < sentences.length; i++) {
    for (let j = i + 1; j < sentences.length; j++) {
      const weight = calculateSentenceSimilarity(sentences[i], sentences[j]);

      if (!graph.has(sentences[i])) graph.set(sentences[i], new Map());
      if (!graph.has(sentences[j])) graph.set(sentences[j], new Map());

      graph.get(sentences[i]).set(sentences[j], weight);
      graph.get(sentences[j]).set(sentences[i], weight);
    }
  }

  return graph;
}

/**
 * Calculates similarity between two sentences using Jaccard similarity.
 * @param {string} sentenceA - First sentence.
 * @param {string} sentenceB - Second sentence.
 * @returns {number} - Similarity score between 0 and 1.
 */
export function calculateSentenceSimilarity(sentenceA, sentenceB) {
  const setA = new Set(sentenceA.toLowerCase().split(/\W+/));
  const setB = new Set(sentenceB.toLowerCase().split(/\W+/));

  const intersection = [...setA].filter(word => setB.has(word)).length;
  const union = new Set([...setA, ...setB]).size;

  return intersection / union;
}

/**
 * Extracts key sentences based on graph weights.
 * @param {Map<string, Map<string, number>>} graph - Weighted graph of sentences.
 * @param {number} count - Number of sentences to extract.
 * @returns {string[]} - Extracted sentences.
 */
export function extractKeySentences(graph, count) {
  const sentenceScores = Array.from(graph.entries()).map(([sentence, edges]) => {
    const score = Array.from(edges.values()).reduce((sum, weight) => sum + weight, 0);
    return { sentence, score };
  });

  return sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(entry => entry.sentence);
}

/**
 * Generates an abstractive summary from extracted sentences.
 * @param {string[]} sentences - Extracted sentences.
 * @param {number} maxLength - Maximum length of the summary.
 * @returns {string} - Abstractive summary.
 */
export function generateAbstractiveSummary(sentences, maxLength) {
  const combinedText = sentences.join(" ");
  const words = combinedText.split(/\s+/);

  if (words.length <= maxLength) return combinedText;

  return words.slice(0, maxLength).join(" ") + "...";
}

/**
 * Compresses a document into a hybrid summary.
 * @param {string} text - The input document.
 * @param {number} extractCount - Number of sentences to extract.
 * @param {number} abstractiveLength - Maximum length of abstractive summary.
 * @returns {string} - Hybrid summary.
 */
export function hybridContextCompressor(text, extractCount = 5, abstractiveLength = 50) {
  const graph = generateWeightedGraph(text);
  const keySentences = extractKeySentences(graph, extractCount);
  return generateAbstractiveSummary(keySentences, abstractiveLength);
}

/**
 * Utility to hash text for deduplication or tracking purposes.
 * @param {string} text - The input text.
 * @returns {string} - SHA-256 hash of the text.
 */
export function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}