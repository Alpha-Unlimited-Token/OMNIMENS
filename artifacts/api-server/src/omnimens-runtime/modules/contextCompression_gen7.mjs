/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: contextCompression
 * Written: 2026-04-01T22:11:25.291Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// contextCompression.mjs

// Utility function to calculate word frequency for scoring relevance
export function calculateWordFrequency(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequency = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }
  return frequency;
}

// Utility function to score sentences based on word frequency
export function scoreSentences(text, wordFrequency) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const scores = sentences.map(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score = words.reduce((sum, word) => sum + (wordFrequency[word] || 0), 0);
    return { sentence, score };
  });
  return scores;
}

// Summarize text by selecting top N sentences based on scores
export function summarizeText(text, maxSentences = 3) {
  const wordFrequency = calculateWordFrequency(text);
  const scoredSentences = scoreSentences(text, wordFrequency);
  scoredSentences.sort((a, b) => b.score - a.score);
  const summary = scoredSentences.slice(0, maxSentences).map(s => s.sentence.trim()).join(' ');
  return summary;
}

// Recursively compress context by summarizing until token limit is met
export function recursiveContextCompression(context, tokenLimit = 1000) {
  const tokenize = text => text.split(/\s+/).length; // Simple tokenization by splitting on whitespace
  let compressed = context;

  while (tokenize(compressed) > tokenLimit) {
    compressed = summarizeText(compressed);
  }

  return compressed;
}

// Example utility for multi-agent use: Distill multiple contexts into a unified summary
export function distillMultipleContexts(contexts, tokenLimit = 1000) {
  const combinedContext = contexts.join(' ');
  return recursiveContextCompression(combinedContext, tokenLimit);
}

// Example utility for scoring relevance of a query against a context
export function queryRelevanceScore(query, context) {
  const queryWords = calculateWordFrequency(query);
  const contextWords = calculateWordFrequency(context);
  const score = Object.keys(queryWords).reduce((sum, word) => sum + (contextWords[word] || 0) * queryWords[word], 0);
  return score;
}