import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollText, Loader2, Send, LogOut, Dices, Swords, Maximize2, Minimize2, FileDown, Play } from "lucide-react";
import { useDsaHost } from "@/game/dsa/DsaHostContext";
import { useMusic } from "@/audio/MusicPlayer";
import { CloseButton } from "./CloseButton";
import { DsaCombatInteractive, type CombatDoneResult } from "./DsaCombatInteractive";
import {
  DSA_SETTINGS,
  parseMasterTurn,
  getSetting,
  type ParsedMasterTurn,
  type SpokenLine,
  type DsaSettingId,
  type AdventureStatus,
} from "@/game/dsa/llmAdventure";
import {
  resolveSceneImage,
} from "@/game/dsa/sceneImages";
import {
  exportAdventureAsDocx,
  exportAdventureAsPdf,
  type ExportTurn,
} from "@/game/dsa/adventureExport";
import {
  ENEMY_STATS,
  companionCombatants,
  foeCombatantFromStat,
  heroCombatantFromCharacter,
  type Combatant,
} from "@/game/dsa/combat";
/**
 * LLM-Tafelrunde im Gemeinschaftsraum E67. Ersetzt das alte gescriptete
 * `DsaAdventureScene`. Drei Modi:
 *   - "loading"    : Initiales Laden vom Server.
 *   - "picker"     : Setting wählen (neues Abenteuer).
 *   - "play"       : Transkript + Bild + Composer.
 * Kampfanforderungen ([COMBAT: ...]) öffnen den bestehenden
 * `DsaCombatOverlay`. Nach Auflösung wird das Ergebnis per
 * `combat_result`-Aktion zurück an den Meister geschickt.
 */

interface ServerReply {
  reply: string;
  parsed: ParsedMasterTurn;
  imageTag: string;
  status: AdventureStatus;
  apAwarded?: number;
  apReason?: string;
}

interface LoadedAdventure {
  setting: DsaSettingId;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  current_image_tag: string;
  status: AdventureStatus;
}

type Mode =
  | { kind: "loading" }
  | { kind: "picker"; error?: string }
  | { kind: "play" };

interface CombatBridge {
  heroes: Combatant[];
  foes: Combatant[];
}

/**
 * Stabile, im Browser gespeicherte ID für anonyme DSA-Runden. Wird nur
 * mitgeschickt, wenn der Spieler nicht angemeldet ist.
 */
function getAnonId(): string {
  if (typeof window === "undefined") return "anon000000000000";
  try {
    let id = window.localStorage.getItem("dsa.anonId");
    if (!id || !/^[0-9a-zA-Z_-]{8,64}$/.test(id)) {
      id = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
      window.localStorage.setItem("dsa.anonId", id);
    }
    return id;
  } catch {
    return "anon000000000000";
  }
}

async function authedPost(body: Record<string, unknown>, sessionId: string): Promise<Response> {
  const { getFreshAccessToken } = await import("@/auth/freshToken");
  const token = await getFreshAccessToken().catch(() => null);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch("/api/public/dsa-master", {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...body,
      sessionId,
      ...(token ? {} : { anonId: getAnonId() }),
    }),
  });
}

