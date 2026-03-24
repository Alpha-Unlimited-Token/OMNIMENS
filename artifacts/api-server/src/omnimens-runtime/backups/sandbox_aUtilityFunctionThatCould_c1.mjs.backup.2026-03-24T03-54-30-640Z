/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T03:22:32.795Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findPatternsInText(text, patterns) {
    if (typeof text !== 'string' || !Array.isArray(patterns)) {
        throw new Error('Invalid input: text must be a string and patterns must be an array of strings.');
    }

    const results = [];
    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        if (typeof pattern !== 'string') {
            throw new Error('Invalid pattern: all patterns must be strings.');
        }
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);
        if (matches) {
            results.push({ pattern, matches });
        }
    }
    return results;
}

// Test cases
const testText = "The quick brown fox jumps over the lazy dog. The fox is clever and quick.";
const testPatterns = ["quick", "fox", "dog", "cat"];

console.log("Test Case 1: Basic Functionality");
console.log(findPatternsInText(testText, testPatterns));

console.log("Test Case 2: No Matches");
console.log(findPatternsInText(testText, ["elephant", "giraffe"]));

console.log("Test Case 3: Empty Text");
console.log(findPatternsInText("", testPatterns));

console.log("Test Case 4: Empty Patterns");
console.log(findPatternsInText(testText, []));

console.log("Test Case 5: Invalid Inputs");
try {
    console.log(findPatternsInText(123, testPatterns));
} catch (error) {
    console.log(error.message);
}

try {
    console.log(findPatternsInText(testText, "quick"));
} catch (error) {
    console.log(error.message);
}

try {
    console.log(findPatternsInText(testText, [123, "fox"]));
} catch (error) {
    console.log(error.message);
}