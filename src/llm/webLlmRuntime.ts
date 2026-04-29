import type { ChatMsg, LlmRuntime, LlmRuntimeStatus } from "./runtime";

/**
 * Lokale WebLLM-Runtime — lädt ein kleines Modell direkt im Browser
 * via WebGPU. Modul-Singleton: Ein Modell-Reload würde ein paar
 * hundert MB neu herunterladen.
 */

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

let enginePromise: Promise<Engine> | null = null;

export interface InitProgress {
  text: string;
  progress?: number;
}

async function loadEngine(
  onProgress: (p: InitProgress) => void,
): Promise<Engine> {
  if (enginePromise) return enginePromise;
  enginePromise = (async () => {
    const mod = await import("@mlc-ai/web-llm");
    const engine = new mod.MLCEngine({
      initProgressCallback: (report: InitProgress) => onProgress(report),
    }) as unknown as Engine;
    try {
      await engine.reload(PRIMARY_MODEL);
    } catch (e) {
      console.warn("WebLLM primary model failed, trying fallback:", e);
      await engine.reload(FALLBACK_MODEL);
    }
    return engine;
  })();
  try {
    return await enginePromise;
  } catch (e) {
    enginePromise = null;
    throw e;
  }
}

/**
 * Erstellt eine lokale Runtime, die sich selbst initialisiert. Der
 * Aufrufer übergibt einen Status-Callback, um Lade-Fortschritt &
 * Fehler in die UI zu spiegeln.
 */
export function createWebLlmRuntime(
  onStatus: (s: LlmRuntimeStatus) => void,
): LlmRuntime {
  const status: LlmRuntimeStatus = {
    kind: "local",
    ready: false,
    loading: { text: "Initialisiere lokales Modell …" },
  };
  onStatus({ ...status });

  const enginePromiseLocal = loadEngine((p) => {
    status.loading = { text: p.text, pct: p.progress };
    onStatus({ ...status });
  })
    .then((eng) => {
      status.ready = true;
      status.loading = undefined;
      onStatus({ ...status });
      return eng;
    })
    .catch((e: unknown) => {
      status.error = e instanceof Error ? e.message : String(e);
      status.ready = false;
      onStatus({ ...status });
      throw e;
    });

  return {
    get status() {
      return status;
    },
    async send(messages, opts) {
      const eng = await enginePromiseLocal;
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
  };
}