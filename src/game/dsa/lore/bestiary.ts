/**
 * Bestiarium-Lite — pro `ENEMY_STATS`-ID 1–2 Zeilen Lore-Hintergrund.
 * Wird dem Master nur als Referenz mitgegeben, damit Kämpfe nicht in
 * generisches "Gegner X greift an" abdriften.
 */

export const DSA_BESTIARY: Record<string, string> = {
  wegelagerer_anfuehrer:
    "Ehemalige Söldner aus dem Orkenkrieg, jetzt arbeitslos und auf Reichsstraßen unterwegs. Anführer mit Brief und Siegel — kennen Strecke und Beute.",
  wegelagerer_armbrust:
    "Bauernbursche, der seine erste Armbrust für drei Dukaten gekauft hat. Spannt langsam, zielt schlecht, trifft trotzdem manchmal.",
  wegelagerer_stab:
    "Tagelöhner mit Hartholzknüppel. Schlägt wuchtig, pariert miserabel. Erste Reihe der Wegelagerer-Bande, oft Kanonenfutter.",
  glatzkopf:
    "Bordell-Rausschmeißer oder Hafenarbeiter, der Faustkämpfe für Geld liefert. Schmerzunempfindlich, langsam, brutal. Bei Wut taub für Verhandlung.",
  spiegelhueter:
    "Magisch geschaffenes Trugbild aus dem Spiegel selbst — kein lebendes Wesen. Spricht mit der Stimme dessen, der ihm gegenüber steht. Stirbt mit dem Spiegel, nicht durch Klinge.",
  spiegelhueter_zornig:
    "Hüter im Stadium des Zorns — der Spiegel wurde geschändet. Greift aggressiv, pariert hart, kennt keine Gnade.",
  spiegelhueter_milde:
    "Hüter im Stadium der Versöhnung — er kämpft, weil er muss, nicht weil er will. Pariert öfter, weicht aus, lässt sich überreden, wenn der Spiegel respektiert wird.",
  sumpfwurm:
    "Riesenwurm aus den Echsensümpfen Echasarra oder dem Bornischen Sumpf — schleimig, langsam, frisst alles. Schwacher RS, viel LE. Frisst Verwundete bei lebendigem Leib.",
  bandit_revenant:
    "Wiedergänger eines getöteten Wegelagerers — Boron hat ihn nicht eingelassen, weil eine alte Tat ungesühnt blieb. Kämpft mit der Wut des Bestohlenen, blutet nicht.",
};

export function buildBestiaryBlock(enemyIds: string[]): string {
  const lines = enemyIds
    .map((id) => (DSA_BESTIARY[id] ? `  • ${id}: ${DSA_BESTIARY[id]}` : null))
    .filter((x): x is string => x !== null);
  if (lines.length === 0) return "";
  return [
    `BESTIARIUM (Lore-Hintergrund verfügbarer Gegner für dieses Abenteuer):`,
    ...lines,
  ].join("\n");
}