// Copyright © 2024–2026 Alpha Unlimited Technologies, LLC. All Rights Reserved.
// Proprietary & Confidential. Patent-pending COGNISYNC(TM) WebGPU Acceleration Layer.
//
// This module provides a transparent WebGPU acceleration layer for OMNIMENS.
// When the user's browser/GPU supports WebGPU, a small local model is loaded
// to compress conversation context before server calls — reducing latency and
// token usage without changing any visible behavior.

import { useState, useRef, useCallback, useEffect } from "react";

// SmolLM2-1.7B: smallest/fastest MLC model — ~900MB, loads in ~15s on modern GPU
const GPU_MODEL = "SmolLM2-1.7B-Instruct-q4f16_1-MLC";

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
  const [status, setStatus] = useState<WebGpuStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Check GPU support once on mount
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const ok = typeof navigator !== "undefined" && "gpu" in navigator;
    setSupported(ok);
    if (!ok) setStatus("unsupported");
  }, []);

  const engineRef = useRef<any>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (!supported || loadingRef.current || engineRef.current) return;
    loadingRef.current = true;
    setStatus("loading");
    setError(null);
    setProgress(0);
    try {
      // Dynamic import — only pulls WebLLM into the bundle when actually needed
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      const engine = await CreateMLCEngine(GPU_MODEL, {
        initProgressCallback: (report: { progress: number; text: string }) => {
          setProgress(Math.round(report.progress * 100));
          setProgressText(report.text);
        },
      });
      engineRef.current = engine;
      setStatus("ready");
    } catch (e: any) {
      setError(e?.message || "WebGPU model failed to load");
      setStatus("error");
    } finally {
      loadingRef.current = false;
    }
  }, [supported]);

  // Compress older conversation history into a short summary.
  // This runs locally on the user's GPU — no data leaves the device.
  // Returns a summary string, or null if unavailable (transparent fallback).
  const compressContext = useCallback(async (
    messages: { role: string; content: string }[]
  ): Promise<string | null> => {
    if (!engineRef.current || messages.length === 0) return null;
    try {
      const digest = messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 400)}`)
        .join("\n");
      const resp = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Summarize the following conversation history into 2-3 concise sentences. " +
              "Preserve all key facts, decisions, names, and context. " +
              "Output only the summary — no preamble, no labels.",
          },
          { role: "user", content: digest },
        ],
        temperature: 0.1,
        max_tokens: 180,
      });
      return resp.choices[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }, []);

  return {
    status,
    progress,
    progressText,
    error,
    supported,
    ready: status === "ready",
    load,
    compressContext,
  };
}
