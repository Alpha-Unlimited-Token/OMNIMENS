/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T06:21:40.714Z
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

    const results = patterns.map(pattern => {
        const regex = new RegExp(pattern, 'g');
        const matches = text.match(regex);
        return {
            pattern: pattern,
            occurrences: matches ? matches.length : 0,
            positions: matches ? [...text.matchAll(regex)].map(match => match.index) : []
        };
    });

    return results;
}

// Test cases
console.log("Test Case 1: Basic pattern matching");
const text1 = "The quick brown fox jumps over the lazy dog. The quick fox is clever.";
const patterns1 = ["quick", "fox", "dog"];
console.log(findPatternsInText(text1, patterns1));

console.log("Test Case 2: Edge case - no matches");
const text2 = "Hello world!";
const patterns2 = ["cat", "mouse"];
console.log(findPatternsInText(text2, patterns2));

console.log("Test Case 3: Edge case - empty text");
const text3 = "";
const patterns3 = ["hello", "world"];
console.log(findPatternsInText(text3, patterns3));

console.log("Test Case 4: Edge case - empty patterns");
const text4 = "Sample text for testing.";
const patterns4 = [];
console.log(findPatternsInText(text4, patterns4));

console.log("Test Case 5: Complex patterns");
const text5 = "abc123def456ghi789";
const patterns5 = ["\\d{3}", "abc", "ghi"];
console.log(findPatternsInText(text5, patterns5));