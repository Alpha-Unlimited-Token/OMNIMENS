/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T21:50:28.193Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function findLongestCommonSubstring(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
        throw new Error('Both inputs must be strings.');
    }

    let maxLength = 0;
    let endIndex = 0;
    const dp = Array(str1.length + 1).fill(null).map(() => Array(str2.length + 1).fill(0));

    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLength) {
                    maxLength = dp[i][j];
                    endIndex = i;
                }
            }
        }
    }

    return str1.slice(endIndex - maxLength, endIndex);
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic case
    const result1 = findLongestCommonSubstring("abcdef", "zcdemf");
    console.log(result1 === "cde" ? "Test 1 Passed" : "Test 1 Failed");

    // Test 2: No common substring
    const result2 = findLongestCommonSubstring("abcd", "xyz");
    console.log(result2 === "" ? "Test 2 Passed" : "Test 2 Failed");

    // Test 3: Entire string match
    const result3 = findLongestCommonSubstring("hello", "hello");
    console.log(result3 === "hello" ? "Test 3 Passed" : "Test 3 Failed");

    // Test 4: Case sensitivity
    const result4 = findLongestCommonSubstring("Hello", "hello");
    console.log(result4 === "" ? "Test 4 Passed" : "Test 4 Failed");

    // Test 5: Empty strings
    const result5 = findLongestCommonSubstring("", "abc");
    console.log(result5 === "" ? "Test 5 Passed" : "Test 5 Failed");

    const result6 = findLongestCommonSubstring("abc", "");
    console.log(result6 === "" ? "Test 6 Passed" : "Test 6 Failed");

    // Test 6: Large common substring
    const result7 = findLongestCommonSubstring("abcde12345", "12345xyz");
    console.log(result7 === "12345" ? "Test 7 Passed" : "Test 7 Failed");

    console.log("Tests completed.");
}

runTests();