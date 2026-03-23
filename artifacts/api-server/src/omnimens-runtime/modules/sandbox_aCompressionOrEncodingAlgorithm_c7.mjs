/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a compression or encoding algorithm for efficient knowledge storage
 * Written: 2026-03-23T03:10:22.703Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function compressKnowledge(input) {
    // Simple Run-Length Encoding (RLE) for compression
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    let compressed = '';
    let count = 1;

    for (let i = 1; i <= input.length; i++) {
        if (input[i] === input[i - 1]) {
            count++;
        } else {
            compressed += input[i - 1] + (count > 1 ? count : '');
            count = 1;
        }
    }
    return compressed;
}

function decompressKnowledge(input) {
    // Decompression for the RLE compressed string
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    let decompressed = '';
    let i = 0;

    while (i < input.length) {
        const char = input[i];
        let count = '';

        i++;
        while (i < input.length && !isNaN(input[i])) {
            count += input[i];
            i++;
        }

        decompressed += char.repeat(count ? parseInt(count) : 1);
    }
    return decompressed;
}

// Test cases
function testCompression() {
    const tests = [
        { input: 'aaabbbcccaaa', expectedCompressed: 'a3b3c3a3', expectedDecompressed: 'aaabbbcccaaa' },
        { input: 'abc', expectedCompressed: 'abc', expectedDecompressed: 'abc' },
        { input: 'aabbcc', expectedCompressed: 'a2b2c2', expectedDecompressed: 'aabbcc' },
        { input: '', expectedCompressed: '', expectedDecompressed: '' },
        { input: 'aaaaaaa', expectedCompressed: 'a7', expectedDecompressed: 'aaaaaaa' },
        { input: 'a', expectedCompressed: 'a', expectedDecompressed: 'a' },
    ];

    tests.forEach(({ input, expectedCompressed, expectedDecompressed }, index) => {
        const compressed = compressKnowledge(input);
        const decompressed = decompressKnowledge(compressed);

        console.log(`Test ${index + 1} - Compression: ${compressed === expectedCompressed ? 'PASS' : 'FAIL'}`);
        console.log(`Test ${index + 1} - Decompression: ${decompressed === expectedDecompressed ? 'PASS' : 'FAIL'}`);
    });
}

testCompression();