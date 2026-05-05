import { memo } from "react";

interface Props {
  fallen: { id: string; name: string }[];
  wasKrieger: boolean;
  onRetry: () => void;
  onGiveUp: () => void;
}

function DefeatViewImpl({ fallen, wasKrieger, onRetry, onGiveUp }: Props) {
  const heroFell = fallen.some((f) => f.id === "hero");
  const yelvaFell = fallen.some((f) => f.id === "yelva");
  const bremFell = fallen.some((f) => f.id === "brem");
  const allDown = heroFell && yelvaFell && bremFell;

  let downedLine = "";
  if (allDown) {
    downedLine = "Alle drei liegen am Boden — der Kampf ist vorbei.";
  } else if (fallen.length === 2) {
    downedLine = `${fallen[0].name} und ${fallen[1].name} sinken zu Boden.`;
  } else if (fallen.length === 1) {
    downedLine = `${fallen[0].name} sinkt zu Boden.`;
  }

  let tjarkLine = "Tja Leute, leider alle tot.";
  if (!allDown && fallen.length > 0) {
    tjarkLine =
      "Zu zweit macht es keinen Spaß. Wollen wir es noch mit neuen Charakteren probieren?";
  } else {
    tjarkLine =
      "Tja Leute, leider alle tot. Wollt ihr es mit neuen Charakteren noch mal probieren?";
  }

  const yelvaAlive = !yelvaFell;
  const bremAlive = !bremFell;

  return (
    <div className="space-y-5">
      <div className="space-y-3 font-serif text-base sm:text-lg leading-relaxed dsa-ink">
        {downedLine && <p>{downedLine}</p>}
        <p className="font-semibold">
          Tjark legt das Regelbuch zur Seite, schaut in die Runde und seufzt:
        </p>
        <p className="dsa-table-aside italic text-base">„{tjarkLine}"</p>
        {!allDown && heroFell && (yelvaAlive || bremAlive) && (
          <p>
            {yelvaAlive && bremAlive
              ? "Yelva schiebt die Brille hoch, Brem klopft auf den Tisch — ohne ihren Anführer macht es ihnen keinen Spaß mehr."
              : yelvaAlive
              ? "Yelva schiebt die Brille hoch und legt ihren Würfel beiseite. „Allein hat das keinen Sinn."
              : "Brem klopft auf den Tisch und schiebt seinen Charakterbogen weg. „Allein? Vergiss es."}
          </p>
        )}
        {!allDown && !heroFell && (yelvaFell || bremFell) && (
          <p>
            {yelvaFell && bremFell
              ? "Yelva und Brem sammeln grummelnd ihre Würfel ein."
              : yelvaFell
              ? "Yelva schiebt ihre Brille hoch und schaut auf den Boden. Brem legt mitfühlend die Hand auf ihre Schulter."
              : "Brem grinst schief und sammelt seine Würfel ein. „War schön mit euch."}
          </p>
        )}
        {allDown && (
          <p>Yelva schiebt die Brille hoch, Brem sammelt grummelnd die Würfel ein.</p>
        )}
        <p className="font-semibold">
          Wollt ihr es mit neuen Charakteren noch mal probieren?
        </p>
        {!wasKrieger && (
          <p className="dsa-table-aside italic text-base">
            „Vielleicht versuchst du es diesmal mit einem Krieger?" — Brem grinst
            schief. „Die halten was aus."
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3 justify-end pt-2">
        <button
          onClick={onGiveUp}
          className="inline-flex items-center gap-2 rounded border-2 border-[#3a2c1a] bg-[#fbf2d8] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#2a1f10] hover:bg-[#f1d99a]"
        >
          Aufgeben
        </button>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded border-2 border-[#2d5a1e] bg-[#2d5a1e] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#f1e6c8] shadow-[0_2px_0_rgba(0,0,0,0.35)] transition-all hover:-translate-y-px"
        >
          Neue Charaktere — noch mal!
        </button>
      </div>
    </div>
  );
}

export const DefeatView = memo(DefeatViewImpl);
