/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: recursiveContextManager
 * Written: 2026-04-02T15:06:42.326Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// recursiveContextManager.mjs

// Utility function to split a large text into manageable chunks based on a maximum token size
export function segmentText(inputText, maxChunkSize) {
    if (typeof inputText !== 'string' || typeof maxChunkSize !== 'number' || maxChunkSize <= 0) {
        throw new Error('Invalid input: inputText must be a string and maxChunkSize must be a positive number.');
    }

    const chunks = [];
    let currentChunk = '';

    for (const word of inputText.split(' ')) {
        if ((currentChunk + word).length > maxChunkSize) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += word + ' ';
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// Utility function to summarize a chunk of text using importance scoring
export function summarizeChunk(chunk) {
    if (typeof chunk !== 'string') {
        throw new Error('Invalid input: chunk must be a string.');
    }

    const sentences = chunk.split('.').map(s => s.trim()).filter(s => s.length > 0);
    const importanceScores = sentences.map(sentence => sentence.length); // Example: score by length

    const totalScore = importanceScores.reduce((sum, score) => sum + score, 0);
    const threshold = totalScore * 0.5; // Keep top 50% importance

    let accumulatedScore = 0;
    const summary = [];

    for (let i = 0; i < sentences.length; i++) {
        accumulatedScore += importanceScores[i];
        summary.push(sentences[i]);
        if (accumulatedScore >= threshold) break;
    }

    return summary.join('. ') + '.';
}

// Recursive summarization function for hierarchical processing
export function recursiveSummarize(inputText, maxChunkSize, maxDepth = 3) {
    if (typeof inputText !== 'string' || typeof maxChunkSize !== 'number' || maxChunkSize <= 0 || typeof maxDepth !== 'number' || maxDepth < 1) {
        throw new Error('Invalid input: Ensure inputText is a string, maxChunkSize is a positive number, and maxDepth is a positive integer.');
    }

    const chunks = segmentText(inputText, maxChunkSize);
    const summaries = chunks.map(chunk => summarizeChunk(chunk));

    const combinedSummary = summaries.join(' ');

    if (combinedSummary.length <= maxChunkSize || maxDepth === 1) {
        return combinedSummary;
    }

    return recursiveSummarize(combinedSummary, maxChunkSize, maxDepth - 1);
}

// Reassembly function to combine summarized chunks into a coherent structure
export function reassembleChunks(chunks) {
    if (!Array.isArray(chunks) || chunks.some(chunk => typeof chunk !== 'string')) {
        throw new Error('Invalid input: chunks must be an array of strings.');
    }

    return chunks.join(' ');
}

// Example utility to process and summarize large contexts
export function processLargeContext(inputText, maxChunkSize, maxDepth = 3) {
    if (typeof inputText !== 'string') {
        throw new Error('Invalid input: inputText must be a string.');
    }

    const recursiveResult = recursiveSummarize(inputText, maxChunkSize, maxDepth);
    return recursiveResult;
}