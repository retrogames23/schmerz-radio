import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Combatant,
  CombatEvent,
  CombatResult,
} from "@/game/dsa/combat";

/**
 * Animierte Auflösung eines automatisch gewürfelten Kampfes.
 *
 * Layout:
 *   ┌────────────────────────────────────────────┐
 *   │  Welt-Ansicht: Held links, Gegner rechts   │  ← oben
 *   │  LE-Balken, kleine Stoß-Animation          │
 *   ├────────────────────────────────────────────┤
 *   │  Würfelzeile: aktuell gefallene Würfel     │  ← Mitte
 *   │  Beschreibung: was sie bedeuten            │
 *   ├────────────────────────────────────────────┤
 *   │  Log: vorherige Schritte                   │  ← unten
 *   └────────────────────────────────────────────┘
 *
 * Spielt die Events automatisch in Intervallen ab. Nutzer kann
 * "Schneller" drücken oder am Ende "Weiter →".
 */

const STEP_MS = 1100;
const STEP_FAST_MS = 250;

export function DsaCombatScene({
  hero,
  foes,
  result,
  illustration,
  onDone,
}: {
  hero: Combatant;
  foes: Combatant[];
  result: CombatResult;
  illustration: string;
  onDone: (victory: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [fast, setFast] = useState(false);
  const [hitFlash, setHitFlash] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const events = result.events;
  const current = events[Math.min(step, events.length - 1)];
  const isLast = step >= events.length - 1;

  useEffect(() => {
    if (isLast) return;
    const ms = fast ? STEP_FAST_MS : STEP_MS;
    timer.current = setTimeout(() => setStep((s) => s + 1), ms);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, fast, isLast]);

  // Hit-Flash bei damage/downed.
  useEffect(() => {
    if (!current) return;
    if (current.kind === "damage" || current.kind === "downed") {
      setHitFlash(current.targetId ?? null);
      const t = setTimeout(() => setHitFlash(null), 350);
      return () => clearTimeout(t);
    }
  }, [current]);

  // Aktuelle LE aus dem letzten Snapshot bis hier.
  const leMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (let i = 0; i <= step && i < events.length; i++) {
      for (const s of events[i].snapshot) m[s.id] = s.le;
    }
    return m;
  }, [step, events]);

  return (
    <div className="dsa-combat-shell flex flex-col gap-3">
      {/* OBEN: Weltansicht */}
      <div
        className="dsa-combat-world relative h-[26vh] sm:h-[30vh] md:h-[34vh] overflow-hidden rounded border-2 border-[#3a2c1a]"
        style={{
          backgroundImage: `url(${illustration})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
        {/* Held links */}
        <CombatantBadge
          c={hero}
          le={leMap[hero.id] ?? hero.le}
          align="left"
          isHit={hitFlash === hero.id}
        />
        {/* Gegner rechts, gestaffelt */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 items-end">
          {foes.map((f) => (
            <CombatantBadge
              key={f.id}
              c={f}
              le={leMap[f.id] ?? f.le}
              align="right"
              isHit={hitFlash === f.id}
              compact
            />
          ))}
        </div>
        {/* VS-Funke in der Mitte bei Treffer */}
        {current?.kind === "damage" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-5xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] animate-[scale-in_0.2s_ease-out]">
              ✦
            </div>
          </div>
        )}
      </div>

      {/* MITTE: aktuelle Würfel + Erklärung */}
      <div className="dsa-combat-roll min-h-[5.5rem] rounded border border-[#3a2c1a]/60 bg-[#fbf2d8]/70 p-3">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {(current?.dice ?? []).map((d, i) => (
            <div
              key={i}
              className={
                "inline-flex flex-col items-center justify-center min-w-[3rem] rounded border px-2 py-1 text-xs font-bold animate-[scale-in_0.18s_ease-out] " +
                (d.success === true
                  ? "border-emerald-700 bg-emerald-100"
                  : d.success === false
                  ? "border-red-800 bg-red-100"
                  : "border-[#3a2c1a]/70 bg-white")
              }
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                {d.label}
              </span>
              <span className="text-base">
                {d.value}
                {typeof d.target === "number" && (
                  <span className="opacity-60"> /{d.target}</span>
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="font-serif text-sm sm:text-base leading-snug">
          {current?.text}
        </p>
      </div>

      {/* UNTEN: Log der letzten Schritte */}
      <div className="dsa-combat-log max-h-[18vh] overflow-y-auto rounded border border-[#3a2c1a]/40 bg-[#1c120a]/85 p-2 text-xs text-[#f3e7c8] font-mono space-y-1">
        {events.slice(0, step).map((e, i) => (
          <LogLine key={i} event={e} />
        ))}
      </div>

      {/* Steuerleiste */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={() => setFast((f) => !f)}
          className="dsa-choice px-3 py-1.5 rounded text-sm"
        >
          {fast ? "Normal" : "Schneller ⏩"}
        </button>
        <button
          onClick={() => onDone(result.victory)}
          disabled={!isLast}
          className="dsa-choice px-4 py-2 rounded font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLast
            ? result.victory
              ? "Sieg! Weiter →"
              : "Niederlage. Weiter →"
            : "…würfelt…"}
        </button>
      </div>
    </div>
  );
}

function CombatantBadge({
  c,
  le,
  align,
  isHit,
  compact,
}: {
  c: Combatant;
  le: number;
  align: "left" | "right";
  isHit: boolean;
  compact?: boolean;
}) {
  const dead = le <= 0;
  const pct = Math.max(0, Math.min(100, (le / c.leMax) * 100));
  return (
    <div
      className={
        "absolute pointer-events-none transition-transform duration-200 " +
        (align === "left" ? "left-3 bottom-3" : "") +
        (isHit ? " animate-[fade-in_0.2s_ease-out] translate-x-[2px]" : "") +
        (dead ? " opacity-40 grayscale" : "")
      }
      style={align === "right" ? { position: "static" } : undefined}
    >
      <div
        className={
          "rounded bg-black/70 backdrop-blur-sm px-2 py-1.5 border " +
          (c.side === "hero"
            ? "border-emerald-400/70"
            : "border-red-400/70") +
          (compact ? " min-w-[10rem]" : " min-w-[12rem]")
        }
      >
        <div className="flex items-center justify-between gap-2 text-[11px] text-white">
          <span className="font-bold truncate">
            {c.side === "hero" ? "🛡 " : "⚔ "}
            {c.name}
          </span>
          <span className="opacity-80 tabular-nums">
            {le}/{c.leMax}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded bg-white/20 overflow-hidden">
          <div
            className={
              "h-full transition-all duration-300 " +
              (c.side === "hero" ? "bg-emerald-400" : "bg-red-400")
            }
            style={{ width: `${pct}%` }}
          />
        </div>
        {!compact && (
          <div className="text-[10px] opacity-70 text-white mt-0.5 truncate">
            AT {c.at} · PA {c.pa} · RS {c.rs} · {c.weapon}
          </div>
        )}
      </div>
    </div>
  );
}

function LogLine({ event }: { event: CombatEvent }) {
  const color =
    event.kind === "damage"
      ? "text-amber-300"
      : event.kind === "parry-success"
      ? "text-sky-300"
      : event.kind === "attack-miss"
      ? "text-zinc-400"
      : event.kind === "downed"
      ? "text-red-400"
      : event.kind === "end-victory"
      ? "text-emerald-400 font-bold"
      : event.kind === "end-defeat"
      ? "text-red-400 font-bold"
      : "text-[#f3e7c8]";
  return <div className={color}>{event.text}</div>;
}
