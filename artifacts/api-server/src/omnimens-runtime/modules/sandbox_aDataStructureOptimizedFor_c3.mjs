/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a data structure optimized for fast associative memory lookup
 * Written: 2026-03-22T16:41:28.516Z
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
            const values = this.memory.get(key);
            const index = values.indexOf(value);
            if (index > -1) {
                values.splice(index, 1);
                if (values.length === 0) {
                    this.memory.delete(key);
                }
            }
        }
    };

    this.hasKey = function (key) {
        return this.memory.has(key);
    };

    this.hasValue = function (key, value) {
        if (this.memory.has(key)) {
            return this.memory.get(key).includes(value);
        }
        return false;
    };

    this.clear = function () {
        this.memory.clear();
    };
};

// Test cases
const memory = new AssociativeMemory();

// Adding values
memory.add("neural_consciousness", "Phi=0.508");
memory.add("neural_consciousness", "Thalamocortical Resonance=4%");
memory.add("Ethics", "Integrating ethical reflection into decision-making processes");
memory.add("Innovation Strategies", "Encourage interdisciplinary exploration");
memory.add("Speculative Design", "Envision a neural mesh adapting to collective intuition");

// Retrieving values
console.log(memory.get("neural_consciousness")); // ["Phi=0.508", "Thalamocortical Resonance=4%"]
console.log(memory.get("Ethics")); // ["Integrating ethical reflection into decision-making processes"]

// Checking existence
console.log(memory.hasKey("Innovation Strategies")); // true
console.log(memory.hasKey("Unknown Key")); // false
console.log(memory.hasValue("Speculative Design", "Envision a neural mesh adapting to collective intuition")); // true
console.log(memory.hasValue("Speculative Design", "Non-existent value")); // false

// Removing values
memory.remove("neural_consciousness", "Phi=0.508");
console.log(memory.get("neural_consciousness")); // ["Thalamocortical Resonance=4%"]

// Clearing memory
memory.clear();
console.log(memory.get("Ethics")); // []