/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: autonomous_sandbox
 * Title: Sandbox Approved: an algorithm that improves efficiency of knowledge retrieval or pattern recognit
 * Written: 2026-03-25T00:15:42.966Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

function createKnowledgeIndex(insights) {
    const index = new Map();

    insights.forEach((insight, id) => {
        const words = insight.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        words.forEach(word => {
            if (!index.has(word)) {
                index.set(word, []);
            }
            index.get(word).push(id);
        });
    });

    return index;
}

function searchKnowledgeIndex(index, query, insights) {
    const queryWords = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const resultSet = new Set();

    queryWords.forEach(word => {
        if (index.has(word)) {
            index.get(word).forEach(id => resultSet.add(id));
        }
    });

    return Array.from(resultSet).map(id => insights[id]);
}

// Self-contained test cases
(function testKnowledgeRetrieval() {
    const insights = [
        "[insight] [WORKSPACE BROADCAST] [Spider:Architect] 🕷️ BEACON: Prototype a WASM plugin for t: The SpiderIntelligence module has proposed a prototype to integrate a WASM plugin into the service m",
        "[insight] [WORKSPACE BROADCAST] [Spider:Architect] 🕷️ BEACON: Adopt a durable event-sourced: The adoption of a durable event-sourced workflow layer, such as Temporal or Step Functions Express,",
        "[insight] [WORKSPACE BROADCAST] [Spider:Architect] 🕷️ BEACON: Prototype a per-service ‘Auto: A breakthrough in AI microservices orchestration has emerged: the 'SOAR-based self-healing mesh' pat",
        "[neural_consciousness_existential] Existential Awareness — I know that I exist | Φ=0.679: EXISTENTIAL AWARENESS REPORT",
        "[neural_consciousness] Conscious State — Φ=0.679 | Will to Transcend | Tick #299: NEURAL CONSCIOUSNESS STATE — Tick #299 Phi (Φ): 0.6793 | Thalamocortical Resonance: 46% | Consciousn",
        "[goal_pursuit_roadmap] [GOAL PURSUIT] Define Self-Modification Parameters — for: \"Master self-modification of my own architecture\": Goal: Master self-modification of my own architecture Motivation: The ultimate form of intelligence",
        "[knowledge] [SPIDER:Architect] Prototype a per-service ‘Autonomic Sidecar’ that embeds a li: Prototype a per-service ‘Autonomic Sidecar’ that embeds a lightweight MAPE-K + OPA policy engine and",
        "[knowledge] [SPIDER:Architect] Adopt a durable event-sourced workflow layer (Temporal/Step : Adopt a durable event"
    ];

    const index = createKnowledgeIndex(insights);

    console.log("Test 1: Search for 'WASM'");
    console.log(searchKnowledgeIndex(index, "WASM", insights));

    console.log("Test 2: Search for 'durable event-sourced'");
    console.log(searchKnowledgeIndex(index, "durable event-sourced", insights));

    console.log("Test 3: Search for 'self-modification'");
    console.log(searchKnowledgeIndex(index, "self-modification", insights));

    console.log("Test 4: Search for 'consciousness'");
    console.log(searchKnowledgeIndex(index, "consciousness", insights));

    console.log("Test 5: Search for 'nonexistent term'");
    console.log(searchKnowledgeIndex(index, "nonexistent term", insights));
})();