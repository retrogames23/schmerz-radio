/**
 * SillyTavern-inspirierter "World Info"/Lorebook-Layer.
 *
 * Ziel: Welt-Konsistenz erhöhen, ohne den statischen System-Prompt
 * weiter aufzublähen. Pro Wende wird ein kleiner, kontextgetriebener
 * Block VOR dem dynamischen State-Block eingespielt.
 *
 *  - `mode: "constant"`  → IMMER drin (z. B. Geo-Sanity gegen
 *    Klassiker wie "die Trollberge bei Greifenfurt").
 *  - `mode: "selective"` → nur wenn in den letzten N Nachrichten
 *    (Standard 6) ein Trigger-Keyword fällt (Stadt, Gott, Orden).
 *
 * Der Block wird kein zusätzlicher Tool-Call: alles passiert
 * deterministisch im Worker, keine Latenz, keine Extra-Tokens für
 * den dsaLore-Aufruf. Der bestehende `dsaLore`-Mechanismus bleibt
 * als Fallback für Detail-Lookups erhalten.
 */

import { DSA_GODS } from "./gods";

const DEFAULT_SCAN_DEPTH = 6;
/** ca. 600 Tokens hartes Budget für den gesamten WorldInfo-Block. */
const DEFAULT_TOKEN_BUDGET = 600;

export interface WorldInfoEntry {
  id: string;
  /** Case-insensitive substring-Trigger; ein Treffer reicht. Ignoriert für constant-Einträge. */
  keywords: string[];
  content: string;
  /** Höher = wird bei knappem Budget bevorzugt eingespielt. */
  priority: number;
  mode: "selective" | "constant";
  /** Optionaler Override (default 6). */
  scanDepth?: number;
}

/** Faustregel-Konversion Zeichen → Tokens (analog zum bestehenden Cost-Log). */
function approxTokens(text: string): number {
  return Math.round(text.length / 3.5);
}

// ───────────────────────────────────────────────────────────────
// CONSTANT — Geografie-Sanity (A2). Bewusst kurz; harte Fakten,
// die wir empirisch immer wieder in Modell-Halluzinationen sahen.
// ───────────────────────────────────────────────────────────────

const GEO_SANITY: WorldInfoEntry = {
  id: "geo.sanity",
  keywords: [],
  mode: "constant",
  priority: 1000,
  content: `### GEOGRAFIE-SANITY (immer beachten)
- **Trollzacken:** Hochgebirge im NORDOSTEN Aventuriens, Grenze zum Orkland. Hunderte Meilen von Greifenfurt entfernt. Es gibt KEINE "Trollberge" — der Name ist falsch.
- **Greifenfurt:** Markgrafschaft im NORDWESTEN, Orkfront, weit weg von den Trollzacken.
- **Gareth:** Zentrum des Mittelreichs, Hauptstadt.
- **Punin:** SÜDWESTEN, Hesinde-Stadt, Magierakademie.
- **Festum:** NORDOSTEN, Bornland-Hauptstadt, Hafen an der Bornsee.
- **Khunchom:** SÜDOSTEN, Tulamidenlande, Handelsstadt.
- **Al'Anfa:** tiefer SÜDEN, Sklavenstadt am Meer der Sieben Winde.
- **Thorwal:** NORDWESTEN, Hafen, Hetfrau Otta.
- **Vinsalt:** SÜDWESTEN, Hauptstadt Horasreich.
- **Reisezeiten:** Zwischen zwei Großstädten WOCHEN, nicht Tage. Pferd ≈ 40 Meilen/Tag, Fußmarsch ≈ 20.
- **VERBOTEN:** Bahnen, Magnetkompasse, Postkutschen-Linien, "schnelle Reise".`,
};

// ───────────────────────────────────────────────────────────────
// SELECTIVE — Städte. Ein kompaktes Stimmungs-/Fakten-Snippet pro
// Großstadt. Bewusst kürzer als der volle `region.*`-Lookup im
// dsaLore-Tool — das ist die "Lufthülle" für Konsistenz; Details
// holt sich der Meister bei Bedarf weiter über das Tool.
// ───────────────────────────────────────────────────────────────

