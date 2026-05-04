/**
 * Overlay-QA — clientseitiger Zustand für die Dev-QA-Session.
 * Persistiert Status pro Raum in localStorage, sammelt Snippets im Speicher,
 * und exponiert einen kleinen Event-Bus, damit SceneView/HotspotEditor
 * reagieren können (z. B. Hotspots dauerhaft einblenden).
 */
import { useEffect, useState } from "react";

export type QAStatus = "todo" | "ok" | "skip" | "fix";
const STATUS_KEY = (sceneId: string) => `e67.overlayQA.${sceneId}`;
const ACTIVE_KEY = "e67.overlayQA.active";
const EDITOR_KEY = "e67.overlayQA.editor";

const EVT_CHANGE = "e67:overlayQA-change";
const snippetBuffer: { sceneId: string; snippet: string; ts: number }[] = [];

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT_CHANGE));
  }
}

export function isQAActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ACTIVE_KEY) === "1";
  } catch {
    return false;
  }
}
export function setQAActive(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(ACTIVE_KEY, "1");
    else window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function isEditorForced(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(EDITOR_KEY) === "1";
  } catch {
    return false;
  }
}
export function setEditorForced(on: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(EDITOR_KEY, "1");
    else window.localStorage.removeItem(EDITOR_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function getStatus(sceneId: string): QAStatus {
  if (typeof window === "undefined") return "todo";
  try {
    const v = window.localStorage.getItem(STATUS_KEY(sceneId));
    if (v === "ok" || v === "skip" || v === "fix") return v;
    return "todo";
  } catch {
    return "todo";
  }
}
export function setStatus(sceneId: string, status: QAStatus) {
  if (typeof window === "undefined") return;
  try {
    if (status === "todo") window.localStorage.removeItem(STATUS_KEY(sceneId));
    else window.localStorage.setItem(STATUS_KEY(sceneId), status);
  } catch {
    /* ignore */
  }
  emit();
}

export function clearAllStatus(sceneIds: string[]) {
  if (typeof window === "undefined") return;
  for (const id of sceneIds) {
    try {
      window.localStorage.removeItem(STATUS_KEY(id));
    } catch {
      /* ignore */
    }
  }
  snippetBuffer.length = 0;
  emit();
}

export function pushSnippet(sceneId: string, snippet: string) {
  snippetBuffer.push({ sceneId, snippet, ts: Date.now() });
  // Auto-Mark: Korrigierter Raum gilt als „fix".
  if (getStatus(sceneId) !== "ok") setStatus(sceneId, "fix");
  emit();
}

export function getSnippets() {
  return snippetBuffer.slice();
}
export function getSnippetsBy(sceneId: string) {
  return snippetBuffer.filter((s) => s.sceneId === sceneId);
}
export function clearSnippets() {
  snippetBuffer.length = 0;
  emit();
}

export function useQA() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener(EVT_CHANGE, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT_CHANGE, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return {
    active: isQAActive(),
    editorForced: isEditorForced(),
  };
}
