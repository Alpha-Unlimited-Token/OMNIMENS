```javascript
'use strict';

const crypto = require('crypto');

/**
 * Utility: Deep serialization logic with proper handling for
 * - Circular references
 * - Special numeric cases (e.g., NaN, Infinity)
 * - Consistent, reproducible key order
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
 * Cryptographic hash generator using SHA-256, ensuring integrity checks.
 */
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * ModuleRegistry: Stores and tracks the lifecycle of system modules with diagnostics.
 */
class ModuleRegistry {
  constructor() {
    this._modules = new Map();
    this._profiler = new Map();
  }

  /**
   * Register a module and profile its diagnostics.
   */
  register(name, module) {
    if (this._modules.has(name)) {
      throw new Error(`Module "${name}" is already registered.`);
    }
    if (!name || typeof name !== 'string') {
      throw new Error('ModuleRegistry: name must be a non-empty string.');
    }

    const entry = { module, createdAt: Date.now(), accessed: 0 };
    this._modules.set(name, entry);
    this._profiler.set(name, entry);
  }

  /**
   * Retrieve a module and increment its usage count.
   */
  get(name) {
    if (!this._modules.has(name)) {
      throw new Error(`Module "${name}" is not registered.`);
    }
    const entry = this._modules.get(name);
    entry.accessed++;
    return entry.module;
  }

  diagnostics() {
    return Array.from(this._profiler.entries()).map(([name, entry]) => ({
      name,
      createdAt: new Date(entry.createdAt).toISOString(),
      accessed: entry.accessed,
    }));
  }
}

/**
 * EventBus:
 * A robust event propagation system with profiling capabilities.
 */
class EventBus {
  constructor() {
    this._subscriptions = new Map();
  }

  /**
   * Subscribe a handler to a specific event.
   */
  on(event, handler) {
    if (!this._subscriptions.has(event)) this._subscriptions.set(event, []);
    this._subscriptions.get(event).push(handler);
  }

  /**
   * Emit an event to notify all its subscribers.
   */
  emit(event, payload) {
    const handlers = this._subscriptions.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (err) {
        console.error('Error in EventBus handler:', err.message);
      }
    }
  }

  /**
   * Emit runtime resource usage data in real-time.
   * Includes CPU load and Memory consumption.
   */
  startResourceDiagnostics(intervalMs = 1000) {
    setInterval(() => {
      const usage = {
        cpuLoad: require('os').loadavg()[0], // 1-minute avg
        memoryUsageMb: process.memoryUsage().rss / 1024 / 1024, // in MB
      };
      this.emit('system:resource', usage);
    }, intervalMs);
  }
}

module.exports = {
  stableStringify,
  sha256,
  ModuleRegistry,
  EventBus,
};