/**
 * Dev-Mode-Editor für `api.showText([...])`-Overlays.
 *
 * `showText` bekommt einen frei-formatierten String-Array übergeben — die
 * Quellen sind über das ganze Repo verstreut (Scenes, Dialog-onEnd-Hooks,
 * Cutscenes …). Damit Edits trotzdem persistierbar sind, schlüsseln wir
 * jeden Patch nach einem stabilen Hash der Original-Zeilen (Join + DJB2).
 *
 * Pro Key speichern wir:
 *   - `original`: die ursprünglichen Zeilen (für den Report).
 *   - `replacement`: die bearbeiteten Zeilen (gleiche Länge).
 *
 * Persistenz: localStorage `e67.textPatches`.
 */
import { useEffect, useState } from "react";

export type TextPatch = {
  original: string[];
  replacement: string[];
};

type AllTextPatches = Record<string, TextPatch>;

const KEY = "e67.textPatches";
const EVT = "e67:textPatch-change";

function emit() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(EVT));
}

function readAll(): AllTextPatches {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as AllTextPatches)
      : {};
  } catch {
    return {};
  }
}

function writeAll(all: AllTextPatches) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  emit();
}

/** Stabiler DJB2-Hash der zusammengefügten Zeilen → Hex-String. */
export function hashTextLines(lines: string[]): string {
  const s = lines.join("\u241E"); // record-separator als Trennzeichen
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16);
}

export function getTextPatch(original: string[]): TextPatch | null {
  const k = hashTextLines(original);
  return readAll()[k] ?? null;
}

export function getAllTextPatches(): AllTextPatches {
  return readAll();
}

export function clearAllTextPatches() {
  writeAll({});
}

export function clearTextPatch(original: string[]) {
  const all = readAll();
  const k = hashTextLines(original);
  if (!all[k]) return;
  delete all[k];
  writeAll(all);
}

export function setTextLine(
  original: string[],
  index: number,
  value: string,
) {
  if (index < 0 || index >= original.length) return;
  const all = readAll();
  const k = hashTextLines(original);
  const cur =
    all[k] ?? { original: [...original], replacement: [...original] };
  if (cur.replacement.length !== original.length) {
    cur.replacement = [...original];
  }
  cur.replacement[index] = value;
  // Wenn Replacement wieder identisch zum Original ist, Eintrag entfernen.
  if (
    cur.replacement.length === original.length &&
    cur.replacement.every((s, i) => s === original[i])
  ) {
    delete all[k];
  } else {
    all[k] = cur;
  }
  writeAll(all);
}

/** Wendet Patch an, falls vorhanden. Sonst Original. */
export function applyTextPatch(original: string[]): string[] {
  const p = getTextPatch(original);
  if (!p) return original;
  if (p.replacement.length !== original.length) return original;
  return p.replacement;
}

export function textPatchStats(all: AllTextPatches = readAll()) {
  let entries = 0;
  let lines = 0;
  for (const k of Object.keys(all)) {
    const p = all[k];
    let dirty = 0;
    for (let i = 0; i < p.replacement.length; i++) {
      if (p.replacement[i] !== p.original[i]) dirty += 1;
    }
    if (dirty > 0) {
      entries += 1;
      lines += dirty;
    }
  }
  return { entries, lines };
}

/* -------------------- Hooks -------------------- */

export function useTextPatchTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
}
