/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T08:16:49.511Z
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
    // Remove punctuation and convert text to lowercase
    const cleanedText = text.replace(/[^\w\s]/g, '').toLowerCase();
    // Split text into words
    const words = cleanedText.split(/\s+/);
    // Use a Set to extract unique words
    const uniqueWords = new Set(words);
    // Convert the Set back to an array and sort alphabetically
    return Array.from(uniqueWords).sort();
}

// Test cases
function runTests() {
    console.log("Test Case 1:");
    const text1 = "Hello, world! Hello again.";
    const result1 = extractUniqueWords(text1);
    console.log(result1); // Expected: ['again', 'hello', 'world']

    console.log("Test Case 2:");
    const text2 = "This is a test. A test, this is!";
    const result2 = extractUniqueWords(text2);
    console.log(result2); // Expected: ['a', 'is', 'test', 'this']

    console.log("Test Case 3:");
    const text3 = "Numbers like 123 or 456 are also words.";
    const result3 = extractUniqueWords(text3);
    console.log(result3); // Expected: ['123', '456', 'also', 'are', 'like', 'numbers', 'or', 'words']

    console.log("Test Case 4:");
    const text4 = "";
    const result4 = extractUniqueWords(text4);
    console.log(result4); // Expected: []

    console.log("Test Case 5:");
    const text5 = "Special characters like @#$%^&*() are ignored!";
    const result5 = extractUniqueWords(text5);
    console.log(result5); // Expected: ['are', 'characters', 'ignored', 'like', 'special']
}

// Run the tests
runTests();