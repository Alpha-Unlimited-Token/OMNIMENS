/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T00:27:18.051Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractNumbersFromText(input) {
    // Extracts all numbers (integers and floats) from a given text and returns them as an array of numbers.
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }

    const numberPattern = /-?\d+(\.\d+)?/g; // Matches integers and floats, including negative numbers
    const matches = input.match(numberPattern);
    return matches ? matches.map(Number) : [];
}

// Test cases
function runTests() {
    console.log("Test Case 1: Basic integers");
    console.log(extractNumbersFromText("The numbers are 42 and 17.")); // [42, 17]

    console.log("Test Case 2: Floats and negative numbers");
    console.log(extractNumbersFromText("Temperature dropped to -3.5 degrees, then rose to 7.8 degrees.")); // [-3.5, 7.8]

    console.log("Test Case 3: No numbers");
    console.log(extractNumbersFromText("No numbers here!")); // []

    console.log("Test Case 4: Mixed content");
    console.log(extractNumbersFromText("Pi is approximately 3.14159, and e is 2.718.")); // [3.14159, 2.718]

    console.log("Test Case 5: Edge case with only numbers");
    console.log(extractNumbersFromText("123 -456 78.9")); // [123, -456, 78.9]

    console.log("Test Case 6: Empty string");
    console.log(extractNumbersFromText("")); // []

    console.log("Test Case 7: Invalid input (non-string)");
    try {
        console.log(extractNumbersFromText(12345));
    } catch (e) {
        console.log(e.message); // "Input must be a string"
    }

    console.log("Test Case 8: Numbers with leading/trailing text");
    console.log(extractNumbersFromText("abc123def -456ghi 78.9xyz")); // [123, -456, 78.9]
}

// Run tests
runTests();