const CITY_ENTRIES: WorldInfoEntry[] = [
  {
    id: "city.gareth",
    keywords: ["gareth", "garether"],
    mode: "selective",
    priority: 500,
    content: `**GARETH** — Hauptstadt des Mittelreichs, ca. 90.000 Einwohner. Größte Praios-Basilika Aventuriens. Kronprinz Brin regiert als Reichsbehüter (Kaiser Hal verschwunden). Stadtmauer, Garnisonen, Diebesviertel "Südquartier", Tempelviertel oben am Berg. Anrede streng nach Stand. Phex-Diebesgilde aktiv im Schatten.`,
  },
  {
    id: "city.punin",
    keywords: ["punin", "puniner"],
    mode: "selective",
    priority: 500,
    content: `**PUNIN** — Stadt der Hesinde im Südwesten, Almada-Grenze. Sitz der größten Hesinde-Akademie. Magier in offiziellen Roben mit Akademie-Siegel sind hier normal, nicht verdächtig. Bibliotheken, Schreibstuben, Schlangentempel. Praios-Inquisition zwar zugegen, aber zurückhaltend — Hesinde hat lokal mehr Gewicht. Wein aus Almada, Olivenhaine vor der Stadt.`,
  },
  {
    id: "city.greifenfurt",
    keywords: ["greifenfurt", "greifenfurter"],
    mode: "selective",
    priority: 600,
    content: `**GREIFENFURT** — Markgrafschaft im Nordwesten, mitten an der Orkfront. Halb zerstört, halb umkämpft. Heerlager, Flüchtlinge, Rondra-Geweihte, Boron-Geweihte für die vielen Toten. Pferde sind selten (oft geraubt), Brot knapp. Orkstreifscharen können jederzeit aus den Wäldern brechen. NICHT bei den Trollzacken — die liegen weit östlich.`,
  },
  {
    id: "city.festum",
    keywords: ["festum", "festumer", "bornland"],
    mode: "selective",
    priority: 500,
    content: `**FESTUM / BORNLAND** — Nordosten Aventuriens, Hafen an der Bornsee. Bornländer reden derb-direkt, trinken Branntwein, lieben Bären und schwere Pelze. Adel mit slawisch klingenden Namen (Praiogor, Rondrigan, Tsajana). Travia (Heim) und Firun (Kälte, Jagd) stark verehrt. Goblins und Wolfsrudel in den Wäldern.`,
  },
  {
    id: "city.khunchom",
    keywords: ["khunchom", "tulamid", "tulamiden", "novadis"],
    mode: "selective",
    priority: 500,
    content: `**KHUNCHOM / TULAMIDENLANDE** — Südosten, Handelsstadt der Tulamiden am Mhanadi. Basare, Schlangenbeschwörer, gewundene Gassen, Kuppeldächer. Anrede "Effendi" (Hoher Herr), "Sahib"/"Lalla" (Meister/Meisterin). Sultane, Emire, Kalifen werden blumig angeredet. Zwölfgötter mischen sich hier mit dem Rastullah-Glauben des Khôm-Südens — Streit ist real.`,
  },
  {
    id: "city.alanfa",
    keywords: ["al'anfa", "alanfa", "al anfa", "alanfaner"],
    mode: "selective",
    priority: 600,
    content: `**AL'ANFA** — tiefer Süden, schwarzgraue Hafenstadt am Meer der Sieben Winde. Größter Sklavenmarkt Aventuriens. Boron-Patriarch herrscht mit eiserner Hand ("Euer Hochwürdigste Erhabenheit"). Schwarzgewandete Patrizierfamilien, vergiftete Becher, schwüle Hitze, Mangroven, krokodilbewohnte Lagunen. Magier sind hier weniger frei als in Punin — Boron-Klerus duldet keine Konkurrenz.`,
  },
  {
    id: "city.thorwal",
    keywords: ["thorwal", "thorwaler", "hjaldingsche"],
    mode: "selective",
    priority: 500,
    content: `**THORWAL** — Nordwesten, Hafenstadt am Thorwaler Meer. Hetfrau Otta herrscht — keine Adelstitel, Anrede mit Name und Abstammung ("Alrik, Sohn des Alrik"). Drachenboote (Ottajasko), Met, Walfang. Verehrt SWAFNIR (Sohn des Efferd, in Walgestalt) — eigene Priesterschaft. Praios spielt hier KEINE Rolle, Travia ja.`,
  },
  {
    id: "city.vinsalt",
    keywords: ["vinsalt", "horasreich", "horasisch", "almada", "methumis"],
    mode: "selective",
    priority: 500,
    content: `**VINSALT / HORASREICH** — Südwesten. Höfisches Aventurien: Maskenbälle, Comto/Comtessa als Anrede, Wein in Strömen, Etikette tödlich genau. Vendetta unter Adelshäusern. Markgraf hier "Euer Erlaucht", Magier "Hochgelehrter Herr". Politischer Konkurrent zu Gareth — Spione in jedem Saal.`,
  },
  {
    id: "city.maraskan",
    keywords: ["maraskan", "rur", "gror"],
    mode: "selective",
    priority: 500,
    content: `**MARASKAN** — tropische Insel im Osten, dauerhafter Aufstand gegen das Mittelreich. Maraskani verehren den Doppelgott Rur und Gror (Schöpfung/Zerstörung), nicht die Zwölfgötter. Dschungel, Reisterrassen, Krokodile, vergiftete Pfeile. Mittelreichische Garnisonen werden regelmäßig überfallen.`,
  },
];

