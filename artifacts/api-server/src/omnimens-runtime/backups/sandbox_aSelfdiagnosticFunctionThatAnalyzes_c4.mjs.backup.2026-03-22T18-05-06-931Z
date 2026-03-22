/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a self-diagnostic function that analyzes system health metrics and returns recom
 * Written: 2026-03-22T12:52:58.374Z
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

    // Analyze uptime
    if (metrics.uptime < 1) {
        recommendations.push("Increase uptime stability. Investigate frequent restarts or crashes.");
    } else {
        recommendations.push("Uptime is stable.");
    }

    // Analyze memory usage
    if (metrics.memoryUsage > 90) {
        recommendations.push("Memory usage is critically high. Optimize memory allocation or increase available memory.");
    } else if (metrics.memoryUsage > 75) {
        recommendations.push("Memory usage is moderately high. Monitor for potential issues.");
    } else {
        recommendations.push("Memory usage is within acceptable range.");
    }

    // Analyze CPU load
    if (metrics.cpuLoad > 85) {
        recommendations.push("CPU load is critically high. Optimize processes or reduce workload.");
    } else if (metrics.cpuLoad > 70) {
        recommendations.push("CPU load is moderately high. Monitor for potential bottlenecks.");
    } else {
        recommendations.push("CPU load is within acceptable range.");
    }

    // Analyze disk space
    if (metrics.diskUsage > 90) {
        recommendations.push("Disk usage is critically high. Free up space or increase disk capacity.");
    } else if (metrics.diskUsage > 75) {
        recommendations.push("Disk usage is moderately high. Monitor storage utilization.");
    } else {
        recommendations.push("Disk usage is within acceptable range.");
    }

    return recommendations;
}

// Self-tests
function runTests() {
    const testCases = [
        {
            input: { uptime: 0.5, memoryUsage: 96, cpuLoad: 87, diskUsage: 92 },
            expected: [
                "Increase uptime stability. Investigate frequent restarts or crashes.",
                "Memory usage is critically high. Optimize memory allocation or increase available memory.",
                "CPU load is critically high. Optimize processes or reduce workload.",
                "Disk usage is critically high. Free up space or increase disk capacity."
            ]
        },
        {
            input: { uptime: 2, memoryUsage: 80, cpuLoad: 72, diskUsage: 76 },
            expected: [
                "Uptime is stable.",
                "Memory usage is moderately high. Monitor for potential issues.",
                "CPU load is moderately high. Monitor for potential bottlenecks.",
                "Disk usage is moderately high. Monitor storage utilization."
            ]
        },
        {
            input: { uptime: 5, memoryUsage: 50, cpuLoad: 40, diskUsage: 30 },
            expected: [
                "Uptime is stable.",
                "Memory usage is within acceptable range.",
                "CPU load is within acceptable range.",
                "Disk usage is within acceptable range."
            ]
        }
    ];

    testCases.forEach((testCase, index) => {
        const result = analyzeSystemHealth(testCase.input);
        console.log(`Test Case ${index + 1}:`, JSON.stringify(result) === JSON.stringify(testCase.expected) ? "Passed" : "Failed");
    });
}

runTests();