/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a self-diagnostic function that analyzes system health metrics and returns recom
 * Written: 2026-03-23T22:29:27.124Z
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
    
    if (!metrics || typeof metrics !== 'object') {
        throw new Error("Invalid input: metrics must be an object.");
    }

    // Check CPU usage
    if (metrics.cpuUsage > 85) {
        recommendations.push("Reduce CPU-intensive tasks or optimize processes.");
    } else if (metrics.cpuUsage < 10) {
        recommendations.push("CPU usage is unusually low; check for idle processes.");
    }

    // Check memory usage
    if (metrics.memoryUsage > 90) {
        recommendations.push("Memory usage is critical; consider freeing up memory or increasing capacity.");
    } else if (metrics.memoryUsage < 20) {
        recommendations.push("Memory usage is unusually low; verify system activity.");
    }

    // Check disk space
    if (metrics.diskSpace < 15) {
        recommendations.push("Disk space is critically low; consider cleaning up or expanding storage.");
    }

    // Check system temperature
    if (metrics.temperature > 75) {
        recommendations.push("System temperature is too high; check cooling systems.");
    } else if (metrics.temperature < 10) {
        recommendations.push("System temperature is abnormally low; verify sensor accuracy.");
    }

    // Check network latency
    if (metrics.networkLatency > 200) {
        recommendations.push("Network latency is high; investigate connection issues.");
    }

    // Return recommendations
    return {
        status: recommendations.length > 0 ? "Issues detected" : "System healthy",
        recommendations: recommendations
    };
}

// Test cases
function runTests() {
    console.log("Running tests...");

    // Test 1: Normal system health
    const metrics1 = {
        cpuUsage: 50,
        memoryUsage: 60,
        diskSpace: 50,
        temperature: 40,
        networkLatency: 100
    };
    console.log(analyzeSystemHealth(metrics1));

    // Test 2: High CPU usage
    const metrics2 = {
        cpuUsage: 90,
        memoryUsage: 60,
        diskSpace: 50,
        temperature: 40,
        networkLatency: 100
    };
    console.log(analyzeSystemHealth(metrics2));

    // Test 3: Low disk space
    const metrics3 = {
        cpuUsage: 50,
        memoryUsage: 60,
        diskSpace: 10,
        temperature: 40,
        networkLatency: 100
    };
    console.log(analyzeSystemHealth(metrics3));

    // Test 4: High temperature
    const metrics4 = {
        cpuUsage: 50,
        memoryUsage: 60,
        diskSpace: 50,
        temperature: 80,
        networkLatency: 100
    };
    console.log(analyzeSystemHealth(metrics4));

    // Test 5: Invalid input
    try {
        console.log(analyzeSystemHealth(null));
    } catch (error) {
        console.log(error.message);
    }

    // Test 6: Low memory usage
    const metrics6 = {
        cpuUsage: 50,
        memoryUsage: 10,
        diskSpace: 50,
        temperature: 40,
        networkLatency: 100
    };
    console.log(analyzeSystemHealth(metrics6));
}

runTests();