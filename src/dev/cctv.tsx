import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGame } from "@/game/GameContext";
import { scenes } from "@/game/scenes";
import { getDialog } from "@/game/dialogs/lookup";

/**
 * Leitstellen-CCTV (Dev). Datenschutz-Prinzip: Spieler senden NUR, solange
 * irgendwo ein geöffneter Monitor „pingt". Ohne Ping wird nichts erfasst
 * oder übertragen — der Beacon lauscht nur passiv auf dem Kanal.
 */
const CHANNEL = "cctv-leitstelle";
const PING_EVERY_MS = 3000;
const PING_TIMEOUT_MS = 6500;
const REPORT_EVERY_MS = 1500;
const STALE_MS = 8000;

export interface CctvReport {
  cid: string;
  label: string;
  sceneId: string;
  sceneTitle: string;
  background: string | null;
  /** IDs der beim Spieler sichtbaren Figuren. */
  npcIds?: string[];
  /** Spielstand-Auszug, damit der Monitor dieselbe Raumfassung wählt. */
  flags?: string[];
  knowledge?: string[];
  items?: string[];
  activity: string;
  radio: boolean;
  at: number;
}

function clientId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("cctv-cid");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("cctv-cid", id);
  }
  return id;
}

/** Läuft bei jedem Spieler. Sendet nur nach Empfang eines Monitor-Pings. */
export function CctvBeacon() {
  const game = useGame();
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    const cid = clientId();
    let lastPing = 0;
    let timer: ReturnType<typeof setInterval> | null = null;
    const ch = supabase.channel(CHANNEL, { config: { broadcast: { self: false } } });

    const report = () => {
      if (Date.now() - lastPing > PING_TIMEOUT_MS) {
        if (timer) clearInterval(timer);
        timer = null;
        return;
      }
      const g = gameRef.current;
      const scene = scenes[g.scene];
      let background: string | null = null;
      try {
        background = scene
          ? typeof scene.background === "function"
            ? scene.background(g.api)
            : scene.background
          : null;
      } catch {
        background = null;
      }
      const api = g.api;
      const npcIds = (scene?.npcs ?? [])
        .filter((n) => {
          try {
            if (n.requires && !n.requires.every((f) => api.hasFlag(f))) return false;
            if (n.hiddenWhen && n.hiddenWhen.some((f) => api.hasFlag(f))) return false;
            if (n.visible && !n.visible(api)) return false;
            return true;
          } catch {
            return false;
          }
        })
        .map((n) => n.id);
      let activity = "Sieht sich um";
      if (g.dialogId && g.dialogLineId) {
        const line = getDialog(g.dialogId)?.lines[g.dialogLineId];
        if (line) activity = `${line.speaker}: „${line.text.slice(0, 90)}"`;
      } else if (g.caption) activity = g.caption.slice(0, 110);
      else if (g.terminalOpen) activity = "Sitzt am Terminal";
      else if (g.radioOpen) activity = "Bedient das Radio";
      else if (g.amigaWorkbenchOpen) activity = "Am Amiga";
      const payload: CctvReport = {
        cid,
        label: `Subjekt #${cid.slice(0, 4).toUpperCase()}`,
        sceneId: g.scene,
        sceneTitle: scene?.title ?? g.scene,
        background,
        npcIds,
        flags: [...g.flags],
        knowledge: [...g.knowledge],
        items: g.inventory.map((it) => it.id),
        activity,
        radio: g.radioActive,
        at: Date.now(),
      };
      void ch.send({ type: "broadcast", event: "report", payload });
    };

    ch.on("broadcast", { event: "ping" }, () => {
      lastPing = Date.now();
      if (!timer) {
        report();
        timer = setInterval(report, REPORT_EVERY_MS);
      }
    }).subscribe();

    return () => {
      if (timer) clearInterval(timer);
      void supabase.removeChannel(ch);
    };
  }, []);

  return null;
}

