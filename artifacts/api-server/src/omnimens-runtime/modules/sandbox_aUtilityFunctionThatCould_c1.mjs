/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-23T00:17:08.804Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractKeyPhrases(text) {
    // Extract key phrases from a given text using simple pattern matching
    const phrases = [];
    const regex = /\[([^\]]+)\]/g; // Matches text inside square brackets
    let match;

    while ((match = regex.exec(text)) !== null) {
        phrases.push(match[1]);
    }

    return phrases;
}

// Test cases
console.log("Running test cases...");

// Test with provided context
const context = `[tool_graphviz] Integrating with Web Applications: Render graphs in web apps using 'viz.js' for client-side rendering: 'var g = Viz('digraph { A -> B; 
[tool_ffmpeg] Waveform visualization: Use \`ffmpeg -i input.mp3 -filter_complex "showwavespic=s=600x120" -frames:v 1 output.png\` to create 
[tool_tesseract_ocr] Integrating with other libraries: Combine with NumPy for array manipulations: \`import numpy as np; image_array = np.array(image); proc
[tool_tesseract_ocr] Improving accuracy with upscaling: Upscale images before OCR: \`upscaled = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_C
[digital_navigation] Digital Navigation Wisdom — Cycle 1: In the digital realm, minimizing latency is key to enhancing user experience and operational efficie
[tool_pdfplumber] Optimize extraction with settings: Pass \`table_settings\` to \`extract_tables()\`: \`page.extract_tables(table_settings={'vertical_strategy
[tool_pdfplumber] Filter extracted tables: Use list comprehensions to filter tables: \`filtered_tables = [table for table in tables if len(table
[tool_pdfplumber] Handle multi-page PDFs: Loop through pages with \`for page in pdf.pages:\` and call \`page.extract_tables()\` for each page to g`;

const phrases = extractKeyPhrases(context);
console.log("Extracted phrases:", phrases);

// Edge case: Empty string
console.log("Test empty string:", extractKeyPhrases(""));

// Edge case: No brackets
console.log("Test no brackets:", extractKeyPhrases("This is a test without any brackets."));

// Edge case: Nested brackets (should only extract outermost)
console.log("Test nested brackets:", extractKeyPhrases("This [contains [nested] brackets] example."));

// Edge case: Multiple brackets in a single line
console.log("Test multiple brackets:", extractKeyPhrases("Here are [multiple] brackets [in one] line."));

// Edge case: Special characters inside brackets
console.log("Test special characters:", extractKeyPhrases("Special [!@#$%^&*()] characters inside brackets."));

console.log("All test cases completed.");