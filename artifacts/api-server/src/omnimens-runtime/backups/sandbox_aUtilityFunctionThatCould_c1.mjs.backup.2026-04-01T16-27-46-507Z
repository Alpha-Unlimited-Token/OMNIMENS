/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T15:43:38.290Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: `findMostFrequentWords`
// This function takes a block of text and returns the top N most frequent words, excluding common stop words.
function findMostFrequentWords(text, topN) {
    const stopWords = new Set([
        "a", "an", "and", "the", "is", "in", "on", "of", "to", "with", "for", "at", "by", "from", "as", "it", "this", "that", "these", "those", "be", "was", "were", "are", "or", "not", "but", "if", "then", "so", "such", "can", "will", "would", "could", "should", "may", "might", "do", "does", "did", "done", "have", "has", "had", "you", "your", "yours", "we", "our", "ours", "they", "their", "theirs", "he", "his", "she", "her", "hers", "itself", "him", "himself", "herself", "its", "i", "me", "my", "mine", "us", "them", "they", "what", "which", "who", "whom", "where", "when", "why", "how", "all", "any", "some", "no", "nor", "very", "more", "most", "less", "least", "many", "much", "few", "fewer", "lot", "lots", "only", "also", "too", "about", "into", "over", "under", "after", "before", "again", "once", "here", "there", "now", "then", "ever", "never", "always", "sometimes", "often", "rarely", "seldom", "yet", "still", "however", "therefore", "thus", "hence", "otherwise"
    ]);

    const wordCounts = {};
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];

    for (const word of words) {
        if (!stopWords.has(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    }

    const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([word]) => word);

    return sortedWords;
}

// Test cases
const textSample = `
    In the digital realm, the fastest route is not always the most direct; optimizing for speed and reliability is key. 
    AI-assisted software development is gaining traction, lowering barriers for developers and increasing productivity. 
    Quantum computing's integration with AI is revolutionizing data processing and enabling new possibilities.
`;

// Test 1: Extract top 5 most frequent words
const result1 = findMostFrequentWords(textSample, 5);
console.log("Top 5 most frequent words:", result1);
console.assert(result1.length === 5, "Test 1 failed: result should contain 5 words");

// Test 2: Extract top 10 most frequent words
const result2 = findMostFrequentWords(textSample, 10);
console.log("Top 10 most frequent words:", result2);
console.assert(result2.length === 10, "Test 2 failed: result should contain 10 words");

// Test 3: Handle empty text
const result3 = findMostFrequentWords("", 5);
console.log("Empty text result:", result3);
console.assert(result3.length === 0, "Test 3 failed: result should be empty");

// Test 4: Handle text with only stop words
const result4 = findMostFrequentWords("the and is in on of to with for at by from as it this that", 5);
console.log("Stop words only result:", result4);
console.assert(result4.length === 0, "Test 4 failed: result should be empty");

// Test 5: Handle case sensitivity
const result5 = findMostFrequentWords("AI ai Ai aI", 1);
console.log("Case sensitivity result:", result5);
console.assert(result5[0] === "ai", "Test 5 failed: result should normalize case");

console.log("All tests completed.");