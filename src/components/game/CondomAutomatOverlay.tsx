import { useEffect } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";
import type { InventoryItem, StoryFlag } from "@/game/types";

/**
 * Kondomautomat-Overlay in der Toilette von „Zum stillen Funk".
 * Drei Reihen: Kondome, Pfefferminzkaugummi, OP-Maske. Layard kauft
 * eine OP-Maske (Reihe 3) für 1 RM. Nach erstem Kauf ist Reihe 3 leer.
 */
export function CondomAutomatOverlay() {
  const { condomAutomatOpen, closeCondomAutomat, api } = useGame();

  useEffect(() => {
    if (!condomAutomatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCondomAutomat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [condomAutomatOpen, closeCondomAutomat]);

  if (!condomAutomatOpen) return null;

  const money = api.getItemCount("reichsmark");
  const broke = money < 1;

  type Row = {
    rowNumber: 1 | 2 | 3;
    title: string;
    subtitle: string;
    flag: StoryFlag;
    item: InventoryItem;
    klackText: string;
  };

  const rows: Row[] = [
    {
      rowNumber: 1,
      title: "Reihe 1 — Kondom",
      subtitle: "Drei Sorten, eine Sorte fehlt.",
      flag: "tookCondomFromAutomat",
      item: {
        id: "condom",
        name: "Kondom",
        description:
          "Zellophanverpackt, brauner Aufdruck »ELASTIC FORTUNA — Volkseigener Betrieb für Hygieneartikel«. Aus dem Automaten im „stillen Funk“. Liegt unbenutzt in Layards Manteltasche.",
      },
      klackText:
        "Es klackt, ein zellophanverpacktes Kondom fällt in die Schublade.",
    },
    {
      rowNumber: 2,
      title: "Reihe 2 — Pfefferminzkaugummi",
      subtitle: "Verstaubte Schachteln. Steht seit Wochen.",
      flag: "tookPeppermintFromAutomat",
      item: {
        id: "peppermint",
        name: "Pfefferminzkaugummi",
        description:
          "Eine verstaubte Schachtel aus dem Automaten im „stillen Funk“. Drei Streifen, papiertrocken. Hilft vielleicht gegen den Bier-Atem im Vorraum.",
      },
      klackText:
        "Es klackt, eine verstaubte Schachtel Pfefferminz fällt in die Schublade.",
    },
    {
      rowNumber: 3,
      title: "Reihe 3 — OP-Maske",
      subtitle: "Handgeschriebener Aufkleber: »OP-MASKE — 1 RM«.",
      flag: "tookMedMaskFromAutomat",
      item: {
        id: "medMask",
        name: "Medizinische Maske",
        description:
          "OP-Maske aus dem Kondomautomaten im „stillen Funk“. Riecht leicht nach Plastik und Bier. Reicht, um in E71 durchgewunken zu werden.",
      },
      klackText:
        "Es klackt, eine zellophanverpackte Maske fällt in die Schublade.",
    },
  ];

  const buy = (row: Row) => {
    const taken = api.hasFlag(row.flag) || api.hasItem(row.item.id);
    if (taken || broke) return;
    api.removeItem("reichsmark", 1);
    api.addItem(row.item);
    api.setFlag(row.flag);
    closeCondomAutomat();
    setTimeout(() => {
      api.showText([
        `Layard wirft eine Reichsmark ein, dreht den Knopf von Reihe ${row.rowNumber}.`,
        row.klackText,
      ]);
    }, 80);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-4"
      onClick={closeCondomAutomat}
      role="dialog"
      aria-label="Kondomautomat"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-sm border-2 border-emerald-400/60 bg-[#142a1a] p-5 text-emerald-100 shadow-[0_20px_80px_rgba(0,0,0,0.7)]"
      >
        <CloseButton
          onClick={closeCondomAutomat}
          tone="amber"
          label="Automat schließen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-[10px] uppercase tracking-[0.3em] text-emerald-300/70">
          Mintgrüner Automat · „Zum stillen Funk“
        </div>
        <h2 className="mt-1 font-display text-xl font-bold text-emerald-100">
          Reihe wählen
        </h2>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-emerald-200/80">
          Drei Reihen, drei Knöpfe. Eine Reichsmark pro Zug.{" "}
          <span className="text-emerald-300/70">
            (Münzfach: {money} RM)
          </span>
        </p>

        <ul className="mt-4 space-y-2 font-mono-crt text-sm">
          {rows.map((row) => {
            const taken =
              api.hasFlag(row.flag) || api.hasItem(row.item.id);
            const disabled = taken || broke;
            return (
              <li
                key={row.rowNumber}
                className={`rounded-sm border px-3 py-2 ${
                  disabled
                    ? "border-emerald-500/20 bg-black/20 opacity-60"
                    : "border-emerald-400/60 bg-emerald-500/10"
                }`}
              >
                <div className="text-emerald-100">
                  {row.title}{" "}
                  <span className="text-[11px] text-emerald-300/70">
                    · 1 RM
                  </span>
                </div>
                <div className="text-[11px] text-emerald-200/60">
                  {row.subtitle}
                </div>
                <button
                  type="button"
                  onClick={() => buy(row)}
                  disabled={disabled}
                  className="mt-2 w-full rounded-sm border border-emerald-400/60 bg-emerald-500/15 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-emerald-100 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {taken
                    ? `▸ Reihe ${row.rowNumber} ist leer`
                    : broke
                      ? "▸ Keine Reichsmark mehr"
                      : `▸ Knopf von Reihe ${row.rowNumber} drücken`}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}