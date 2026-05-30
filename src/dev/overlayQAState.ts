/**
 * Overlay-QA — clientseitiger Zustand für die Dev-QA-Session.
 * Persistiert nur noch zwei Dinge: Ob QA aktiv ist und die per Drag/Resize
 * verschobenen Boxen pro Szene. Beim „Report kopieren" wird ein Snapshot
 * dieser Overrides gespeichert; der nächste Report enthält nur das Delta.
 */
import { useEffect, useState } from "react";

const ACTIVE_KEY = "e67.overlayQA.active";
const OVERRIDES_KEY = "e67.overlayQA.overrides";
const SNAPSHOT_KEY = "e67.overlayQA.lastReport";

const EVT_CHANGE = "e67:overlayQA-change";

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

/* ------------------------------------------------------------------ */
/* Persistente Hotspot-/NPC-/Decal-Overrides (pro Szene, pro Box-ID). */
/* Werden direkt beim Rendern angewendet, damit Korrekturen sofort    */
/* sichtbar sind und Szenenwechsel überleben.                          */
/* ------------------------------------------------------------------ */

export type BoxOverride = { x: number; y: number; w: number; h: number };
type AllOverrides = Record<string, Record<string, BoxOverride>>;

function readAll(): AllOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AllOverrides) : {};
  } catch {
    return {};
  }
}

function writeAll(all: AllOverrides) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  emit();
}

export function getOverridesFor(sceneId: string): Record<string, BoxOverride> {
  return readAll()[sceneId] ?? {};
}

export function setOverride(
  sceneId: string,
  boxId: string,
  box: BoxOverride,
) {
  const all = readAll();
  const scene = { ...(all[sceneId] ?? {}) };
  scene[boxId] = box;
  all[sceneId] = scene;
  writeAll(all);
}

export function clearOverridesFor(sceneId: string) {
  const all = readAll();
  if (!all[sceneId]) return;
  delete all[sceneId];
  writeAll(all);
}

export function clearAllOverrides() {
  writeAll({});
  setLastReportSnapshot({});
}

export function getOverrideCount(): number {
  const all = readAll();
  let n = 0;
  for (const k of Object.keys(all)) n += Object.keys(all[k] ?? {}).length;
  return n;
}

/* ------------------------------------------------------------------ */
/* Snapshot des zuletzt kopierten Reports → ermöglicht Delta-Prompts. */
/* ------------------------------------------------------------------ */

export function getLastReportSnapshot(): AllOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AllOverrides) : {};
  } catch {
    return {};
  }
}

export function setLastReportSnapshot(snap: AllOverrides) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
  emit();
}

export type BoxDelta = {
  sceneId: string;
  boxId: string;
  box: BoxOverride;
};
export type OverrideDiff = {
  added: BoxDelta[];
  changed: BoxDelta[];
  removed: { sceneId: string; boxId: string }[];
};

const r1 = (n: number) => Math.round(n * 10) / 10;
const sameBox = (a: BoxOverride, b: BoxOverride) =>
  r1(a.x) === r1(b.x) &&
  r1(a.y) === r1(b.y) &&
  r1(a.w) === r1(b.w) &&
  r1(a.h) === r1(b.h);

export function diffSinceLastReport(): OverrideDiff {
  const current = readAll();
  const prev = getLastReportSnapshot();
  const added: BoxDelta[] = [];
  const changed: BoxDelta[] = [];
  const removed: { sceneId: string; boxId: string }[] = [];
  const sceneIds = new Set([...Object.keys(current), ...Object.keys(prev)]);
  for (const sceneId of sceneIds) {
    const cur = current[sceneId] ?? {};
    const old = prev[sceneId] ?? {};
    const boxIds = new Set([...Object.keys(cur), ...Object.keys(old)]);
    for (const boxId of boxIds) {
      const c = cur[boxId];
      const o = old[boxId];
      if (c && !o) added.push({ sceneId, boxId, box: c });
      else if (!c && o) removed.push({ sceneId, boxId });
      else if (c && o && !sameBox(c, o)) changed.push({ sceneId, boxId, box: c });
    }
  }
  return { added, changed, removed };
}

export function snapshotCurrentAsLastReport() {
  setLastReportSnapshot(readAll());
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
    // Editor ist immer an, sobald QA aktiv ist (kein separater Toggle mehr).
    editorForced: isQAActive(),
  };
}
