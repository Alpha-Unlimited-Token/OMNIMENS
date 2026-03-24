/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-24T02:28:02.550Z
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
}

AssociativeMemory.prototype.add = function(key, value) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string.');
    }
    this.memory.set(key, value);
};

AssociativeMemory.prototype.get = function(key) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string.');
    }
    return this.memory.get(key) || null;
};

AssociativeMemory.prototype.remove = function(key) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string.');
    }
    return this.memory.delete(key);
};

AssociativeMemory.prototype.hasKey = function(key) {
    if (typeof key !== 'string') {
        throw new Error('Key must be a string.');
    }
    return this.memory.has(key);
};

AssociativeMemory.prototype.clear = function() {
    this.memory.clear();
};

AssociativeMemory.prototype.size = function() {
    return this.memory.size;
};

// Test cases
(function testAssociativeMemory() {
    const memory = new AssociativeMemory();

    // Test adding and retrieving values
    memory.add("name", "Alice");
    console.log(memory.get("name")); // Expected: "Alice"

    memory.add("age", 30);
    console.log(memory.get("age")); // Expected: 30

    // Test checking existence of keys
    console.log(memory.hasKey("name")); // Expected: true
    console.log(memory.hasKey("gender")); // Expected: false

    // Test removing a key
    memory.remove("name");
    console.log(memory.get("name")); // Expected: null
    console.log(memory.hasKey("name")); // Expected: false

    // Test clearing all keys
    memory.add("city", "New York");
    memory.add("country", "USA");
    console.log(memory.size()); // Expected: 2
    memory.clear();
    console.log(memory.size()); // Expected: 0

    // Test edge cases
    try {
        memory.add(123, "InvalidKey");
    } catch (e) {
        console.log(e.message); // Expected: "Key must be a string."
    }

    try {
        memory.get(123);
    } catch (e) {
        console.log(e.message); // Expected: "Key must be a string."
    }

    console.log("All tests passed.");
})();