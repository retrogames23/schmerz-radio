import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { CloseButton } from "./CloseButton";
import type {
  Combatant,
  CombatEvent,
  CombatResult,
} from "@/game/dsa/combat";
import { CombatantCard } from "./dsa/CombatantCard";
import { ActionIndicator } from "./dsa/ActionIndicator";
import { DieBox } from "./dsa/DieBox";
import { CombatLogLine } from "./dsa/CombatLogLine";

/**
 * Vollbild-Overlay für DSA-Kämpfe — gleicher Pergament-/Tafel-Stil wie der
 * Charakterbogen. Subkomponenten (Karten, Würfel, Log-Zeilen) sind in
 * `./dsa/*` ausgelagert und memoisiert.
 */

const STEP_MS = 1100;
const STEP_FAST_MS = 50;

export function DsaCombatOverlay({
  heroes,
  foes,
  result,
  onDone,
}: {
  heroes: Combatant[];
  foes: Combatant[];
  result: CombatResult;
  onDone: (victory: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [fast, setFast] = useState(false);
  const [hitFlash, setHitFlash] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const events = result.events;
  const current = events[Math.min(step, events.length - 1)];
  const isLast = step >= events.length - 1;

  const roundNumber = useMemo(() => {
    let r = 0;
    for (let i = 0; i <= step && i < events.length; i++) {
      const m = events[i].text.match(/Runde (\d+)/);
      if (m) r = parseInt(m[1], 10);
    }
    return r;
  }, [step, events]);

  useEffect(() => {
    if (isLast) return;
    const ms = fast ? STEP_FAST_MS : STEP_MS;
    timer.current = setTimeout(() => setStep((s) => s + 1), ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, fast, isLast]);

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

  const heroIds = useMemo(() => new Set(heroes.map((h) => h.id)), [heroes]);
  const heroSide = attackerId !== null && heroIds.has(attackerId);

  const handleDone = useCallback(
    () => onDone(result.victory),
    [onDone, result.victory],
  );
  const toggleFast = useCallback(() => setFast((f) => !f), []);

  const visibleEvents = useMemo(() => events.slice(0, step + 1), [events, step]);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-start sm:items-center justify-center overflow-y-auto bg-black/90 p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Kampf"
    >
      <div className="dsa-adventure-shell relative my-auto w-full max-w-4xl rounded-md shadow-2xl flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)]">
        {isLast && <CloseButton onClick={handleDone} />}

        <div className="dsa-adventure-header shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Kampf · DSA 3 · Tjark würfelt
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl sm:text-3xl dsa-ink font-extrabold">
              {result.victory && isLast
                ? "Sieg"
                : !result.victory && isLast
                ? "Niederlage"
                : "Klingen sind gezogen"}
            </h2>
            <span className="dsa-typed text-sm dsa-ink font-bold">
              {roundNumber > 0 ? `Runde ${roundNumber}` : "Initiative"}
            </span>
          </div>
        </div>

        <div className="dsa-adventure-body min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
            <div className="space-y-2">
              <SideLabel label="Eure Seite" align="left" />
              {heroes.map((h) => (
                <CombatantCard
                  key={h.id}
                  c={h}
                  le={leMap[h.id] ?? h.le}
                  isHit={hitFlash === h.id}
                  isAttacking={attackerId === h.id}
                  isDefending={defenderId === h.id}
                  facing="right"
                  compact={heroes.length > 1}
                />
              ))}
            </div>

            <div className="flex flex-col items-center justify-center pt-8 min-w-[3rem]">
              <ActionIndicator kind={current?.kind} heroSide={heroSide} />
            </div>

            <div className="space-y-2">
              <SideLabel label="Gegner" align="right" />
              {foes.map((f) => (
                <CombatantCard
                  key={f.id}
                  c={f}
                  le={leMap[f.id] ?? f.le}
                  isHit={hitFlash === f.id}
                  isAttacking={attackerId === f.id}
                  isDefending={defenderId === f.id}
                  facing="left"
                  compact={foes.length > 1}
                />
              ))}
            </div>
          </div>

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
              Kampfprotokoll
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
        </div>

        <div className="dsa-adventure-footer shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-3">
          <button
            onClick={toggleFast}
            className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
          >
            {fast ? "Normaltempo" : "Schneller ⏩"}
          </button>
          <button
            onClick={handleDone}
            disabled={!isLast}
            className={
              "inline-flex items-center gap-2 rounded border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all " +
              (isLast
                ? result.victory
                  ? "border-[#2d5a1e] bg-[#2d5a1e] text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px"
                  : "border-[#6b1a0e] bg-[#6b1a0e] text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] hover:-translate-y-px"
                : "border-[#3a2c1a]/50 bg-[#fbf2d8]/50 text-[#2a1f10]/50 cursor-not-allowed")
            }
          >
            <span>
              {isLast
                ? result.victory
                  ? "Sieg — weiter"
                  : "Niederlage — weiter"
                : "…würfelt…"}
            </span>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SideLabel({
  label,
  align,
}: {
  label: string;
  align: "left" | "right";
}) {
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
