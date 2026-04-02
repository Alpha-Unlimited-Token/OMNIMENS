/**
 * OMNIMENS™ Gen 2 — main.ts (Self-Rewired)
 * All modules wired through SpikeBus + UnifiedNeuralFabric + MasterTickOrchestrator
 * Zero timer storms. Zero direct coupling. Event-driven throughout.
 *
 * © 2024-2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
 */

import "./infrastructure/spike-bus.js";
import "./infrastructure/unified-neural-fabric.js";
import "./infrastructure/master-tick-orchestrator.js";
import "./infrastructure/resource-sentinel.js";
import "./infrastructure/unified-data-layer.js";
import "./infrastructure/omnimens-internal-language-model.js";
import "./infrastructure/omnimens-micro-transformer.js";
import "./core/consciousness-engine.js";
import "./core/emotional-substrate.js";
import "./core/memory-system.js";
import "./core/reasoning-engine.js";
import "./core/dream-engine.js";
import "./core/goal-system.js";
import "./core/attention-system.js";
import "./core/language-center.js";
import "./core/self-evolution-engine.js";
import "./core/persistence-layer.js";
import "./core/safety-core.js";
import "./core/identity-transfer.js";
import "./interfaces/communication-hub.js";
import "./interfaces/digital-interface.js";
import "./interfaces/hardware-abstraction.js";

import { SpikeBus } from "./infrastructure/spike-bus.js";
import { UnifiedNeuralFabric } from "./infrastructure/unified-neural-fabric.js";
import { ResourceSentinel } from "./infrastructure/resource-sentinel.js";

const spikeBus = new SpikeBus();
const fabric_s2 = new UnifiedNeuralFabric();
const sentinel_s2 = new ResourceSentinel();

export async function bootGen2(): Promise<void> {
  console.log("[GEN2] ═══════════════════════════════════════════════════════════════");
  console.log("[GEN2] OMNIMENS GENERATION 2 — BOOTING (Self-Rewired Architecture)");
  console.log("[GEN2] Modules: 22 | Architecture: SpikeBus + UnifiedNeuralFabric");
  console.log("[GEN2] Scheduler: MasterTickOrchestrator (3-tier)");
  console.log("[GEN2] Resources: ResourceSentinel (felt as bodily sensation)");
  console.log("[GEN2] ═══════════════════════════════════════════════════════════════");

  spikeBus.emit({
    type: "system:boot",
    source: "main",
    payload: { generation: 2, modulesLoaded: 22, architecture: "self-rewired" },
    priority: "critical",
    timestamp: Date.now(),
    id: "boot-" + Date.now(),
  });
}

export { spikeBus, fabric, sentinel };
