import { useEffect, useMemo, useState } from "react";
import { useDsaHost } from "@/game/dsa/DsaHostContext";
import { CloseButton } from "./CloseButton";
import { ATTR_LABEL, ATTR_ORDER, type Attr } from "@/game/dsa/dice";
import { DSA_CLASSES } from "@/game/dsa/classes";
import {
  CLASS_COMBAT_PROFILES,
  heroCombatantFromCharacter,
} from "@/game/dsa/combat";
import { SPELLS } from "@/game/dsa/rules/spells";
import { TALENTS } from "@/game/dsa/rules/talents";
import { upgradeToHero, availableAp } from "@/game/dsa/advancement";
import { DsaHeroAdvancement } from "./DsaHeroAdvancement";
import type { DsaHero } from "@/game/types";

/**
 * Vollbild-Overlay, das den aktuellen DSA-Charakterbogen zeigt — im
 * gleichen Pergament-Stil wie der Charakter-Erstell-Bogen, aber rein
 * lesend. Lässt sich per Knopf (TopBar) oder Taste „C" öffnen/schließen.
 */
export function DsaCharacterSheet() {
  const { dsaSheetOpen, closeDsaSheet, dsaCharacter, updateHero } = useDsaHost();
  const [advanceOpen, setAdvanceOpen] = useState(false);

  // Tastenkürzel C zum Ein-/Ausblenden — wird zentral in Game.tsx gehandhabt,
  // hier nur ESC zum Schließen.
  useEffect(() => {
    if (!dsaSheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDsaSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dsaSheetOpen, closeDsaSheet]);

  if (!dsaSheetOpen) return null;
  if (!dsaCharacter) {
    closeDsaSheet();
    return null;
  }

  const cls = DSA_CLASSES.find((c) => c.id === dsaCharacter.classId);
  const combatant = heroCombatantFromCharacter(dsaCharacter);
  const profile =
    (CLASS_COMBAT_PROFILES as Record<string, unknown>)[dsaCharacter.classId] ??
    null;

  // DsaHero ist Erweiterung von DsaCharacterSummary; im Standalone führen
  // wir den Helden bereits als Hero, im Hauptspiel wird er beim Anzeigen
  // promotet (AP-Felder dann 0, bis das Hauptspiel sie befüllt).
  const hero = upgradeToHero(dsaCharacter as DsaHero) as DsaHero;
  const ap = availableAp(hero);
  const canAdvance = !!updateHero;
  type LearnedTalent = { name: string; value: number; probe: readonly string[] };
  const learnedTalents: LearnedTalent[] = Object.entries(hero.talents ?? {})
    .flatMap(([id, value]) => {
      const def = TALENTS.find((t) => t.id === id);
      return def ? [{ name: def.name, value, probe: def.probe as readonly string[] }] : [];
    })
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const learnedSpells = Object.entries(hero.spells ?? {})
    .map(([id, value]) => {
      const def = SPELLS.find((s) => s.id === id);
      return def ? { def, value } : null;
    })
    .filter((s): s is { def: typeof SPELLS[number]; value: number } => !!s)
    .sort((a, b) => b.value - a.value || a.def.name.localeCompare(b.def.name));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-6"
      onClick={(e) => {
        // Klick aufs Backdrop schließt — Klick im Bogen selbst nicht.
        if (e.target === e.currentTarget) closeDsaSheet();
      }}
    >
      <div className="dsa-adventure-shell relative my-auto w-full max-w-3xl rounded-md shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]">
        <CloseButton onClick={closeDsaSheet} />

        {/* Header */}
        <div className="dsa-adventure-header shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Charakterbogen · DSA 3
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-2xl sm:text-3xl dsa-ink font-extrabold">
              {dsaCharacter.name}
            </h2>
            <span className="dsa-typed text-sm dsa-ink font-bold">
              · {dsaCharacter.className}
              {cls?.magic ? " · magiebegabt" : ""}
            </span>
          </div>
          {cls?.blurb && (
            <p className="dsa-typed mt-2 text-sm italic dsa-ink leading-snug font-semibold">
              {cls.blurb}
            </p>
          )}
          {canAdvance && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded border-2 border-[rgba(30,18,8,0.65)] bg-[rgba(30,18,8,0.08)] px-3 py-2">
              <div className="dsa-typed text-[12px] dsa-ink font-bold">
                Verfügbare AP: <span className="font-display text-lg">{ap}</span>
                <span className="ml-2 opacity-70 text-[10px] uppercase tracking-widest">
                  · gespielt {hero.adventuresPlayed} · siegreich {hero.adventuresWon}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAdvanceOpen(true)}
                disabled={ap <= 0}
                className={
                  "dsa-typed text-[11px] uppercase tracking-widest font-bold px-3 py-1.5 border-2 rounded-sm " +
                  (ap > 0
                    ? "bg-[rgba(30,18,8,0.85)] text-[#f1e6c8] border-[rgba(30,18,8,0.85)] hover:bg-[rgba(30,18,8,1)]"
                    : "dsa-ink border-[rgba(30,18,8,0.4)] opacity-50 cursor-not-allowed")
                }
              >
                Held steigern
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="dsa-adventure-body min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Eigenschaften + LE/AE */}
          <section>
            <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
              Eigenschaftswerte
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {ATTR_ORDER.map((a) => (
                <ReadAttr
                  key={a}
                  attr={a}
                  value={(dsaCharacter.attrs as Record<string, number>)[a] ?? 0}
                />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              label="Lebensenergie"
              value={
                dsaCharacter.leMax && dsaCharacter.leMax !== dsaCharacter.le
                  ? `${dsaCharacter.le} / ${dsaCharacter.leMax}`
                  : `${dsaCharacter.le}`
              }
              accent
            />
            {dsaCharacter.ae !== null ? (
              <Stat label="Astralenergie" value={`${dsaCharacter.ae}`} />
            ) : (
              <Stat label="Astralenergie" value="—" />
            )}
            <Stat
              label="Geschlecht"
              value={
                (dsaCharacter as unknown as { geschlecht?: string }).geschlecht ??
                "—"
              }
              small
            />
            <Stat
              label="Status"
              value={
                dsaCharacter.le <= Math.max(5, Math.floor((dsaCharacter.le ?? 30) * 0.3))
                  ? "angeschlagen"
                  : "kampftauglich"
              }
              small
            />
          </section>

          {/* Kampfwerte (Held in der Tafelrunde) */}
          <section>
            <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
              Kampfwerte (im Abenteuer)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Attacke (AT)" value={`${combatant.at}`} small />
              <Stat label="Parade (PA)" value={`${combatant.pa}`} small />
              <Stat
                label="Trefferpunkte"
                value={`${combatant.tpDice}W6${
                  combatant.tpBonus ? `+${combatant.tpBonus}` : ""
                }`}
                small
              />
              <Stat
                label="Rüstungsschutz"
                value={`${combatant.rs}`}
                small
              />
            </div>
            <div className="dsa-typed mt-2 text-sm dsa-ink font-semibold">
              Bewaffnung: <span className="dsa-ink font-extrabold">{combatant.weapon}</span>
            </div>
          </section>

          {/* Talente (passend zur Klasse) */}
          {profile && (
            <section>
              <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
                Talente · Auswahl
              </div>
              <div className="dsa-typed text-[13px] dsa-ink font-semibold grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {classTalents(dsaCharacter.classId).map((t) => (
                  <div
                    key={t}
                    className="flex items-center justify-between border-b border-[rgba(20,12,4,0.55)] py-0.5"
                  >
                    <span>{t.split(" ").slice(0, -1).join(" ") || t}</span>
                    <span className="dsa-ink font-bold">
                      {t.split(" ").slice(-1)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Zauber (nur magisch begabte Klassen) */}
          {cls?.magic && (
            <section>
              <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
                Zauber · Gelernt
              </div>
              {(() => {
                const list = learnedSpells.length > 0
                  ? learnedSpells
                  : SPELLS.filter((s) => s.schools.includes(dsaCharacter.classId)).map(
                      (def) => ({ def, value: 0 }),
                    );
                if (list.length === 0) {
                  return (
                    <div className="dsa-typed text-[13px] dsa-ink italic font-semibold">
                      Keine Hauszauber für diese Klasse verzeichnet.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {list.map(({ def: s, value }) => (
                      <div
                        key={s.id}
                        className="dsa-typed text-[13px] dsa-ink font-semibold border-b border-[rgba(20,12,4,0.55)] pb-1.5"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-display dsa-ink font-extrabold text-[15px]">
                            {s.name} <span className="text-[12px] opacity-80">(ZfW {value})</span>
                          </span>
                          <span className="text-[11px] uppercase tracking-widest">
                            Probe {s.probe.join("/")} · {s.cost} AsP · {s.target}
                          </span>
                        </div>
                        <div className="italic mt-0.5">{s.effect}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Gelernte Talente (Steigerungs-Sicht). */}
          {canAdvance && learnedTalents.length > 0 && (
            <section>
              <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
                Talente · Gelernt
              </div>
              <div className="dsa-typed text-[13px] dsa-ink font-semibold grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {learnedTalents.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between border-b border-[rgba(20,12,4,0.55)] py-0.5"
                  >
                    <span>
                      {t.name}{" "}
                      <span className="text-[10px] opacity-60 uppercase tracking-wider">
                        {t.probe.join("/")}
                      </span>
                    </span>
                    <span className="dsa-ink font-bold">{t.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="dsa-adventure-footer shrink-0 flex items-center justify-between px-5 sm:px-6 py-3 text-xs">
          <span className="opacity-80">
            Drücke <kbd className="px-1 border border-current rounded">C</kbd>{" "}
            oder <kbd className="px-1 border border-current rounded">Esc</kbd>{" "}
            zum Schließen.
          </span>
          <button
            onClick={closeDsaSheet}
            className="underline-offset-2 hover:underline"
          >
            Bogen weglegen
          </button>
        </div>
      </div>

      {advanceOpen && canAdvance && (
        <DsaHeroAdvancement
          hero={hero}
          onChange={(h) => updateHero?.(h)}
          onClose={() => setAdvanceOpen(false)}
        />
      )}
    </div>
  );
}

function ReadAttr({ attr, value }: { attr: Attr; value: number }) {
  return (
    <div className="flex flex-col items-center min-w-0">
      <div className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink font-bold">
        {attr}
      </div>
      <div className="dsa-box-thick mt-1 flex h-12 w-full items-center justify-center">
        <span className="font-display text-2xl dsa-ink font-extrabold">{value}</span>
      </div>
      <div className="dsa-typed text-[10px] dsa-ink font-semibold mt-1 truncate">
        {ATTR_LABEL[attr]}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink font-bold mb-1">
        {label}
      </div>
      <div
        className={
          "dsa-box-thick flex items-center justify-center " +
          (small ? "h-10" : "h-12")
        }
      >
        <span
          className={
            "font-display dsa-ink font-extrabold " +
            (accent ? "text-2xl" : small ? "text-base" : "text-xl")
          }
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function classTalents(classId: string): string[] {
  switch (classId) {
    case "magier":
    case "druide":
      return ["Stab +5", "Lesen/Schreiben +6", "Sprachen +4", "Pflanzenkunde +3"];
    case "streuner":
    case "gaukler":
      return ["Dolch +5", "Schleichen +6", "Taschendieb +5", "Lügen +4"];
    case "elf":
      return ["Bogen +7", "Sinnenschärfe +6", "Wildnisleben +5", "Singen +4"];
    case "thorwaler":
      return ["Hiebwaffen +7", "Boote fahren +5", "Zechen +5"];
    case "zwerg":
      return ["Hiebwaffen +6", "Mineralogie +5", "Bergbau +5"];
    default:
      return ["Hiebwaffen +6", "Schild +5", "Reiten +4", "Athletik +4"];
  }
}
