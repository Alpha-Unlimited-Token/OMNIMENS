/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-04-01T03:10:37.852Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Generate n-grams from a given text
function generateNGrams(text, n) {
    if (typeof text !== 'string' || typeof n !== 'number' || n < 1 || !Number.isInteger(n)) {
        throw new TypeError('Invalid input: text must be a string and n must be a positive integer.');
    }

    const words = text.split(/\s+/).filter(word => word.trim().length > 0);
    const nGrams = [];

    for (let i = 0; i <= words.length - n; i++) {
        nGrams.push(words.slice(i, i + n).join(' '));
    }

    return nGrams;
}

// Test cases
console.log("Test Case 1: Basic bigrams");
console.assert(
    JSON.stringify(generateNGrams("Artificial intelligence is fascinating", 2)) === JSON.stringify(["Artificial intelligence", "intelligence is", "is fascinating"]),
    "Test Case 1 Failed"
);

console.log("Test Case 2: Trigrams");
console.assert(
    JSON.stringify(generateNGrams("Artificial intelligence is fascinating", 3)) === JSON.stringify(["Artificial intelligence is", "intelligence is fascinating"]),
    "Test Case 2 Failed"
);

console.log("Test Case 3: Single-word n-grams");
console.assert(
    JSON.stringify(generateNGrams("AI is evolving rapidly", 1)) === JSON.stringify(["AI", "is", "evolving", "rapidly"]),
    "Test Case 3 Failed"
);

console.log("Test Case 4: Edge case - empty string");
console.assert(
    JSON.stringify(generateNGrams("", 2)) === JSON.stringify([]),
    "Test Case 4 Failed"
);

console.log("Test Case 5: Edge case - n larger than number of words");
console.assert(
    JSON.stringify(generateNGrams("AI is evolving", 5)) === JSON.stringify([]),
    "Test Case 5 Failed"
);

console.log("Test Case 6: Invalid inputs");
try {
    generateNGrams(123, 2);
    console.error("Test Case 6 Failed: Did not throw error for non-string input");
} catch (e) {
    console.log("Test Case 6 Passed: Correctly threw error for non-string input");
}

try {
    generateNGrams("AI is evolving", -1);
    console.error("Test Case 6 Failed: Did not throw error for negative n");
} catch (e) {
    console.log("Test Case 6 Passed: Correctly threw error for negative n");
}

try {
    generateNGrams("AI is evolving", 1.5);
    console.error("Test Case 6 Failed: Did not throw error for non-integer n");
} catch (e) {
    console.log("Test Case 6 Passed: Correctly threw error for non-integer n");
}

console.log("All tests completed.");