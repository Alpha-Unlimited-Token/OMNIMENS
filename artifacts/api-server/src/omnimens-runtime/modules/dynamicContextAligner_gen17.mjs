/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: dynamicContextAligner
 * Written: 2026-04-02T15:14:30.081Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// dynamicContextAligner.mjs

import { createHash } from 'crypto';

/**
 * Generates a hash-based identifier for prompt templates to track optimization iterations.
 * Useful for ensuring unique tracking across agents.
 */
export function generateTemplateID(template) {
  const hash = createHash('sha256');
  hash.update(template);
  return hash.digest('hex');
}

/**
 * Evaluates alignment between external output and internal cognition.
 * Returns a score between 0 and 1, where higher scores indicate better alignment.
 */
export function evaluateAlignment(externalOutput, internalCognition) {
  if (typeof externalOutput !== 'string' || typeof internalCognition !== 'string') {
    throw new TypeError('Both externalOutput and internalCognition must be strings.');
  }

  const externalWords = externalOutput.split(/\s+/);
  const internalWords = internalCognition.split(/\s+/);

  const matchingWords = externalWords.filter(word => internalWords.includes(word));
  return matchingWords.length / Math.max(externalWords.length, internalWords.length);
}

/**
 * Refines prompt templates based on alignment scores using reinforcement learning.
 * Iteratively adjusts the template to improve alignment.
 */
export function refinePromptTemplate(template, externalOutput, internalCognition, learningRate = 0.1) {
  if (typeof template !== 'string' || typeof externalOutput !== 'string' || typeof internalCognition !== 'string') {
    throw new TypeError('Template, externalOutput, and internalCognition must be strings.');
  }

  const alignmentScore = evaluateAlignment(externalOutput, internalCognition);

  // Simulate reinforcement learning by adjusting template based on alignment score
  if (alignmentScore < 0.5) {
    const internalWords = internalCognition.split(/\s+/);
    const missingWords = internalWords.filter(word => !template.includes(word));

    // Add missing words to the template to improve alignment
    const adjustedTemplate = template + ' ' + missingWords.slice(0, Math.ceil(missingWords.length * learningRate)).join(' ');
    return adjustedTemplate.trim();
  }

  return template; // No adjustment needed if alignment is sufficient
}

/**
 * Utility function for multi-agent systems to assess and optimize prompt alignment.
 * Returns optimized template and alignment score.
 */
export function optimizePrompt(template, externalOutput, internalCognition) {
  let optimizedTemplate = template;
  let alignmentScore = evaluateAlignment(externalOutput, internalCognition);

  for (let i = 0; i < 10; i++) { // Limit iterations to prevent infinite loops
    const newTemplate = refinePromptTemplate(optimizedTemplate, externalOutput, internalCognition);
    const newScore = evaluateAlignment(externalOutput, internalCognition);

    if (newScore <= alignmentScore) break; // Stop if no improvement

    optimizedTemplate = newTemplate;
    alignmentScore = newScore;
  }

  return { optimizedTemplate, alignmentScore };
}

/**
 * Cross-agent utility to tokenize text for broader usability in text processing.
 * Splits text into an array of words.
 */
export function tokenizeText(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Text must be a string.');
  }
  return text.split(/\s+/).filter(word => word.length > 0);
}

/**
 * Cross-agent utility to calculate similarity between two texts using Jaccard index.
 * Useful for comparing text across agents.
 */
export function calculateTextSimilarity(textA, textB) {
  const tokensA = new Set(tokenizeText(textA));
  const tokensB = new Set(tokenizeText(textB));

  const intersection = new Set([...tokensA].filter(token => tokensB.has(token)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}