export function DsaLlmAdventureScene() {
  const {
    dsaAdventureOpen,
    dsaCharacter,
    setDsaCharacter,
    clearDsaCharacter,
    closeDsaAdventure,
    toggleDsaSheet,
    dsaSheetOpen,
    getDsaSessionId,
    openDsaCreator,
    creditHeroAp,
  } = useDsaHost();
  const { setMoodPool, setMood } = useMusic();

  const [mode, setMode] = useState<Mode>({ kind: "loading" });
  const [imageTag, setImageTag] = useState<string>("forest_path");
  const [turns, setTurns] = useState<
    Array<
      | { id: number; kind: "master"; lines: SpokenLine[]; sceneTag: string | null }
      | { id: number; kind: "player"; text: string }
    >
  >([]);
  const [composerText, setComposerText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combat, setCombat] = useState<CombatBridge | null>(null);
  const [pendingCombat, setPendingCombat] = useState<CombatBridge | null>(null);
  const [endState, setEndState] = useState<AdventureStatus | null>(null);
  const [endAp, setEndAp] = useState<{ value: number; reason: string } | null>(null);
  const [settingId, setSettingId] = useState<DsaSettingId | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const turnIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Vollbild (Desktop) – analog zur Stammspiel-TopBar.
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* Browser hat Vollbild verweigert – stillschweigend ignorieren. */
    }
  };

  const dsaCharacterRef = useRef(dsaCharacter);
  dsaCharacterRef.current = dsaCharacter;

  const nextId = useCallback(() => {
    turnIdRef.current += 1;
    return turnIdRef.current;
  }, []);

  const appendMaster = useCallback(
    (parsed: ParsedMasterTurn, sceneTag: string | null) => {
      if (parsed.lines.length === 0) return;
      setTurns((t) => [
        ...t,
        { id: nextId(), kind: "master", lines: parsed.lines, sceneTag },
      ]);
    },
    [nextId],
  );

  // Initial: laufendes Abenteuer laden.
  useEffect(() => {
    if (!dsaAdventureOpen) return;
    let cancelled = false;
    setMode({ kind: "loading" });
    setError(null);
    setTurns([]);
    setCombat(null);
    setPendingCombat(null);
    setEndState(null);
    (async () => {
      try {
        const r = await authedPost({ action: "load" }, getDsaSessionId());
        if (cancelled) return;
        if (!r.ok) {
          setMode({ kind: "picker", error: "Konnte Stand nicht laden." });
          return;
        }
        const data = (await r.json()) as { none?: boolean; adventure?: LoadedAdventure };
        if (data.none || !data.adventure) {
          setMode({ kind: "picker" });
          return;
        }
        const adv = data.adventure;
        setImageTag(adv.current_image_tag || "forest_path");
        setSettingId(adv.setting);
        // Verlauf rekonstruieren — nur user/assistant, keine System-Cues.
        const restored: typeof turns = [];
        for (const m of adv.messages) {
          if (m.role === "assistant") {
            const parsed = parseMasterTurn(m.content);
            if (parsed.lines.length > 0) {
              turnIdRef.current += 1;
              restored.push({
                id: turnIdRef.current,
                kind: "master",
                lines: parsed.lines,
                sceneTag: parsed.sceneTag,
              });
            }
          } else if (m.role === "user") {
            // Spieler-Cues + COMBAT_RESULT ausblenden.
            const txt = m.content.trim();
            if (txt.startsWith("(SPIELLEITER-CUE") || txt.startsWith("[COMBAT_RESULT")) continue;
            turnIdRef.current += 1;
            restored.push({ id: turnIdRef.current, kind: "player", text: txt });
          }
        }
        setTurns(restored);
        if (adv.status !== "active") {
          setEndState(adv.status);
        }
        setMode({ kind: "play" });
      } catch (e) {
        if (cancelled) return;
        console.error("dsa-llm load failed", e);
        const msg = e instanceof Error ? e.message : "Verbindung fehlgeschlagen.";
        setMode({ kind: "picker", error: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dsaAdventureOpen]);

  // Bewusst kein Auto-Scroll: der Spieler bleibt an der zuletzt gelesenen
  // Stelle und scrollt nach unten, wenn er die Reaktion sehen will.

  const handleServerReply = useCallback(
    (data: ServerReply) => {
      const newTag = data.imageTag || data.parsed.sceneTag || null;
      appendMaster(data.parsed, newTag);
      if (data.imageTag) setImageTag(data.imageTag);
      if (data.parsed.mood) setMood(data.parsed.mood);
      if (data.parsed.combat && dsaCharacterRef.current) {
        // Kampfbildschirm bauen.
        const ch = dsaCharacterRef.current;
        const maybeHero = ch as unknown as { spells?: Record<string, number> };
        const heroLike =
          maybeHero && typeof maybeHero.spells === "object" ? maybeHero : null;
        const hero = heroCombatantFromCharacter(ch, heroLike);
        const companions = companionCombatants();
        const foes = data.parsed.combat.enemyIds
          .map((id, i) => {
            const stat = ENEMY_STATS[id];
            return stat ? foeCombatantFromStat(stat, i) : null;
          })
          .filter((f): f is Combatant => !!f);
        if (foes.length > 0) {
          const heroes = [hero, ...companions];
          // Erst eine Zwischenstufe — Spieler bestätigt mit "Waffen ziehen!".
          setPendingCombat({ heroes, foes });
          return;
        }
      }
      if (data.status !== "active") {
        setEndState(data.status);
        if (typeof data.apAwarded === "number" && data.apAwarded > 0) {
          setEndAp({ value: data.apAwarded, reason: data.apReason ?? "" });
          creditHeroAp?.(data.apAwarded, data.apReason ?? "", data.status === "victory");
        }
      }
    },
    [appendMaster, setMood, creditHeroAp],
  );

  // Mood-Pool aktivieren, solange die Tafelrunde offen ist. Beim Schließen
  // übernimmt die GameShell-Bridge wieder (-> dsaTavern).
  useEffect(() => {
    if (!dsaAdventureOpen) return;
    setMoodPool("intro");
    return () => {
      setMoodPool(null);
    };
  }, [dsaAdventureOpen, setMoodPool]);

  async function handlePickSetting(settingId: DsaSettingId) {
    if (!dsaCharacter || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await authedPost(
        {
          action: "start",
          setting: settingId,
          character: dsaCharacter,
        },
        getDsaSessionId(),
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Fehler." }));
        setError(j.error || "Fehler beim Start.");
        setMode({ kind: "picker" });
        return;
      }
      const data = (await r.json()) as ServerReply;
      setTurns([]);
      setSettingId(settingId);
      setMode({ kind: "play" });
      handleServerReply(data);
    } catch (e) {
      console.error("dsa-llm start failed", e);
      setError(e instanceof Error ? e.message : "Verbindung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  const handleSend = useCallback(async () => {
    const text = composerText.trim();
    if (!text || busy || endState) return;
    setComposerText("");
    setBusy(true);
    setError(null);
    const myId = nextId();
    setTurns((t) => [...t, { id: myId, kind: "player", text }]);
    try {
      const r = await authedPost({ action: "say", text }, getDsaSessionId());
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Fehler." }));
        setError(j.error || "Tjark schweigt.");
        // Eingabe wieder herstellen, damit sie nicht verloren ist.
        setComposerText(text);
        setTurns((t) => t.filter((x) => x.id !== myId));
        return;
      }
      const data = (await r.json()) as ServerReply;
      handleServerReply(data);
    } catch (e) {
      console.error("dsa-llm say failed", e);
      setError(e instanceof Error ? e.message : "Verbindung fehlgeschlagen.");
      setComposerText(text);
      setTurns((t) => t.filter((x) => x.id !== myId));
    } finally {
      setBusy(false);
    }
  }, [composerText, busy, endState, nextId, handleServerReply]);

  async function handleCombatDone(res: CombatDoneResult) {
    if (!combat || !dsaCharacter) return;
    let nextChar = { ...dsaCharacter };
    if (res.outcome === "victory" || res.outcome === "aborted") {
      nextChar.le = Math.max(1, res.heroLe);
    } else {
      nextChar.le = Math.max(1, Math.floor(dsaCharacter.leMax / 2));
      if (res.consequenceKind === "wound" && res.attrLowered) {
        const cur = dsaCharacter.attrs[res.attrLowered] ?? 11;
        nextChar = {
          ...nextChar,
          attrs: { ...dsaCharacter.attrs, [res.attrLowered]: Math.max(1, cur - 1) },
        };
      }
    }
    setDsaCharacter(nextChar);
    setCombat(null);
    setBusy(true);
    setError(null);
    try {
      const r = await authedPost(
        {
          action: "combat_result",
          outcome: res.outcome,
          consequenceKind: res.consequenceKind,
          heroLe: nextChar.le,
          heroLeMax: nextChar.leMax,
          wounds: res.heroWounds,
          fallen: res.fallen,
          attrLowered: res.attrLowered,
        },
        getDsaSessionId(),
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Fehler." }));
        setError(j.error || "Tjark schweigt.");
        return;
      }
      const data = (await r.json()) as ServerReply;
      handleServerReply(data);
    } catch (e) {
      console.error("dsa-llm combat_result failed", e);
      setError(e instanceof Error ? e.message : "Verbindung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAbortAndPickNew() {
    setBusy(true);
    try {
      await authedPost({ action: "abort" }, getDsaSessionId());
    } catch {
      /* ignore */
    }
    setTurns([]);
    setEndState(null);
    setImageTag("forest_path");
    setBusy(false);
    // Bei Niederlage: neuen Charakter rollen.
    if (endState === "defeat") {
      clearDsaCharacter();
      closeDsaAdventure();
      openDsaCreator();
      return;
    }
    setMode({ kind: "picker" });
  }

  async function handleResume() {
    setBusy(true);
    try {
      await authedPost({ action: "resume" }, getDsaSessionId());
      setEndState(null);
      setEndAp(null);
    } catch (e) {
      console.error("dsa-llm resume failed", e);
      setError(e instanceof Error ? e.message : "Konnte nicht fortsetzen.");
    } finally {
      setBusy(false);
    }
  }

  function handleStandUp() {
    closeDsaAdventure();
  }

  const imgSrc = useMemo(
    () => resolveSceneImage(imageTag),
    [imageTag],
  );

  // Beim Szenenwechsel oder Schließen automatisch Zoom zurücksetzen.
  useEffect(() => {
    setImageZoomed(false);
  }, [imageTag, dsaAdventureOpen]);

  // Escape schließt den Zoom.
  useEffect(() => {
    if (!imageZoomed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setImageZoomed(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [imageZoomed]);

  if (!dsaAdventureOpen) return null;
  if (!dsaCharacter) {
    closeDsaAdventure();
    return null;
  }

  // ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/85 p-2 sm:p-6">
      <div className="dsa-adventure-shell relative my-auto w-full max-w-5xl overflow-hidden rounded-md shadow-2xl flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-3rem)]">
        <CloseButton onClick={handleStandUp} />

        {/* Header */}
        <div className="dsa-adventure-header shrink-0 px-4 sm:px-6 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.3em] opacity-70">
                Tjark erzählt
              </div>
              <h2 className="font-serif text-xl sm:text-2xl mt-1 truncate">
                {dsaCharacter.name} · {dsaCharacter.className}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2 mr-10">
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
                aria-label={isFullscreen ? "Vollbild verlassen" : "Vollbild aktivieren"}
                className="hidden sm:inline-flex items-center justify-center rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2 py-1.5 text-[#2a1f10] hover:bg-[#f1d99a]"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </button>
              <button
                type="button"
                onClick={toggleDsaSheet}
                title="Charakterbogen (C)"
                className={
                  "inline-flex items-center gap-1.5 rounded border-2 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all " +
                  (dsaSheetOpen
                    ? "border-[#3a2c1a] bg-[#3a2c1a] text-[#f1e6c8]"
                    : "border-[#3a2c1a] bg-[#fbf2d8] text-[#2a1f10] hover:bg-[#f1d99a]")
                }
              >
                <ScrollText className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>Bogen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        {mode.kind === "loading" && (
          <div className="flex-1 flex items-center justify-center py-16 text-[#2a1f10]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-3 font-serif text-lg">Tjark blättert in seinen Notizen …</span>
          </div>
        )}

        {mode.kind === "picker" && (
          <SettingPicker
            error={mode.error ?? error}
            busy={busy}
            onPick={handlePickSetting}
            onStandUp={handleStandUp}
          />
        )}

        {mode.kind === "play" && (
          <>
            {imgSrc && (
              <button
                type="button"
                onClick={() => setImageZoomed(true)}
                title="Bild vergrößern"
                className="shrink-0 relative w-full bg-black/80 cursor-zoom-in focus:outline-none"
              >
                <img
                  src={imgSrc}
                  alt="Szene"
                  loading="lazy"
                  className="w-full h-32 sm:h-48 object-cover opacity-90"
                />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 text-[#2a1f10]"
            >
              {turns.map((t) =>
                t.kind === "master" ? (
                  <MasterTurn key={t.id} lines={t.lines} />
                ) : (
                  <PlayerTurn key={t.id} text={t.text} name={dsaCharacter.name} />
                ),
              )}
              {pendingCombat && !busy && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCombat(pendingCombat);
                      setPendingCombat(null);
                    }}
                    className="inline-flex items-center gap-2 rounded border-2 border-[#6b1a0e] bg-[#6b1a0e] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px transition-transform"
                  >
                    <Swords className="h-4 w-4" strokeWidth={2.5} />
                    Die Waffen ziehen!
                  </button>
                </div>
              )}
              {busy && (
                <div className="flex items-center gap-2 italic text-[#2a1f10]/70 font-serif">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tjark überlegt …
                </div>
              )}
              {error && (
                <div className="rounded border-2 border-red-900/40 bg-red-100/60 px-3 py-2 text-sm text-red-900">
                  {error}
                </div>
              )}
            </div>

            {/* Composer / End-State */}
            {endState ? (
              <EndBanner
                status={endState}
                turns={turns}
                character={dsaCharacter}
                settingId={settingId}
                ap={endAp}
                onNew={handleAbortAndPickNew}
                onStandUp={handleStandUp}
                onResume={endState === "aborted" ? handleResume : undefined}
                resuming={busy}
              />
            ) : (
              <div className="dsa-adventure-header shrink-0 border-t border-[#3a2c1a]/30 px-3 sm:px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value.slice(0, 500))}
                    placeholder={
                      pendingCombat
                        ? "Ein Kampf bahnt sich an — zieh die Waffen, um fortzufahren."
                        : `Was tut ${dsaCharacter.name}? (Klick auf „Senden")`
                    }
                    rows={2}
                    disabled={busy || !!pendingCombat}
                    className="flex-1 resize-none rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 font-sans text-base leading-relaxed text-[#2a1f10] placeholder:text-[#2a1f10]/40 focus:outline-none focus:ring-2 focus:ring-[#3a2c1a]/40 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={busy || !composerText.trim() || !!pendingCombat}
                    className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#3a2c1a] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] hover:bg-[#2a1f10] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Sagen
                  </button>
                </div>
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-[#2a1f10]/60">
                  <button
                    type="button"
                    onClick={handleStandUp}
                    className="inline-flex items-center gap-1 hover:text-[#2a1f10]"
                  >
                    <LogOut className="h-3 w-3" /> Vom Tisch aufstehen
                  </button>
                  <span>{composerText.length}/500</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {combat && (
        <DsaCombatInteractive
          heroes={combat.heroes}
          foes={combat.foes}
          player={{
            KL: dsaCharacter.attrs.KL ?? 11,
            CH: dsaCharacter.attrs.CH ?? 11,
          }}
          onDone={(r) => void handleCombatDone(r)}
        />
      )}

      {imgSrc && imageZoomed && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          onClick={() => setImageZoomed(false)}
        >
          <CloseButton
            onClick={() => setImageZoomed(false)}
            className="absolute top-3 left-3 z-10"
          />
          <img
            src={imgSrc}
            alt="Szene (vergrößert)"
            className="max-h-full max-w-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Sub-Komponenten
// ──────────────────────────────────────────────────────────────

function MasterTurn({ lines }: { lines: SpokenLine[] }) {
  return (
    <div className="space-y-1.5">
      {lines.map((l, i) => (
        <div key={i} className="font-serif text-[15px] leading-relaxed">
          {(i === 0 || lines[i - 1].speaker !== l.speaker) && (
          <span
            className={
              "inline-block mr-2 text-[10px] font-bold uppercase tracking-widest align-middle px-1.5 py-0.5 rounded " +
              (l.speaker === "TJARK"
                ? "bg-[#3a2c1a] text-[#f1e6c8]"
                : l.speaker === "BREM"
                  ? "bg-[#6b3a2a] text-[#f1e6c8]"
                  : "bg-[#3a4a6a] text-[#f1e6c8]")
            }
          >
            {l.speaker === "TJARK"
              ? "Tjark (Meister)"
              : l.speaker === "BREM"
                ? "Brem (Streuner)"
                : "Yelva (Elfe)"}
          </span>
          )}
          <span>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

function PlayerTurn({ text, name }: { text: string; name: string }) {
  return (
    <div className="font-serif text-[15px] leading-relaxed italic text-[#2a1f10]/85 pl-3 border-l-2 border-[#3a2c1a]/40">
      <span className="text-[10px] not-italic font-bold uppercase tracking-widest text-[#2a1f10]/60 mr-2">
        {name}
      </span>
      {text}
    </div>
  );
}

function SettingPicker({
  error,
  busy,
  onPick,
  onStandUp,
}: {
  error: string | null | undefined;
  busy: boolean;
  onPick: (id: DsaSettingId) => void;
  onStandUp: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
      <div className="max-w-2xl mx-auto text-[#2a1f10]">
        <p className="font-serif text-[15px] leading-relaxed mb-1">
          <span className="inline-block mr-2 text-[10px] font-bold uppercase tracking-widest bg-[#3a2c1a] text-[#f1e6c8] px-1.5 py-0.5 rounded">
            Tjark
          </span>
          Also gut. Brem (Streuner) schiebt die Würfel hin und her, Yelva
          (Elfe) poliert ihre Brille. Worauf hast du heute Lust?
        </p>
        <p className="text-xs uppercase tracking-[0.3em] opacity-60 mt-6 mb-3">
          Setting wählen
        </p>
        {error && (
          <div className="mb-3 rounded border-2 border-red-900/40 bg-red-100/60 px-3 py-2 text-sm text-red-900">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DSA_SETTINGS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={busy}
              onClick={() => onPick(s.id)}
              className="text-left rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] hover:bg-[#f1d99a] disabled:opacity-50 px-4 py-3 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <Dices className="h-4 w-4" strokeWidth={2.5} />
                <h3 className="font-serif text-base font-bold">{s.title}</h3>
              </div>
              <p className="text-xs leading-snug opacity-80">{s.blurb}</p>
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onStandUp}
            disabled={busy}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#2a1f10]/60 hover:text-[#2a1f10] disabled:opacity-50"
          >
            <LogOut className="h-3 w-3" /> Doch nicht spielen
          </button>
        </div>
      </div>
    </div>
  );
}

function EndBanner({
  status,
  turns,
  character,
  settingId,
  ap,
  onNew,
  onStandUp,
}: {
  status: AdventureStatus;
  turns: Array<
    | { id: number; kind: "master"; lines: SpokenLine[]; sceneTag: string | null }
    | { id: number; kind: "player"; text: string }
  >;
  character: import("@/game/types").DsaCharacterSummary;
  settingId: DsaSettingId | null;
  ap: { value: number; reason: string } | null;
  onNew: () => void;
  onStandUp: () => void;
}) {
  const label =
    status === "victory"
      ? "Sieg! Das Abenteuer ist zu Ende."
      : status === "defeat"
        ? "Niederlage. Dein Held ist gefallen."
        : "Abenteuer abgebrochen.";
  const newLabel =
    status === "defeat" ? "Neuen Charakter rollen" : "Neues Abenteuer wählen";

  const [downloading, setDownloading] = useState<"docx" | "pdf" | null>(null);
  const exportPayload = () => ({
    character,
    settingTitle: (settingId && getSetting(settingId)?.title) || "Tafelrunde",
    endingLabel: label,
    turns: turns.map((t): ExportTurn =>
      t.kind === "master"
        ? { kind: "master", lines: t.lines, sceneTag: t.sceneTag }
        : { kind: "player", text: t.text },
    ),
  });
  async function handleDownload(kind: "docx" | "pdf") {
    if (downloading) return;
    setDownloading(kind);
    try {
      if (kind === "docx") await exportAdventureAsDocx(exportPayload());
      else await exportAdventureAsPdf(exportPayload());
    } catch (e) {
      console.error("dsa export failed", e);
      alert("Download fehlgeschlagen.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="dsa-adventure-header shrink-0 border-t border-[#3a2c1a]/30 px-4 py-4 text-[#2a1f10]">
      <p className="font-serif text-base mb-3">{label}</p>
      {ap && ap.value > 0 && (
        <div className="mb-3 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 text-sm">
          <div className="font-bold uppercase tracking-wider text-[11px] text-[#2a1f10]/70">
            Abenteuerpunkte
          </div>
          <div className="font-serif text-lg leading-tight">
            +{ap.value} AP{" "}
            <span className="text-xs opacity-70">für {character.name}</span>
          </div>
          {ap.reason && (
            <div className="font-serif text-[13px] italic mt-1 opacity-80">
              „{ap.reason}"
            </div>
          )}
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider opacity-70 mr-1">
          Abenteuer mitnehmen:
        </span>
        <button
          type="button"
          onClick={() => void handleDownload("docx")}
          disabled={!!downloading}
          title="Word/OpenOffice/LibreOffice (.docx)"
          className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a] disabled:opacity-50"
        >
          {downloading === "docx" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <FileDown className="h-3 w-3" strokeWidth={2.5} />
          )}
          Word / OpenOffice
        </button>
        <button
          type="button"
          onClick={() => void handleDownload("pdf")}
          disabled={!!downloading}
          title="PDF"
          className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a] disabled:opacity-50"
        >
          {downloading === "pdf" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <FileDown className="h-3 w-3" strokeWidth={2.5} />
          )}
          PDF
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#3a2c1a] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] hover:bg-[#2a1f10]"
        >
          <Dices className="h-3.5 w-3.5" strokeWidth={2.5} />
          {newLabel}
        </button>
        <button
          type="button"
          onClick={onStandUp}
          className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
          Vom Tisch aufstehen
        </button>
      </div>
    </div>
  );
}
