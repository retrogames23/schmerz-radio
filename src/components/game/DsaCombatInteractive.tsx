import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Pause, Play, Send } from "lucide-react";
import { CloseButton } from "./CloseButton";
import {
  createCombatState,
  resolveRound,
  TACTIC_LABELS,
  type Combatant,
  type CombatEvent,
  type CombatState,
  type ConsequenceKind,
  type PlayerStats,
  type Tactic,
  type SpellFocus,
} from "@/game/dsa/combat";
import { SPELLS } from "@/game/dsa/rules/spells";
import { mergeCombatIntents, parseCombatIntent, type CombatIntent } from "@/game/dsa/combatIntent";
import { CombatantCard } from "./dsa/CombatantCard";
import { ActionIndicator } from "./dsa/ActionIndicator";
import { DieBox } from "./dsa/DieBox";
import { CombatLogLine } from "./dsa/CombatLogLine";

/**
 * Interaktives Kampf-Overlay für die LLM-Tafelrunde.
 * - Spieler wählt zu Beginn eine Taktik.
 * - Kampf läuft danach automatisch ab (normal/schnell).
 * - Pause-Button hält an und erlaubt Taktikwechsel.
 */

const STEP_MS = 1100;
const STEP_FAST_MS = 60;

export interface CombatDoneResult {
  outcome: "victory" | "aborted" | "defeat_consequence";
  consequenceKind: ConsequenceKind | null;
  heroLe: number;
  heroLeMax: number;
  heroWounds: number;
  fallen: string[];
  /** Bei kind=wound vom Client gewähltes Attribut, das −1 bekommt. */
  attrLowered: "MU" | "KL" | "CH" | "FF" | "GE" | "IN" | "KK" | null;
}

