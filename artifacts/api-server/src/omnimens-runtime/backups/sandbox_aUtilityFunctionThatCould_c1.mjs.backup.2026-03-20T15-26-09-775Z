/**
 * OMNIMENS Self-Authored Module
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a utility function that could be useful for an AI system (data processing, patte
 * Written: 2026-03-20T15:14:10.839Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 */

function extractTablesFromText(text) {
    // Extract tables from a given text input
    const tables = [];
    const tableRegex = /\[table\](.*?)\[\/table\]/gs;

    let match;
    while ((match = tableRegex.exec(text)) !== null) {
        const tableContent = match[1].trim();
        const rows = tableContent.split('\n').map(row => row.split('|').map(cell => cell.trim()));
        tables.push(rows);
    }

    return tables;
}

// Test cases
function runTests() {
    const testText1 = `
        Some random text here.
        [table]
        Name | Age | Location
        John | 25  | USA
        Jane | 30  | UK
        [/table]
        More random text.
    `;

    const testText2 = `
        [table]
        Product | Price | Quantity
        Apple   | 1.00  | 10
        Banana  | 0.50  | 20
        [/table]
        [table]
        Day | Temperature | Condition
        Mon | 22C         | Sunny
        Tue | 18C         | Rainy
        [/table]
    `;

    const testText3 = `
        No tables here, just plain text.
    `;

    console.log("Test Case 1:");
    console.log(extractTablesFromText(testText1));
    console.log("Expected:", [
        [
            ["Name", "Age", "Location"],
            ["John", "25", "USA"],
            ["Jane", "30", "UK"]
        ]
    ]);

    console.log("Test Case 2:");
    console.log(extractTablesFromText(testText2));
    console.log("Expected:", [
        [
            ["Product", "Price", "Quantity"],
            ["Apple", "1.00", "10"],
            ["Banana", "0.50", "20"]
        ],
        [
            ["Day", "Temperature", "Condition"],
            ["Mon", "22C", "Sunny"],
            ["Tue", "18C", "Rainy"]
        ]
    ]);

    console.log("Test Case 3:");
    console.log(extractTablesFromText(testText3));
    console.log("Expected:", []);
}

// Run tests
runTests();