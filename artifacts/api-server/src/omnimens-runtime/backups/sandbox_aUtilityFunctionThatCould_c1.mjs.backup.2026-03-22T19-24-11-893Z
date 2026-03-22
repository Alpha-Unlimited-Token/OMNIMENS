/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T19:09:49.355Z
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
        const matches = text.match(regex) || [];
        return { pattern, count: matches.length, matches };
    });

    return results;
}

// Test cases
function runTests() {
    console.log('Test 1: Basic pattern matching');
    const text1 = "The quick brown fox jumps over the lazy dog. The dog barked.";
    const patterns1 = ["dog", "fox", "cat"];
    console.log(findPatternsInText(text1, patterns1));

    console.log('Test 2: Case sensitivity');
    const text2 = "Hello hello HELLO world.";
    const patterns2 = ["hello", "HELLO"];
    console.log(findPatternsInText(text2, patterns2));

    console.log('Test 3: Empty text');
    const text3 = "";
    const patterns3 = ["test"];
    console.log(findPatternsInText(text3, patterns3));

    console.log('Test 4: No matches');
    const text4 = "This is a test string.";
    const patterns4 = ["xyz", "123"];
    console.log(findPatternsInText(text4, patterns4));

    console.log('Test 5: Invalid inputs');
    try {
        console.log(findPatternsInText(123, ["test"]));
    } catch (error) {
        console.log(error.message);
    }

    try {
        console.log(findPatternsInText("Valid text", "invalid patterns"));
    } catch (error) {
        console.log(error.message);
    }
}

runTests();