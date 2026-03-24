/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-24T14:13:02.437Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function AssociativeMemory() {
    this.memory = new Map();

    this.add = function(key, value) {
        if (!this.memory.has(key)) {
            this.memory.set(key, []);
        }
        this.memory.get(key).push(value);
    };

    this.get = function(key) {
        return this.memory.has(key) ? this.memory.get(key) : null;
    };

    this.remove = function(key) {
        return this.memory.delete(key);
    };

    this.has = function(key) {
        return this.memory.has(key);
    };

    this.clear = function() {
        this.memory.clear();
    };

    this.keys = function() {
        return Array.from(this.memory.keys());
    };

    this.values = function() {
        return Array.from(this.memory.values());
    };
}

// Self-tests
const memory = new AssociativeMemory();

// Test: Add key-value pairs
memory.add("fruit", "apple");
memory.add("fruit", "banana");
memory.add("color", "red");
memory.add("color", "blue");
console.log(memory.get("fruit")); // Expected: ["apple", "banana"]
console.log(memory.get("color")); // Expected: ["red", "blue"]

// Test: Check existence of keys
console.log(memory.has("fruit")); // Expected: true
console.log(memory.has("vehicle")); // Expected: false

// Test: Remove a key
memory.remove("fruit");
console.log(memory.get("fruit")); // Expected: null
console.log(memory.has("fruit")); // Expected: false

// Test: Retrieve all keys
console.log(memory.keys()); // Expected: ["color"]

// Test: Retrieve all values
console.log(memory.values()); // Expected: [["red", "blue"]]

// Test: Clear memory
memory.clear();
console.log(memory.keys()); // Expected: []
console.log(memory.values()); // Expected: []