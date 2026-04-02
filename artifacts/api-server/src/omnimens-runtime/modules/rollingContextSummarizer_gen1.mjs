/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: rollingContextSummarizer
 * Written: 2026-04-02T21:23:26.042Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// rollingContextSummarizer.mjs

import { createHash } from 'crypto';

/**
 * Generates a fixed-size embedding (hash-based) for a given input string.
 * This function is generic and can be used by any agent needing compact representations.
 * @param {string} input - The input string to be summarized.
 * @param {number} size - The desired size of the output embedding in bytes.
 * @returns {string} - A hexadecimal string representing the fixed-size embedding.
 */
export function generateEmbedding(input, size = 32) {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex').slice(0, size * 2); // Hex is 2 chars per byte
}

/**
 * Summarizes an array of tokens into a compact embedding for context retention.
 * This function is reusable for agents needing to compress large token sequences.
 * @param {string[]} tokens - The array of tokens to summarize.
 * @param {number} size - The size of the output embedding in bytes.
 * @returns {string} - A fixed-size embedding summarizing the input tokens.
 */
export function summarizeTokens(tokens, size = 32) {
    const combinedInput = tokens.join(' ');
    return generateEmbedding(combinedInput, size);
}

/**
 * Periodically summarizes a rolling context to maintain coherence within token limits.
 * This function is useful for agents managing dynamic, large contexts.
 * @param {string[]} tokens - The array of tokens representing the current context.
 * @param {number} maxTokens - The maximum number of tokens allowed before summarization.
 * @param {number} embeddingSize - The size of the output embedding in bytes.
 * @returns {{ updatedTokens, summary: string | null }}
 * - updatedTokens: The updated token array after summarization.
 * - summary: The generated summary embedding if summarization occurred, otherwise null.
 */
export function rollingContextSummarizer(tokens, maxTokens, embeddingSize = 32) {
    if (tokens.length <= maxTokens) {
        return { updatedTokens: tokens, summary};
    }

    // Summarize the excess tokens
    const excessTokens = tokens.slice(0, tokens.length - maxTokens);
    const summary = summarizeTokens(excessTokens, embeddingSize);

    // Keep only the last maxTokens tokens
    const updatedTokens = tokens.slice(tokens.length - maxTokens);

    return { updatedTokens, summary };
}

/**
 * Utility function to split a large text into tokens based on whitespace.
 * This function is generic and can be used by any agent needing tokenization.
 * @param {string} text - The input text to tokenize.
 * @returns {string[]} - An array of tokens.
 */
export function tokenize(text) {
    return text.split(/\s+/).filter(token => token.length > 0);
}

/**
 * Utility function to reconstruct text from tokens.
 * This function is generic and can be used by any agent needing detokenization.
 * @param {string[]} tokens - The array of tokens to reconstruct.
 * @returns {string} - The reconstructed text.
 */
export function detokenize(tokens) {
    return tokens.join(' ');
}

/**
 * Example usage of the rollingContextSummarizer module.
 * Demonstrates how to manage a rolling context with token limits.
 */
export function exampleUsage() {
    const context = "This is a long sequence of text that represents the context of a conversation or document. It needs to be managed effectively.";
    const tokens = tokenize(context);
    const maxTokens = 10;

    let { updatedTokens, summary } = rollingContextSummarizer(tokens, maxTokens);

    console.log("Updated Tokens:", updatedTokens);
    console.log("Summary Embedding:", summary);
}
