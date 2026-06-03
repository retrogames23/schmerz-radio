export interface DsaBfTimeAnchor {
  year: number;
  yearsAfter20Hal: number;
  yearsAfter1Hal: number;
  relationTo20Hal: string;
  relationTo1Hal: string;
  halNote: string;
}

export function makeBfTimeAnchor(year: number): DsaBfTimeAnchor {
  const yearsAfter20Hal = year - 1012;
  const yearsAfter1Hal = year - 993;
  const relationTo20Hal = yearsAfter20Hal === 0
    ? "genau im Jahr 20 Hal (= 1012 BF)"
    : yearsAfter20Hal > 0
      ? `${yearsAfter20Hal} Jahre nach 20 Hal (= 1012 BF)`
      : `${Math.abs(yearsAfter20Hal)} Jahre vor 20 Hal (= 1012 BF)`;
  const relationTo1Hal = yearsAfter1Hal === 0
    ? "genau im Jahr 1 Hal (= 993 BF)"
    : yearsAfter1Hal > 0
      ? `${yearsAfter1Hal} Jahre nach 1 Hal (= 993 BF)`
      : `${Math.abs(yearsAfter1Hal)} Jahre vor 1 Hal (= 993 BF)`;
  const halNote = year >= 993 && year <= 1012
    ? `Innerhalb von Hals Regierungszeit entspricht das ${year - 992} Hal.`
    : "Nicht als Hal-Jahr ausdrücken; Kaiser Hal regiert hier nicht plausibel weiter.";
  return { year, yearsAfter20Hal, yearsAfter1Hal, relationTo20Hal, relationTo1Hal, halNote };
}

export function formatBfTimeAnchor(year: number): string {
  const anchor = makeBfTimeAnchor(year);
  return [
    `ZEITANKER — ${anchor.year} BF`,
    `${anchor.year} BF liegt ${anchor.relationTo20Hal}.`,
    `${anchor.year} BF liegt außerdem ${anchor.relationTo1Hal}.`,
    anchor.halNote,
    `BF bedeutet "nach Bosparans Fall", nicht "nach Gründung".`,
  ].join("\n");
}

export function extractBfYears(text: string | null | undefined): number[] {
  if (!text) return [];
  const years: number[] = [];
  const seen = new Set<number>();
  const re = /\b([1-9]\d{2,3})\s*(?:BF|B\.?\s*F\.?|nach\s+Bosparans\s+Fall)\b/gi;
  for (const match of text.matchAll(re)) {
    const year = Number.parseInt(match[1], 10);
    if (!Number.isFinite(year) || year <= 0 || year >= 10000 || seen.has(year)) continue;
    seen.add(year);
    years.push(year);
  }
  return years;
}

export function buildBfTimeAnchorPrompt(text: string | null | undefined): string {
  const years = extractBfYears(text).slice(0, 3);
  if (years.length === 0) return "";
  const anchors = years.map(formatBfTimeAnchor).join("\n\n");
  return `
SPIELERWUNSCH-ZEITANKER — SERVERSEITIG BERECHNET, NICHT SCHÄTZEN:
${anchors}

  PFLICHT: Übernimm diese Jahresdifferenzen wörtlich. Nenne keine abweichende
  Kopfrechen-Schätzung wie "etwa 110 Jahre". Wenn du weitere Jahresrechnungen
  brauchst, nutze dsaLore({ topic: "zeitrechnung.bf.<jahr>" }).`;
}