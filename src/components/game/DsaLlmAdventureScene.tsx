import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollText, Loader2, Send, LogOut, Dices } from "lucide-react";
import { useGame } from "@/game/GameContext";
import { useMusic } from "@/audio/MusicPlayer";
import { CloseButton } from "./CloseButton";
import { DsaCombatInteractive, type CombatDoneResult } from "./DsaCombatInteractive";
import {
  DSA_SETTINGS,
  parseMasterTurn,
  type ParsedMasterTurn,
  type SpokenLine,
  type DsaSettingId,
  type AdventureStatus,
} from "@/game/dsa/llmAdventure";
import {
  resolveSceneImage,
} from "@/game/dsa/sceneImages";
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
    closeDsaAdventure,
    toggleDsaSheet,
    dsaSheetOpen,
    api,
  } = useGame();
  const { setMoodPool, setMood } = useMusic();

  const [mode, setMode] = useState<Mode>({ kind: "loading" });
  const [imageTag, setImageTag] = useState<string>("forest_path");
  const [turns, setTurns] = useState<
    Array<{ id: number; kind: "master"; lines: SpokenLine[] } | { id: number; kind: "player"; text: string }>
  >([]);
  const [composerText, setComposerText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combat, setCombat] = useState<CombatBridge | null>(null);
  const [endState, setEndState] = useState<AdventureStatus | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  const turnIdRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dsaCharacterRef = useRef(dsaCharacter);
  dsaCharacterRef.current = dsaCharacter;

  const nextId = useCallback(() => {
    turnIdRef.current += 1;
    return turnIdRef.current;
  }, []);

  const appendMaster = useCallback(
    (parsed: ParsedMasterTurn) => {
      if (parsed.lines.length === 0) return;
      setTurns((t) => [...t, { id: nextId(), kind: "master", lines: parsed.lines }]);
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
    setEndState(null);
    (async () => {
      try {
        const r = await authedPost({ action: "load" }, api.getDsaSessionId());
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
        // Verlauf rekonstruieren — nur user/assistant, keine System-Cues.
        const restored: typeof turns = [];
        for (const m of adv.messages) {
          if (m.role === "assistant") {
            const parsed = parseMasterTurn(m.content);
            if (parsed.lines.length > 0) {
              turnIdRef.current += 1;
              restored.push({ id: turnIdRef.current, kind: "master", lines: parsed.lines });
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
      appendMaster(data.parsed);
      if (data.imageTag) setImageTag(data.imageTag);
      if (data.parsed.mood) setMood(data.parsed.mood);
      if (data.parsed.combat && dsaCharacterRef.current) {
        // Kampfbildschirm bauen.
        const hero = heroCombatantFromCharacter(dsaCharacterRef.current);
        const companions = companionCombatants();
        const foes = data.parsed.combat.enemyIds
          .map((id, i) => {
            const stat = ENEMY_STATS[id];
            return stat ? foeCombatantFromStat(stat, i) : null;
          })
          .filter((f): f is Combatant => !!f);
        if (foes.length > 0) {
          const heroes = [hero, ...companions];
          setCombat({ heroes, foes });
          return;
        }
      }
      if (data.status !== "active") {
        setEndState(data.status);
      }
    },
    [appendMaster, setMood],
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
        api.getDsaSessionId(),
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Fehler." }));
        setError(j.error || "Fehler beim Start.");
        setMode({ kind: "picker" });
        return;
      }
      const data = (await r.json()) as ServerReply;
      setTurns([]);
      setMode({ kind: "play" });
      handleServerReply(data);
    } catch (e) {
      console.error("dsa-llm start failed", e);
      setError(e instanceof Error ? e.message : "Verbindung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    const text = composerText.trim();
    if (!text || busy || endState) return;
    setComposerText("");
    setBusy(true);
    setError(null);
    const myId = nextId();
    setTurns((t) => [...t, { id: myId, kind: "player", text }]);
    try {
      const r = await authedPost({ action: "say", text }, api.getDsaSessionId());
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
  }

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
        api.getDsaSessionId(),
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
      await authedPost({ action: "abort" }, api.getDsaSessionId());
    } catch {
      /* ignore */
    }
    setTurns([]);
    setEndState(null);
    setImageTag("forest_path");
    setBusy(false);
    // Bei Niederlage: neuen Charakter rollen.
    if (endState === "defeat") {
      api.clearDsaCharacter();
      closeDsaAdventure();
      api.openDsaCreator();
      return;
    }
    setMode({ kind: "picker" });
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
      <div className="dsa-adventure-shell relative my-auto w-full max-w-5xl overflow-hidden rounded-md shadow-2xl flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)]">
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
                onNew={handleAbortAndPickNew}
                onStandUp={handleStandUp}
              />
            ) : (
              <div className="dsa-adventure-header shrink-0 border-t border-[#3a2c1a]/30 px-3 sm:px-4 py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value.slice(0, 500))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder={`Was tut ${dsaCharacter.name}? (Enter = senden)`}
                    rows={2}
                    disabled={busy}
                    className="flex-1 resize-none rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-2 font-sans text-base leading-relaxed text-[#2a1f10] placeholder:text-[#2a1f10]/40 focus:outline-none focus:ring-2 focus:ring-[#3a2c1a]/40 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={busy || !composerText.trim()}
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
            className="absolute top-3 right-3 z-10"
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
            {l.speaker === "TJARK" ? "Tjark" : l.speaker === "BREM" ? "Brem" : "Yelva"}
          </span>
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
          Also gut. Brem schiebt die Würfel hin und her, Yelva poliert ihre
          Brille. Worauf hast du heute Lust?
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
  onNew,
  onStandUp,
}: {
  status: AdventureStatus;
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
  return (
    <div className="dsa-adventure-header shrink-0 border-t border-[#3a2c1a]/30 px-4 py-4 text-[#2a1f10]">
      <p className="font-serif text-base mb-3">{label}</p>
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
