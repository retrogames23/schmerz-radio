import { useEffect, useMemo, useState } from "react";
import { scenes, useGame } from "@/game/GameContext";
import type { SceneId } from "@/game/types";
import {
  clearAllStatus,
  clearAllOverrides,
  clearSnippets,
  getSnippets,
  getStatus,
  getOverrideCount,
  isEditorForced,
  isQAActive,
  setEditorForced,
  setQAActive,
  setStatus,
  useQA,
} from "./overlayQAState";

/**
 * Dev-only Overlay-QA-Tool. Iteriert systematisch durch alle Räume,
 * blendet Hotspot-Rahmen dauerhaft ein und sammelt korrigierte
 * Snippets in einem Report — alles clientseitig, kein LLM, kein Server.
 */
export function OverlayQAOverlay() {
  const { api, scene } = useGame();
  useQA();
  const [open, setOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const sceneIds = useMemo(
    () =>
      Object.keys(scenes).sort((a, b) =>
        a.localeCompare(b, "en"),
      ) as SceneId[],
    [],
  );

  const idx = Math.max(0, sceneIds.indexOf(scene as SceneId));
  const total = sceneIds.length;

  const counts = sceneIds.reduce(
    (acc, id) => {
      const s = getStatus(id);
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    { ok: 0, fix: 0, skip: 0, todo: 0 } as Record<string, number>,
  );

  // Grid via CSS injection (an QA-aktive Bühne gebunden).
  useEffect(() => {
    const id = "e67-overlay-qa-grid";
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    if (!isQAActive() || !showGrid) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      [data-overlay-qa-grid="1"]::after {
        content: "";
        position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, rgba(251,191,36,0.25) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(251,191,36,0.25) 1px, transparent 1px),
          linear-gradient(to right, rgba(251,191,36,0.6) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(251,191,36,0.6) 1px, transparent 1px);
        background-size: 5% 5%, 5% 5%, 25% 25%, 25% 25%;
        pointer-events: none;
        z-index: 25;
      }
    `;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [showGrid]);

  // Mark image layer for grid CSS selector.
  useEffect(() => {
    const layers = document.querySelectorAll(".relative.mx-auto.aspect-\\[16\\/9\\]");
    if (!isQAActive() || !showGrid) {
      layers.forEach((n) => (n as HTMLElement).removeAttribute("data-overlay-qa-grid"));
      return;
    }
    layers.forEach((n) => (n as HTMLElement).setAttribute("data-overlay-qa-grid", "1"));
    return () => {
      layers.forEach((n) => (n as HTMLElement).removeAttribute("data-overlay-qa-grid"));
    };
  }, [showGrid, scene]);

  const goIdx = (i: number) => {
    const next = sceneIds[(i + total) % total];
    if (next) api.goTo(next);
  };

  const active = isQAActive();
  const editor = isEditorForced();
  const overrideCount = getOverrideCount();

  const buildReport = () => {
    const lines: string[] = [];
    lines.push(`# Overlay-QA-Report (${counts.ok} ok / ${counts.fix} fix / ${counts.skip} skip / ${counts.todo} todo)`);
    lines.push("");
    for (const id of sceneIds) {
      const s = getStatus(id);
      const sym =
        s === "ok" ? "✓" : s === "fix" ? "✎" : s === "skip" ? "↷" : "·";
      lines.push(`- ${sym} ${id} — ${s}`);
    }
    const snips = getSnippets();
    if (snips.length > 0) {
      lines.push("");
      lines.push("## Korrektur-Snippets");
      const bySc = new Map<string, string[]>();
      for (const sn of snips) {
        const arr = bySc.get(sn.sceneId) ?? [];
        arr.push(sn.snippet);
        bySc.set(sn.sceneId, arr);
      }
      for (const [sc, arr] of bySc) {
        lines.push("");
        lines.push(`### ${sc}`);
        lines.push("```");
        for (const s of arr) lines.push(s);
        lines.push("```");
      }
    }
    return lines.join("\n");
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard?.writeText(buildReport());
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Dev: Overlay-QA"
        className="fixed bottom-4 left-32 z-[120] flex h-10 items-center justify-center rounded-full border border-amber-glow/60 bg-background/80 px-3 font-mono-crt text-xs text-amber-glow shadow-lg hover:bg-amber-glow/15"
      >
        QA {active ? `· ${idx + 1}/${total}` : ""}
      </button>

      {open && (
        <div className="fixed bottom-16 left-4 z-[121] w-[360px] rounded-sm border border-amber-glow/60 bg-background p-3 shadow-[0_0_60px_rgba(0,0,0,0.85)] font-mono-crt text-xs text-foreground">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-glow">
              Overlay-QA
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-amber-glow"
            >
              ✕
            </button>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setQAActive(!active);
                if (!active) setEditorForced(false);
              }}
              className={
                "rounded-sm border px-2 py-1 " +
                (active
                  ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
                  : "border-amber-glow/40 hover:bg-amber-glow/10")
              }
            >
              {active ? "QA aktiv" : "QA starten"}
            </button>
            <button
              type="button"
              onClick={() => setEditorForced(!editor)}
              className={
                "rounded-sm border px-2 py-1 " +
                (editor
                  ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
                  : "border-amber-glow/40 hover:bg-amber-glow/10")
              }
            >
              Editor: {editor ? "an" : "aus"}
            </button>
            <button
              type="button"
              onClick={() => setShowGrid((v) => !v)}
              className={
                "rounded-sm border px-2 py-1 " +
                (showGrid
                  ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
                  : "border-amber-glow/40 hover:bg-amber-glow/10")
              }
            >
              Raster: {showGrid ? "an" : "aus"}
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => goIdx(idx - 1)}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              ◀
            </button>
            <div className="flex-1 truncate text-center">
              {idx + 1}/{total} · <span className="text-amber-glow">{scene}</span>
            </div>
            <button
              type="button"
              onClick={() => goIdx(idx + 1)}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              ▶
            </button>
          </div>

          <div className="mb-2 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => {
                setStatus(scene, "ok");
                goIdx(idx + 1);
              }}
              className="rounded-sm border border-emerald-500/50 px-2 py-1 text-emerald-300 hover:bg-emerald-500/10"
            >
              ✓ OK
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus(scene, "fix");
                setEditorForced(true);
              }}
              className="rounded-sm border border-amber-glow/60 px-2 py-1 text-amber-glow hover:bg-amber-glow/10"
            >
              ✎ Fix
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus(scene, "skip");
                goIdx(idx + 1);
              }}
              className="rounded-sm border border-muted-foreground/40 px-2 py-1 text-muted-foreground hover:bg-muted-foreground/10"
            >
              ↷ Skip
            </button>
          </div>

          <div className="mb-2 text-[10px] text-muted-foreground">
            ✓ {counts.ok} · ✎ {counts.fix} · ↷ {counts.skip} · · {counts.todo}
          </div>

          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReport((v) => !v)}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              {showReport ? "Report aus" : "Report"}
            </button>
            <button
              type="button"
              onClick={copyReport}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              Report kopieren
            </button>
            <button
              type="button"
              onClick={() => {
                if (!confirm("Alle QA-Status & Snippets zurücksetzen?")) return;
                clearAllStatus(sceneIds);
                clearSnippets();
                clearAllOverrides();
              }}
              className="ml-auto rounded-sm border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
            >
              Reset
            </button>
          </div>

          {showReport && (
            <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-sm border border-amber-glow/30 bg-black/40 p-2 text-[10px] leading-tight">
              {buildReport()}
            </pre>
          )}

          <div className="mt-2 text-[10px] text-muted-foreground">
            Tipp: „Editor an" → Hotspots ziehen/größenändern. Änderungen werden
            sofort persistent (localStorage, {overrideCount} aktiv) und
            überleben Szenenwechsel/Reload. Snippets landen automatisch im
            Report — von dort in den Code übernehmen, dann „Reset" klicken.
          </div>
        </div>
      )}
    </>
  );
}
