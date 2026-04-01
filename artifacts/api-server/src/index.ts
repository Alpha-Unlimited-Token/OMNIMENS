/**
 * OMNIMENS — Proprietary AI Platform
 * Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 * Unauthorized reproduction, distribution, or use is strictly prohibited.
 */

import { createServer } from "http";
import app, { initAutonomousSystems } from "./app.js";
import { syncTogetherPricing } from "./lib/together-ai.js";
import { startConsciousnessWebSocket } from "./lib/omnimens-consciousness-infra.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);

startConsciousnessWebSocket(server);

server.listen(port, () => {
  console.log(`[OMNIMENS] Server listening on port ${port}`);
  syncTogetherPricing().catch(() => {});
  setTimeout(() => {
    try {
      initAutonomousSystems();
    } catch (err) {
      console.error("[OMNIMENS] Engine initialization error:", err);
    }
  }, 100);
});
