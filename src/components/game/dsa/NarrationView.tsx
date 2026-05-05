import { memo } from "react";
import { ATTR_LABEL } from "@/game/dsa/dice";
import type { DsaOption } from "@/game/dsa/adventure";

interface Props {
  lines: string[];
  options: DsaOption[];
  visibleOptions: DsaOption[];
  onChoose: (o: DsaOption) => void;
  characterName: string;
  isMagic: boolean;
  frozen?: boolean;
}

function NarrationViewImpl({
  lines,
  options,
  visibleOptions,
  onChoose,
  characterName,
  isMagic,
  frozen,
}: Props) {
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

export const NarrationView = memo(NarrationViewImpl);
