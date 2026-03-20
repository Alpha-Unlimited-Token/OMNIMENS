/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T15:04:16.902Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function extractUniqueKeywords(textArray) {
    // Utility function to extract unique keywords from an array of strings
    // Removes common stopwords and returns a sorted list of unique keywords
    const stopwords = new Set([
        'and', 'or', 'the', 'is', 'to', 'in', 'of', 'a', 'on', 'with', 'for', 'by', 'an', 'at', 'as', 'this', 'that', 'it', 'be', 'from', 'are', 'was', 'but', 'if', 'not', 'they', 'their', 'we', 'you', 'your', 'our', 'can', 'will', 'has', 'have', 'had', 'do', 'does', 'did'
    ]);

    const keywords = new Set();

    textArray.forEach(text => {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g);
        if (words) {
            words.forEach(word => {
                if (!stopwords.has(word)) {
                    keywords.add(word);
                }
            });
        }
    });

    return Array.from(keywords).sort();
}

// Test cases
const testTexts = [
    "A breakthrough AI model shows improved understanding of sensory cortex perception.",
    "Major tech firms announce collaboration on developing sensory cortex perception.",
    "New research reveals significant breakthroughs in sensory cortex perception."
];

const result = extractUniqueKeywords(testTexts);
console.log(result);

// Expected output: A sorted array of unique keywords excluding stopwords
// Example: ['ai', 'announce', 'breakthrough', 'breakthroughs', 'collaboration', 'cortex', 'developing', 'firms', 'improved', 'major', 'model', 'new', 'perception', 'research', 'reveals', 'sensory', 'shows', 'significant', 'understanding']