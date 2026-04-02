/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: semanticHashingContextManager
 * Written: 2026-04-02T14:23:41.442Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// semanticHashingContextManager.mjs

import { createHash } from 'crypto';

/**
 * Generate a semantic hash for a given string.
 * @param {string} input - The input string to hash.
 * @returns {string} - A semantic hash of the input.
 */
export function generateSemanticHash(input) {
    const normalizedInput = input.trim().toLowerCase();
    const hash = createHash('sha256');
    hash.update(normalizedInput);
    return hash.digest('hex');
}

/**
 * Perform latent topic modeling using a simple term frequency approach.
 * @param {Array<string>} documents - Array of text documents.
 * @returns {Map<string, number>} - Map of terms to their frequency scores.
 */
export function performTopicModeling(documents) {
    const termFrequency = new Map();

    for (const doc of documents) {
        const words = doc.toLowerCase().match(/\b\w+\b/g) || [];
        for (const word of words) {
            termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
        }
    }

    return termFrequency;
}

/**
 * Compress tokens while retaining context using semantic hashing and topic modeling.
 * @param {Array<string>} tokens - Array of tokens to compress.
 * @param {Array<string>} contextDocuments - Array of context documents for relevance scoring.
 * @returns {Array<string>} - Array of compressed tokens with context preserved.
 */
export function compressTokensWithContext(tokens, contextDocuments) {
    const topicScores = performTopicModeling(contextDocuments);
    const compressedTokens = [];

    for (const token of tokens) {
        const semanticHash = generateSemanticHash(token);
        const relevanceScore = topicScores.get(token.toLowerCase()) || 0;

        // Retain token if it has a high relevance score
        if (relevanceScore > 0) {
            compressedTokens.push(`${token}:${semanticHash}`);
        }
    }

    return compressedTokens;
}

/**
 * Utility to normalize and tokenize text.
 * @param {string} text - Input text to tokenize.
 * @returns {Array<string>} - Array of normalized tokens.
 */
export function tokenizeText(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
}

/**
 * Utility to calculate similarity between two sets of tokens.
 * @param {Array<string>} tokensA - First set of tokens.
 * @param {Array<string>} tokensB - Second set of tokens.
 * @returns {number} - Jaccard similarity coefficient.
 */
export function calculateTokenSimilarity(tokensA, tokensB) {
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
}

/**
 * Utility to rank tokens by their relevance to context.
 * @param {Array<string>} tokens - Array of tokens to rank.
 * @param {Array<string>} contextDocuments - Array of context documents for scoring.
 * @returns {Array<{token, score}>} - Array of tokens with relevance scores.
 */
export function rankTokensByContext(tokens, contextDocuments) {
    const topicScores = performTopicModeling(contextDocuments);
    return tokens.map(token => ({
        token,
        score: topicScores.get(token.toLowerCase()) || 0
    })).sort((a, b) => b.score - a.score);
}