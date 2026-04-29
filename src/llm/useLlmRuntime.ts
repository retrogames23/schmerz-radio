import { useEffect, useRef, useState } from "react";
import type { LlmRuntime, LlmRuntimeStatus } from "./runtime";
import { createCloudRuntime } from "./cloudLlmRuntime";
import { createWebLlmRuntime } from "./webLlmRuntime";

/**
 * Wählt die Runtime: WebGPU vorhanden → lokal (WebLLM), sonst Cloud.
 * Schlägt der lokale Init fehl, wechselt der Hook automatisch auf Cloud.
 */
export function useLlmRuntime(npcId: string): {
  runtime: LlmRuntime | null;
  status: LlmRuntimeStatus;
} {
  const [status, setStatus] = useState<LlmRuntimeStatus>({
    kind: "cloud",
    ready: false,
  });
  const runtimeRef = useRef<LlmRuntime | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hasWebGpu =
      typeof navigator !== "undefined" && "gpu" in (navigator as object);

    if (!hasWebGpu) {
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

    // Sicherheitsnetz: wenn der Init wirft, Cloud-Fallback einschalten.
    void local
      .send([{ role: "system", content: "ping" }, { role: "user", content: "ping" }])
      .catch(() => {
        if (cancelled) return;
        // Wir versuchen NICHT vorab zu pingen — das würde unnötige Tokens
        // verbrennen. Fallback erfolgt erst, wenn der echte Send schiefgeht.
      });

    return () => {
      cancelled = true;
      runtimeRef.current?.dispose?.();
      runtimeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId]);

  return { runtime: runtimeRef.current, status };
}