/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a novelty detection function that identifies unusual or surprising patterns in d
 * Written: 2026-03-24T08:07:11.726Z
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
    if (typeof threshold !== 'number' || threshold <= 0) {
        throw new Error("Threshold must be a positive number.");
    }

    // Calculate mean
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;

    // Calculate standard deviation
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // Identify novel patterns
    const novelty = data.map((value, index) => {
        const zScore = (value - mean) / stdDev;
        return {
            index: index,
            value: value,
            zScore: zScore,
            isNovel: Math.abs(zScore) > threshold
        };
    });

    return novelty.filter(item => item.isNovel);
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test case 1: Basic functionality
    const data1 = [1, 2, 3, 4, 100];
    const threshold1 = 2;
    const result1 = detectNovelty(data1, threshold1);
    console.log("Test case 1 result:", result1);

    // Test case 2: All values within threshold
    const data2 = [10, 12, 11, 13, 12];
    const threshold2 = 3;
    const result2 = detectNovelty(data2, threshold2);
    console.log("Test case 2 result:", result2);

    // Test case 3: Empty array
    try {
        detectNovelty([], 2);
    } catch (error) {
        console.log("Test case 3 result:", error.message);
    }

    // Test case 4: Invalid threshold
    try {
        detectNovelty([1, 2, 3], -1);
    } catch (error) {
        console.log("Test case 4 result:", error.message);
    }

    // Test case 5: Extremely high threshold
    const data5 = [1, 2, 3, 4, 100];
    const threshold5 = 100;
    const result5 = detectNovelty(data5, threshold5);
    console.log("Test case 5 result:", result5);

    console.log("Tests completed.");
}

// Execute tests
runTests();