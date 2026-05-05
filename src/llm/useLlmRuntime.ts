import { useCallback, useEffect, useRef, useState } from "react";
import type { LlmRuntime, LlmRuntimeStatus } from "./runtime";
import { createCloudRuntime, onCloudError } from "./cloudLlmRuntime";
import { readLlmModeOverride } from "@/dev/devMode";

/**
 * Inline WebGPU-Check — vermeidet einen statischen Import von
 * `webLlmLoader`, das wiederum `@mlc-ai/web-llm`-Typen mit ins
 * Initial-Bundle ziehen würde.
 */
function isWebGpuAvailable(): boolean {
  return typeof navigator !== "undefined" && "gpu" in (navigator as object);
}

/**
 * Wählt die Runtime: WebGPU vorhanden → lokal, sonst Cloud.
 * Stellt zusätzlich `cancelLocalLoad()` und `switchToCloud()` bereit,
 * damit die UI dem Spieler eine Abbruch-/Sofort-Cloud-Option geben kann.
 */
type LocalRuntime = LlmRuntime & { cancelLoad: () => void };

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
  const localRef = useRef<LocalRuntime | null>(null);
  const [overrideTick, setOverrideTick] = useState(0);

  // Auf Dev-Mode-Override hören.
  useEffect(() => {
    const handler = () => setOverrideTick((n) => n + 1);
    window.addEventListener("e67:llm-mode-change", handler);
    return () => window.removeEventListener("e67:llm-mode-change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const override = readLlmModeOverride();
    // Standard ist Cloud. Lokal nur, wenn Dev-Mode `local` erzwingt
    // ODER wenn das Hard-Limit ohne Spende erreicht wurde (siehe
    // "force_local"-Flag, das `onCloudError` unten setzt).
    const forcedLocal =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("e67.forceLocalLlm") === "1";
    const canRunLocal = isWebGpuAvailable();
    const useCloud =
      override === "cloud" ||
      (override !== "local" && !(forcedLocal && canRunLocal));

    if (useCloud) {
      const r = createCloudRuntime(npcId);
      runtimeRef.current = r;
      setStatus(r.status);
      return () => {
        cancelled = true;
        runtimeRef.current = null;
      };
    }

    // Lokale Runtime erst dynamisch nachladen, sobald sie wirklich
    // gebraucht wird — sonst landet `@mlc-ai/web-llm` (mehrere MB) im
    // initialen GameShell-Bundle, obwohl die meisten Sessions
    // ausschließlich Cloud nutzen.
    setStatus({
      kind: "local",
      ready: false,
      loading: { text: "Initialisiere lokales Modell …" },
    });
    void import("./webLlmRuntime").then(({ createWebLlmRuntime }) => {
      if (cancelled) return;
      const local = createWebLlmRuntime((s) => {
        if (cancelled) return;
        setStatus({ ...s });
      });
      runtimeRef.current = local;
      localRef.current = local;
    });

    return () => {
      cancelled = true;
      runtimeRef.current?.dispose?.();
      runtimeRef.current = null;
      localRef.current = null;
    };
  }, [npcId, overrideTick]);

  // Bei `donation_required` (Hard-Limit) markieren wir die Session,
  // damit der nächste Mount auf die lokale Runtime fällt — sofern
  // WebGPU verfügbar ist. So bleibt Cloud Standard, und nur ohne
  // Spende wird lokal erzwungen.
  useEffect(() => {
    return onCloudError((e) => {
      if (e.code !== "donation_required") return;
      if (typeof window === "undefined") return;
      if (!isWebGpuAvailable()) return;
      window.sessionStorage.setItem("e67.forceLocalLlm", "1");
      setOverrideTick((n) => n + 1);
    });
  }, []);

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
