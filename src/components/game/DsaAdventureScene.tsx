import { useMemo, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
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

/**
 * Vollbild-Overlay, das die DSA-Tafelrunde simuliert. Zeigt
 * Illustration + Tjarks Erzähltext + Wahloptionen, die nur sichtbar
 * sind, wenn Layards Klasse passt. Auswahl löst Erzähltext (mit
 * optionaler Eigenschafts-Probe) und Übergang zum nächsten Beat aus.
 */

type Phase =
  | { kind: "narration" }
  | { kind: "outcome"; option: DsaOption; check: AttrCheckResult | null };

export function DsaAdventureScene() {
  const {
    dsaAdventureOpen,
    dsaBeat,
    dsaCharacter,
    api,
    closeDsaAdventure,
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
    let result: AttrCheckResult | null = null;
    if (option.attrCheck) {
      const attrVal = dsaCharacter!.attrs[option.attrCheck.attr] ?? 10;
      result = rollAttrCheck(attrVal, option.attrCheck.modifier ?? 0);
    }
    setPhase({ kind: "outcome", option, check: result });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6">
      <div className="dsa-adventure-shell relative w-full max-w-5xl overflow-hidden rounded-md shadow-2xl">
        <CloseButton onClick={handleStandUp} />

        {/* Header: Akt-Titel */}
        <div className="dsa-adventure-header px-6 pt-5 pb-2">
          <div className="text-xs uppercase tracking-[0.3em] opacity-70">
            Akt {DSA_CAMPAIGN.findIndex((a) => a.id === act.id) + 1} · Tjark erzählt
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl mt-1">{act.title}</h2>
        </div>

        {/* Illustration */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border-y-2 border-[#3a2c1a]">
          <img
            src={beat.illustration}
            alt={`${act.title} — ${beat.id}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 dsa-adventure-vignette" />
        </div>

        {/* Erzähltext / Outcome */}
        <div className="dsa-adventure-body p-5 sm:p-6">
          {phase.kind === "narration" ? (
            <NarrationView
              lines={beat.narration}
              options={beat.options}
              visibleOptions={visibleOptions}
              onChoose={handleChoose}
              characterClass={cls?.name ?? "?"}
              isMagic={isMagic}
            />
          ) : (
            <OutcomeView
              option={phase.option}
              check={phase.check}
              onAdvance={handleAdvance}
            />
          )}
        </div>

        <div className="dsa-adventure-footer flex items-center justify-between px-6 py-3 text-xs opacity-80">
          <span>
            {dsaCharacter.name} · {dsaCharacter.className}
          </span>
          <button
            onClick={handleStandUp}
            className="underline-offset-2 hover:underline"
          >
            Vom Tisch aufstehen
          </button>
        </div>
      </div>
    </div>
  );
}

function NarrationView({
  lines,
  options,
  visibleOptions,
  onChoose,
  characterClass,
  isMagic,
}: {
  lines: string[];
  options: DsaOption[];
  visibleOptions: DsaOption[];
  onChoose: (o: DsaOption) => void;
  characterClass: string;
  isMagic: boolean;
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
        <div className="text-xs uppercase tracking-widest opacity-70 mb-2">
          Was tut {characterClass} Layard?
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