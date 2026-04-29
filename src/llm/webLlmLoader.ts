import type { ChatMsg } from "./runtime";

/**
 * Globaler Singleton-Loader für das lokale WebLLM-Modell.
 * Kann jederzeit (z.B. vom Titelbildschirm) heimlich gestartet werden,
 * unterstützt mehrere Subscriber für Fortschritt und ist abbrechbar.
 *
 * Wichtig: Ein einmal geladenes Modell bleibt im Speicher — ein Cancel
 * verwirft den Lade-Prozess, das Engine-Objekt wird gelöscht.
 */

export type LoadPhase = "idle" | "loading" | "ready" | "error" | "cancelled";

export interface LoadProgress {
  phase: LoadPhase;
  /** 0..1 wenn bekannt */
  pct?: number;
  /** Menschenlesbarer Status (z.B. „Lade Modell-Gewichte …") */
  text: string;
  /** Fehlertext, falls phase === "error" */
  error?: string;
}

type Engine = {
  reload: (model: string) => Promise<void>;
  chat: {
    completions: {
      create: (args: {
        messages: ChatMsg[];
        temperature?: number;
        max_tokens?: number;
        stream?: false;
      }) => Promise<{
        choices: Array<{ message: { content?: string | null } }>;
      }>;
    };
  };
};

const PRIMARY_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const FALLBACK_MODEL = "Phi-3.5-mini-instruct-q4f16_1-MLC";

let engine: Engine | null = null;
let loadingPromise: Promise<Engine> | null = null;
let cancelled = false;
const subscribers = new Set<(p: LoadProgress) => void>();

let current: LoadProgress = {
  phase: "idle",
  text: "Modell noch nicht geladen.",
};

function emit(next: Partial<LoadProgress>) {
  current = { ...current, ...next };
  for (const s of subscribers) s(current);
}

export function getProgress(): LoadProgress {
  return current;
}

export function subscribe(fn: (p: LoadProgress) => void): () => void {
  subscribers.add(fn);
  fn(current);
  return () => subscribers.delete(fn);
}

export function isWebGpuAvailable(): boolean {
  return typeof navigator !== "undefined" && "gpu" in (navigator as object);
}

/**
 * Startet das Laden, falls noch nicht passiert. Mehrfach-Aufrufe
 * teilen sich denselben Promise.
 */
export function startLocalLlmLoad(): Promise<Engine> {
  if (engine) return Promise.resolve(engine);
  if (loadingPromise) return loadingPromise;
  if (!isWebGpuAvailable()) {
    const err = new Error("WebGPU nicht verfügbar.");
    emit({ phase: "error", text: "Kein WebGPU.", error: err.message });
    return Promise.reject(err);
  }

  cancelled = false;
  emit({
    phase: "loading",
    text: "Initialisiere lokales Modell …",
    pct: 0,
    error: undefined,
  });

  loadingPromise = (async () => {
    const mod = await import("@mlc-ai/web-llm");
    if (cancelled) throw new Error("cancelled");
    const eng = new mod.MLCEngine({
      initProgressCallback: (report: { text: string; progress?: number }) => {
        if (cancelled) return;
        emit({
          phase: "loading",
          text: report.text,
          pct: typeof report.progress === "number" ? report.progress : current.pct,
        });
      },
    }) as unknown as Engine;
    try {
      await eng.reload(PRIMARY_MODEL);
    } catch (e) {
      if (cancelled) throw new Error("cancelled");
      console.warn("WebLLM primary model failed, trying fallback:", e);
      emit({ text: "Primärmodell fehlgeschlagen — versuche Ausweich-Modell …" });
      await eng.reload(FALLBACK_MODEL);
    }
    if (cancelled) throw new Error("cancelled");
    engine = eng;
    emit({ phase: "ready", text: "Lokales Modell bereit.", pct: 1 });
    return eng;
  })();

  loadingPromise.catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "cancelled") {
      emit({ phase: "cancelled", text: "Laden abgebrochen.", pct: undefined });
    } else {
      emit({ phase: "error", text: "Laden fehlgeschlagen.", error: msg });
    }
    loadingPromise = null;
  });

  return loadingPromise;
}

/**
 * Bricht einen laufenden Ladevorgang ab. Ein bereits geladenes Modell
 * bleibt erhalten. Nach Cancel kann später erneut `startLocalLlmLoad`
 * aufgerufen werden.
 */
export function cancelLocalLlmLoad() {
  if (engine) return; // schon fertig — nichts zu tun
  if (!loadingPromise) return;
  cancelled = true;
  loadingPromise = null;
  // Engine, das während Cancel evtl. noch entsteht, wird nicht referenziert.
  emit({ phase: "cancelled", text: "Laden abgebrochen.", pct: undefined });
}

export async function getLoadedEngineOrLoad(): Promise<Engine> {
  if (engine) return engine;
  return startLocalLlmLoad();
}

export function hasLoadedEngine(): boolean {
  return engine !== null;
}