/** 2×2-Überwachungsmonitore. Pingt nur, solange geöffnet. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function remoteApi(base: any, r: CctvReport): any {
  if (!r.flags) return base;
  const f = new Set(r.flags);
  const k = new Set(r.knowledge ?? []);
  const it = r.items ?? [];
  return {
    ...base,
    hasFlag: (x: string) => f.has(x),
    hasKnowledge: (x: string) => k.has(x),
    hasItem: (x: string) => it.includes(x),
    getItemCount: (x: string) => it.filter((i) => i === x).length,
  };
}

function sceneOf(sceneId: string) {
  return (scenes as Record<string, (typeof scenes)[keyof typeof scenes]>)[sceneId];
}

function localBackground(sceneId: string, api: unknown): string | null {
  const scene = sceneOf(sceneId);
  if (!scene) return null;
  try {
    return typeof scene.background === "function"
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scene.background(api as any)
      : scene.background;
  } catch {
    return null;
  }
}

export function CctvMonitor({ onClose }: { onClose: () => void }) {
  const viewerGame = useGame();
  const [reports, setReports] = useState<Record<string, CctvReport>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const ch = supabase.channel(CHANNEL, { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "report" }, ({ payload }) => {
      const r = payload as CctvReport;
      setReports((prev) => ({ ...prev, [r.cid]: { ...r, at: Date.now() } }));
    });
    let ping: ReturnType<typeof setInterval> | null = null;
    ch.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      const send = () => void ch.send({ type: "broadcast", event: "ping", payload: {} });
      send();
      ping = setInterval(send, PING_EVERY_MS);
    });
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      if (ping) clearInterval(ping);
      clearInterval(tick);
      window.removeEventListener("keydown", onKey);
      void supabase.removeChannel(ch);
    };
  }, [onClose]);

  const live = Object.values(reports)
    .filter((r) => now - r.at < STALE_MS)
    .sort((a, b) => a.cid.localeCompare(b.cid))
    .slice(0, 4);
  const slots = [0, 1, 2, 3].map((i) => live[i] ?? null);
  const clock = new Date(now).toLocaleTimeString("de-DE");

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-background p-3 font-mono-crt">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-amber-glow">
        <span>Leitstelle E67 · Überwachung · {live.length}/4 Signale</span>
        <button type="button" onClick={onClose} className="hover:underline">
          schließen [Esc]
        </button>
      </div>
      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
        {slots.map((r, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[18px] border-4 border-muted bg-card shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]"
          >
            {r && (localBackground(r.sceneId, remoteApi(viewerGame.api, r)) ?? r.background) ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative aspect-video max-h-full w-full opacity-80 [filter:grayscale(0.7)_sepia(0.3)_contrast(1.1)]">
                  <img
                    src={localBackground(r.sceneId, remoteApi(viewerGame.api, r)) ?? r.background ?? ""}
                    alt={r.sceneTitle}
                    className="absolute inset-0 h-full w-full object-fill"
                  />
                  {(sceneOf(r.sceneId)?.npcs ?? [])
                    .filter((n) => r.npcIds?.includes(n.id))
                    .map((n) => (
                      <img
                        key={n.id}
                        src={n.src}
                        alt={n.alt}
                        className="absolute object-contain"
                        style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%` }}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <div className="cctv-noise absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {r ? "Bild gestört" : "Kein Signal / Standby"}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,hsl(var(--background)/0.25)_0px,hsl(var(--background)/0.25)_1px,transparent_2px,transparent_3px)]" />
            <div className="absolute left-2 top-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-amber-glow">
              <span>Kamera 0{i + 1}</span>
              {r && <span className="animate-pulse text-destructive">● REC</span>}
            </div>
            <div className="absolute right-2 top-2 text-[11px] text-amber-glow">{clock}</div>
            {r && (
              <div className="absolute inset-x-0 bottom-0 bg-background/80 px-2 py-1 text-[11px] leading-snug text-foreground">
                <div className="text-amber-glow">
                  {r.label} · {r.sceneTitle} {r.radio && "· 104,6"}
                </div>
                <div className="truncate">{r.activity}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
