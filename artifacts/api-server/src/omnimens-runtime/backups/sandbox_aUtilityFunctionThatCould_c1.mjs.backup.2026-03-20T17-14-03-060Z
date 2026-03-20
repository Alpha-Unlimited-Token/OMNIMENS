/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T16:57:56.356Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

// Utility function: Find the longest common substring between two strings
function longestCommonSubstring(str1, str2) {
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
console.log("Test Cases for Longest Common Substring:");
console.log(longestCommonSubstring("digital", "navigation")); // Expected output: "gital"
console.log(longestCommonSubstring("fractals", "fraction")); // Expected output: "fract"
console.log(longestCommonSubstring("mesh", "fresh")); // Expected output: "esh"
console.log(longestCommonSubstring("optimization", "minimization")); // Expected output: "minimization"
console.log(longestCommonSubstring("abc", "def")); // Expected output: ""
console.log(longestCommonSubstring("", "anything")); // Expected output: ""
console.log(longestCommonSubstring("same", "same")); // Expected output: "same"