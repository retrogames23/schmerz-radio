import { useEffect } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { ATTR_LABEL, ATTR_ORDER, type Attr } from "@/game/dsa/dice";
import { DSA_CLASSES } from "@/game/dsa/classes";
import {
  CLASS_COMBAT_PROFILES,
  heroCombatantFromCharacter,
} from "@/game/dsa/combat";

/**
 * Vollbild-Overlay, das den aktuellen DSA-Charakterbogen zeigt — im
 * gleichen Pergament-Stil wie der Charakter-Erstell-Bogen, aber rein
 * lesend. Lässt sich per Knopf (TopBar) oder Taste „C" öffnen/schließen.
 */
export function DsaCharacterSheet() {
  const { dsaSheetOpen, closeDsaSheet, dsaCharacter } = useGame();

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-6"
      onClick={(e) => {
        // Klick aufs Backdrop schließt — Klick im Bogen selbst nicht.
        if (e.target === e.currentTarget) closeDsaSheet();
      }}
    >
      <div className="dsa-adventure-shell relative my-auto w-full max-w-3xl rounded-md shadow-2xl flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)]">
        <CloseButton onClick={closeDsaSheet} />

        {/* Header */}
        <div className="dsa-adventure-header shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Charakterbogen · DSA 2
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
            <Stat label="Lebensenergie" value={`${dsaCharacter.le}`} accent />
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
