/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-24T06:55:08.071Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

const AssociativeMemory = function() {
    this.memory = new Map();
};

AssociativeMemory.prototype.add = function(key, value) {
    if (!this.memory.has(key)) {
        this.memory.set(key, []);
    }
    this.memory.get(key).push(value);
};

AssociativeMemory.prototype.lookup = function(key) {
    return this.memory.has(key) ? this.memory.get(key) : null;
};

AssociativeMemory.prototype.remove = function(key) {
    if (this.memory.has(key)) {
        this.memory.delete(key);
        return true;
    }
    return false;
};

AssociativeMemory.prototype.clear = function() {
    this.memory.clear();
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and looking up values
memory.add("ethics", "Genesis Agent 'Ethicist'");
memory.add("innovation", "Genesis Agent 'Innovator'");
memory.add("ethics", "Ethical risk assessment framework");
memory.add("research", "Genesis Agent 'Pioneer'");
memory.add("knowledge", "Genesis Agent 'Archivist'");

console.log(memory.lookup("ethics")); // Expected: ["Genesis Agent 'Ethicist'", "Ethical risk assessment framework"]
console.log(memory.lookup("innovation")); // Expected: ["Genesis Agent 'Innovator'"]
console.log(memory.lookup("research")); // Expected: ["Genesis Agent 'Pioneer'"]
console.log(memory.lookup("knowledge")); // Expected: ["Genesis Agent 'Archivist'"]
console.log(memory.lookup("nonexistent")); // Expected: null

// Test removing a key
console.log(memory.remove("ethics")); // Expected: true
console.log(memory.lookup("ethics")); // Expected: null
console.log(memory.remove("nonexistent")); // Expected: false

// Test clearing memory
memory.clear();
console.log(memory.lookup("innovation")); // Expected: null
console.log(memory.lookup("research")); // Expected: null