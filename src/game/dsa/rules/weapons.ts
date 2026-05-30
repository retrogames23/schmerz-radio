/**
 * Standard-Waffenwerte (DSA3-kompatibel).
 *
 * Reine Spielwerte — Tabellen-Fakten, keine Regeltexte aus dem Original.
 * Wird vom Master-Prompt für Bewaffnung von NSCs und Beute genutzt.
 *
 * Felder:
 *   tp     — Trefferpunkte als (Würfel + Bonus), z. B. "1W+4"
 *   at     — AT-Modifikator (auf den AT-Basiswert des Trägers)
 *   pa     — PA-Modifikator
 *   hands  — 1 = einhändig, 2 = zweihändig
 *   reach  — kurz | mittel | lang
 *   kind   — hieb | stich | schuss | wurf
 */
export interface WeaponStats {
  id: string;
  name: string;
  tp: string;
  at: number;
  pa: number;
  hands: 1 | 2;
  reach: "kurz" | "mittel" | "lang";
  kind: "hieb" | "stich" | "schuss" | "wurf";
}

export const WEAPONS: Record<string, WeaponStats> = {
  dolch:           { id: "dolch",           name: "Dolch",            tp: "1W+1", at: 0,  pa: -1, hands: 1, reach: "kurz",   kind: "stich" },
  kurzschwert:     { id: "kurzschwert",     name: "Kurzschwert",      tp: "1W+3", at: 0,  pa:  0, hands: 1, reach: "kurz",   kind: "hieb"  },
  saebel:          { id: "saebel",          name: "Säbel",            tp: "1W+4", at: 0,  pa:  0, hands: 1, reach: "mittel", kind: "hieb"  },
  langschwert:     { id: "langschwert",     name: "Langschwert",      tp: "1W+4", at: 0,  pa:  0, hands: 1, reach: "mittel", kind: "hieb"  },
  anderthalbhand:  { id: "anderthalbhand",  name: "Anderthalbhänder", tp: "2W+2", at: 0,  pa: -1, hands: 2, reach: "lang",   kind: "hieb"  },
  zweihaender:     { id: "zweihaender",     name: "Zweihänder",       tp: "2W+4", at: -1, pa: -2, hands: 2, reach: "lang",   kind: "hieb"  },
  streitaxt:       { id: "streitaxt",       name: "Streitaxt",        tp: "1W+5", at: 0,  pa: -1, hands: 1, reach: "mittel", kind: "hieb"  },
  kriegshammer:    { id: "kriegshammer",    name: "Kriegshammer",     tp: "1W+5", at: 0,  pa: -2, hands: 1, reach: "mittel", kind: "hieb"  },
  morgenstern:     { id: "morgenstern",     name: "Morgenstern",      tp: "1W+6", at: -1, pa: -2, hands: 1, reach: "mittel", kind: "hieb"  },
  speer:           { id: "speer",           name: "Speer",            tp: "1W+3", at: 0,  pa:  0, hands: 1, reach: "lang",   kind: "stich" },
  hellebarde:      { id: "hellebarde",      name: "Hellebarde",       tp: "2W+3", at: 0,  pa: -1, hands: 2, reach: "lang",   kind: "hieb"  },
  stab:            { id: "stab",            name: "Kampfstab",        tp: "1W+2", at: 0,  pa:  1, hands: 2, reach: "lang",   kind: "hieb"  },
  keule:           { id: "keule",           name: "Keule",            tp: "1W+3", at: 0,  pa: -1, hands: 1, reach: "kurz",   kind: "hieb"  },

  wurfmesser:      { id: "wurfmesser",      name: "Wurfmesser",       tp: "1W",   at: 0,  pa:  0, hands: 1, reach: "kurz",   kind: "wurf"  },
  wurfspeer:       { id: "wurfspeer",       name: "Wurfspeer",        tp: "1W+3", at: 0,  pa:  0, hands: 1, reach: "lang",   kind: "wurf"  },
  kurzbogen:       { id: "kurzbogen",       name: "Kurzbogen",        tp: "1W+3", at: 0,  pa:  0, hands: 2, reach: "lang",   kind: "schuss"},
  langbogen:       { id: "langbogen",       name: "Langbogen",        tp: "1W+5", at: 0,  pa:  0, hands: 2, reach: "lang",   kind: "schuss"},
  armbrust:        { id: "armbrust",        name: "Armbrust",         tp: "2W+4", at: 0,  pa:  0, hands: 2, reach: "lang",   kind: "schuss"},
};

/** Kompakter Plain-Text-Block für den System-Prompt. */
export function weaponsForPrompt(): string {
  const rows = Object.values(WEAPONS).map(
    (w) => `  ${w.name.padEnd(18)} TP ${w.tp.padEnd(5)} AT${w.at >= 0 ? "+" : ""}${w.at} PA${w.pa >= 0 ? "+" : ""}${w.pa} ${w.hands}H ${w.reach}`,
  );
  return ["WAFFEN (DSA3-Standardwerte):", ...rows].join("\n");
}