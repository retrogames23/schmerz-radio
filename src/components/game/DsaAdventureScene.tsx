import { useMemo, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { ScrollText, LogOut } from "lucide-react";
import {
  DSA_CAMPAIGN,
  findBeat,
  meetsRequirement,
  rollAttrCheck,
  type AttrCheckResult,
  type DsaOption,
} from "@/game/dsa/adventure";
import {
  DSA_CLASSES,
  type DsaClassId,
} from "@/game/dsa/classes";
import { ATTR_LABEL, type Attr } from "@/game/dsa/dice";
import {
  ENEMY_STATS,
  foeCombatantFromStat,
  heroCombatantFromCharacter,
  resolveCombat,
  type Combatant,
  type CombatResult,
} from "@/game/dsa/combat";
import { DsaCombatOverlay } from "./DsaCombatOverlay";

/**
 * Vollbild-Overlay, das die DSA-Tafelrunde simuliert. Zeigt
 * Illustration + Tjarks Erzähltext + Wahloptionen, die nur sichtbar
 * sind, wenn Layards Klasse passt. Auswahl löst Erzähltext (mit
 * optionaler Eigenschafts-Probe) und Übergang zum nächsten Beat aus.
 */

type Phase =
  | { kind: "narration" }
  | {
      kind: "combat";
      option: DsaOption;
      hero: Combatant;
      foes: Combatant[];
      result: CombatResult;
    }
  | { kind: "outcome"; option: DsaOption; check: AttrCheckResult | null };

export function DsaAdventureScene() {
  const {
    dsaAdventureOpen,
    dsaBeat,
    dsaCharacter,
    setDsaCharacter,
    api,
    closeDsaAdventure,
    toggleDsaSheet,
    dsaSheetOpen,
  } = useGame();

  const [phase, setPhase] = useState<Phase>({ kind: "narration" });

  const found = useMemo(() => (dsaBeat ? findBeat(dsaBeat) : null), [dsaBeat]);

  if (!dsaAdventureOpen) return null;
  if (!dsaCharacter) {
    // Defensive — sollte nicht passieren; wir schließen.
    closeDsaAdventure();
    return null;
  }
  if (!found) {
    closeDsaAdventure();
    return null;
  }

  const { act, beat } = found;
  const cls = DSA_CLASSES.find((c) => c.id === dsaCharacter.classId);
  const classId = (cls?.id ?? null) as DsaClassId | null;
  const isMagic = !!cls?.magic;

  function handleChoose(option: DsaOption) {
    // Automatischer Kampf hat Vorrang vor einfacher Probe.
    if (option.combat && dsaCharacter) {
      const hero = heroCombatantFromCharacter(dsaCharacter);
      const foes = option.combat.enemyIds.map((id, i) => {
        const stat = ENEMY_STATS[id];
        if (!stat) {
          throw new Error(`Unknown enemy id ${id} in option ${option.id}`);
        }
        return foeCombatantFromStat(stat, i);
      });
      // Wir kopieren die Combatants, damit resolveCombat sie mutieren darf,
      // ohne die UI-Referenzen zu zerstören. Snapshots im Result reichen.
      const heroForFight = { ...hero };
      const foesForFight = foes.map((f) => ({ ...f }));
      const result = resolveCombat(heroForFight, foesForFight);
      setPhase({ kind: "combat", option, hero, foes, result });
      return;
    }
    let result: AttrCheckResult | null = null;
    if (option.attrCheck) {
      const attrVal = dsaCharacter!.attrs[option.attrCheck.attr] ?? 10;
      result = rollAttrCheck(attrVal, option.attrCheck.modifier ?? 0);
    }
    setPhase({ kind: "outcome", option, check: result });
  }

  function handleCombatDone(victory: boolean) {
    if (phase.kind !== "combat") return;
    // Synthetisches Probe-Resultat, damit OutcomeView den richtigen Text wählt.
    const synthetic: AttrCheckResult = {
      rolls: [0, 0, 0],
      total: 0,
      target: 0,
      success: victory,
    };
    // Ohne attrCheck zeigt OutcomeView keine Würfelzeile — gut, der Kampf
    // hatte schon seine eigene. Wir setzen daher check=null bei Kampf.
    void synthetic;
    const opt = phase.option;
    setPhase({
      kind: "outcome",
      option: { ...opt, attrCheck: undefined },
      check: { rolls: [0, 0, 0], total: 0, target: 0, success: victory },
    });
    // Aktualisiere LE des Charakters, falls Schaden genommen.
    if (dsaCharacter && phase.result.heroLeFinal !== dsaCharacter.le) {
      setDsaCharacter({
        ...dsaCharacter,
        le: Math.max(1, phase.result.heroLeFinal),
      });
    }
  }

  function handleAdvance() {
    if (phase.kind !== "outcome") return;
    const target = phase.option.next;
    if (target === "end") {
      api.setFlag("dsaAdventureScene3Done");
      api.setFlag("dsaCampaignFinished");
      api.setDsaBeat(null);
      closeDsaAdventure();
      return;
    }
    if (target === "scene2") {
      api.setFlag("dsaAdventureScene1Done");
      api.setDsaBeat("s2b1");
    } else if (target === "scene3") {
      api.setFlag("dsaAdventureScene2Done");
      api.setDsaBeat("s3b1");
    } else {
      api.setDsaBeat(target);
    }
    setPhase({ kind: "narration" });
  }

  function handleStandUp() {
    closeDsaAdventure();
  }

  const visibleOptions = beat.options.filter((o) =>
    meetsRequirement(classId, isMagic, o.requires),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/85 p-4 sm:p-6">
      <div className="dsa-adventure-shell relative my-auto w-full max-w-5xl overflow-hidden rounded-md shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]">
        <CloseButton onClick={handleStandUp} />

        {/* Header: Akt-Titel + Werkzeugleiste */}
        <div className="dsa-adventure-header shrink-0 px-6 pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.3em] opacity-70">
                Akt {DSA_CAMPAIGN.findIndex((a) => a.id === act.id) + 1} · Tjark erzählt
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl mt-1 truncate">
                {act.title}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2 mr-10">
              <button
                type="button"
                onClick={toggleDsaSheet}
                title="Charakterbogen ein-/ausblenden (C)"
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

        {/* Illustration */}
        <div className="relative w-full shrink-0 overflow-hidden border-y-2 border-[#3a2c1a] h-[28vh] sm:h-[32vh] md:h-[36vh]">
          <img
            src={beat.illustration}
            alt={`${act.title} — ${beat.id}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 dsa-adventure-vignette" />
        </div>

        {/* Erzähltext / Outcome */}
        <div className="dsa-adventure-body min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {phase.kind === "narration" ? (
            <NarrationView
              lines={beat.narration}
              options={beat.options}
              visibleOptions={visibleOptions}
              onChoose={handleChoose}
              characterName={dsaCharacter.name}
              isMagic={isMagic}
            />
          ) : phase.kind === "combat" ? (
            // Während des Kampfes Erzählung „eingefroren" sichtbar lassen.
            // Das eigentliche Kampf-Fenster legt sich als eigenes Overlay drüber.
            <NarrationView
              lines={beat.narration}
              options={beat.options}
              visibleOptions={[]}
              onChoose={() => {}}
              characterName={dsaCharacter.name}
              isMagic={isMagic}
              frozen
            />
          ) : (
            <OutcomeView
              option={phase.option}
              check={phase.check}
              onAdvance={handleAdvance}
            />
          )}
        </div>

        <div className="dsa-adventure-footer shrink-0 flex items-center justify-between gap-3 px-6 py-3 text-xs">
          <span className="text-[#2a1f10] font-semibold truncate">
            {dsaCharacter.name} · {dsaCharacter.className}
          </span>
          <button
            onClick={handleStandUp}
            title="Abenteuer pausieren — du kannst später am Tisch weitermachen."
            className="inline-flex items-center gap-2 rounded border-2 border-[#6b1a0e] bg-[#6b1a0e] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] transition-all hover:bg-[#8a2310] hover:-translate-y-px"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Vom Tisch aufstehen</span>
          </button>
        </div>
      </div>

      {/* Kampf-Overlay (eigenes Fenster wie der Charakterbogen) */}
      {phase.kind === "combat" && (
        <DsaCombatOverlay
          hero={phase.hero}
          foes={phase.foes}
          result={phase.result}
          onDone={handleCombatDone}
        />
      )}
    </div>
  );
}

function NarrationView({
  lines,
  options,
  visibleOptions,
  onChoose,
  characterName,
  isMagic,
  frozen,
}: {
  lines: string[];
  options: DsaOption[];
  visibleOptions: DsaOption[];
  onChoose: (o: DsaOption) => void;
  characterName: string;
  isMagic: boolean;
  frozen?: boolean;
}) {
  const hiddenCount = options.length - visibleOptions.length;
  return (
    <div className="space-y-4">
      <div className="space-y-2 font-serif text-base sm:text-lg leading-relaxed">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <div className="border-t border-[#3a2c1a]/40 pt-4">
        {frozen ? (
          <div className="dsa-typed text-xs uppercase tracking-widest dsa-ink-faded italic">
            … die Klingen sind gezogen, der Würfel rollt …
          </div>
        ) : (
          <>
        <div className="text-xs uppercase tracking-widest opacity-70 mb-2">
          Was tut {characterName}?
        </div>
        <ul className="space-y-2">
          {visibleOptions.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => onChoose(o)}
                className="dsa-choice w-full text-left px-3 py-2 rounded"
              >
                <span className="block">{o.text}</span>
                {o.attrCheck && (
                  <span className="block mt-1 text-xs opacity-70">
                    Probe: {ATTR_LABEL[o.attrCheck.attr]}
                    {o.attrCheck.modifier
                      ? ` (${o.attrCheck.modifier > 0 ? "+" : ""}${o.attrCheck.modifier})`
                      : ""}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {hiddenCount > 0 && (
          <div className="mt-3 text-xs italic opacity-60">
            ({hiddenCount} weitere Option
            {hiddenCount === 1 ? "" : "en"} sind nur für andere Klassen
            sichtbar{isMagic ? "" : " — Magie nicht verfügbar"}.)
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

function OutcomeView({
  option,
  check,
  onAdvance,
}: {
  option: DsaOption;
  check: AttrCheckResult | null;
  onAdvance: () => void;
}) {
  const success = check ? check.success : true;
  const lines = success
    ? option.outcome.success
    : option.outcome.failure ?? option.outcome.success;
  return (
    <div className="space-y-4">
      {check && (
        <DiceRow
          attr={option.attrCheck!.attr}
          target={check.target}
          rolls={check.rolls}
          total={check.total}
          success={check.success}
        />
      )}
      <div className="space-y-2 font-serif text-base sm:text-lg leading-relaxed">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {option.outcome.table && (
        <div className="dsa-table-aside text-sm italic">
          <span className="font-semibold not-italic mr-1">
            {option.outcome.table.speaker}:
          </span>
          „{option.outcome.table.text}“
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          onClick={onAdvance}
          className="dsa-choice px-4 py-2 rounded font-semibold"
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

function DiceRow({
  attr,
  target,
  rolls,
  total,
  success,
}: {
  attr: Attr;
  target: number;
  rolls: [number, number, number];
  total: number;
  success: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border border-[#3a2c1a]/40 bg-[#fbf2d8]/60 rounded px-3 py-2 text-sm">
      <span className="font-semibold">
        {ATTR_LABEL[attr]}-Probe gegen {target}:
      </span>
      {rolls.map((r, i) => (
        <span
          key={i}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#3a2c1a]/70 bg-white font-bold"
        >
          {r}
        </span>
      ))}
      <span>= {total}</span>
      <span
        className={
          "ml-auto font-bold " +
          (success ? "text-emerald-700" : "text-red-800")
        }
      >
        {success ? "Erfolg" : "Misslungen"}
      </span>
    </div>
  );
}