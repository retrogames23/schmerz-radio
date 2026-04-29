import { useEffect, useState } from "react";

/**
 * Developer-Mode: schaltet zusätzliche Debug-UIs frei (z.B. Free-Chat
 * Debug-Panel, LLM-Mode-Override). Aktivieren per URL: `?dev=1`,
 * deaktivieren per `?dev=0`. Persistiert in localStorage.
 */
const KEY = "e67.devMode";

function readFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    const param = url.searchParams.get("dev");
    if (param === "1") {
      window.localStorage.setItem(KEY, "1");
      return true;
    }
    if (param === "0") {
      window.localStorage.removeItem(KEY);
      return false;
    }
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function isDevMode(): boolean {
  return readFlag();
}

export function useDevMode(): boolean {
  const [on, setOn] = useState<boolean>(() => readFlag());
  useEffect(() => {
    const handler = () => setOn(readFlag());
    window.addEventListener("storage", handler);
    window.addEventListener("e67:devmode-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("e67:devmode-change", handler);
    };
  }, []);
  return on;
}

/** LLM-Mode-Override für den Dev-Mode. */
export type LlmModeOverride = "auto" | "local" | "cloud";
const MODE_KEY = "e67.devLlmMode";

export function readLlmModeOverride(): LlmModeOverride {
  if (typeof window === "undefined") return "auto";
  try {
    const v = window.localStorage.getItem(MODE_KEY);
    if (v === "local" || v === "cloud") return v;
    return "auto";
  } catch {
    return "auto";
  }
}

export function writeLlmModeOverride(mode: LlmModeOverride) {
  if (typeof window === "undefined") return;
  try {
    if (mode === "auto") window.localStorage.removeItem(MODE_KEY);
    else window.localStorage.setItem(MODE_KEY, mode);
    window.dispatchEvent(new CustomEvent("e67:llm-mode-change"));
  } catch {
    /* ignore */
  }
}

export function useLlmModeOverride(): [
  LlmModeOverride,
  (m: LlmModeOverride) => void,
] {
  const [mode, setMode] = useState<LlmModeOverride>(() =>
    readLlmModeOverride(),
  );
  useEffect(() => {
    const handler = () => setMode(readLlmModeOverride());
    window.addEventListener("storage", handler);
    window.addEventListener("e67:llm-mode-change", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("e67:llm-mode-change", handler);
    };
  }, []);
  return [
    mode,
    (m) => {
      writeLlmModeOverride(m);
      setMode(m);
    },
  ];
}