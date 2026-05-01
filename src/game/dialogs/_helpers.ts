import type { GameApi } from "../types";

/**
 * Weg C zum Serverraum 5610: Sobald drei Philippe-Sondierungs-Notizen
 * gesetzt sind, hat Layard genug Andeutungen, um sich Bodos zweite
 * Wartungskarte aus der Werkbank zu holen. Das Item öffnet später am
 * Kartenleser die Tür 5610. (Item-ID bleibt aus Save-Kompatibilität
 * "wartungsnotiz5610".)
 * Wird aus den onEnd-Callbacks aller fünf Sonden aufgerufen.
 */
export function maybeGiveWartungsnotiz5610(api: GameApi) {
  const probes =
    (api.hasFlag("philippeProbeNote1") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote2") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote3") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote4") ? 1 : 0) +
    (api.hasFlag("philippeProbeNote5") ? 1 : 0);
  if (probes >= 3 && !api.hasItem("wartungsnotiz5610")) {
    api.addItem({
      id: "wartungsnotiz5610",
      name: "Wartungskarte (E67 · Korridor 56)",
      description:
        "Eine abgegriffene blaue Plastikkarte aus Bodos zweiter Schublade. Auf der Rückseite mit Bleistift: »5610 · nur Bodo«. Öffnet den Kartenleser an der Wartungstür im Korridor 56.",
    });
  }
}
