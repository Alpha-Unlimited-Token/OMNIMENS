/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-22T06:04:35.546Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function to find the longest common substring between two strings
function longestCommonSubstring(str1, str2) {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
        throw new Error('Both inputs must be strings');
    }

    const len1 = str1.length;
    const len2 = str2.length;
    let maxLength = 0;
    let endIndex = 0;

    // Create a 2D array to store lengths of common substrings
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > maxLength) {
                    maxLength = dp[i][j];
                    endIndex = i;
                }
            }
        }
    }

    // Extract the longest common substring
    return str1.slice(endIndex - maxLength, endIndex);
}

// Test cases
console.log(longestCommonSubstring("abcdef", "zcdemf")); // Expected output: "cde"
console.log(longestCommonSubstring("12345", "34567")); // Expected output: "345"
console.log(longestCommonSubstring("hello", "world")); // Expected output: ""
console.log(longestCommonSubstring("abcdxyz", "xyzabcd")); // Expected output: "abcd"
console.log(longestCommonSubstring("same", "same")); // Expected output: "same"

// Edge cases
console.log(longestCommonSubstring("", "abc")); // Expected output: ""
console.log(longestCommonSubstring("abc", "")); // Expected output: ""
console.log(longestCommonSubstring("", "")); // Expected output: ""
console.log(longestCommonSubstring("a", "a")); // Expected output: "a"
console.log(longestCommonSubstring("a", "b")); // Expected output: ""