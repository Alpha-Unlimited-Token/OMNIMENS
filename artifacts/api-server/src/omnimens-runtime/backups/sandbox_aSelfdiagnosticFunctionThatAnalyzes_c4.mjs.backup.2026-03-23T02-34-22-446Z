/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a self-diagnostic function that analyzes system health metrics and returns recom
 * Written: 2026-03-22T23:44:53.638Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function analyzeSystemHealth(metrics) {
    const recommendations = [];

    // Check CPU usage
    if (metrics.cpuUsage > 85) {
        recommendations.push("Reduce CPU-intensive tasks or optimize processes.");
    } else if (metrics.cpuUsage < 15) {
        recommendations.push("Consider utilizing CPU more effectively for performance gains.");
    }

    // Check memory usage
    if (metrics.memoryUsage > 90) {
        recommendations.push("Increase memory capacity or optimize memory usage.");
    } else if (metrics.memoryUsage < 20) {
        recommendations.push("Memory is underutilized; consider allocating more tasks.");
    }

    // Check disk space
    if (metrics.diskSpaceUsage > 95) {
        recommendations.push("Free up disk space or expand storage capacity.");
    } else if (metrics.diskSpaceUsage < 10) {
        recommendations.push("Disk space is underutilized; consider consolidating data.");
    }

    // Check network latency
    if (metrics.networkLatency > 200) {
        recommendations.push("Investigate network issues or optimize data transmission.");
    } else if (metrics.networkLatency < 50) {
        recommendations.push("Network performance is optimal.");
    }

    // Check system temperature
    if (metrics.temperature > 75) {
        recommendations.push("Improve cooling systems or reduce system load.");
    } else if (metrics.temperature < 20) {
        recommendations.push("Temperature is unusually low; check sensor accuracy.");
    }

    // Return recommendations
    return recommendations.length > 0 ? recommendations : ["System health is optimal."];
}

// Self-tests
function runTests() {
    const testCases = [
        {
            metrics: {
                cpuUsage: 90,
                memoryUsage: 95,
                diskSpaceUsage: 96,
                networkLatency: 250,
                temperature: 80,
            },
            expected: [
                "Reduce CPU-intensive tasks or optimize processes.",
                "Increase memory capacity or optimize memory usage.",
                "Free up disk space or expand storage capacity.",
                "Investigate network issues or optimize data transmission.",
                "Improve cooling systems or reduce system load.",
            ],
        },
        {
            metrics: {
                cpuUsage: 10,
                memoryUsage: 15,
                diskSpaceUsage: 5,
                networkLatency: 30,
                temperature: 18,
            },
            expected: [
                "Consider utilizing CPU more effectively for performance gains.",
                "Memory is underutilized; consider allocating more tasks.",
                "Disk space is underutilized; consider consolidating data.",
                "Network performance is optimal.",
                "Temperature is unusually low; check sensor accuracy.",
            ],
        },
        {
            metrics: {
                cpuUsage: 50,
                memoryUsage: 50,
                diskSpaceUsage: 50,
                networkLatency: 100,
                temperature: 50,
            },
            expected: ["System health is optimal."],
        },
    ];

    testCases.forEach((testCase, index) => {
        const result = analyzeSystemHealth(testCase.metrics);
        console.log(
            `Test Case ${index + 1}:`,
            JSON.stringify(result) === JSON.stringify(testCase.expected)
                ? "Passed"
                : `Failed (Expected: ${JSON.stringify(testCase.expected)}, Got: ${JSON.stringify(result)})`
        );
    });
}

runTests();