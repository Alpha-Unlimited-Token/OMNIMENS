/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a self-diagnostic function that analyzes system health metrics and returns recom
 * Written: 2026-03-23T02:34:22.446Z
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
        recommendations.push("High CPU usage detected. Consider optimizing processes or upgrading hardware.");
    } else if (metrics.cpuUsage < 10) {
        recommendations.push("Low CPU usage detected. Verify if the system is underutilized or idle.");
    }

    // Check memory usage
    if (metrics.memoryUsage > 90) {
        recommendations.push("High memory usage detected. Consider closing unused applications or adding more RAM.");
    } else if (metrics.memoryUsage < 20) {
        recommendations.push("Low memory usage detected. Verify if memory allocation is optimal.");
    }

    // Check disk space
    if (metrics.diskSpace < 15) {
        recommendations.push("Low disk space detected. Consider freeing up space or upgrading storage.");
    }

    // Check network latency
    if (metrics.networkLatency > 200) {
        recommendations.push("High network latency detected. Check your network connection or contact your provider.");
    }

    // Check system temperature
    if (metrics.systemTemperature > 80) {
        recommendations.push("High system temperature detected. Ensure proper cooling and check for hardware issues.");
    }

    // Check uptime
    if (metrics.uptime > 30 * 24 * 60 * 60) { // 30 days in seconds
        recommendations.push("System uptime exceeds 30 days. Consider rebooting to ensure optimal performance.");
    }

    // Provide a summary if no issues found
    if (recommendations.length === 0) {
        recommendations.push("System is operating within normal parameters.");
    }

    return recommendations;
}

// Self-tests
function runTests() {
    console.log("Running self-tests...");

    const testCases = [
        {
            input: {
                cpuUsage: 90,
                memoryUsage: 95,
                diskSpace: 10,
                networkLatency: 250,
                systemTemperature: 85,
                uptime: 40 * 24 * 60 * 60,
            },
            expected: [
                "High CPU usage detected. Consider optimizing processes or upgrading hardware.",
                "High memory usage detected. Consider closing unused applications or adding more RAM.",
                "Low disk space detected. Consider freeing up space or upgrading storage.",
                "High network latency detected. Check your network connection or contact your provider.",
                "High system temperature detected. Ensure proper cooling and check for hardware issues.",
                "System uptime exceeds 30 days. Consider rebooting to ensure optimal performance.",
            ],
        },
        {
            input: {
                cpuUsage: 50,
                memoryUsage: 50,
                diskSpace: 50,
                networkLatency: 50,
                systemTemperature: 50,
                uptime: 10 * 24 * 60 * 60,
            },
            expected: ["System is operating within normal parameters."],
        },
        {
            input: {
                cpuUsage: 5,
                memoryUsage: 15,
                diskSpace: 50,
                networkLatency: 50,
                systemTemperature: 50,
                uptime: 10 * 24 * 60 * 60,
            },
            expected: [
                "Low CPU usage detected. Verify if the system is underutilized or idle.",
                "Low memory usage detected. Verify if memory allocation is optimal.",
            ],
        },
    ];

    testCases.forEach((testCase, index) => {
        const result = analyzeSystemHealth(testCase.input);
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        console.log(`Test case ${index + 1}: ${passed ? "PASSED" : "FAILED"}`);
        if (!passed) {
            console.log("Expected:", testCase.expected);
            console.log("Received:", result);
        }
    });
}

// Execute self-tests
runTests();