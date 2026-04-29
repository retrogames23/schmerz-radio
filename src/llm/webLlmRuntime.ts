import type { LlmRuntime, LlmRuntimeStatus } from "./runtime";
import {
  cancelLocalLlmLoad,
  getLoadedEngineOrLoad,
  hasLoadedEngine,
  startLocalLlmLoad,
  subscribe as subscribeLoader,
} from "./webLlmLoader";

/**
 * Lokale Runtime — dünner Wrapper über den globalen Singleton-Loader.
 * Mehrere Aufrufe teilen sich denselben Modell-Lade-Vorgang.
 */
export function createWebLlmRuntime(
  onStatus: (s: LlmRuntimeStatus) => void,
): LlmRuntime & { cancelLoad: () => void } {
  const status: LlmRuntimeStatus = {
    kind: "local",
    ready: hasLoadedEngine(),
    loading: hasLoadedEngine()
      ? undefined
      : { text: "Initialisiere lokales Modell …" },
  };
  onStatus({ ...status });

  const unsub = subscribeLoader((p) => {
    if (p.phase === "ready") {
      status.ready = true;
      status.loading = undefined;
      status.error = null;
    } else if (p.phase === "error") {
      status.ready = false;
      status.loading = undefined;
      status.error = p.error ?? p.text;
    } else if (p.phase === "cancelled") {
      status.ready = false;
      status.loading = undefined;
      status.error = "cancelled";
    } else if (p.phase === "loading") {
      status.ready = false;
      status.loading = { text: p.text, pct: p.pct };
      status.error = null;
    }
    onStatus({ ...status });
  });

  // Lade-Vorgang sicher anstoßen (Singleton — no-op wenn schon fertig/läuft).
  void startLocalLlmLoad().catch(() => {
    /* Status wird via Subscriber gespiegelt. */
  });

  return {
    get status() {
      return status;
    },
    async send(messages, opts) {
      const eng = await getLoadedEngineOrLoad();
      if (opts?.signal?.aborted) throw new Error("aborted");
      const res = await eng.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 220,
        stream: false,
      });
      const reply = res.choices?.[0]?.message?.content?.trim() ?? "";
      if (!reply) throw new Error("Leere Antwort vom lokalen Modell.");
      return reply;
    },
    cancelLoad() {
      cancelLocalLlmLoad();
    },
    dispose() {
      unsub();
    },
  };
}
