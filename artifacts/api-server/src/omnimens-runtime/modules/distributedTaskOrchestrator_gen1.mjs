/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskOrchestrator
 * Written: 2026-04-02T15:12:24.079Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskOrchestrator.mjs

import { randomUUID } from 'crypto';

// Task Queue Implementation
const taskQueue = [];

// Raft Consensus State
const state = {
  term: 0,
  leaderId: null,
  votedFor: null,
  log: []
};

// Utility: Add Task to Queue
export function addTask(task) {
  if (!task || typeof task !== 'object' || !task.id) {
    throw new Error('Invalid task format. Task must be an object with an id.');
  }
  taskQueue.push(task);
}

// Utility: Get Next Task
export function getNextTask() {
  return taskQueue.shift();
}

// Utility: Generate Unique Task ID
export function generateTaskId() {
  return randomUUID();
}

// Raft: Request Vote RPC
export function requestVote(candidateId, candidateTerm, lastLogIndex, lastLogTerm) {
  if (candidateTerm < state.term) {
    return { voteGranted: false, term: state.term };
  }

  if (
    (state.votedFor === null || state.votedFor === candidateId) &&
    (state.log.length === 0 ||
      lastLogTerm > state.log[state.log.length - 1].term ||
      (lastLogTerm === state.log[state.log.length - 1].term && lastLogIndex >= state.log.length - 1))
  ) {
    state.votedFor = candidateId;
    state.term = candidateTerm;
    return { voteGranted: true, term: state.term };
  }

  return { voteGranted: false, term: state.term };
}

// Raft: Append Entries RPC
export function appendEntries(leaderId, leaderTerm, prevLogIndex, prevLogTerm, entries, leaderCommit) {
  if (leaderTerm < state.term) {
    return { success: false, term: state.term };
  }

  state.leaderId = leaderId;
  state.term = leaderTerm;

  if (
    prevLogIndex >= 0 &&
    (state.log.length <= prevLogIndex || state.log[prevLogIndex].term !== prevLogTerm)
  ) {
    return { success: false, term: state.term };
  }

  if (entries && entries.length > 0) {
    state.log.splice(prevLogIndex + 1);
    state.log.push(...entries);
  }

  if (leaderCommit > state.commitIndex) {
    state.commitIndex = Math.min(leaderCommit, state.log.length - 1);
  }

  return { success: true, term: state.term };
}

// Utility: Get Current State
export function getState() {
  return { ...state };
}

// Utility: Add Log Entry
export function addLogEntry(entry) {
  if (!entry || typeof entry !== 'object' || !entry.term) {
    throw new Error('Invalid log entry format. Entry must be an object with a term.');
  }
  state.log.push(entry);
}

// Utility: Get Task Queue Snapshot
export function getTaskQueueSnapshot() {
  return [...taskQueue];
}