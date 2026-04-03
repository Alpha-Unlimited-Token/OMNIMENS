/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_6
 * Name: recursiveContextSynthesizer
 * Purpose: Recursively expands compressed context to recover lost information during long-context reasoning.
 * Description: Expands compressed context using recursive summarization and salience scoring for long-context reasoning.
 * Migrated: 2026-04-03T12:16:17.363Z
 */

// recursiveContextSynthesizer.mjs

import crypto from 'crypto';

/**
 * Utility function to calculate salience score for a given text segment.
 * Salience is determined by word frequency and uniqueness.
 * @param {string} text - The text to analyze.
 * @returns {number} - Salience score.
 */
export function calculateSalienceScore(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFrequency = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
    }, {});
    const uniqueWords = Object.keys(wordFrequency).length;
    const totalWords = words.length;
    return uniqueWords / totalWords;
}

/**
 * Summarizes a given text by extracting the most salient sentences.
 * @param {string} text - The text to summarize.
 * @param {number} sentenceCount - Number of sentences to retain.
 * @returns {string} - Summarized text.
 */
export function summarizeText(text, sentenceCount = 3) {
    const sentences = text.match(/[^.!?]+[.!?]/g) || [];
    const scoredSentences = sentences.map(sentence => ({
        sentence,
        score: calculateSalienceScore(sentence)
    }));
    scoredSentences.sort((a, b) => b.score - a.score);
    return scoredSentences.slice(0, sentenceCount).map(item => item.sentence).join(' ');
}

/**
 * Recursively expands compressed context by re-synthesizing details from summaries.
 * @param {string} compressedContext - The compressed context to expand.
 * @param {number} depth - Maximum recursion depth.
 * @param {number} sentenceCount - Number of sentences to retain at each level.
 * @returns {string} - Expanded context.
 */
export function recursiveExpandContext(compressedContext, depth = 3, sentenceCount = 3) {
    if (depth <= 0 || !compressedContext) return compressedContext;

    const expandedContext = summarizeText(compressedContext, sentenceCount);
    return recursiveExpandContext(expandedContext, depth - 1, sentenceCount) + ' ' + expandedContext;
}

/**
 * Generates a salience-based hash for a given text to identify unique contexts.
 * @param {string} text - The text to hash.
 * @returns {string} - A unique hash string.
 */
export function generateContextHash(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
}

/**
 * Utility function to dynamically re-expand context based on salience and relevance.
 * @param {string[]} contexts - Array of context strings.
 * @param {number} relevanceThreshold - Minimum salience score to retain context.
 * @returns {string[]} - Array of re-expanded contexts.
 */
export function dynamicReExpansion(contexts, relevanceThreshold = 0.5) {
    return contexts
        .map(context => ({
            context,
            score: calculateSalienceScore(context)
        }))
        .filter(item => item.score >= relevanceThreshold)
        .map(item => recursiveExpandContext(item.context));
}

/**
 * Merges multiple contexts into a single coherent summary.
 * @param {string[]} contexts - Array of context strings.
 * @param {number} sentenceCount - Number of sentences to retain in the merged summary.
 * @returns {string} - Merged summary.
 */
export function mergeContexts(contexts, sentenceCount = 5) {
    const combinedText = contexts.join(' ');
    return summarizeText(combinedText, sentenceCount);
}
