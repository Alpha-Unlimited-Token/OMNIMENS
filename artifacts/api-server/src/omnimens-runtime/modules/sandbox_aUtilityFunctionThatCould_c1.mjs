/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-24T04:06:07.170Z
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
        throw new Error('Both inputs must be strings');
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

// Test cases
console.log(findLongestCommonSubstring("abcdef", "zcdemf")); // Expected output: "cde"
console.log(findLongestCommonSubstring("12345", "54321")); // Expected output: "3"
console.log(findLongestCommonSubstring("hello", "world")); // Expected output: "l"
console.log(findLongestCommonSubstring("abc", "def")); // Expected output: ""
console.log(findLongestCommonSubstring("", "abc")); // Expected output: ""
console.log(findLongestCommonSubstring("abc", "")); // Expected output: ""
console.log(findLongestCommonSubstring("", "")); // Expected output: ""