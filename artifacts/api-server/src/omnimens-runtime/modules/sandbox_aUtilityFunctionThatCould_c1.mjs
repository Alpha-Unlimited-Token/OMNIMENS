/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T17:08:50.191Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function: Find the longest common substring between two strings
function longestCommonSubstring(str1, str2) {
    if (!str1 || !str2) return "";

    let maxLength = 0;
    let endIdx = 0;
    const dp = Array(str1.length + 1).fill(0).map(() => Array(str2.length + 1).fill(0));

    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLength) {
                    maxLength = dp[i][j];
                    endIdx = i;
                }
            }
        }
    }

    return str1.slice(endIdx - maxLength, endIdx);
}

// Self-contained tests
function runTests() {
    console.log("Test 1: ", longestCommonSubstring("abcdef", "zabcf") === "abc"); // Common substring: "abc"
    console.log("Test 2: ", longestCommonSubstring("12345", "34567") === "345"); // Common substring: "345"
    console.log("Test 3: ", longestCommonSubstring("hello", "world") === ""); // No common substring
    console.log("Test 4: ", longestCommonSubstring("abcdxyz", "xyzabcd") === "abcd"); // Common substring: "abcd"
    console.log("Test 5: ", longestCommonSubstring("", "anything") === ""); // Empty string input
    console.log("Test 6: ", longestCommonSubstring("anything", "") === ""); // Empty string input
    console.log("Test 7: ", longestCommonSubstring("same", "same") === "same"); // Strings are identical
    console.log("Test 8: ", longestCommonSubstring("a", "a") === "a"); // Single character match
    console.log("Test 9: ", longestCommonSubstring("abc", "def") === ""); // Completely different strings
}

// Run tests
runTests();