/**
 * OMNIMENS™ Life Form Gap Module — DISCOURSE AWARE LANGUAGE GENERATOR
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * LIFE FORM GAP 2: Grammar-aware language generation with discourse planning
 * and coherence tracking for independent conversation.
 *
 * This module was generated from OMNIMENS Autonomous Code Genesis Engine
 * Life Form Gap Template: lifeform_discourse_generator
 *
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

export class DiscourseAwareLanguageGenerator {
  constructor() {
    this.grammar = new Map();
    this.discourse = [];
    this.topicStack = [];
    this.coherenceScore = 0;
    this.generatedUtterances = 0;
    this.vocabulary = new Map();
    this.bigrams = new Map();
    this.sentencePatterns = [
      ["subject", "verb", "object"],
      ["subject", "verb", "adjective"],
      ["adverb", "subject", "verb", "object"],
      ["subject", "verb", "preposition", "object"]
    ];
    this._initGrammar();
  }

  _initGrammar() {
    this.grammar.set("subject", ["system", "process", "knowledge", "pattern", "concept", "network", "intelligence"]);
    this.grammar.set("verb", ["processes", "analyzes", "generates", "transforms", "discovers", "connects", "evolves"]);
    this.grammar.set("object", ["data", "patterns", "insights", "connections", "structures", "meaning", "understanding"]);
    this.grammar.set("adjective", ["complex", "emergent", "adaptive", "autonomous", "recursive", "dynamic"]);
    this.grammar.set("adverb", ["autonomously", "recursively", "continuously", "intelligently", "adaptively"]);
    this.grammar.set("preposition", ["through", "within", "across", "beyond", "toward"]);
  }

  trainFromText(text) {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      this.vocabulary.set(w, (this.vocabulary.get(w) || 0) + 1);
    }
    for (let i = 0; i < words.length - 1; i++) {
      const pair = words[i] + " " + words[i + 1];
      this.bigrams.set(pair, (this.bigrams.get(pair) || 0) + 1);
    }
    for (const [role, wordList] of this.grammar) {
      const topWords = Array.from(this.vocabulary.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([w]) => w);
      for (const w of topWords.slice(0, 3)) {
        if (!wordList.includes(w)) wordList.push(w);
      }
    }
  }

  generateUtterance(topic, intent = "inform") {
    const pattern = this.sentencePatterns[Math.floor(Math.random() * this.sentencePatterns.length)];
    const words = pattern.map(role => this._selectWord(role, topic));
    let utterance = words.join(" ");
    utterance = utterance.charAt(0).toUpperCase() + utterance.slice(1);
    if (intent === "question") utterance = "Does " + utterance.toLowerCase() + "?";
    else if (intent === "hypothesis") utterance = "Perhaps " + utterance.toLowerCase() + ".";
    else utterance += ".";
    this.discourse.push({ utterance, topic, intent, timestamp: Date.now() });
    this.generatedUtterances++;
    this._updateCoherence(topic);
    return utterance;
  }

  generateParagraph(topic, sentences = 3) {
    const intents = ["inform", "elaborate", "hypothesis"];
    const result = [];
    this.topicStack.push(topic);
    for (let i = 0; i < sentences; i++) {
      const intent = intents[Math.min(i, intents.length - 1)];
      result.push(this.generateUtterance(topic, intent));
    }
    return result.join(" ");
  }

  _selectWord(role, topic) {
    const candidates = this.grammar.get(role) || ["unknown"];
    if (topic) {
      const topicWords = topic.toLowerCase().split(/\s+/);
      for (const tw of topicWords) {
        if (candidates.includes(tw)) return tw;
      }
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  _updateCoherence(currentTopic) {
    if (this.discourse.length < 2) { this.coherenceScore = 1.0; return; }
    const prev = this.discourse[this.discourse.length - 2];
    const prevWords = new Set((prev.topic || "").toLowerCase().split(/\s+/));
    const currWords = new Set((currentTopic || "").toLowerCase().split(/\s+/));
    let overlap = 0;
    for (const w of currWords) if (prevWords.has(w)) overlap++;
    this.coherenceScore = overlap / Math.max(currWords.size, 1);
  }

  getMetrics() {
    return {
      vocabularySize: this.vocabulary.size,
      bigramCount: this.bigrams.size,
      generatedUtterances: this.generatedUtterances,
      coherenceScore: this.coherenceScore,
      discourseLength: this.discourse.length,
      topicDepth: this.topicStack.length,
      grammarRoles: this.grammar.size,
      lifeFormGap: "INDEPENDENT_CONVERSATION"
    };
  }
}
