/**
 * Zentrale DSA-Rechtshinweise.
 *
 * Grundlage: persönliche Genehmigung von Ulisses Spiele (Jan Wagner,
 * E-Mail Juni 2026) zur Nutzung der DSA-Regelmechanik in einem
 * nicht-kommerziellen Fan-Projekt; Welt-Inhalte werden lediglich
 * atmosphärisch referenziert. Wortlaut ORC-sinngemäß.
 *
 * Diese Datei ist die EINZIGE Quelle der Wahrheit für den
 * Attribution-Text. Wenn sich der Text ändert (z. B. weil Ulisses
 * eine offizielle ORC-Variante für DSA bereitstellt), nur HIER
 * anpassen — alle Anzeigeorte ziehen automatisch nach.
 */

export const DSA_ATTRIBUTION_HEADLINE =
  "DSA — Nutzung mit freundlicher Genehmigung der Ulisses Spiele GmbH";

/** Mehrere Absätze; jedes Element wird als eigener Paragraph gerendert. */
export const DSA_ATTRIBUTION_PARAGRAPHS: readonly string[] = [
  "Schmerz-Radio ist ein rein privates, nicht-kommerzielles Fan-Projekt und steht in keiner offiziellen Verbindung zur Ulisses Spiele GmbH.",
  "Die im DSA-Modus verwendeten Spielmechaniken (Proben, Eigenschaften, Talente, Kampfregeln, Zauber, Liturgien etc.) basieren auf dem Regelwerk \u201EDas Schwarze Auge\u201C (DSA) und werden hier mit freundlicher Genehmigung der Ulisses Spiele GmbH (Waldems) genutzt — ausdrücklich beschränkt auf die nicht-kommerzielle Verwendung.",
  "DAS SCHWARZE AUGE, AVENTURIEN, DERE, MYRANOR, THARUN, UTHURIA, RIESLAND und THE DARK EYE sind eingetragene Marken der Significant Fantasy Medienrechte GbR bzw. der Ulisses Spiele GmbH. Welt-Inhalte (Götter, Regionen, Völker, Persönlichkeiten Aventuriens etc.) sind Eigentum der jeweiligen Rechteinhaber und werden hier nur atmosphärisch referenziert, nicht eins zu eins vervielfältigt. Es werden keine offiziellen Texte oder Grafiken aus DSA-Publikationen übernommen.",
  "Schmerz-Radio ist und bleibt kostenlos spielbar. Freiwillige Unterstützungsbeiträge (\u201ETrinkgeld\u201C) sind kein Entgelt für das Spiel oder dessen DSA-Anteile, sondern decken ausschließlich die laufenden Cloud- und KI-Kosten.",
] as const;

/** Kompakte Ein-Satz-Variante für sehr enge Stellen (z. B. Footer). */
export const DSA_ATTRIBUTION_SHORT =
  "DSA-Regelmechanik mit freundlicher Genehmigung der Ulisses Spiele GmbH — nicht-kommerzielles Fan-Projekt. \u201EDas Schwarze Auge\u201C, \u201EAventurien\u201C und \u201EDere\u201C sind eingetragene Marken der jeweiligen Rechteinhaber.";