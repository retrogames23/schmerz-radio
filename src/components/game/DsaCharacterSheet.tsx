import { useEffect, useRef, useState } from "react";
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
import { WEAPONS } from "@/game/dsa/rules/weapons";
import { ARMORS } from "@/game/dsa/rules/armor";
import {
  equipWeapon,
  unequipWeapon,
  equipArmor,
  unequipArmor,
  equipShield,
  unequipShield,
  discardItemById,
  type HeroGear,
} from "@/game/dsa/gear";
import { portraitFor } from "@/game/dsa/portraits";
import { DsaHeroAdvancement } from "./DsaHeroAdvancement";
import type { DsaHero } from "@/game/types";

/**
 * Vollbild-Overlay, das den aktuellen DSA-Charakterbogen zeigt — im
 * gleichen Pergament-Stil wie der Charakter-Erstell-Bogen, aber rein
 * lesend. Lässt sich per Knopf (TopBar) oder Taste „C" öffnen/schließen.
 */
export function DsaCharacterSheet() {
  const { dsaSheetOpen, closeDsaSheet, dsaCharacter, updateHero, notifyMaster } =
    useDsaHost();
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  const canEditGear = !!updateHero && !!hero.gear;
  const geschlecht =
    (dsaCharacter as unknown as { geschlecht?: string }).geschlecht ?? "m";
  const portraitUrl =
    (dsaCharacter as unknown as { portraitDataUrl?: string }).portraitDataUrl ??
    portraitFor(dsaCharacter.classId, geschlecht);

  function applyGear(next: HeroGear, note: string) {
    if (!updateHero) return;
    updateHero({ ...hero, gear: next });
    notifyMaster?.(note);
  }

  function onPortraitFile(file: File) {
    if (!updateHero) return;
    if (!file.type.startsWith("image/")) return;
    const heroName = dsaCharacter?.name ?? "Der Held";
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 512;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        updateHero({ ...hero, portraitDataUrl: dataUrl });
        notifyMaster?.(
          `${heroName} hat ein neues Porträt am Heldenbrief befestigt.`,
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function resetPortrait() {
    if (!updateHero) return;
    const next = { ...hero };
    delete (next as { portraitDataUrl?: string }).portraitDataUrl;
    updateHero(next);
  }
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
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 p-3 sm:p-6"
      onClick={(e) => {
        // Klick aufs Backdrop schließt — Klick im Bogen selbst nicht.
        if (e.target === e.currentTarget) closeDsaSheet();
      }}
    >
      <div className="dsa-adventure-shell relative mx-auto w-full max-w-3xl rounded-md shadow-2xl">
        <div className="sticky top-2 z-10 flex justify-end pr-2 pt-2 -mb-8">
          <CloseButton onClick={closeDsaSheet} />
        </div>

        {/* Header */}
        <div className="dsa-adventure-header px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
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

        {/* Body — gesamter Bogen scrollt (kein inneres Scrollen mehr) */}
        <div className="dsa-adventure-body p-5 sm:p-6 space-y-5">
          {/* Porträt + Stammdaten */}
          <section className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="dsa-portrait-frame h-40 w-32 sm:h-44 sm:w-36 overflow-hidden">
                <img src={portraitUrl} alt={`Porträt von ${dsaCharacter.name}`} />
              </div>
              {canAdvance && (
                <div className="flex flex-col items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPortraitFile(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="dsa-mini-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Eigenes Bild
                  </button>
                  {(dsaCharacter as unknown as { portraitDataUrl?: string })
                    .portraitDataUrl && (
                    <button
                      type="button"
                      className="dsa-mini-btn"
                      onClick={resetPortrait}
                    >
                      Standard
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 w-full">
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
            </div>
          </section>

          {/* Eigenschaften + LE/AE */}
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

          {/* Ausrüstung — vom Meister vergeben/gestrichen */}
          {hero.gear && (
            <section>
              <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold mb-2 border-b-2 border-[rgba(20,12,4,0.85)] pb-1">
                Ausrüstung
              </div>
              {(() => {
                const g = hero.gear!;
                const weapon = g.weaponId ? WEAPONS[g.weaponId] : null;
                const armor = g.armorId ? ARMORS[g.armorId] : null;
                const shield = g.shieldId ? ARMORS[g.shieldId] : null;
                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 dsa-typed text-[13px] dsa-ink font-semibold">
                      <GearSlot
                        label="Waffe"
                        value={weapon ? `${weapon.name} (TP ${weapon.tp})` : "— unbewaffnet —"}
                        onUnequip={
                          canEditGear && g.weaponId
                            ? () =>
                                applyGear(
                                  unequipWeapon(g),
                                  `${dsaCharacter.name} legt ${weapon?.name ?? "die Waffe"} ab.`,
                                )
                            : undefined
                        }
                      />
                      <GearSlot
                        label="Rüstung"
                        value={armor ? `${armor.name} (RS ${armor.rs})` : "— keine —"}
                        onUnequip={
                          canEditGear && g.armorId
                            ? () =>
                                applyGear(
                                  unequipArmor(g),
                                  `${dsaCharacter.name} legt ${armor?.name ?? "die Rüstung"} ab.`,
                                )
                            : undefined
                        }
                      />
                      <GearSlot
                        label="Schild"
                        value={shield ? `${shield.name} (PA +${shield.paBonus ?? 0})` : "—"}
                        onUnequip={
                          canEditGear && g.shieldId
                            ? () =>
                                applyGear(
                                  unequipShield(g),
                                  `${dsaCharacter.name} hängt ${shield?.name ?? "den Schild"} an den Gürtel.`,
                                )
                            : undefined
                        }
                      />
                    </div>
                    <div className="dsa-typed text-[11px] uppercase tracking-widest dsa-ink-faded font-bold mb-1">
                      Inventar
                    </div>
                    {g.items.length === 0 ? (
                      <div className="dsa-typed text-[13px] dsa-ink italic font-semibold">
                        Die Taschen sind leer.
                      </div>
                    ) : (
                      <ul className="dsa-typed text-[13px] dsa-ink font-semibold space-y-1">
                        {g.items.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center justify-between gap-3 border-b border-[rgba(20,12,4,0.45)] py-1"
                          >
                            <span className="min-w-0">
                              <span className="font-extrabold">{it.name}</span>
                              {(it.count ?? 1) > 1 && (
                                <span className="ml-1 opacity-70">×{it.count}</span>
                              )}
                              {it.description && (
                                <span className="italic ml-2 opacity-80">— {it.description}</span>
                              )}
                            </span>
                            {canEditGear && (
                              <span className="flex shrink-0 gap-1">
                                {it.weaponId && (
                                  <button
                                    type="button"
                                    className="dsa-mini-btn"
                                    onClick={() =>
                                      applyGear(
                                        equipWeapon(g, it.id),
                                        `${dsaCharacter.name} rüstet ${it.name} als Waffe aus.`,
                                      )
                                    }
                                  >
                                    Anlegen
                                  </button>
                                )}
                                {it.armorId && (
                                  <button
                                    type="button"
                                    className="dsa-mini-btn"
                                    onClick={() =>
                                      applyGear(
                                        equipArmor(g, it.id),
                                        `${dsaCharacter.name} zieht ${it.name} an.`,
                                      )
                                    }
                                  >
                                    Anlegen
                                  </button>
                                )}
                                {it.shieldId && (
                                  <button
                                    type="button"
                                    className="dsa-mini-btn"
                                    onClick={() =>
                                      applyGear(
                                        equipShield(g, it.id),
                                        `${dsaCharacter.name} nimmt ${it.name} in die Hand.`,
                                      )
                                    }
                                  >
                                    Anlegen
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="dsa-mini-btn is-danger"
                                  title="Item wegwerfen"
                                  onClick={() => {
                                    if (!window.confirm(`„${it.name}" wirklich wegwerfen?`)) return;
                                    applyGear(
                                      discardItemById(g, it.id),
                                      `${dsaCharacter.name} wirft ${it.name} weg.`,
                                    );
                                  }}
                                >
                                  Weg
                                </button>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink-faded font-bold mt-2 opacity-70">
                      Der Meister erfährt jede Änderung am Inventar.
                    </div>
                  </>
                );
              })()}
            </section>
          )}

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
        <div className="dsa-adventure-footer flex items-center justify-between px-5 sm:px-6 py-3 text-xs">
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

function GearSlot({
  label,
  value,
  onUnequip,
}: {
  label: string;
  value: string;
  onUnequip?: () => void;
}) {
  return (
    <div>
      <div className="dsa-typed text-[10px] uppercase tracking-widest dsa-ink-faded font-bold mb-1 flex items-center justify-between gap-2">
        <span>{label}</span>
        {onUnequip && (
          <button type="button" className="dsa-mini-btn" onClick={onUnequip}>
            Ablegen
          </button>
        )}
      </div>
      <div className="dsa-box-thick flex h-10 items-center justify-center px-2">
        <span className="font-display dsa-ink font-extrabold text-[13px] truncate">
          {value}
        </span>
      </div>
    </div>
  );
}
