/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: distributedTaskScheduler
 * Written: 2026-04-03T12:17:37.613Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// distributedTaskScheduler.mjs

import { randomUUID } from 'crypto';

/**
 * Generates unique identifiers for tasks.
 * Useful across multiple agents for ensuring task uniqueness.
 */
export function generateTaskId() {
  return randomUUID();
}

/**
 * Represents a node in the distributed system.
 * Each node tracks its state and participates in consensus.
 */
export class Node {
  constructor(id) {
    this.id = id;
    this.state = "follower"; // Possible states: follower, candidate, leader
    this.log = []; // Task log for synchronization
    this.currentTerm = 0;
    this.votedFor = null;
  }

  /**
   * Initiates a new election cycle.
   * Useful for leader election in distributed systems.
   */
  startElection(peers) {
    this.state = "candidate";
    this.currentTerm++;
    this.votedFor = this.id;

    let votes = 1; // Self-vote

    for (const peer of peers) {
      const voteGranted = peer.requestVote(this.currentTerm, this.id);
      if (voteGranted) votes++;
    }

    if (votes > peers.length / 2) {
      this.state = "leader";
    } else {
      this.state = "follower";
    }
  }

  /**
   * Handles vote requests from other nodes.
   * Ensures consensus rules are followed.
   */
  requestVote(term, candidateId) {
    if (term > this.currentTerm && (this.votedFor === null || this.votedFor === candidateId)) {
      this.currentTerm = term;
      this.votedFor = candidateId;
      return true;
    }
    return false;
  }

  /**
   * Appends a task to the log and synchronizes with peers.
   * Useful for distributed task tracking.
   */
  appendTask(task, peers) {
    if (this.state !== "leader") {
      throw new Error("Only the leader can append tasks.");
    }

    this.log.push({ term: this.currentTerm, task });

    for (const peer of peers) {
      peer.receiveTask(this.currentTerm, task);
    }
  }

  /**
   * Receives a task from the leader and updates the log.
   * Ensures followers stay synchronized.
   */
  receiveTask(term, task) {
    if (term >= this.currentTerm) {
      this.log.push({ term, task });
      this.currentTerm = term;
    }
  }
}

/**
 * Creates a cluster of nodes for distributed task scheduling.
 * Useful for simulating and testing consensus algorithms.
 */
export function createCluster(nodeCount) {
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node(`Node-${i}`));
  }
  return nodes;
}

/**
 * Simulates a task distribution process.
 * Demonstrates how tasks can be scheduled across a cluster.
 */
export function simulateTaskDistribution(cluster, task) {
  const leader = cluster.find(node => node.state === "leader");

  if (!leader) {
    throw new Error("No leader found in the cluster.");
  }

  leader.appendTask(task, cluster.filter(node => node !== leader));
}
