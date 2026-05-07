import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CloseButton } from "./CloseButton";

/**
 * Pneumatik-Rohrpost-Overlay (Kantine 3602). Schicke die gefälschte
 * Quittung 4317-K an die Ausgabestelle E70-K. Validiert Code und Item.
 */
export function PneumaticTubeOverlay() {
  const { pneumaticOpen, closePneumatic, api } = useGame();
  const [code, setCode] = useState("");
  const [target, setTarget] = useState("E70-K");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pneumaticOpen) {
      setCode("");
      setTarget("E70-K");
      setError(null);
    }
  }, [pneumaticOpen]);

  useEffect(() => {
    if (!pneumaticOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePneumatic();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pneumaticOpen, closePneumatic]);

  if (!pneumaticOpen) return null;

  const hasForged = api.hasItem("quittungForged4317");

  const onSend = () => {
    if (!hasForged) {
      setError("Keine versandfertige Quittung in der Aktentasche.");
      return;
    }
    if (code.replace(/\s/g, "").toUpperCase() !== "4317-K") {
      setError("Code-Feld stimmt nicht mit der Quittung überein. (Hinweis: 4317-K)");
      return;
    }
    if (target.toUpperCase() !== "E70-K") {
      setError("Empfänger ungültig. Quittungen Schicht B gehen an E70-K.");
      return;
    }
    api.setFlag("sentForgedQuittung");
    closePneumatic();
    setTimeout(() => {
      api.showText([
        "Layard rollt die Quittung zur Hülse, schraubt zu, schiebt sie ein.",
        "Ein leises Saugen, dann das vertraute Klacken. Der Schlitten",
        "verschwindet im Messing. Das rote Lämpchen oben blinkt jetzt grün.",
        "Irgendwo zwei Etagen tiefer wird gerade etwas entgegengenommen.",
        "[ Quittung 4317-K abgeschickt. ]",
      ]);
      // Antwort kommt direkt zurück — sonst übersehen Spieler:innen
      // leicht, dass sie das Rohr ein zweites Mal anklicken müssten,
      // und stehen mit Insa fest, die auf den Transferbogen wartet.
      if (!api.hasFlag("receivedTillaTransfer")) {
        setTimeout(() => {
          api.setFlag("receivedTillaTransfer");
          api.addItem({
            id: "tillaTransfer",
            name: "Transferbogen E70-K → 70-2244",
            description:
              "Eingehende Rohrpost-Hülse, beantwortet eine Quittung 4317-K. Inhalt: ein Transferbogen — Patientin Tilla Kowalk, von E70-K verlegt an Heim Lothenau, neue Bewohnernummer 70-2244. Stempel »ÜBERFÜHRUNG STILL«. Datum 06.11.1997.",
          });
          api.showText([
            "Kaum eine Minute später klackt es im Rohr. Eine Hülse landet im Auffangkorb.",
            "Aufkleber: »EINGANG · QUITTUNG 4317-K · BEANTWORTET«.",
            "Drinnen: ein Transferbogen. Eine Bewohnernummer. Ein Heim.",
            "Tilla.",
            "[ Transferbogen 70-2244 eingesteckt. Ruf Insa zurück. ]",
          ]);
        }, 1200);
      }
    }, 80);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-4"
      onClick={closePneumatic}
      role="dialog"
      aria-label="Pneumatik-Rohrpost"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-sm border-2 border-amber-glow/60 bg-[#2a1a08] p-5 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]"
      >
        <CloseButton
          onClick={closePneumatic}
          tone="amber"
          label="Rohrpost schließen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/70">
          Pneumatik-Rohrpost · Kantine 26
        </div>
        <h2 className="mt-1 font-display text-xl font-bold">Versand vorbereiten</h2>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-amber-glow/80">
          Hülse einlegen, Empfänger und Code eingeben. Schicht-B-Quittungen
          gehen an die Ausgabestelle E70-K.
        </p>

        <div className="mt-4 space-y-3 font-mono-crt text-sm">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-amber-glow/60">
              Inhalt der Hülse
            </label>
            <div className="mt-1 rounded-sm border border-amber-glow/30 bg-black/40 px-2 py-1 text-amber-glow/90">
              {hasForged
                ? "Quittung 4317-K (Schicht B, fertig)"
                : "— leer — (keine versandfertige Quittung)"}
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-amber-glow/60">
              Empfänger
            </label>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full rounded-sm border border-amber-glow/30 bg-black/40 px-2 py-1 text-amber-glow"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-amber-glow/60">
              Code-Feld (vom Quittungskopf)
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="z. B. 4317-K"
              className="mt-1 w-full rounded-sm border border-amber-glow/30 bg-black/40 px-2 py-1 text-amber-glow"
            />
          </div>
          {error && (
            <div className="rounded-sm border border-red-700/60 bg-red-900/30 px-2 py-1 text-xs text-red-300">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={onSend}
            className="w-full rounded-sm border border-amber-glow/60 bg-amber-glow/15 px-3 py-2 font-display uppercase tracking-widest hover:bg-amber-glow/25"
          >
            ▸ Hülse abschicken
          </button>
        </div>
      </div>
    </div>
  );
}