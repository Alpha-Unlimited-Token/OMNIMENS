/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-23T01:39:49.042Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

class FastAssociativeMemory {
    constructor() {
        this.memory = new Map();
    }

    // Insert a key-value pair into the memory
    insert(key, value) {
        if (key === null || key === undefined) {
            throw new Error("Key cannot be null or undefined.");
        }
        this.memory.set(key, value);
    }

    // Retrieve a value by key
    lookup(key) {
        if (this.memory.has(key)) {
            return this.memory.get(key);
        }
        return null; // Return null if key is not found
    }

    // Remove a key-value pair by key
    remove(key) {
        return this.memory.delete(key);
    }

    // Check if a key exists in the memory
    contains(key) {
        return this.memory.has(key);
    }

    // Clear all entries in the memory
    clear() {
        this.memory.clear();
    }

    // Get the total number of entries
    size() {
        return this.memory.size;
    }
}

// Self-tests
const memory = new FastAssociativeMemory();

// Test 1: Insert and lookup
memory.insert("name", "Alice");
console.log(memory.lookup("name")); // Expected: "Alice"

// Test 2: Lookup non-existent key
console.log(memory.lookup("age")); // Expected: null

// Test 3: Remove key and verify
memory.insert("age", 30);
console.log(memory.lookup("age")); // Expected: 30
memory.remove("age");
console.log(memory.lookup("age")); // Expected: null

// Test 4: Check contains
memory.insert("city", "New York");
console.log(memory.contains("city")); // Expected: true
console.log(memory.contains("country")); // Expected: false

// Test 5: Clear memory and check size
memory.clear();
console.log(memory.size()); // Expected: 0

// Test 6: Edge case - Insert null or undefined key
try {
    memory.insert(null, "value");
} catch (e) {
    console.log(e.message); // Expected: "Key cannot be null or undefined."
}

try {
    memory.insert(undefined, "value");
} catch (e) {
    console.log(e.message); // Expected: "Key cannot be null or undefined."
}