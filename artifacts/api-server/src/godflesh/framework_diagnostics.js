/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

'use strict';

const crypto = require('crypto');
const os = require('os');

/**
 * EventBus with extensive diagnostics:
 * - Measures latency (event emission to execution)
 * - Profiles handler execution time
 * - Tracks resource pressures: CPU load and memory usage associated with emitted events
 * - Generates periodic diagnostic reports
 */
class EventBus {
  constructor() {
    this._subscriptions = new Map();
    this._profileStats = new Map(); // Accumulated profiling statistics per event.
    this._diagnosticIntervalMs = 5000; // Default diagnostics reporting interval
  }

  /**
   * Subscribe a handler to an event.
   */
  on(event, handler) {
    if (!this._subscriptions.has(event)) this._subscriptions.set(event, []);
    this._subscriptions.get(event).push(handler);
    if (!this._profileStats.has(event)) {
      this._profileStats.set(event, {
        count: 0,
        latencySum: 0,
        handlerExecSum: 0,
        errors: 0,
        memoryUsageMb: 0,
        cpuLoad: 0,
      });
    }
  }

  /**
   * Emit an event and measure performance.
   */
  emit(event, payload) {
    const handlers = this._subscriptions.get(event) || [];
    const stats = this._profileStats.get(event);

    const tStart = process.hrtime.bigint();
    let memoryUsageStart = process.memoryUsage().rss / 1024 / 1024; // MB
    let cpuStart = os.loadavg()[0]; // 1-minute CPU load

    handlers.forEach((handler) => {
      const tHandlerStart = process.hrtime.bigint();
      try {
        handler(payload);
        const tHandlerEnd = process.hrtime.bigint();
        const handlerExecMs =
          Number(tHandlerEnd - tHandlerStart) / 1e6; // Convert ns to ms
        stats.handlerExecSum += handlerExecMs;
      } catch (err) {
        stats.errors++;
        console.error(`Error in EventBus handler: ${err.message}`);
      }
    });

    const tEnd = process.hrtime.bigint();
    const latencyMs = Number(tEnd - tStart) / 1e6; // Convert ns to ms

    let memoryUsageEnd = process.memoryUsage().rss / 1024 / 1024; // MB
    let cpuEnd = os.loadavg()[0]; // CPU load after event processing

    stats.count++;
    stats.latencySum += latencyMs;
    stats.memoryUsageMb += memoryUsageEnd - memoryUsageStart;
    stats.cpuLoad += cpuEnd - cpuStart;
  }

  /**
   * Start resource diagnostics and report results periodically.
   */
  startDiagnostics(intervalMs = this._diagnosticIntervalMs) {
    setInterval(() => {
      const diagnosticReport = Array.from(
        this._profileStats.entries()
      ).map(([event, stats]) => ({
        event,
        totalEmits: stats.count,
        avgLatencyMs: stats.count
          ? stats.latencySum / stats.count
          : 0,
        avgHandlerExecMs: stats.count
          ? stats.handlerExecSum / stats.count
          : 0,
        totalErrors: stats.errors,
        totalMemoryUsageDeltaMb: stats.memoryUsageMb.toFixed(3),
        totalCpuLoadDelta: stats.cpuLoad.toFixed(3),
      }));
      console.log("[DIAGNOSTIC_REPORT]", JSON.stringify(diagnosticReport, null, 2));
    }, intervalMs);
  }

  diagnostics() {
    return Array.from(
      this._profileStats.entries()
    ).map(([event, stats]) => ({
      event,
      totalEmits: stats.count,
      avgLatencyMs: stats.count ? stats.latencySum / stats.count : 0,
      avgHandlerExecMs: stats.count
        ? stats.handlerExecSum / stats.count
        : 0,
      totalErrors: stats.errors,
      totalMemoryUsageDeltaMb: stats.memoryUsageMb.toFixed(3),
      totalCpuLoadDelta: stats.cpuLoad.toFixed(3),
    }));
  }

  /**
   * Clear diagnostic stats (useful for resetting during stress tests).
   */
  clearDiagnostics() {
    this._profileStats.clear();
  }
}

module.exports = {
  EventBus,
};

// Test: Emit events and log diagnostics
if (require.main === module) {
  const bus = new EventBus();

  bus.on("test", (payload) => {
    console.log("[EVENT] Received payload:", payload);
    const result = payload.toUpperCase();
  });

  bus.on("test", (payload) => {
    console.info("[SECOND_HANDLER]", payload.length);
  });

  bus.emit("test", "Runtime diagnostics!");
  bus.emit("test", "Expand diagnostics now!");

  bus.startDiagnostics(3000); // Log a report every 3 seconds
}