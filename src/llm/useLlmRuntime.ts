import { useCallback, useEffect, useRef, useState } from "react";
import type { LlmRuntime, LlmRuntimeStatus } from "./runtime";
import { createCloudRuntime } from "./cloudLlmRuntime";
import { createWebLlmRuntime } from "./webLlmRuntime";
import { isWebGpuAvailable } from "./webLlmLoader";
import { readLlmModeOverride } from "@/dev/devMode";

/**
 * Wählt die Runtime: WebGPU vorhanden → lokal, sonst Cloud.
 * Stellt zusätzlich `cancelLocalLoad()` und `switchToCloud()` bereit,
 * damit die UI dem Spieler eine Abbruch-/Sofort-Cloud-Option geben kann.
 */
export function useLlmRuntime(npcId: string): {
  runtime: LlmRuntime | null;
  status: LlmRuntimeStatus;
  cancelLocalLoad: () => void;
  switchToCloud: () => void;
} {
  const [status, setStatus] = useState<LlmRuntimeStatus>({
    kind: "cloud",
    ready: false,
  });
  const runtimeRef = useRef<LlmRuntime | null>(null);
  const localRef = useRef<(LlmRuntime & { cancelLoad: () => void }) | null>(
    null,
  );
  const [overrideTick, setOverrideTick] = useState(0);

  // Auf Dev-Mode-Override hören.
  useEffect(() => {
    const handler = () => setOverrideTick((n) => n + 1);
    window.addEventListener("e67:llm-mode-change", handler);
    return () => window.removeEventListener("e67:llm-mode-change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const isCoarse =
      typeof window !== "undefined" &&
      !!window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;

    const override = readLlmModeOverride();
    const useCloud =
      override === "cloud" ||
      (override !== "local" && (isCoarse || !isWebGpuAvailable()));

    if (useCloud) {
      const r = createCloudRuntime(npcId);
      runtimeRef.current = r;
      setStatus(r.status);
      return () => {
        cancelled = true;
        runtimeRef.current = null;
      };
    }

    const local = createWebLlmRuntime((s) => {
      if (cancelled) return;
      setStatus({ ...s });
    });
    runtimeRef.current = local;
    localRef.current = local;

    return () => {
      cancelled = true;
      runtimeRef.current?.dispose?.();
      runtimeRef.current = null;
      localRef.current = null;
    };
  }, [npcId, overrideTick]);

  const cancelLocalLoad = useCallback(() => {
    localRef.current?.cancelLoad();
  }, []);

  const switchToCloud = useCallback(() => {
    localRef.current?.cancelLoad();
    const r = createCloudRuntime(npcId);
    runtimeRef.current = r;
    setStatus(r.status);
    setOverrideTick((n) => n + 1);
  }, [npcId]);

  return {
    runtime: runtimeRef.current,
    status,
    cancelLocalLoad,
    switchToCloud,
  };
}
