import { useEffect, useMemo, useRef, useState } from "react";
import { Swords, Shield, Skull, ChevronRight } from "lucide-react";
import { CloseButton } from "./CloseButton";
import type {
  Combatant,
  CombatEvent,
  CombatResult,
} from "@/game/dsa/combat";

/**
 * Vollbild-Overlay für DSA-Kämpfe — gleicher Pergament-/Tafel-Stil wie der
 * Charakterbogen. Zeigt Helden- und Gegnerkarten nebeneinander, die
 * aktuell gewürfelten W20/W6 mittig, und das Kampfprotokoll unten.
 *
 * Spielt CombatEvents zeitversetzt ab — Nutzer kann „Schneller" wählen
 * oder am Ende über „Weiter" zurück in die Outcome-Phase.
 */

const STEP_MS = 1100;
const STEP_FAST_MS = 240;

export function DsaCombatOverlay({
  hero,
  foes,
  result,
  onDone,
}: {
  hero: Combatant;
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

  // Aktuelle Runde aus den Events ableiten.
  const roundNumber = useMemo(() => {
    let r = 0;
    for (let i = 0; i <= step && i < events.length; i++) {
      const m = events[i].text.match(/Runde (\d+)/);
      if (m) r = parseInt(m[1], 10);
    }
    return r;
  }, [step, events]);

  // Auto-Advance.
  useEffect(() => {
    if (isLast) return;
    const ms = fast ? STEP_FAST_MS : STEP_MS;
    timer.current = setTimeout(() => setStep((s) => s + 1), ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, fast, isLast]);

  // Hit-Flash.
  useEffect(() => {
    if (!current) return;
    if (current.kind === "damage" || current.kind === "downed") {
      setHitFlash(current.targetId ?? null);
      const t = setTimeout(() => setHitFlash(null), 380);
      return () => clearTimeout(t);
    }
  }, [current]);

  // Auto-Scroll Log.
  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [step]);

  // Aktuelle LE-Werte aus Snapshots.
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

  const heroSide = attackerId === hero.id;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-start sm:items-center justify-center overflow-y-auto bg-black/90 p-2 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Kampf"
    >
      <div className="dsa-adventure-shell relative my-auto w-full max-w-4xl rounded-md shadow-2xl flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)]">
        {/* Schließen nur am Ende erlaubt — sonst verlässt man laufenden Kampf. */}
        {isLast && <CloseButton onClick={() => onDone(result.victory)} />}

        {/* Header */}
        <div className="dsa-adventure-header shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Kampf · DSA 2 · Tjark würfelt
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

        {/* Body */}
        <div className="dsa-adventure-body min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Tafel: Held links · Mitte · Gegner rechts */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-start">
            {/* Helden-Spalte */}
            <div className="space-y-2">
              <SideLabel label="Eure Seite" align="left" />
              <CombatantCard
                c={hero}
                le={leMap[hero.id] ?? hero.le}
                isHit={hitFlash === hero.id}
                isAttacking={attackerId === hero.id}
                isDefending={defenderId === hero.id}
                facing="right"
              />
            </div>

            {/* Mitte: Aktion-Indikator */}
            <div className="flex flex-col items-center justify-center pt-8 min-w-[3rem]">
              <ActionIndicator
                kind={current?.kind}
                heroSide={heroSide}
              />
            </div>

            {/* Gegner-Spalte */}
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

          {/* Würfel + Beschreibung */}
          <section>
            <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.7)] pb-1">
              Aktueller Wurf
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2 min-h-[3.5rem]">
              {(current?.dice ?? []).length === 0 && (
                <span className="dsa-typed text-sm dsa-ink-faded italic">
                  …
                </span>
              )}
              {(current?.dice ?? []).map((d, i) => (
                <DieBox key={i} d={d} />
              ))}
            </div>
            <p className="dsa-typed text-sm sm:text-base dsa-ink leading-snug font-semibold">
              {current?.text}
            </p>
          </section>

          {/* Log */}
          <section>
            <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.7)] pb-1">
              Kampfprotokoll
            </div>
            <div
              ref={logRef}
              className="dsa-combat-log max-h-[22vh] overflow-y-auto pr-1 space-y-0.5"
            >
              {events.slice(0, step + 1).map((e, i) => (
                <LogLine key={i} event={e} active={i === step} />
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="dsa-adventure-footer shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-3">
          <button
            onClick={() => setFast((f) => !f)}
            className="inline-flex items-center gap-1.5 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
          >
            {fast ? "Normaltempo" : "Schneller ⏩"}
          </button>
          <button
            onClick={() => onDone(result.victory)}
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

function CombatantCard({
  c,
  le,
  isHit,
  isAttacking,
  isDefending,
  facing,
  compact,
}: {
  c: Combatant;
  le: number;
  isHit: boolean;
  isAttacking: boolean;
  isDefending: boolean;
  facing: "left" | "right";
  compact?: boolean;
}) {
  const dead = le <= 0;
  const pct = Math.max(0, Math.min(100, (le / c.leMax) * 100));
  const isHero = c.side === "hero";

  const motion = dead
    ? ""
    : isAttacking
    ? facing === "right"
      ? "translate-x-1.5 -rotate-1"
      : "-translate-x-1.5 rotate-1"
    : isDefending
    ? facing === "right"
      ? "-translate-x-0.5"
      : "translate-x-0.5"
    : "";

  const flash = isHit ? "dsa-card-hit" : "";

  return (
    <div
      className={
        "dsa-combat-card relative transition-transform duration-200 ease-out " +
        motion +
        " " +
        flash +
        (dead ? " opacity-50 grayscale" : "")
      }
    >
      {/* Status-Symbol */}
      <div
        className={
          "absolute -top-2 " +
          (facing === "right" ? "-left-2" : "-right-2") +
          " w-7 h-7 rounded-full grid place-items-center border-2 " +
          (isHero
            ? "bg-[#1f3d1a] border-[#5a8a4d] text-[#d8e8c4]"
            : "bg-[#3d1a1a] border-[#8a4d4d] text-[#e8c4c4]")
        }
        aria-hidden
      >
        {dead ? (
          <Skull className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : isHero ? (
          <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Swords className="h-3.5 w-3.5" strokeWidth={2.5} />
        )}
      </div>

      <div
        className={
          "dsa-box-thick px-3 py-2 " +
          (compact ? "min-h-[5rem]" : "min-h-[6rem]")
        }
      >
        {/* Name */}
        <div className="dsa-typed text-[12px] sm:text-[13px] dsa-ink font-extrabold leading-tight pr-2">
          {c.name}
        </div>

        {/* Waffe */}
        <div className="dsa-typed text-[10px] dsa-ink-faded font-semibold leading-tight truncate mb-1.5">
          {c.weapon}
        </div>

        {/* LE */}
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="dsa-typed text-[9px] uppercase tracking-widest dsa-ink-faded font-bold">
            Lebensenergie
          </span>
          <span className="font-display dsa-ink font-extrabold tabular-nums text-base leading-none">
            {Math.max(0, le)}
            <span className="text-[10px] dsa-ink-faded">/{c.leMax}</span>
          </span>
        </div>

        {/* LE-Balken */}
        <div className="h-2 w-full rounded-sm bg-[rgba(20,12,4,0.18)] overflow-hidden border border-[rgba(20,12,4,0.45)]">
          <div
            className={
              "h-full transition-all duration-500 " +
              (isHero
                ? pct > 50
                  ? "bg-[#3a6f2a]"
                  : pct > 25
                  ? "bg-[#a07020]"
                  : "bg-[#8a2010]"
                : pct > 50
                ? "bg-[#6b1a0e]"
                : pct > 25
                ? "bg-[#5a1a18]"
                : "bg-[#3a1208]")
            }
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Stats */}
        {!compact && (
          <div className="dsa-typed text-[10px] dsa-ink font-bold mt-1.5 flex items-center gap-2 flex-wrap">
            <span>AT {c.at}</span>
            <span className="dsa-ink-faded">·</span>
            <span>PA {c.pa}</span>
            <span className="dsa-ink-faded">·</span>
            <span>RS {c.rs}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionIndicator({
  kind,
  heroSide,
}: {
  kind?: CombatEvent["kind"];
  heroSide: boolean;
}) {
  if (kind === "damage") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <div className={"text-3xl " + (heroSide ? "" : "scale-x-[-1]")}>⚔</div>
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold text-[#6b1a0e]">
          Treffer
        </div>
      </div>
    );
  }
  if (kind === "parry-success") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <div className="text-3xl">🛡</div>
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold text-[#1f3d6b]">
          Pariert
        </div>
      </div>
    );
  }
  if (kind === "attack-miss") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <div className="text-2xl dsa-ink-faded">✗</div>
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold dsa-ink-faded">
          Daneben
        </div>
      </div>
    );
  }
  if (kind === "attack-hit") {
    return (
      <div className={"text-2xl animate-[scale-in_0.18s_ease-out] " + (heroSide ? "" : "scale-x-[-1]")}>
        →
      </div>
    );
  }
  if (kind === "downed") {
    return (
      <div className="flex flex-col items-center gap-1 animate-[scale-in_0.18s_ease-out]">
        <Skull className="h-6 w-6 text-[#6b1a0e]" strokeWidth={2.25} />
        <div className="dsa-typed text-[10px] uppercase tracking-widest font-bold text-[#6b1a0e]">
          Niedergerungen
        </div>
      </div>
    );
  }
  return (
    <div className="dsa-typed text-base font-extrabold dsa-ink-faded tracking-widest">
      VS
    </div>
  );
}

function DieBox({
  d,
}: {
  d: { label: string; value: number; target?: number; success?: boolean };
}) {
  return (
    <div
      className={
        "dsa-die animate-[scale-in_0.18s_ease-out] " +
        (d.success === true
          ? "dsa-die-success"
          : d.success === false
          ? "dsa-die-fail"
          : "")
      }
    >
      <span className="dsa-typed text-[9px] uppercase tracking-wider dsa-ink-faded font-bold">
        {d.label}
      </span>
      <span className="font-display dsa-ink font-extrabold text-lg leading-none tabular-nums">
        {d.value}
        {typeof d.target === "number" && (
          <span className="text-xs dsa-ink-faded font-bold"> /{d.target}</span>
        )}
      </span>
    </div>
  );
}

function LogLine({ event, active }: { event: CombatEvent; active: boolean }) {
  const baseColor =
    event.kind === "damage"
      ? "text-[#6b1a0e]"
      : event.kind === "parry-success"
      ? "text-[#1f3d6b]"
      : event.kind === "attack-miss"
      ? "dsa-ink-faded"
      : event.kind === "downed"
      ? "text-[#6b1a0e] font-extrabold"
      : event.kind === "end-victory"
      ? "text-[#2d5a1e] font-extrabold"
      : event.kind === "end-defeat"
      ? "text-[#6b1a0e] font-extrabold"
      : event.kind === "round-start"
      ? "dsa-ink font-extrabold"
      : "dsa-ink";

  return (
    <div
      className={
        "dsa-typed text-xs sm:text-[13px] leading-snug py-0.5 px-2 rounded font-semibold " +
        baseColor +
        (active ? " bg-[rgba(20,12,4,0.08)]" : "")
      }
    >
      {event.text}
    </div>
  );
}
