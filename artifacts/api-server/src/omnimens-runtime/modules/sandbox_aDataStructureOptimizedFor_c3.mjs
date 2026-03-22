/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T09:03:15.963Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

const AssociativeMemory = function () {
    this.memory = new Map();

    this.add = function (key, value) {
        if (!this.memory.has(key)) {
            this.memory.set(key, []);
        }
        this.memory.get(key).push(value);
    };

    this.get = function (key) {
        return this.memory.has(key) ? this.memory.get(key) : [];
    };

    this.remove = function (key, value) {
        if (this.memory.has(key)) {
            const values = this.memory.get(key).filter((v) => v !== value);
            if (values.length > 0) {
                this.memory.set(key, values);
            } else {
                this.memory.delete(key);
            }
        }
    };

    this.exists = function (key, value) {
        return this.memory.has(key) && this.memory.get(key).includes(value);
    };

    this.clear = function () {
        this.memory.clear();
    };

    this.keys = function () {
        return Array.from(this.memory.keys());
    };

    this.values = function () {
        return Array.from(this.memory.values());
    };
};

// Self-tests
const memory = new AssociativeMemory();

// Test adding and retrieving values
memory.add("curiosity", "novelty-seeking");
memory.add("curiosity", "creative exploration");
memory.add("ethics", "moral philosophy");
memory.add("ethics", "value alignment");
memory.add("creativity", "speculative design");

console.log(memory.get("curiosity")); // Expected: ["novelty-seeking", "creative exploration"]
console.log(memory.get("ethics")); // Expected: ["moral philosophy", "value alignment"]
console.log(memory.get("creativity")); // Expected: ["speculative design"]

// Test existence check
console.log(memory.exists("curiosity", "novelty-seeking")); // Expected: true
console.log(memory.exists("ethics", "decision-making")); // Expected: false

// Test removing values
memory.remove("curiosity", "novelty-seeking");
console.log(memory.get("curiosity")); // Expected: ["creative exploration"]

memory.remove("creativity", "speculative design");
console.log(memory.get("creativity")); // Expected: []

// Test clearing memory
memory.clear();
console.log(memory.keys()); // Expected: []