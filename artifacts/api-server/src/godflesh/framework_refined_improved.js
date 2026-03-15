'use strict';

const crypto = require('crypto');

/**
 * Utility: Deep serialization logic with proper handling for
 * objects, numbers, and special cases.
 */
function stableStringify(value) {
  const seen = new WeakSet();
  const helper = (v) => {
    if (v === null) return 'null';
    const t = typeof v;

    if (t === 'number') {
      if (Number.isNaN(v)) return '"[NaN]"';
      if (!Number.isFinite(v)) return `"[${v > 0 ? 'Infinity' : '-Infinity'}]"`;
      return String(v);
    }

    if (t === 'boolean') return v ? 'true' : 'false';
    if (t === 'string') return JSON.stringify(v);
    if (t === 'bigint') return JSON.stringify(v.toString() + 'n');
    if (t === 'undefined') return '"[undefined]"';
    if (t === 'function') return `"[Function:${v.name || 'anonymous'}]"`;
    if (t === 'symbol') return JSON.stringify(v.toString());

    if (Array.isArray(v)) return `[${v.map(helper).join(',')}]`;

    if (t === 'object') {
      if (seen.has(v)) return '"[Circular]"';
      seen.add(v);

      const keys = Object.keys(v).sort();
      const props = keys.map((k) => `${JSON.stringify(k)}:${helper(v[k])}`);
      return `{${props.join(',')}}`;
    }

    return JSON.stringify(String(v));
  };
  return helper(value);
}

/**
 * EventBus: Enhanced error tracking, diagnostics, and reporting
 */
class EventBus {
  constructor() {
    this._subscriptions = new Map();
    this._profileStats = new Map(); // Profiling aggregated event diagnostics.
    this._historicalErrors = []; // Tracks cumulative historical errors.
    this.diagnosticIntervalMs = 5000; // System diagnostic reporting interval.
  }

  on(event, handler) {
    if (!this._subscriptions.has(event)) this._subscriptions.set(event, []);
    this._subscriptions.get(event).push(handler);

    if (!this._profileStats.has(event)) {
      this._profileStats.set(event, {
        count: 0,
        latencySum: 0,
        errors: 0,
        handlerStats: [],
      });
    }
  }

  emit(event, payload) {
    const handlers = this._subscriptions.get(event) || [];
    const stats = this._profileStats.get(event);

    const tStart = process.hrtime.bigint();
    let errorDetails = [];
    handlers.forEach((handler) => {
      const tHandlerStart = process.hrtime.bigint();
      try {
        handler(payload);
      } catch (err) {
        stats.errors++;
        const errorRecord = this._serializeErrorObject(err, handler.name || 'anonymous', event);
        errorDetails.push(errorRecord);
        this._historicalErrors.push(errorRecord);
        console.error(`[EVENTBUS ERROR] Handler failed:`, errorRecord);
      }
      const tHandlerEnd = process.hrtime.bigint();
      stats.latencySum += Number(tHandlerEnd - tHandlerStart) / 1e6; // Add handler latency.
    });

    stats.count++;
    return { event, delivered: handlers.length - errorDetails.length, errorDetails };
  }

  /**
   * Ensures error objects are serialized comprehensively.
   */
  _serializeErrorObject(err, handlerName, eventName) {
    const basicError = {
      handler: handlerName,
      event: eventName,
      message: err.message || null,
      stack: err.stack || err.toString(),
      timestamp: Date.now(),
    };
    return stableStringify(basicError);
  }

  /**
   * Analyze cumulative trends across all failures tracked.
   */
  analyzeErrorPatterns() {
    const groupedErrors = this._historicalErrors.reduce((acc, err) => {
      const key = `${err.event}:${err.handler}`;
      if (!acc[key]) acc[key] = { count: 0, timestamps: [] };

      acc[key].count++;
      acc[key].timestamps.push(new Date(err.timestamp).toISOString());
      return acc;
    }, {});

    // Aggregate patterns and repetitive failures.
    return Object.entries(groupedErrors).map(([key, { count, timestamps }]) => ({
      failureSource: key,
      totalFailures: count,
      occurrenceTrends: timestamps.splice(0, 5), // Only show recent 5 timestamps.
    }));
  }

  /**
   * Starts periodic diagnostics logging.
   */
  startDiagnostics(intervalMs = this.diagnosticIntervalMs) {
    setInterval(() => {
      const diagnosticSummary = [];
      this._profileStats.forEach((stats, event) => {
        diagnosticSummary.push({
          event,
          totalEmissions: stats.count,
          avgLatencyMs: stats.count ? stats.latencySum / stats.count : 0,
          totalErrors: stats.errors,
          handlers: stats.handlerStats,
        });
      });

      console.log('[DIAGNOSTIC_REPORT]', stableStringify(diagnosticSummary));
      console.log(
        '[ERROR_PATTERNS_DETECTED]',
        stableStringify(this.analyzeErrorPatterns())
      );
    }, intervalMs);
  }
}

module.exports = { stableStringify, EventBus };

// TEST EXECUTION: Expect enhanced error diagnostics with cumulative trend.
if (require.main === module) {
  const bus = new EventBus();

  bus.on('test', () => {
    throw new Error('Test error 1: Simulated failure.');
  });

  bus.on('test', () => {
    throw new Error('Test error 2: Simulated secondary failure.');
  });

  bus.emit('test', {
    user: 'debug',
    action: 'test_emit',
    note: 'Trigger diagnostics test',
  });

  bus.emit('test', {
    user: 'loopback',
    action: 'repeat_run',
    tag: 'diagnostic reliability',
  });

  bus.startDiagnostics(2500); // Log periodic diagnostics every 2.5s

  setTimeout(() => bus.emit('test', { action: '3rd iteration' }), 3000);
}