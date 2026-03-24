/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T13:22:17.511Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractUniqueWords(text) {
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
        .split(/\s+/); // Split by whitespace
    const uniqueWords = new Set(words);
    uniqueWords.delete(''); // Remove empty strings
    return Array.from(uniqueWords).sort();
}

// Test cases
function testExtractUniqueWords() {
    const testCases = [
        {
            input: "Hello, world! Hello again.",
            expected: ["again", "hello", "world"]
        },
        {
            input: "AI is the future. The future is AI.",
            expected: ["ai", "future", "is", "the"]
        },
        {
            input: "123 456 123 789",
            expected: ["123", "456", "789"]
        },
        {
            input: "No duplicates here!",
            expected: ["duplicates", "here", "no"]
        },
        {
            input: "",
            expected: []
        }
    ];

    testCases.forEach((testCase, index) => {
        const result = extractUniqueWords(testCase.input);
        console.log(
            `Test Case ${index + 1}:`,
            JSON.stringify(result) === JSON.stringify(testCase.expected)
                ? "Passed"
                : `Failed (Expected: ${JSON.stringify(testCase.expected)}, Got: ${JSON.stringify(result)})`
        );
    });
}

// Run tests
testExtractUniqueWords();