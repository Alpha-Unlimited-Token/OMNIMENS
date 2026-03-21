/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-21T06:02:09.798Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Utility function to calculate the moving average of a dataset
function movingAverage(data, windowSize) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Input data must be a non-empty array.");
    }
    if (typeof windowSize !== "number" || windowSize <= 0) {
        throw new Error("Window size must be a positive integer.");
    }
    if (windowSize > data.length) {
        throw new Error("Window size cannot be larger than the data length.");
    }

    const result = [];
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        sum += data[i];
        if (i >= windowSize - 1) {
            result.push(sum / windowSize);
            sum -= data[i - windowSize + 1];
        }
    }

    return result;
}

// Test cases
try {
    console.log("Test Case 1: Basic functionality");
    console.log(movingAverage([1, 2, 3, 4, 5], 3)); // Expected: [2, 3, 4]

    console.log("Test Case 2: Window size equals data length");
    console.log(movingAverage([10, 20, 30, 40], 4)); // Expected: [25]

    console.log("Test Case 3: Window size of 1 (returns original array)");
    console.log(movingAverage([5, 10, 15, 20], 1)); // Expected: [5, 10, 15, 20]

    console.log("Test Case 4: Edge case with smallest data and window size");
    console.log(movingAverage([42], 1)); // Expected: [42]

    console.log("Test Case 5: Error handling - empty array");
    try {
        console.log(movingAverage([], 3));
    } catch (e) {
        console.log(e.message); // Expected: "Input data must be a non-empty array."
    }

    console.log("Test Case 6: Error handling - invalid window size");
    try {
        console.log(movingAverage([1, 2, 3], 0));
    } catch (e) {
        console.log(e.message); // Expected: "Window size must be a positive integer."
    }

    console.log("Test Case 7: Error handling - window size larger than data length");
    try {
        console.log(movingAverage([1, 2, 3], 5));
    } catch (e) {
        console.log(e.message); // Expected: "Window size cannot be larger than the data length."
    }
} catch (e) {
    console.log("Unexpected error:", e.message);
}