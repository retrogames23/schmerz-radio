import { useEffect, useMemo, useState } from "react";
import { scenes, useGame } from "@/game/GameContext";
import type { SceneId } from "@/game/types";
import {
  clearAllOverrides,
  diffSinceLastReport,
  getOverrideCount,
  isQAActive,
  setQAActive,
  snapshotCurrentAsLastReport,
  useQA,
} from "./overlayQAState";

/**
 * Dev-only Overlay-QA-Tool. Bühne durchklicken, Hotspots/NPCs/Decals
 * per Drag/Resize korrigieren — die Änderungen landen persistent in
 * localStorage. „Report kopieren" baut einen kompakten Prompt aus
 * exakt dem Delta seit dem letzten Kopieren.
 */
export function OverlayQAOverlay() {
  const { api, scene } = useGame();
  useQA();
  const [open, setOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const sceneIds = useMemo(
    () =>
      Object.keys(scenes).sort((a, b) =>
        a.localeCompare(b, "en"),
      ) as SceneId[],
    [],
  );

  const idx = Math.max(0, sceneIds.indexOf(scene as SceneId));
  const total = sceneIds.length;

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

  useEffect(() => {
    const layers = document.querySelectorAll(
      ".relative.mx-auto.aspect-\\[16\\/9\\]",
    );
    if (!isQAActive() || !showGrid) {
      layers.forEach((n) =>
        (n as HTMLElement).removeAttribute("data-overlay-qa-grid"),
      );
      return;
    }
    layers.forEach((n) =>
      (n as HTMLElement).setAttribute("data-overlay-qa-grid", "1"),
    );
    return () => {
      layers.forEach((n) =>
        (n as HTMLElement).removeAttribute("data-overlay-qa-grid"),
      );
    };
  }, [showGrid, scene]);

  const goIdx = (i: number) => {
    const next = sceneIds[(i + total) % total];
    if (next) api.goTo(next);
  };

  const active = isQAActive();
  const overrideCount = getOverrideCount();

  const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

  const buildReport = (): string | null => {
    const diff = diffSinceLastReport();
    if (
      diff.added.length === 0 &&
      diff.changed.length === 0 &&
      diff.removed.length === 0
    ) {
      return null;
    }
    const bySc = new Map<
      string,
      { added: typeof diff.added; changed: typeof diff.changed; removed: typeof diff.removed }
    >();
    const ensure = (id: string) => {
      let e = bySc.get(id);
      if (!e) {
        e = { added: [], changed: [], removed: [] };
        bySc.set(id, e);
      }
      return e;
    };
    for (const d of diff.added) ensure(d.sceneId).added.push(d);
    for (const d of diff.changed) ensure(d.sceneId).changed.push(d);
    for (const d of diff.removed) ensure(d.sceneId).removed.push(d);

    const lines: string[] = [];
    lines.push(
      "Wende diese Overlay-Korrekturen auf die jeweilige Szene an. Werte sind Prozent der Bühne (16:9). Suche pro Block die Box mit der genannten id (Hotspot/NPC/Decal) in src/game/scenes/<sceneId>.ts und überschreibe nur x/y/w/h.",
    );
    for (const [sc, e] of bySc) {
      lines.push("");
      lines.push(`## ${sc}`);
      for (const d of e.changed) {
        lines.push(
          `- geändert: id "${d.boxId}" → x: ${fmt(d.box.x)}, y: ${fmt(d.box.y)}, w: ${fmt(d.box.w)}, h: ${fmt(d.box.h)}`,
        );
      }
      for (const d of e.added) {
        lines.push(
          `- neu: id "${d.boxId}" → x: ${fmt(d.box.x)}, y: ${fmt(d.box.y)}, w: ${fmt(d.box.w)}, h: ${fmt(d.box.h)}`,
        );
      }
      for (const d of e.removed) {
        lines.push(`- gelöscht: id "${d.boxId}"`);
      }
    }
    return lines.join("\n");
  };

  const copyReport = async () => {
    const text = buildReport();
    if (text === null) {
      setHint("Keine Änderungen seit letztem Report.");
      try {
        await navigator.clipboard?.writeText(
          "Keine Änderungen seit letztem Report.",
        );
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await navigator.clipboard?.writeText(text);
      snapshotCurrentAsLastReport();
      setHint("Report kopiert. Snapshot aktualisiert.");
    } catch {
      setHint("Clipboard fehlgeschlagen.");
    }
  };

  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(null), 2500);
    return () => clearTimeout(t);
  }, [hint]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Dev: Overlay-QA"
        className="fixed bottom-4 left-32 z-[9998] flex h-10 items-center justify-center rounded-full border border-amber-glow/60 bg-background/80 px-3 font-mono-crt text-xs text-amber-glow shadow-lg hover:bg-amber-glow/15"
      >
        QA {active ? `· ${idx + 1}/${total}` : ""}
      </button>

      {open && (
        <div className="fixed bottom-16 left-4 z-[9999] w-[340px] rounded-sm border border-amber-glow/60 bg-background p-3 shadow-[0_0_60px_rgba(0,0,0,0.85)] font-mono-crt text-xs text-foreground">
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
              onClick={() => setQAActive(!active)}
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
              {idx + 1}/{total} ·{" "}
              <span className="text-amber-glow">{scene}</span>
            </div>
            <button
              type="button"
              onClick={() => goIdx(idx + 1)}
              className="rounded-sm border border-amber-glow/40 px-2 py-1 hover:bg-amber-glow/10"
            >
              ▶
            </button>
          </div>

          <div className="mb-2 flex items-center gap-2">
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
                if (
                  !confirm(
                    "Alle Overrides & Report-Snapshot zurücksetzen?",
                  )
                )
                  return;
                clearAllOverrides();
                setHint("Alles zurückgesetzt.");
              }}
              className="ml-auto rounded-sm border border-red-500/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
            >
              Reset
            </button>
          </div>

          {hint && (
            <div className="mb-2 rounded-sm border border-amber-glow/30 bg-amber-glow/10 px-2 py-1 text-[10px] text-amber-glow">
              {hint}
            </div>
          )}

          <div className="text-[10px] text-muted-foreground">
            QA an → Hotspots/NPCs/Decals draggen & resizen. Änderungen
            landen sofort persistent ({overrideCount} aktiv). „Report
            kopieren" gibt nur das Delta seit dem letzten Kopieren aus.
          </div>
        </div>
      )}
    </>
  );
}