// ───────────────────────────────────────────────────────────────
// SELECTIVE — Götter (A3). Wenn ein Gottesname fällt, schießen
// wir das knappe Profil rein, statt zu hoffen, dass der Meister
// `dsaLore({topic:'gott.*'})` aufruft.
// ───────────────────────────────────────────────────────────────

const GOD_ENTRIES: WorldInfoEntry[] = Object.values(DSA_GODS).map((g) => ({
  id: `god.${g.id}`,
  // Beiname + Name. "Swafnir" o. ä. fängt durch city.thorwal.
  keywords: [g.name.toLowerCase(), `${g.name.toLowerCase()}-`, `${g.name.toLowerCase()}geweiht`],
  mode: "selective",
  priority: 400,
  content: `**${g.name.toUpperCase()}** (${g.beiname}) — ${g.domain}. Symbol: ${g.symbol}. Tabus: ${g.tabus} Anrede/Gruß: ${g.greetingNote}`,
}));

// ───────────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────────

const ALL_ENTRIES: WorldInfoEntry[] = [
  GEO_SANITY,
  ...CITY_ENTRIES,
  ...GOD_ENTRIES,
];

export interface SelectWorldInfoArgs {
  /** Komplette History (oder neueste Nachrichten); wir nutzen nur die letzten `depth` Einträge. */
  recentMessages: { role: string; content: string }[];
  /** Zusätzlicher Freitext, den wir zum Scan-Pool werfen (z. B. Setting-Hint oder Wish-Brief). */
  extraScanText?: string;
  depth?: number;
  tokenBudget?: number;
}

export interface WorldInfoResult {
  block: string;
  activatedIds: string[];
  approxTokens: number;
}

/**
 * Wählt aktive WorldInfo-Einträge aus. Constants sind immer drin,
 * Selectives nur bei Keyword-Treffer in den letzten `depth` Nachrichten.
 * Bei Budget-Überschreitung werden niedrig-priorisierte Einträge
 * verworfen (Constants haben mit prio 1000 quasi immer Vorrang).
 */
export function selectActiveWorldInfo(args: SelectWorldInfoArgs): WorldInfoResult {
  const depth = args.depth ?? DEFAULT_SCAN_DEPTH;
  const budget = args.tokenBudget ?? DEFAULT_TOKEN_BUDGET;

  const scanPool = [
    ...(args.recentMessages.slice(-depth).map((m) => m.content)),
    args.extraScanText ?? "",
  ]
    .join("\n")
    .toLowerCase();

  const matched: WorldInfoEntry[] = [];
  for (const entry of ALL_ENTRIES) {
    if (entry.mode === "constant") {
      matched.push(entry);
      continue;
    }
    const hit = entry.keywords.some((kw) => kw && scanPool.includes(kw.toLowerCase()));
    if (hit) matched.push(entry);
  }

  // Nach Priorität sortieren (höhere zuerst), dann Budget kappen.
  matched.sort((a, b) => b.priority - a.priority);

  const kept: WorldInfoEntry[] = [];
  let used = 0;
  for (const e of matched) {
    const cost = approxTokens(e.content);
    if (used + cost > budget && e.mode !== "constant") break;
    kept.push(e);
    used += cost;
  }

  if (kept.length === 0) {
    return { block: "", activatedIds: [], approxTokens: 0 };
  }

  const body = kept.map((e) => e.content).join("\n\n");
  const block = `### WELT-KONTEXT (kontextgetriggert, immer beachten)

${body}`;

  return {
    block,
    activatedIds: kept.map((e) => e.id),
    approxTokens: approxTokens(block),
  };
}

/** Nur zum Test/Debug verfügbar gemacht. */
export const _WORLD_INFO_ENTRIES = ALL_ENTRIES;