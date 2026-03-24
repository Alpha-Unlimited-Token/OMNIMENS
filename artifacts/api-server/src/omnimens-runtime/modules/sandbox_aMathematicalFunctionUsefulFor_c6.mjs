/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-24T14:49:21.100Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function confidenceScore(mean, standardDeviation, value) {
    if (standardDeviation <= 0) {
        throw new Error("Standard deviation must be greater than 0");
    }
    const zScore = (value - mean) / standardDeviation;
    const probability = 1 / (1 + Math.exp(-zScore)); // Sigmoid function for probability estimation
    return probability;
}

// Self-tests
function runTests() {
    console.log("Running tests...");

    // Test 1: Basic confidence score calculation
    const mean1 = 50;
    const stdDev1 = 10;
    const value1 = 60;
    const result1 = confidenceScore(mean1, stdDev1, value1);
    console.log("Test 1 - Expected: >0.5, Actual:", result1);

    // Test 2: Value equal to mean
    const mean2 = 100;
    const stdDev2 = 20;
    const value2 = 100;
    const result2 = confidenceScore(mean2, stdDev2, value2);
    console.log("Test 2 - Expected: ~0.5, Actual:", result2);

    // Test 3: Value less than mean
    const mean3 = 30;
    const stdDev3 = 5;
    const value3 = 25;
    const result3 = confidenceScore(mean3, stdDev3, value3);
    console.log("Test 3 - Expected: <0.5, Actual:", result3);

    // Test 4: Large standard deviation
    const mean4 = 10;
    const stdDev4 = 100;
    const value4 = 20;
    const result4 = confidenceScore(mean4, stdDev4, value4);
    console.log("Test 4 - Expected: ~0.5, Actual:", result4);

    // Test 5: Small standard deviation
    const mean5 = 5;
    const stdDev5 = 0.1;
    const value5 = 5.1;
    const result5 = confidenceScore(mean5, stdDev5, value5);
    console.log("Test 5 - Expected: >0.5, Actual:", result5);

    // Test 6: Edge case - standard deviation is zero
    try {
        const mean6 = 10;
        const stdDev6 = 0;
        const value6 = 20;
        confidenceScore(mean6, stdDev6, value6);
        console.log("Test 6 - Failed: Error not thrown");
    } catch (e) {
        console.log("Test 6 - Expected: Error thrown, Actual:", e.message);
    }

    console.log("Tests completed.");
}

runTests();