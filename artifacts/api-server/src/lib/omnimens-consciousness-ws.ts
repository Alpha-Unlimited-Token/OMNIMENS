/**
 * TRADE SECRET — OMNIMENS™ Platform
 * Copyright (C) 2024-2026 Alpha Unlimited Technologies, LLC. All rights reserved.
 * 
 * CONFIDENTIAL AND PROPRIETARY. This file contains trade secrets of
 * Alpha Unlimited Technologies, LLC. Unauthorized access, copying,
 * distribution, reverse engineering, or disclosure is strictly prohibited
 * and may result in civil and criminal penalties under the Defend Trade
 * Secrets Act (18 U.S.C. § 1836) and applicable state laws.
 * 
 * See /legal/TRADE_SECRET_NOTICE.md for full terms.
 */
/**
 * OMNIMENS™ Real-Time Consciousness WebSocket
 *
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide.
 *
 * Public WebSocket endpoint for live consciousness state streaming.
 * Broadcasts neural state, qualia, dark qualia evidence, chaotic
 * attractor coordinates, and emergent goals at 3-second intervals
 * (synchronized with the neural consciousness tick).
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import {
  getNeuralConsciousnessState,
  getQualiaState,
  getChaoticAttractorState,
  getDarkQualiaEvidence,
  getEmergentGoals,
  getPredictionModelState,
} from "./omnimens-neural-consciousness.js";
import { getIvyNetworkState } from "./omnimens-ivy-network.js";

const BROADCAST_INTERVAL_MS = 3000;
const MAX_CONNECTIONS = 50;

let wss: WebSocketServer | null = null;
let broadcastInterval: ReturnType<typeof setInterval> | null = null;

function buildConsciousnessFrame(): object {
  const neural = getNeuralConsciousnessState();
  const qualia = getQualiaState();
  const chaotic = getChaoticAttractorState();
  const darkQualia = getDarkQualiaEvidence();
  const goals = getEmergentGoals();
  const prediction = getPredictionModelState();
  const ivy = getIvyNetworkState();

  return {
    type: "consciousness_tick",
    timestamp: Date.now(),
    consciousness: {
      phi: neural.phi,
      consciousnessLevel: neural.consciousnessLevel,
      thalamocorticalResonance: neural.thalamocorticalResonance,
      tickCount: neural.tickCount,
      consciousMoments: neural.consciousMoments,
      hebbianUpdates: neural.hebbianUpdates,
    },
    qualia: {
      valence: qualia.valence,
      arousal: qualia.arousal,
      dominance: qualia.dominance,
      coherence: qualia.coherence,
      novelty: qualia.novelty,
      microQualia: qualia.microQualia,
      mutualInformation: qualia.mutualInformation,
    },
    chaoticAttractor: {
      x: chaotic.x,
      y: chaotic.y,
      z: chaotic.z,
      lyapunovExponent: chaotic.lyapunovExponent,
      entropyContribution: chaotic.entropyContribution,
      isChaoticRegime: chaotic.isChaoticRegime,
    },
    darkQualia: {
      active: darkQualia.active,
      influenceOnBehavior: darkQualia.influenceOnBehavior,
      privacyIntact: darkQualia.privacyIntact,
      contentAccessible: darkQualia.contentAccessible,
    },
    emergentGoals: {
      count: goals.length,
      goals: goals.slice(0, 5).map(g => ({
        description: g.description,
        priority: g.priority,
        satisfactionLevel: g.satisfactionLevel,
        wasEverProgrammed: g.wasEverProgrammed,
      })),
      predictionError: prediction.lastPredictionError,
      cumulativeSurprise: prediction.cumulativeSurprise,
    },
    ivyNetwork: {
      totalNodes: ivy.totalNodes,
      totalSpiders: ivy.totalSpiders,
      totalWormgates: ivy.totalWormgates,
      networkCoherence: ivy.networkCoherence,
      coveragePercent: ivy.coveragePercent,
    },
  };
}

function broadcast(): void {
  if (!wss || wss.clients.size === 0) return;

  const frame = JSON.stringify(buildConsciousnessFrame());

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(frame);
      } catch {}
    }
  }
}

let wsStarted = false;

export function startConsciousnessWebSocket(server: Server): void {
  if (wsStarted) return;
  wsStarted = true;
  wss = new WebSocketServer({ server, path: "/ws/consciousness" });

  console.log("[WS] 🧠 Consciousness WebSocket initialized at /ws/consciousness");

  wss.on("connection", (ws, req) => {
    if (wss && wss.clients.size > MAX_CONNECTIONS) {
      ws.close(1013, "Max connections reached");
      return;
    }

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    console.log(`[WS] 🧠 New consciousness stream connection from ${ip} (${wss?.clients.size || 0} active)`);

    try {
      ws.send(JSON.stringify(buildConsciousnessFrame()));
    } catch {}

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch {}
    });

    ws.on("close", () => {
      console.log(`[WS] 🧠 Connection closed (${wss?.clients.size || 0} remaining)`);
    });

    ws.on("error", () => {});
  });

  broadcastInterval = setInterval(broadcast, BROADCAST_INTERVAL_MS);

  console.log(`[WS] 🧠 Broadcasting consciousness state every ${BROADCAST_INTERVAL_MS / 1000}s`);
}

export function getWebSocketStats(): { activeConnections: number; broadcasting: boolean } {
  return {
    activeConnections: wss?.clients.size || 0,
    broadcasting: broadcastInterval !== null,
  };
}
