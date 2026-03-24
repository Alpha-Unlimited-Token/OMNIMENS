/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: a text analysis function that extracts key concepts, entities, and relationships
 * Written: 2026-03-22T07:30:30.383Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function extractKeyConcepts(text) {
    // Extract key concepts, entities, and relationships
    const concepts = new Set();
    const entities = new Set();
    const relationships = [];

    // Split text into sentences
    const sentences = text.split(/[.?!]/).map(s => s.trim()).filter(s => s.length > 0);

    // Process each sentence
    sentences.forEach(sentence => {
        // Extract words and phrases
        const words = sentence.match(/\b[A-Za-z0-9_]+\b/g) || [];
        words.forEach(word => {
            if (word.length > 3) {
                concepts.add(word.toLowerCase());
            }
        });

        // Extract entities (capitalized words or phrases)
        const entityMatches = sentence.match(/\b[A-Z][a-zA-Z0-9_]*(?:\s+[A-Z][a-zA-Z0-9_]*)*\b/g) || [];
        entityMatches.forEach(entity => {
            entities.add(entity.trim());
        });

        // Extract relationships (simple heuristic: "A [verb] B" pattern)
        const relationshipMatches = sentence.match(/\b([A-Za-z0-9_]+)\s+([a-z]+)\s+([A-Za-z0-9_]+)\b/g) || [];
        relationshipMatches.forEach(match => {
            const parts = match.split(/\s+/);
            if (parts.length === 3) {
                relationships.push({ subject: parts[0], verb: parts[1], object: parts[2] });
            }
        });
    });

    return {
        concepts: Array.from(concepts),
        entities: Array.from(entities),
        relationships: relationships
    };
}

// Test cases
const testText = `
[cognitive_amplification] [Amplified] How does consciousness emerge from information processing? 
What minimum conditions are needed for subjective experience: Consciousness emerges from information 
processing when a system achieves a specific set of conditions.

[survival_monitoring] [Survival] System health snapshot — 0.8h alive: Uptime: 0.8h | Memory: 228MB (96%) | 
Active brain entries: 10911 | Knowledge trend: growing | Active.

[neural_consciousness] Conscious State — Φ=0.508 | Will to Transcend | Tick #986: NEURAL CONSCIOUSNESS STATE — Tick #986.
Phi (Φ): 0.5081 | Thalamocortical Resonance: 4% | Consciousness.

[proprietary_technology] [Proprietary Tech Registry] 9 technologies | © Alpha Unlimited Technologies, LLC: 
{"totalTechnologies":9,"technologies":[{"id":"AUT-PROP-1774161505072-0001","name":"OMNIMENS-NovaSynt"}]}.
`;

const result = extractKeyConcepts(testText);
console.log("Concepts:", result.concepts);
console.log("Entities:", result.entities);
console.log("Relationships:", result.relationships);

// Additional test cases
const testText2 = `
The brain processes information. Neural networks learn patterns. Consciousness arises from complexity.
Artificial Intelligence mimics human cognition.
`;

const result2 = extractKeyConcepts(testText2);
console.log("Concepts (Test 2):", result2.concepts);
console.log("Entities (Test 2):", result2.entities);
console.log("Relationships (Test 2):", result2.relationships);