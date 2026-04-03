/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: hierarchicalContextManager
 * Written: 2026-04-03T04:58:53.042Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// hierarchicalContextManager.mjs

import crypto from 'crypto';

/**
 * Generate a unique hash for a given text segment.
 * @param {string} text - The input text to hash.
 * @returns {string} - A unique hash string.
 */
export function generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Split a long text into manageable chunks of a specified size.
 * @param {string} text - The input text to split.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
export function splitIntoChunks(text, chunkSize) {
    if (typeof text !== 'string' || chunkSize <= 0) {
        throw new Error('Invalid input: text must be a string and chunkSize must be a positive number.');
    }
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Summarize a single chunk of text using a simple heuristic (e.g., extracting the first and last sentences).
 * @param {string} chunk - The text chunk to summarize.
 * @returns {string} - A summarized version of the chunk.
 */
export function summarizeChunk(chunk) {
    const sentences = chunk.match(/[^.!?]+[.!?]/g) || [chunk];
    const summary = [sentences[0], sentences[sentences.length - 1]];
    return summary.join(' ').trim();
}

/**
 * Create a hierarchical summary of a document by summarizing chunks and combining them recursively.
 * @param {string} text - The full document text to summarize.
 * @param {number} chunkSize - The size of each chunk for initial segmentation.
 * @returns {object} - A hierarchical summary object.
 */
export function hierarchicalSummarize(text, chunkSize = 512) {
    const chunks = splitIntoChunks(text, chunkSize);
    const summaries = chunks.map((chunk, index) => {
        const summary = summarizeChunk(chunk);
        return {
            id: generateHash(chunk),
            index,
            chunk,
            summary
        };
    });

    const combinedSummary = summaries.map(s => s.summary).join(' ');
    const topLevelSummary = summarizeChunk(combinedSummary);

    return {
        topLevelSummary,
        summaries
    };
}

/**
 * Traverse a hierarchical summary and extract all summaries at a specified depth.
 * @param {object} summaryObject - The hierarchical summary object.
 * @param {number} depth - The depth level to extract summaries from (0 for top-level).
 * @returns {string[]} - An array of summaries at the specified depth.
 */
export function extractSummariesAtDepth(summaryObject, depth) {
    if (depth === 0) {
        return [summaryObject.topLevelSummary];
    }
    return summaryObject.summaries.map(s => s.summary);
}

/**
 * Merge multiple hierarchical summaries into one, maintaining their structure.
 * @param {object[]} summaryObjects - An array of hierarchical summary objects to merge.
 * @returns {object} - A merged hierarchical summary object.
 */
export function mergeHierarchicalSummaries(summaryObjects) {
    const mergedSummaries = summaryObjects.flatMap(obj => obj.summaries);
    const combinedSummary = mergedSummaries.map(s => s.summary).join(' ');
    const topLevelSummary = summarizeChunk(combinedSummary);

    return {
        topLevelSummary,
        summaries: mergedSummaries
    };
}

// Example usage:
// const text = "...long document text...";
// const result = hierarchicalSummarize(text, 512);
// console.log(result);