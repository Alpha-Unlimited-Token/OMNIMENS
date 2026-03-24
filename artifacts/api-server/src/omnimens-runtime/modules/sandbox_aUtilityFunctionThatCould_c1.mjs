/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T22:12:06.159Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findMostFrequentWords(text, topN) {
    function cleanText(input) {
        return input.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(word => word.length > 0);
    }

    function countWords(words) {
        const wordCounts = {};
        for (const word of words) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
        return wordCounts;
    }

    function sortWordCounts(wordCounts) {
        return Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    }

    const cleanedWords = cleanText(text);
    const wordCounts = countWords(cleanedWords);
    const sortedWordCounts = sortWordCounts(wordCounts);

    return sortedWordCounts.slice(0, topN).map(([word, count]) => ({ word, count }));
}

// Test cases
function runTests() {
    const text1 = "Hello world! Hello again, world.";
    const text2 = "AI systems are evolving. AI is everywhere. AI, AI, AI!";
    const text3 = "One fish two fish red fish blue fish.";

    console.log(findMostFrequentWords(text1, 2)); // Expected: [{ word: 'hello', count: 2 }, { word: 'world', count: 2 }]
    console.log(findMostFrequentWords(text2, 3)); // Expected: [{ word: 'ai', count: 5 }, { word: 'is', count: 1 }, { word: 'everywhere', count: 1 }]
    console.log(findMostFrequentWords(text3, 4)); // Expected: [{ word: 'fish', count: 4 }, { word: 'one', count: 1 }, { word: 'two', count: 1 }, { word: 'red', count: 1 }]
    console.log(findMostFrequentWords("", 5)); // Expected: []
    console.log(findMostFrequentWords("Special characters! @#$%^&*() shouldn't count.", 3)); // Expected: [{ word: 'special', count: 1 }, { word: 'characters', count: 1 }, { word: 'shouldnt', count: 1 }]
}

runTests();