export function DsaCombatInteractive({
  heroes,
  foes,
  player,
  intent,
  onDone,
}: {
  heroes: Combatant[];
  foes: Combatant[];
  player: PlayerStats;
  intent?: CombatIntent | null;
  onDone: (r: CombatDoneResult) => void;
}) {
  // Persistenter State des Kampfes (mutiert von resolveRound).
  const stateRef = useRef<CombatState>(
    createCombatState(
      heroes.map((h) => ({ ...h })),
      foes.map((f) => ({ ...f })),
      intent ?? null,
    ),
  );
  const [tactic, setTactic] = useState<Tactic>("balanced");
  const [spellFocus, setSpellFocus] = useState<SpellFocus>("offense");
  const [hasStarted, setHasStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [events, setEvents] = useState<CombatEvent[]>([]);
  const [commandText, setCommandText] = useState("");
  const [commandError, setCommandError] = useState<string | null>(null);
  const [commandNotes, setCommandNotes] = useState<string[]>(() => intent?.notes ?? []);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<CombatState["phase"]>("ongoing");
  const [hitFlash, setHitFlash] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const tacticRef = useRef(tactic);
  tacticRef.current = tactic;
  const spellFocusRef = useRef(spellFocus);
  spellFocusRef.current = spellFocus;

  const current = events[Math.min(step, events.length - 1)];
  const queueExhausted = step >= events.length - 1;

  // Wenn die aktuelle Event-Schlange abgearbeitet ist UND der Kampf noch
  // läuft UND nicht pausiert → nächste Runde auflösen und Events anhängen.
  useEffect(() => {
    if (!hasStarted) return;
    if (paused) return;
    if (phase !== "ongoing") return;
    if (!queueExhausted) return;
    const newEvents = resolveRound(stateRef.current, tacticRef.current, player, {
      spellFocus: spellFocusRef.current,
      intent: intent ?? null,
    });
    if (newEvents.length === 0) return;
    setEvents((prev) => [...prev, ...newEvents]);
    setPhase(stateRef.current.phase);
    // Step wandert automatisch durch das useEffect unten weiter.
  }, [hasStarted, paused, phase, queueExhausted, step, player]);

  // Auto-Advance Step.
  useEffect(() => {
    if (!hasStarted) return;
    if (paused) return;
    if (step >= events.length - 1) return;
    const ms = fast ? STEP_FAST_MS : STEP_MS;
    timer.current = setTimeout(() => setStep((s) => s + 1), ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, fast, events.length, paused, hasStarted]);

  useEffect(() => {
    if (!current) return;
    if (current.kind === "damage" || current.kind === "downed") {
      setHitFlash(current.targetId ?? null);
      const t = setTimeout(() => setHitFlash(null), 380);
      return () => clearTimeout(t);
    }
  }, [current]);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [step]);

  const leMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (let i = 0; i <= step && i < events.length; i++) {
      for (const s of events[i].snapshot) m[s.id] = s.le;
    }
    return m;
  }, [step, events]);

  const woundMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const h of stateRef.current.heroes) m[h.id] = h.wounds;
    return m;
    // recompute when step changes (Wunden ändern sich nur an downed-Events)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const attackerId =
    current &&
    (current.kind === "attack-hit" ||
      current.kind === "attack-miss" ||
      current.kind === "damage")
      ? current.actorId ?? null
      : null;
  const defenderId =
    current &&
    (current.kind === "parry-success" ||
      current.kind === "damage" ||
      current.kind === "downed")
      ? current.targetId ?? null
      : null;

  const heroIdsSet = useMemo(
    () => new Set(stateRef.current.heroes.map((h) => h.id)),
    [],
  );
  const heroSide = attackerId !== null && heroIdsSet.has(attackerId);

  const handleStart = useCallback(() => {
    setHasStarted(true);
  }, []);

  const handleDone = useCallback(() => {
    const st = stateRef.current;
    const hero = st.heroes.find((h) => h.id === "hero");
    const heroLe = hero ? Math.max(0, hero.le) : 0;
    const heroLeMax = hero ? hero.leMax : 1;
    const heroWounds = hero ? hero.wounds : 0;
    const outcome: CombatDoneResult["outcome"] =
      st.phase === "victory"
        ? "victory"
        : st.phase === "aborted"
          ? "aborted"
          : "defeat_consequence";
    let attrLowered: CombatDoneResult["attrLowered"] = null;
    if (outcome === "defeat_consequence" && st.consequenceKind === "wound") {
      const pool: CombatDoneResult["attrLowered"][] = ["KK", "GE", "IN", "MU", "KL", "CH", "FF"];
      attrLowered = pool[Math.floor(Math.random() * pool.length)];
    }
    onDone({
      outcome,
      consequenceKind: st.consequenceKind,
      heroLe: outcome === "victory" ? Math.max(1, heroLe) : heroLe,
      heroLeMax,
      heroWounds,
      fallen: st.fallenHeroes.map((f) => f.name),
      attrLowered,
    });
  }, [onDone]);

  const toggleFast = useCallback(() => setFast((f) => !f), []);
  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const handleCommandSubmit = useCallback(() => {
    const raw = commandText.trim();
    if (!raw || phase !== "ongoing") return;
    const layard = stateRef.current.heroes.find((h) => h.id === "hero") ?? null;
    const parsed = parseCombatIntent(raw, layard?.spells ?? null);
    const tacticCommand = detectTacticCommand(raw, layard);
    if (tacticCommand) setTactic(tacticCommand);
    const notes = [
      ...(parsed.notes.length > 0 ? parsed.notes : []),
      ...(tacticCommand ? [`Taktik: ${TACTIC_LABELS[tacticCommand].title}`] : []),
    ];
    if (notes.length === 0) {
      setCommandError("Tjark versteht den Kampfbefehl nicht.");
      return;
    }
    stateRef.current.roundIntent = mergeCombatIntents(
      stateRef.current.roundIntent ?? null,
      parsed,
    );
    setCommandNotes((prev) => [...prev, ...notes]);
    setCommandText("");
    setCommandError(null);
  }, [commandText, phase]);

  const visibleEvents = useMemo(() => events.slice(0, step + 1), [events, step]);

  const headerLabel =
    phase === "victory"
      ? "Sieg"
      : phase === "aborted"
        ? "Kampf abgebrochen"
        : phase === "defeat"
          ? "Niederlage"
          : !hasStarted
            ? "Klingen werden gezogen"
            : "Kampf läuft";

  const isTerminal = phase !== "ongoing" && step >= events.length - 1;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-start sm:items-center justify-center overflow-y-auto bg-black/90 p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Kampf"
    >
      <div className="dsa-adventure-shell relative my-auto w-full max-w-4xl rounded-md shadow-2xl flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-3rem)]">
        {isTerminal && <CloseButton onClick={handleDone} />}

        <div className="dsa-adventure-header shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Kampf · DSA 3 · Tjark würfelt
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl sm:text-3xl dsa-ink font-extrabold">
              {headerLabel}
            </h2>
            <span className="dsa-typed text-sm dsa-ink font-bold">
              {stateRef.current.round > 0 ? `Runde ${stateRef.current.round}` : "Initiative"}
            </span>
          </div>
        </div>

        <div className="dsa-adventure-body min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
            <div className="space-y-2">
              <SideLabel label="Eure Seite" align="left" />
              {stateRef.current.heroes.map((h) => (
                <CombatantCard
                  key={h.id}
                  c={h}
                  le={leMap[h.id] ?? h.le}
                  wounds={woundMap[h.id] ?? 0}
                  isHit={hitFlash === h.id}
                  isAttacking={attackerId === h.id}
                  isDefending={defenderId === h.id}
                  facing="right"
                  compact={stateRef.current.heroes.length > 1}
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center pt-8 min-w-[3rem]">
              <ActionIndicator kind={current?.kind} heroSide={heroSide} />
            </div>

            <div className="space-y-2">
              <SideLabel label="Gegner" align="right" />
              {stateRef.current.foes.map((f) => (
                <CombatantCard
                  key={f.id}
                  c={f}
                  le={leMap[f.id] ?? f.le}
                  isHit={hitFlash === f.id}
                  isAttacking={attackerId === f.id}
                  isDefending={defenderId === f.id}
                  facing="left"
                  compact={stateRef.current.foes.length > 1}
                />
              ))}
            </div>
          </div>

          {(!hasStarted || paused) && phase === "ongoing" && (
            <>
            {intent && intent.notes.length > 0 && (
              <div className="dsa-typed text-xs dsa-ink-faded border-l-2 border-[rgba(20,12,4,0.5)] pl-2 mb-2">
                <div className="uppercase tracking-[0.25em] font-bold mb-1 dsa-ink">
                  Erkannte Befehle
                </div>
                <ul className="space-y-0.5">
                  {intent.notes.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              </div>
            )}
            <TacticPicker
              tactic={tactic}
              onChange={setTactic}
              spellFocus={spellFocus}
              onFocusChange={setSpellFocus}
              onConfirm={() => {
                if (!hasStarted) handleStart();
                else setPaused(false);
              }}
              confirmLabel={!hasStarted ? "Kampf beginnen" : "Weiterkämpfen"}
              layard={stateRef.current.heroes.find((h) => h.id === "hero") ?? null}
            />
            </>
          )}

          {hasStarted && (
            <>
              <section>
                <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.7)] pb-1">
                  Aktueller Wurf
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[3.5rem]">
                  {(current?.dice ?? []).length === 0 && (
                    <span className="dsa-typed text-sm dsa-ink-faded italic">…</span>
                  )}
                  {(current?.dice ?? []).map((d, i) => (
                    <DieBox key={i} d={d} />
                  ))}
                </div>
                <p className="dsa-typed text-sm sm:text-base dsa-ink leading-snug font-semibold">
                  {current?.text}
                </p>
              </section>

              <section>
                <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.7)] pb-1">
                  Kampfprotokoll · Taktik: {TACTIC_LABELS[tactic].title}
                </div>
                <div
                  ref={logRef}
                  className="dsa-combat-log max-h-[22vh] overflow-y-auto pr-1 space-y-0.5"
                >
                  {visibleEvents.map((e, i) => (
                    <CombatLogLine key={i} event={e} active={i === step} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="dsa-adventure-footer shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            {hasStarted && phase === "ongoing" && (
              <button
                onClick={togglePause}
                className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
              >
                {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {paused ? "Weiter" : "Pause · Taktik ändern"}
              </button>
            )}
            {hasStarted && (
              <button
                onClick={toggleFast}
                className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
              >
                {fast ? "Normaltempo" : "Schneller ⏩"}
              </button>
            )}
          </div>
          <button
            onClick={handleDone}
            disabled={!isTerminal}
            className={
              "inline-flex items-center gap-2 rounded border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all " +
              (isTerminal
                ? phase === "victory"
                  ? "border-[#2d5a1e] bg-[#2d5a1e] text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px"
                  : phase === "aborted"
                    ? "border-[#3a2c1a] bg-[#3a2c1a] text-[#f1e6c8] hover:-translate-y-px"
                    : "border-[#6b1a0e] bg-[#6b1a0e] text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px"
                : "border-[#3a2c1a]/50 bg-[#fbf2d8]/50 text-[#2a1f10]/50 cursor-not-allowed")
            }
          >
            <span>
              {isTerminal
                ? phase === "victory"
                  ? "Sieg — weiter"
                  : phase === "aborted"
                    ? "Davongekommen — weiter"
                    : "Konsequenz — weiter"
                : hasStarted
                  ? "…würfelt…"
                  : "Warte auf Taktik"}
            </span>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SideLabel({ label, align }: { label: string; align: "left" | "right" }) {
  return (
    <div
      className={
        "dsa-typed text-[10px] uppercase tracking-[0.3em] dsa-ink font-bold pb-1 border-b border-[rgba(20,12,4,0.55)] " +
        (align === "right" ? "text-right" : "text-left")
      }
    >
      {label}
    </div>
  );
}

function TacticPicker({
  tactic,
  onChange,
  spellFocus,
  onFocusChange,
  onConfirm,
  confirmLabel,
  layard,
}: {
  tactic: Tactic;
  onChange: (t: Tactic) => void;
  spellFocus: SpellFocus;
  onFocusChange: (f: SpellFocus) => void;
  onConfirm: () => void;
  confirmLabel: string;
  layard: Combatant | null;
}) {
  const combatSpellIds = new Set(["ignifaxius", "blitz_dich_find", "fulminictus"]);
  const spells = layard?.spells ?? {};
  const knowsCombatSpell = Object.keys(spells).some((id) =>
    combatSpellIds.has(id),
  );
  const knowsBalsam = typeof spells["balsam_salabunde"] === "number";
  const hasAsp = (layard?.ae ?? 0) > 0;
  // Magier-Modus: Spieler wählt Magie-Intensität statt klassischer Taktik.
  const mageMode = knowsCombatSpell;
  const tactics: Tactic[] = mageMode
    ? ["magic-none", "magic-low", "magic-mid", "magic-high", "flee"]
    : ["balanced", "aggressive", "defensive", "cunning", "flee"];
  // Default auf sinnvolle Magier-Taktik umstellen, wenn nötig.
  useEffect(() => {
    if (mageMode && !tactics.includes(tactic)) onChange("magic-mid");
    if (!mageMode && (tactic === "spell" || tactic.startsWith("magic-")))
      onChange("balanced");
    // Wenn AsP leer → "magic-none" reicht; alle anderen Magie-Tasten bleiben
    // wählbar, wirken aber im Resolver einfach nicht.
    if (mageMode && !hasAsp && tactic !== "magic-none" && tactic !== "flee")
      onChange("magic-none");
  }, [mageMode, hasAsp, tactic, onChange, tactics]);
  return (
    <section className="dsa-box-thick p-3 sm:p-4">
      <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.7)] pb-1">
        {mageMode ? "Layards Magie-Einsatz" : "Layards Taktik"}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {tactics.map((t) => {
          const meta = TACTIC_LABELS[t];
          const active = tactic === t;
          const subline = (() => {
            if (!layard) return null;
            if (t.startsWith("magic-")) {
              const known = SPELLS.filter(
                (s) =>
                  (combatSpellIds.has(s.id) || s.id === "balsam_salabunde") &&
                  typeof spells[s.id] === "number",
              );
              if (known.length === 0) return null;
              return `Bekannt: ${known.map((s) => `${s.name} (ZfW ${spells[s.id]})`).join(" · ")} · AsP ${layard.ae}/${layard.aeMax ?? layard.ae}`;
            }
            if (t === "spell") {
              const known = SPELLS.filter(
                (s) => combatSpellIds.has(s.id) && typeof spells[s.id] === "number",
              );
              if (known.length === 0) return null;
              return `Bekannt: ${known.map((s) => `${s.name} (ZfW ${spells[s.id]})`).join(" · ")} · AsP ${layard.ae}/${layard.aeMax ?? layard.ae}`;
            }
            return null;
          })();
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              className={
                "text-left rounded border-2 px-3 py-2 transition-all " +
                (active
                  ? "border-[#3a2c1a] bg-[#3a2c1a] text-[#f1e6c8]"
                  : "border-[#3a2c1a] bg-[#fbf2d8] text-[#2a1f10] hover:bg-[#f1d99a]")
              }
            >
              <div
                className="dsa-typed font-extrabold text-sm"
                style={active ? { color: "#f1e6c8" } : undefined}
              >
                {meta.title}
              </div>
              <div
                className="dsa-typed text-[11px] leading-snug opacity-90 mt-0.5"
                style={active ? { color: "#f1e6c8" } : undefined}
              >
                {meta.blurb}
              </div>
              {subline && (
                <div
                  className="dsa-typed text-[10px] leading-snug opacity-80 mt-1 italic"
                  style={active ? { color: "#f1e6c8" } : undefined}
                >
                  {subline}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {mageMode && knowsBalsam && tactic !== "magic-none" && tactic !== "flee" && (
        <div className="mb-3">
          <div className="dsa-typed text-[10px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b border-[rgba(20,12,4,0.55)] pb-1">
            Magie-Schwerpunkt
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(
              [
                { id: "offense", title: "Angriffszauber", blurb: "Nur Ignifaxius & Co. — kein Balsam." },
                { id: "balanced", title: "Ausgeglichen", blurb: "Balsam erst, wenn Layard unter halber LE ist." },
                { id: "healing", title: "Heilzauber", blurb: "Bevorzugt Balsam Salabunde, wenn Wunden vorhanden." },
              ] as { id: SpellFocus; title: string; blurb: string }[]
            ).map((opt) => {
              const active = spellFocus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFocusChange(opt.id)}
                  className={
                    "text-left rounded border-2 px-3 py-2 transition-all " +
                    (active
                      ? "border-[#3a2c1a] bg-[#3a2c1a] text-[#f1e6c8]"
                      : "border-[#3a2c1a] bg-[#fbf2d8] text-[#2a1f10] hover:bg-[#f1d99a]")
                  }
                >
                  <div
                    className="dsa-typed font-extrabold text-sm"
                    style={active ? { color: "#f1e6c8" } : undefined}
                  >
                    {opt.title}
                  </div>
                  <div
                    className="dsa-typed text-[11px] leading-snug opacity-90 mt-0.5"
                    style={active ? { color: "#f1e6c8" } : undefined}
                  >
                    {opt.blurb}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onConfirm}
        className="w-full inline-flex items-center justify-center gap-2 rounded border-2 border-[#2d5a1e] bg-[#2d5a1e] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px"
      >
        {confirmLabel}
      </button>
    </section>
  );
}