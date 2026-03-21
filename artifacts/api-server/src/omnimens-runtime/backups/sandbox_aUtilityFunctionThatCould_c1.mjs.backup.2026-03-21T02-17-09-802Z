/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T02:08:54.614Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Extract unique words from a text, count their occurrences, and sort by frequency
function analyzeTextFrequency(inputText) {
    if (typeof inputText !== 'string') {
        throw new Error("Input must be a string");
    }

    // Normalize text: convert to lowercase and remove non-alphanumeric characters
    const normalizedText = inputText.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Split text into words
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);

    // Count word occurrences
    const wordFrequency = {};
    for (const word of words) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }

    // Convert to array and sort by frequency (descending), then alphabetically for ties
    const sortedWordFrequency = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    return sortedWordFrequency;
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic text analysis
    const text1 = "Hello world! Hello again, world.";
    const result1 = analyzeTextFrequency(text1);
    console.log(result1);
    // Expected: [['hello', 2], ['world', 2], ['again', 1]]

    // Test 2: Case insensitivity and punctuation handling
    const text2 = "Test, test, TEST! This is a test.";
    const result2 = analyzeTextFrequency(text2);
    console.log(result2);
    // Expected: [['test', 4], ['this', 1], ['is', 1], ['a', 1]]

    // Test 3: Empty string
    const text3 = "";
    const result3 = analyzeTextFrequency(text3);
    console.log(result3);
    // Expected: []

    // Test 4: Numbers and mixed content
    const text4 = "123 123 test 456 test 123";
    const result4 = analyzeTextFrequency(text4);
    console.log(result4);
    // Expected: [['123', 3], ['test', 2], ['456', 1]]

    // Test 5: Single word
    const text5 = "word";
    const result5 = analyzeTextFrequency(text5);
    console.log(result5);
    // Expected: [['word', 1]]

    console.log("Tests completed.");
}

// Run the self-tests
runTests();