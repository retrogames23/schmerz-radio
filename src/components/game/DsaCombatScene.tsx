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

/** Symbol für Held / Gegner – grobes Comic-Token. */
function tokenFor(c: Combatant): string {
  if (c.side === "hero") return "🛡️";
  const n = c.name.toLowerCase();
  if (n.includes("armbrust")) return "🏹";
  if (n.includes("anführer") || n.includes("söldner")) return "⚔️";
  if (n.includes("hüter") || n.includes("spiegel")) return "👁️";
  if (n.includes("knüppel")) return "🪓";
  return "🗡️";
}

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

  // Wer schlägt jetzt zu? (für „Lunge"-Animation)
  const attackerId =
    current && (current.kind === "attack-hit" || current.kind === "attack-miss" || current.kind === "damage")
      ? current.actorId ?? null
      : null;
  const defenderId =
    current && (current.kind === "parry-success" || current.kind === "damage" || current.kind === "downed")
      ? current.targetId ?? null
      : null;

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
      {/* OBEN: Comichafte Kampf-Bühne — Helden links, Gegner rechts */}
      <div
        className="dsa-combat-world relative h-[28vh] sm:h-[32vh] md:h-[36vh] overflow-hidden rounded border-2 border-[#3a2c1a]"
        style={{
          backgroundImage: `url(${illustration})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />

        {/* Bühne */}
        <div className="relative z-10 grid h-full grid-cols-[1fr_auto_1fr] items-end gap-2 px-3 pb-3 pt-2">
          {/* Held(en) links */}
          <div className="flex flex-col items-start justify-end gap-2">
            <CombatToken
              c={hero}
              le={leMap[hero.id] ?? hero.le}
              isHit={hitFlash === hero.id}
              isAttacking={attackerId === hero.id}
              isDefending={defenderId === hero.id}
              facing="right"
            />
          </div>

          {/* Mitte: VS / Treffer-Funke */}
          <div className="flex flex-col items-center justify-end pb-6">
            {current?.kind === "damage" ? (
              <div className="text-5xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)] animate-[scale-in_0.2s_ease-out]">
                💥
              </div>
            ) : current?.kind === "parry-success" ? (
              <div className="text-4xl text-sky-200 drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] animate-[scale-in_0.2s_ease-out]">
                ✶
              </div>
            ) : current?.kind === "attack-miss" ? (
              <div className="text-3xl text-zinc-200 drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] animate-[scale-in_0.2s_ease-out]">
                ✗
              </div>
            ) : (
              <div className="text-2xl text-amber-100/80 font-black tracking-widest drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]">
                VS
              </div>
            )}
          </div>

          {/* Gegner rechts, gestaffelt */}
          <div className="flex flex-col items-end justify-end gap-2">
            {foes.map((f) => (
              <CombatToken
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

function CombatToken({
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
  const lungeTx =
    isAttacking && !dead
      ? facing === "right"
        ? "translate-x-3 -rotate-3"
        : "-translate-x-3 rotate-3"
      : isDefending && !dead
      ? facing === "right"
        ? "-translate-x-1"
        : "translate-x-1"
      : "";
  const flashRing = isHit
    ? "ring-4 ring-amber-300/90 animate-[scale-in_0.18s_ease-out]"
    : "";
  const tokenSize = compact ? "h-14 w-14 text-3xl" : "h-20 w-20 text-5xl";

  return (
    <div className={"flex flex-col items-center gap-1 " + (dead ? "opacity-40 grayscale" : "")}>
      {/* Sprechblase / Aktion-Hinweis */}
      {isAttacking && !dead && (
        <div className="font-mono text-[10px] uppercase tracking-widest text-amber-200 bg-black/60 px-1.5 py-0.5 rounded animate-[fade-in_0.18s_ease-out]">
          Angriff!
        </div>
      )}
      {/* Token */}
      <div
        className={
          "relative grid place-items-center rounded-full border-2 transition-all duration-200 ease-out shadow-lg " +
          tokenSize +
          " " +
          (c.side === "hero"
            ? "border-emerald-300 bg-gradient-to-b from-emerald-700/90 to-emerald-950/90 text-emerald-50"
            : "border-red-300 bg-gradient-to-b from-red-800/90 to-stone-950/90 text-red-50") +
          " " +
          lungeTx +
          " " +
          flashRing
        }
        style={{
          transform: `${facing === "left" ? "scaleX(-1)" : ""}`.trim(),
        }}
      >
        <span style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}>
          {dead ? "💀" : tokenFor(c)}
        </span>
        {isHit && (
          <span className="absolute -top-2 -right-2 text-2xl animate-[scale-in_0.2s_ease-out]">
            💥
          </span>
        )}
      </div>

      {/* Name + LE-Balken */}
      <div
        className={
          "rounded bg-black/75 backdrop-blur-sm px-2 py-1 border " +
          (c.side === "hero" ? "border-emerald-400/70" : "border-red-400/70") +
          (compact ? " min-w-[9rem]" : " min-w-[11rem]")
        }
      >
        <div className="flex items-center justify-between gap-2 text-[11px] text-white">
          <span className="font-bold truncate">{c.name}</span>
          <span className="opacity-80 tabular-nums">
            {Math.max(0, le)}/{c.leMax}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded bg-white/15 overflow-hidden">
          <div
            className={
              "h-full transition-all duration-300 " +
              (c.side === "hero" ? "bg-emerald-400" : "bg-red-400")
            }
            style={{ width: `${pct}%` }}
          />
        </div>
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
