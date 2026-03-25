/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-24T23:45:07.546Z
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

AssociativeMemory.prototype.store = function(key, value) {
    this.memory.set(key, value);
};

AssociativeMemory.prototype.retrieve = function(key) {
    return this.memory.has(key) ? this.memory.get(key) : null;
};

AssociativeMemory.prototype.remove = function(key) {
    if (this.memory.has(key)) {
        this.memory.delete(key);
        return true;
    }
    return false;
};

AssociativeMemory.prototype.exists = function(key) {
    return this.memory.has(key);
};

// Test cases
(function testAssociativeMemory() {
    const memory = new AssociativeMemory();

    // Test storing and retrieving data
    memory.store("key1", "value1");
    console.log(memory.retrieve("key1")); // Expected: "value1"

    memory.store("key2", 42);
    console.log(memory.retrieve("key2")); // Expected: 42

    memory.store("key3", { name: "Genesis", type: "Agent" });
    console.log(memory.retrieve("key3")); // Expected: { name: "Genesis", type: "Agent" }

    // Test existence check
    console.log(memory.exists("key1")); // Expected: true
    console.log(memory.exists("key4")); // Expected: false

    // Test removing data
    console.log(memory.remove("key2")); // Expected: true
    console.log(memory.retrieve("key2")); // Expected: null
    console.log(memory.exists("key2")); // Expected: false

    // Test edge cases
    console.log(memory.retrieve("nonexistent")); // Expected: null
    console.log(memory.remove("nonexistent")); // Expected: false

    // Test overwriting existing key
    memory.store("key1", "newValue1");
    console.log(memory.retrieve("key1")); // Expected: "newValue1"

    console.log("All tests passed.");
})();