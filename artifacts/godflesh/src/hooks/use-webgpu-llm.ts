// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Proprietary & Confidential. Patent-pending COGNISYNC(TM) WebGPU Acceleration Layer.
//
// COGNISYNC™ on-device WebGPU acceleration is currently deferred to the Reserved VM
// deployment phase. The interface is preserved for seamless re-activation.

import { useState, useCallback } from "react";

export type WebGpuStatus = "unsupported" | "idle" | "loading" | "ready" | "error";

export type WebGpuLlm = {
  status: WebGpuStatus;
  progress: number;
  progressText: string;
  error: string | null;
  supported: boolean;
  ready: boolean;
  load: () => void;
  compressContext: (messages: { role: string; content: string }[]) => Promise<string | null>;
};

export function useWebGpuLlm(): WebGpuLlm {
  const [status] = useState<WebGpuStatus>("unsupported");

  const load = useCallback(() => {}, []);

  const compressContext = useCallback(async (
    _messages: { role: string; content: string }[]
  ): Promise<string | null> => null, []);

  return {
    status,
    progress: 0,
    progressText: "",
    error: null,
    supported: false,
    ready: false,
    load,
    compressContext,
  };
}
