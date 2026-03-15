'use strict';

const crypto = require('crypto');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

/**
 * EventBus: Enhanced with multi-threaded handler processing.
 */
class EventBus {
  constructor() {
    this._subscriptions = new Map();
    this._profileStats = new Map(); // Profiling aggregated event diagnostics.
    this._historicalErrors = []; // Tracks cumulative historical errors.
    this.workerPool = [];
    this.queue = []; // Task queue for managing events.
    this.diagnosticIntervalMs = 5000;
    this.workerCount = Math.max(2, os.cpus().length); // Dynamically allocate workers based on CPU cores.

    this._initializeWorkerPool(this.workerCount);
  }

  /**
   * Initializes a thread pool using worker threads.
   */
  _initializeWorkerPool(numWorkers) {
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(__filename, { workerData: { threadId: i } });
      worker.on('message', (msg) => this._handleWorkerMessage(msg));
      worker.on('error', (err) => console.error(`[WORKER ERROR] Thread ${i}:`, err.message));
      worker.on('exit', (code) => console.log(`[WORKER EXIT] Thread ${i} exited with code ${code}.`));
      this.workerPool.push(worker);
    }
  }

  /**
   * Handles messages from worker threads, including diagnostics and results.
   */
  _handleWorkerMessage(msg) {
    if (msg.type === 'diagnostics') {
      console.log('[WORKER DIAGNOSTICS]', JSON.stringify(msg.data, null, 2));
    } else if (msg.type === 'error') {
      this._historicalErrors.push(msg.data);
    } else if (msg.type === 'result') {
      const { event, latencyMs } = msg.data;
      const stats = this._profileStats.get(event);
      stats.latencySum += latencyMs;
      stats.count++;
    }
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
        errors: 0,
      });
    }
  }

  /**
   * Emit an event asynchronously (queued for processing by workers).
   */
  emit(event, payload) {
    const handlers = this._subscriptions.get(event) || [];
    let taskBatch = [];
    handlers.forEach((handler, index) => {
      taskBatch.push({ event, payload, handlerName: handler.name || `handler_${index}` });
    });
    this.queue.push(...taskBatch);

    this._processQueue();
  }

  /**
   * Processes queued tasks using available workers.
   */
  _processQueue() {
    while (this.queue.length > 0) {
      const task = this.queue.shift(); // Get the next task
      const availableWorker = this.workerPool.find((w) => w.threadAvailable); // Find any idle worker
      if (availableWorker) {
        // Send tasks to the idle worker thread
        availableWorker.postMessage({ type: 'run', task });
        availableWorker.threadAvailable = false; // Mark the worker as busy
      }
    }
  }

  /**
   * Starts diagnostics reporting collated from threads and the main program.
   */
  startDiagnostics(intervalMs = this.diagnosticIntervalMs) {
    setInterval(() => {
      const diagnosticSummary = Array.from(this._profileStats.entries()).map(([event, stats]) => ({
        event,
        totalEmissions: stats.count,
        avgLatencyMs: stats.count ? stats.latencySum / stats.count : 0,
        totalErrors: stats.errors,
      }));

      console.log('[EVENTBUS_DIAGNOSTICS_REPORT]', JSON.stringify(diagnosticSummary, null, 2));
      console.log('[HISTORICAL_ERRORS]', JSON.stringify(this._historicalErrors, null, 2));
    }, intervalMs);
  }
}

if (isMainThread) {
  module.exports = { EventBus };

  // TEST EXECUTION (verify multi-threaded behavior with EventBus)
  if (require.main === module) {
    const bus = new EventBus();
    bus.on('test', (payload) => {
      console.log(`[HANDLER] Processed event with payload: ${JSON.stringify(payload)}`);
    });
    bus.on('test', () => {
      throw new Error('Simulated handler error.');
    });

    bus.emit('test', { iteration: 1, data: 'dataA' });
    bus.emit('test', { iteration: 2, data: 'dataB' });
    bus.startDiagnostics(); // Diagnostic reporting every 5 seconds
  }
} else {
  // Worker thread execution logic for processing tasks
  parentPort.on('message', (msg) => {
    if (msg.type === 'run' && msg.task) {
      const { event, payload, handlerName } = msg.task;
      const tStart = process.hrtime.bigint();
      try {
        msg.task.handler(payload); // Execute provided handler function
        const tEnd = process.hrtime.bigint();
        const latencyMs = Number(tEnd - tStart) / 1e6;

        parentPort.postMessage({ type: 'result', data: { event, latencyMs } });
      } catch (err) {
        parentPort.postMessage({
          type: 'error',
          data: { handlerName, event, message: err.message, stack: err.stack },
        });
      } finally {
        parentPort.postMessage({
          type: 'diagnostics',
          data: {
            cpuLoad: os.loadavg()[0],
            memoryUsageMb: process.memoryUsage().rss / 1024 / 1024,
          },
        });
        parentPort.threadAvailable = true; // Mark thread availability when done
      }
    }
  });
}