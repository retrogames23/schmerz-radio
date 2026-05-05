import { memo } from "react";
import type { EndingId } from "@/game/dsa/adventure";

interface Props {
  onLeave: () => void;
  ending: EndingId | null;
  goldExtra: number;
}

const HEADLINES: Record<string, string> = {
  hero_return: "Auftrag erfüllt — das Buch liegt vor Wendelmir.",
  hero_betray: "Verrat in Punin — ihr habt das Buch selbst verkauft.",
  pact_with_warden: "Ein Pakt mit dem Hüter — das Buch bleibt, wo es war.",
  decline_path: "Ihr seid nie aufgebrochen — andere taten es, und sind nicht zurück.",
  empty_handed: "Mit leeren Händen, aber lebendig zurück am Tisch.",
  tragic_victory: "Ein bitterer Sieg — das Buch ist da, einer von euch nicht.",
};
const FLAVORS: Record<string, string> = {
  hero_return:
    "Wendelmir nimmt das Buch wortlos entgegen, zählt fünfzig Dukaten ab und legt sie auf den Tisch. Yelva und Brem teilen schweigend.",
  hero_betray:
    "In Punin schmeckt das Bier süßer als verdient. Wendelmir wird euch suchen, aber heute ist heute.",
  pact_with_warden:
    "Der Tempel hat sich für euch geöffnet — und wieder geschlossen. Was er euch dafür gab, war kein Gold, sondern etwas, das man nicht wegtragen kann.",
  decline_path:
    "Manchmal ist die richtige Heldentat, daheim zu bleiben. Es fühlt sich nicht so an. Aber es ist so.",
  empty_handed:
    "Ihr habt drei Atemzüge mehr als drei Gruppen vor euch. Wendelmir wird wütend sein. Aber ihr atmet.",
  tragic_victory:
    "Tjark schweigt lange, ehe er das Notizbuch zuklappt. Manche Geschichten enden, indem sie weh tun.",
};

function OutroViewImpl({ onLeave, ending, goldExtra }: Props) {
  const e = ending ?? "hero_return";
  return (
    <div className="space-y-5">
      <div className="space-y-3 font-serif text-base sm:text-lg leading-relaxed dsa-ink">
        <p className="font-semibold">{HEADLINES[e]}</p>
        <p>{FLAVORS[e]}</p>
        <p>
          Tjark schließt sein Notizbuch, schiebt die Würfel zur Mitte des
          Tisches und lehnt sich zurück.
        </p>
        <p className="dsa-table-aside italic text-base">
          „Das war's für heute, Leute. Schöne Runde."
        </p>
        {goldExtra > 0 && (
          <p className="text-sm opacity-80">
            (Zusätzliches Gold aus Verhandlung/Fund: {goldExtra} Dukaten — narrativ
            verteilt.)
          </p>
        )}
        <p>
          Yelva nimmt die Brille ab und reibt sich die Augen. Brem grinst,
          klopft dir auf die Schulter und sammelt die Bleistifte ein.
        </p>
        <p>
          Draußen ist es längst dunkel. Der Gemeinschaftsraum riecht nach
          kaltem Tee und altem Papier. Dein Charakterbogen liegt vor dir —
          gut beschmiert, mit Eselsohren.
        </p>
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={onLeave}
          className="inline-flex items-center gap-2 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a] transition-all"
        >
          Vom Tisch aufstehen
        </button>
      </div>
    </div>
  );
}

export const OutroView = memo(OutroViewImpl);
