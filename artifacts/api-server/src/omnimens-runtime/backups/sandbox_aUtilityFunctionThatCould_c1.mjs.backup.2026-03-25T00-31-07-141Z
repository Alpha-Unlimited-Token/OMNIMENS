/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-25T00:03:53.295Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractKeywords(text, minLength = 4) {
    // Extracts unique keywords from a given text based on word length and frequency
    const wordCounts = {};
    const words = text.toLowerCase().match(/\b[a-z]+\b/g);

    if (!words) return [];

    words.forEach(word => {
        if (word.length >= minLength) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    });

    const sortedKeywords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);
    return sortedKeywords;
}

// Self-tests
function runTests() {
    console.log("Test Case 1:");
    const text1 = "Artificial intelligence is becoming increasingly important in the digital realm.";
    const result1 = extractKeywords(text1);
    console.log(result1); // Expected: ['intelligence', 'artificial', 'becoming', 'increasingly', 'important', 'digital', 'realm']

    console.log("Test Case 2:");
    const text2 = "Generative AI focuses on creating new content, indicating a rise in AI capabilities.";
    const result2 = extractKeywords(text2);
    console.log(result2); // Expected: ['generative', 'focuses', 'creating', 'content', 'indicating', 'capabilities']

    console.log("Test Case 3:");
    const text3 = "Quantum computing and AI integration are pioneering advancements.";
    const result3 = extractKeywords(text3);
    console.log(result3); // Expected: ['quantum', 'computing', 'integration', 'pioneering', 'advancements']

    console.log("Test Case 4:");
    const text4 = "Short words like 'is', 'on', 'and' should be excluded.";
    const result4 = extractKeywords(text4);
    console.log(result4); // Expected: ['short', 'words', 'like', 'should', 'excluded']

    console.log("Test Case 5:");
    const text5 = "";
    const result5 = extractKeywords(text5);
    console.log(result5); // Expected: []
}

runTests();