/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a mathematical function useful for confidence scoring, probability estimation, o
 * Written: 2026-03-23T00:08:54.234Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function calculateConfidenceInterval(mean, stdDev, sampleSize, zScore) {
    if (sampleSize <= 0 || stdDev < 0 || zScore < 0) {
        throw new Error("Invalid input values. Ensure sample size > 0, standard deviation >= 0, and z-score >= 0.");
    }

    const marginOfError = zScore * (stdDev / Math.sqrt(sampleSize));
    const lowerBound = mean - marginOfError;
    const upperBound = mean + marginOfError;

    return {
        lowerBound: lowerBound,
        upperBound: upperBound,
        marginOfError: marginOfError
    };
}

// Test cases
function runTests() {
    // Test 1: Basic test
    let result = calculateConfidenceInterval(50, 10, 100, 1.96);
    console.log("Test 1:", result); // Expected: lowerBound and upperBound around 48.04 and 51.96

    // Test 2: Small sample size
    result = calculateConfidenceInterval(100, 15, 10, 1.96);
    console.log("Test 2:", result); // Expected: wider interval due to small sample size

    // Test 3: Zero standard deviation
    result = calculateConfidenceInterval(75, 0, 50, 1.96);
    console.log("Test 3:", result); // Expected: lowerBound and upperBound both equal 75

    // Test 4: Large sample size
    result = calculateConfidenceInterval(200, 20, 1000, 1.96);
    console.log("Test 4:", result); // Expected: very narrow interval due to large sample size

    // Test 5: Invalid inputs
    try {
        result = calculateConfidenceInterval(50, -10, 100, 1.96);
        console.log("Test 5: Failed (should throw error)");
    } catch (e) {
        console.log("Test 5: Passed (error thrown as expected)");
    }

    try {
        result = calculateConfidenceInterval(50, 10, -100, 1.96);
        console.log("Test 6: Failed (should throw error)");
    } catch (e) {
        console.log("Test 6: Passed (error thrown as expected)");
    }
}

runTests();