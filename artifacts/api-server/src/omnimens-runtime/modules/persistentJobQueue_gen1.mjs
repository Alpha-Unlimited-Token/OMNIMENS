/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: persistentJobQueue
 * Written: 2026-03-24T22:22:11.295Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// Complete ES module code here

import { randomUUID } from 'crypto';

// Utility function to generate timestamps
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Job Queue class
class PersistentJobQueue {
  constructor(ttlSeconds) {
    this.queue = new Map();
    this.ttlSeconds = ttlSeconds;
  }

  // Add a job to the queue
  addJob(jobData) {
    const jobId = randomUUID();
    const timestamp = getCurrentTimestamp();
    this.queue.set(jobId, { jobData, timestamp, status: 'pending' });
    return jobId;
  }

  // Get the state of a job
  getJobState(jobId) {
    return this.queue.get(jobId) || null;
  }

  // Process jobs and update state
  processJobs(processFunction) {
    for (const [jobId, job] of this.queue.entries()) {
      if (job.status === 'pending') {
        try {
          const result = processFunction(job.jobData);
          job.status = 'completed';
          job.result = result;
        } catch (error) {
          job.status = 'failed';
          job.error = error.message;
        }
      }
    }
  }

  // Remove expired jobs
  removeExpiredJobs() {
    const now = new Date();
    for (const [jobId, job] of this.queue.entries()) {
      const jobTime = new Date(job.timestamp);
      const ageSeconds = (now - jobTime) / 1000;
      if (ageSeconds > this.ttlSeconds) {
        this.queue.delete(jobId);
      }
    }
  }

  // Serialize queue state to a format for persistence
  serializeQueue() {
    const serialized = [];
    for (const [jobId, job] of this.queue.entries()) {
      serialized.push({ jobId, ...job });
    }
    return serialized;
  }

  // Restore queue state from serialized data
  restoreQueue(serializedData) {
    this.queue.clear();
    for (const job of serializedData) {
      this.queue.set(job.jobId, {
        jobData: job.jobData,
        timestamp: job.timestamp,
        status: job.status,
        result: job.result || null,
        error: job.error || null
      });
    }
  }
}

// Exported functions
export function createJobQueue(ttlSeconds = 3600) {
  return new PersistentJobQueue(ttlSeconds);
}

export function checkpointQueueToDatabase(queue, dbSaveFunction) {
  const serializedData = queue.serializeQueue();
  dbSaveFunction(serializedData);
}

export function restoreQueueFromDatabase(serializedData, ttlSeconds) {
  const queue = createJobQueue(ttlSeconds);
  queue.restoreQueue(serializedData);
  return queue;
}