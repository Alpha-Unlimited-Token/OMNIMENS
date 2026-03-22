/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T22:35:59.100Z
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
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push({
                match: match[0],
                index: match.index
            });
        }
        return { pattern, matches };
    });

    return results;
}

// Test cases
function runTests() {
    console.log("Running tests...");

    const text = "The quick brown fox jumps over the lazy dog. The fox is clever.";
    const patterns = ["fox", "dog", "The", "clever"];

    const results = findPatternsInText(text, patterns);

    console.log("Test 1: Basic pattern matching");
    console.log(results);

    console.log("Test 2: Edge case - empty text");
    console.log(findPatternsInText("", patterns));

    console.log("Test 3: Edge case - no patterns");
    console.log(findPatternsInText(text, []));

    console.log("Test 4: Edge case - invalid inputs");
    try {
        console.log(findPatternsInText(null, patterns));
    } catch (e) {
        console.log(e.message);
    }

    try {
        console.log(findPatternsInText(text, null));
    } catch (e) {
        console.log(e.message);
    }

    console.log("All tests completed.");
}

runTests();