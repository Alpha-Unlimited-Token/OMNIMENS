/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T15:50:21.284Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function extractNumbersFromText(text) {
    // Extracts all numbers (integers and floats) from the given text and returns them as an array
    const numberPattern = /-?\d+(\.\d+)?/g;
    const matches = text.match(numberPattern);
    return matches ? matches.map(Number) : [];
}

// Test cases
function runTests() {
    console.log("Test 1: Extracting numbers from text with integers and floats");
    console.log(extractNumbersFromText("The price is 45.67 dollars, and the discount is 10%.")); 
    // Expected: [45.67, 10]

    console.log("Test 2: Extracting negative numbers");
    console.log(extractNumbersFromText("Temperatures dropped to -5 degrees last night.")); 
    // Expected: [-5]

    console.log("Test 3: Extracting numbers from text with no numbers");
    console.log(extractNumbersFromText("There are no numbers here!")); 
    // Expected: []

    console.log("Test 4: Extracting numbers from mixed text");
    console.log(extractNumbersFromText("Coordinates are x=12.34, y=-56.78, z=90.")); 
    // Expected: [12.34, -56.78, 90]

    console.log("Test 5: Extracting numbers from text with large numbers and scientific notation");
    console.log(extractNumbersFromText("The distance is 1.23e+10 meters or 12300000000 meters.")); 
    // Expected: [1.23, 10, 12300000000]

    console.log("Test 6: Extracting numbers from text with multiple spaces and special characters");
    console.log(extractNumbersFromText("Values:  1000, -2000; 3000.5!")); 
    // Expected: [1000, -2000, 3000.5]
}

// Run tests
runTests();