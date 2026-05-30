import { useCallback, useMemo, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import { ScrollText, LogOut } from "lucide-react";
import {
  DSA_CAMPAIGN,
  findBeat,
  isOptionVisible,
  rollAttrCheck,
  createAdventureState,
  pickEnding,
  type AttrCheckResult,
  type DsaOption,
  type AdventureState,
  type AdventureFlag,
} from "@/game/dsa/adventure";
import {
  DSA_CLASSES,
  type DsaClassId,
} from "@/game/dsa/classes";
import {
  ENEMY_STATS,
  foeCombatantFromStat,
  heroCombatantFromCharacter,
  companionCombatants,
  resolveCombat,
  type Combatant,
  type CombatResult,
} from "@/game/dsa/combat";
import { DsaCombatOverlay } from "./DsaCombatOverlay";
import { NarrationView } from "./dsa/NarrationView";
import { OutcomeView } from "./dsa/OutcomeView";
import { DefeatView } from "./dsa/DefeatView";
import { OutroView } from "./dsa/OutroView";

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
      heroes: Combatant[];
      foes: Combatant[];
      result: CombatResult;
    }
  | { kind: "outcome"; option: DsaOption; check: AttrCheckResult | null }
  | { kind: "defeat"; fallen: { id: string; name: string }[] }
  | { kind: "outro"; victory: boolean };

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
  const [advState, setAdvState] = useState<AdventureState>(() => createAdventureState());

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
      // RS-Bonus (Hesinde-Amulett) für den Endkampf übernehmen.
      if (advState.rsBonus > 0) {
        hero.rs = hero.rs + advState.rsBonus;
      }
      const companions = companionCombatants();
      const heroes = [hero, ...companions];
      // Endkampf flagsensitiv: krypt_pillaged → zorniger Hüter, krypt_freed → milder Hüter.
      const swappedIds = option.combat.enemyIds.map((id) => {
        if (id !== "spiegelhueter") return id;
        if (advState.flags.has("krypt_pillaged")) return "spiegelhueter_zornig";
        if (advState.flags.has("krypt_freed")) return "spiegelhueter_milde";
        return id;
      });
      const foes = swappedIds.map((id, i) => {
        const stat = ENEMY_STATS[id];
        if (!stat) {
          throw new Error(`Unknown enemy id ${id} in option ${option.id}`);
        }
        return foeCombatantFromStat(stat, i);
      });
      // Wir kopieren die Combatants, damit resolveCombat sie mutieren darf,
      // ohne die UI-Referenzen zu zerstören. Snapshots im Result reichen.
      const heroesForFight = heroes.map((h) => ({ ...h }));
      const foesForFight = foes.map((f) => ({ ...f }));
      const result = resolveCombat(heroesForFight, foesForFight);
      setPhase({ kind: "combat", option, heroes, foes, result });
      return;
    }
    let result: AttrCheckResult | null = null;
    if (option.attrCheck) {
      const attrVal = dsaCharacter!.attrs[option.attrCheck.attr] ?? 10;
      result = rollAttrCheck(attrVal, option.attrCheck.modifier ?? 0);
    }
    // Flags + Stat-Modifikatoren aus dem Outcome übernehmen.
    applyOutcomeEffects(option, result?.success ?? true);
    setPhase({ kind: "outcome", option, check: result });
  }

  function applyOutcomeEffects(option: DsaOption, success: boolean) {
    const o = option.outcome;
    const flags = success ? o.setFlags : (o.setFlagsOnFailure ?? o.setFlags);
    const grant = success;
    if (!flags && !grant) return;
    // Heilung sofort auf den Charakter anwenden — gerastet/getrunken heißt:
    // verlorene LE kommen zurück (bis zum Maximum).
    if (grant && o.grantLeBonus && dsaCharacter) {
      const cap = dsaCharacter.leMax ?? dsaCharacter.le;
      const healed = Math.min(dsaCharacter.le + o.grantLeBonus, cap);
      if (healed !== dsaCharacter.le) {
        setDsaCharacter({ ...dsaCharacter, le: healed });
      }
    }
    setAdvState((s) => {
      const next: AdventureState = {
        flags: new Set(s.flags),
        goldExtra: s.goldExtra,
        leBonus: s.leBonus,
        rsBonus: s.rsBonus,
      };
      if (flags) flags.forEach((f) => next.flags.add(f as AdventureFlag));
      if (grant) {
        if (o.grantGold) next.goldExtra += o.grantGold;
        if (o.grantRsBonus) next.rsBonus += o.grantRsBonus;
      }
      return next;
    });
  }

  function handleCombatDone(victory: boolean) {
    if (phase.kind !== "combat") return;
    // Bei Niederlage: dedizierter Defeat-Dialog statt Outcome (sonst läuft
    // die Story einfach weiter und es kommt zum Absturz, wenn der Held
    // bei LE 0 steht und der nächste Beat ihn lebend voraussetzt).
    if (!victory) {
      setPhase({
        kind: "defeat",
        fallen: phase.result.fallenHeroes,
      });
      return;
    }
    // Sieg: LE übernehmen (mind. 1, damit der Held „angeschlagen" weitergeht).
    if (dsaCharacter && phase.result.heroLeFinal !== dsaCharacter.le) {
      setDsaCharacter({
        ...dsaCharacter,
        le: Math.max(1, phase.result.heroLeFinal),
      });
    }
    const opt = phase.option;
    // Bei Kampfsieg auch Outcome-Flags anwenden (success-Pfad).
    applyOutcomeEffects(opt, true);
    setPhase({
      kind: "outcome",
      option: { ...opt, attrCheck: undefined },
      check: null,
    });
  }

  function handleAdvance() {
    if (phase.kind !== "outcome") return;
    const target = phase.option.next;
    if (target === "end") {
      setPhase({ kind: "outro", victory: true });
      return;
    }
    if (target === "scene2") {
      api.setFlag("dsaAdventureScene1Done");
      api.setDsaBeat("s2b1");
    } else if (target === "scene3") {
      api.setFlag("dsaAdventureScene2Done");
      api.setDsaBeat("s3b1");
    } else {
      // Camp-Beat erreicht? Markiere Akt 2 als beendet.
      if (target === "camp1") api.setFlag("dsaAdventureScene2Done");
      api.setDsaBeat(target);
    }
    setPhase({ kind: "narration" });
  }

  function handleStandUp() {
    closeDsaAdventure();
  }

  function handleDefeatRetry() {
    // Charakter zurücksetzen, Beat zurücksetzen, Charaktererschaffung öffnen.
    api.clearDsaCharacter();
    api.setDsaBeat(null);
    closeDsaAdventure();
    api.openDsaCreator();
  }

  function handleDefeatGiveUp() {
    // Vom Tisch aufstehen — Spieler kehrt zurück, ohne Fortschritt.
    api.clearDsaCharacter();
    api.setDsaBeat(null);
    closeDsaAdventure();
  }

  function handleOutroLeaveTable() {
    // Reguläres Ende: Flags setzen, Beat zurücksetzen, schließen.
    api.setFlag("dsaAdventureScene3Done");
    api.setFlag("dsaCampaignFinished");
    api.setDsaBeat(null);
    closeDsaAdventure();
  }

  const visibleOptions = useMemo(
    () =>
      beat.options.filter((o) =>
        isOptionVisible(o, classId, isMagic, advState),
      ),
    [beat.options, classId, isMagic, advState],
  );

  // Welche Endung passt zur aktuellen Lage?
  const endingId = useMemo(
    () =>
      phase.kind === "outro"
        ? pickEnding(advState, { lastBeatId: beat.id, victory: true })
        : null,
    [phase.kind, advState, beat.id],
  );

  const wasKrieger = dsaCharacter.classId === "krieger";

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/85 p-4 sm:p-6">
      <div className="dsa-adventure-shell relative my-auto w-full max-w-5xl overflow-hidden rounded-md shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]">
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
          ) : phase.kind === "defeat" ? (
            <DefeatView
              fallen={phase.fallen}
              wasKrieger={wasKrieger}
              onRetry={handleDefeatRetry}
              onGiveUp={handleDefeatGiveUp}
            />
          ) : phase.kind === "outro" ? (
            <OutroView onLeave={handleOutroLeaveTable} ending={endingId} goldExtra={advState.goldExtra} />
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
          heroes={phase.heroes}
          foes={phase.foes}
          result={phase.result}
          onDone={handleCombatDone}
        />
      )}
    </div>
  );
}
