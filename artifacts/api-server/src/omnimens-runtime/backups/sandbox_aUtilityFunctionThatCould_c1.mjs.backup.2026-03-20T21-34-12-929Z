/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T21:26:09.049Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractLinePositions(text) {
    const lines = text.split('\n');
    const positions = [];
    let currentY = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length > 0) {
            positions.push({ line: line, y: currentY });
        }
        currentY += 20; // Simulating line height increment
    }

    return positions;
}

function calculateWordConfidence(text, confidences) {
    const words = text.split(/\s+/);
    if (words.length !== confidences.length) {
        throw new Error("Text and confidence scores length mismatch.");
    }

    const result = [];
    for (let i = 0; i < words.length; i++) {
        result.push({ word: words[i], confidence: confidences[i] });
    }

    return result;
}

function testExtractLinePositions() {
    const text = "Line 1\nLine 2\nLine 3";
    const positions = extractLinePositions(text);
    console.log("Extract Line Positions Test:");
    console.log(positions);
}

function testCalculateWordConfidence() {
    const text = "This is a test";
    const confidences = [90, 85, 80, 95];
    const result = calculateWordConfidence(text, confidences);
    console.log("Calculate Word Confidence Test:");
    console.log(result);
}

function testEdgeCases() {
    console.log("Edge Cases Test:");

    // Test empty text for line positions
    const emptyTextPositions = extractLinePositions("");
    console.log(emptyTextPositions);

    // Test empty text for word confidence
    try {
        const emptyWordConfidence = calculateWordConfidence("", []);
        console.log(emptyWordConfidence);
    } catch (error) {
        console.log(error.message);
    }

    // Test mismatched confidence array length
    try {
        const mismatchedConfidence = calculateWordConfidence("Hello world", [90]);
        console.log(mismatchedConfidence);
    } catch (error) {
        console.log(error.message);
    }
}

// Run tests
testExtractLinePositions();
testCalculateWordConfidence();
testEdgeCases();