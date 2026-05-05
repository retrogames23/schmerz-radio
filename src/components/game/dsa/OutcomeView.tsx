import { memo } from "react";
import type { AttrCheckResult, DsaOption } from "@/game/dsa/adventure";
import { DiceRow } from "./DiceRow";

interface Props {
  option: DsaOption;
  check: AttrCheckResult | null;
  onAdvance: () => void;
}

function OutcomeViewImpl({ option, check, onAdvance }: Props) {
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

export const OutcomeView = memo(OutcomeViewImpl);
