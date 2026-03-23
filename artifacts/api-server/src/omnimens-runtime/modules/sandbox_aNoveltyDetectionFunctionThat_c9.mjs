/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a novelty detection function that identifies unusual or surprising patterns in d
 * Written: 2026-03-23T03:34:25.423Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function detectNovelty(data, threshold) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Input data must be a non-empty array.");
    }
    if (typeof threshold !== "number" || threshold <= 0) {
        throw new Error("Threshold must be a positive number.");
    }

    // Calculate mean and standard deviation
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Identify novel data points
    const novelPoints = data.filter((val) => Math.abs(val - mean) > threshold * stdDev);

    return {
        mean: mean,
        stdDev: stdDev,
        novelPoints: novelPoints,
    };
}

// Test cases
console.log("Test Case 1:");
console.log(detectNovelty([1, 2, 3, 4, 5, 100], 2)); // Expect: Novel point [100]

console.log("Test Case 2:");
console.log(detectNovelty([10, 12, 10, 11, 10, 50, 12], 1.5)); // Expect: Novel point [50]

console.log("Test Case 3:");
console.log(detectNovelty([5, 5, 5, 5, 5], 2)); // Expect: No novel points

console.log("Test Case 4:");
console.log(detectNovelty([-10, -12, -11, -10, -100], 2)); // Expect: Novel point [-100]

console.log("Edge Case 1:");
try {
    console.log(detectNovelty([], 2)); // Expect: Error
} catch (e) {
    console.log(e.message);
}

console.log("Edge Case 2:");
try {
    console.log(detectNovelty([1, 2, 3], -1)); // Expect: Error
} catch (e) {
    console.log(e.message);
}