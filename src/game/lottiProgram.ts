/**
 * "lotti" — Bodos Fütterungskalender für seine Katze.
 *
 * Bodo vergisst. Lotti darf das nicht. Also hat er sich vor Jahren
 * dieses Programm geschrieben: ein winziger Kalender, der für jeden
 * Tag festhält, welche Dose er aufgemacht hat, welche Sorte, und
 * was er sich dazu notiert hat. Kein Spiel, keine Animation —
 * eine Liste.
 *
 * Das Programm zählt auch den Vorrat und merkt sich, wann die
 * nächste B3-Lieferung kommt. Wenn Bodo morgens das Terminal
 * öffnet, ist das Erste, was er tippt: »lotti«. Dann »heute«.
 * Dann weiß er wieder, wer er ist.
 */

// ── Datenmodell ───────────────────────────────────────────
export type FutterSorte = "rind" | "fisch" | "trocken";

export interface FutterEintrag {
  /** Uhrzeit "HH:MM". */
  zeit: string;
  sorte: FutterSorte;
  /** Optional: Notiz, die Bodo dazu geschrieben hat. */
  notiz?: string;
}

export interface KalenderTag {
  /** "06.11." */
  datum: string;
  /** Wochentag, kurz: "Mo", "Di" … */
  wt: string;
  eintraege: FutterEintrag[];
  /** Tagesnotiz, frei. */
  notiz?: string;
  /** Nur für anzeige: Bodo war an diesem tag „nicht ganz da". */
  vergessen?: boolean;
}

export interface LottiState {
  /** Tageshistorie, neuester zuerst. Index 0 = heute. */
  tage: KalenderTag[];
  /** Vorrat in Dosen / Beuteln. */
  vorrat: Record<FutterSorte, number>;
  /** Datum der nächsten erwarteten Lieferung. */
  liefertermin: string;
  /** Beendet? */
  finished: boolean;
}

// ── Anfangszustand ────────────────────────────────────────
/**
 * Sieben Tage Historie, plus der heutige Tag (06.11.1997).
 * Manche Tage haben Lücken — Bodo hat das selber so eingetragen,
 * weil ehrlicher Kalender wichtiger ist als vollständiger Kalender.
 */
export function newLottiState(): LottiState {
  const tage: KalenderTag[] = [
    {
      datum: "06.11.",
      wt: "Do",
      eintraege: [
        { zeit: "06:40", sorte: "trocken", notiz: "anfütterung. sie wollte nicht warten." },
      ],
      notiz: "B3 wird knapp. heute mittag noch eine rind-dose, dann ist rind alle.",
    },
    {
      datum: "05.11.",
      wt: "Mi",
      eintraege: [
        { zeit: "07:10", sorte: "rind" },
        { zeit: "13:25", sorte: "trocken" },
        { zeit: "19:50", sorte: "rind", notiz: "doppelt gefressen. gut." },
      ],
    },
    {
      datum: "04.11.",
      wt: "Di",
      eintraege: [
        { zeit: "07:00", sorte: "fisch" },
        { zeit: "13:30", sorte: "rind" },
        { zeit: "20:05", sorte: "fisch", notiz: "letzte fisch-dose." },
      ],
      notiz: "fisch ist seit heute abend alle. lieferung erst freitag.",
    },
    {
      datum: "03.11.",
      wt: "Mo",
      eintraege: [
        { zeit: "06:55", sorte: "fisch" },
        { zeit: "13:10", sorte: "rind" },
        { zeit: "20:00", sorte: "rind" },
      ],
    },
    {
      datum: "02.11.",
      wt: "So",
      eintraege: [
        { zeit: "08:20", sorte: "rind", notiz: "länger geschlafen. sie war geduldig." },
        { zeit: "14:00", sorte: "fisch" },
      ],
      notiz: "abendmahlzeit vergessen?",
      vergessen: true,
    },
    {
      datum: "01.11.",
      wt: "Sa",
      eintraege: [
        { zeit: "07:05", sorte: "rind" },
        { zeit: "12:45", sorte: "trocken" },
        { zeit: "19:30", sorte: "fisch" },
      ],
    },
    {
      datum: "31.10.",
      wt: "Fr",
      eintraege: [
        { zeit: "07:00", sorte: "fisch" },
        { zeit: "13:00", sorte: "rind" },
        { zeit: "19:55", sorte: "rind" },
      ],
      notiz: "lieferung gekommen: 8x rind, 6x fisch, 2 beutel trocken.",
    },
    {
      datum: "30.10.",
      wt: "Do",
      eintraege: [
        { zeit: "07:15", sorte: "rind" },
      ],
      notiz: "den ganzen tag im flur 26 unterwegs. weiß nicht mehr, ob ich sie noch gefüttert habe.",
      vergessen: true,
    },
  ];
  return {
    tage,
    vorrat: { rind: 2, fisch: 0, trocken: 1 },
    liefertermin: "07.11. (Fr)",
    finished: false,
  };
}

// ── Anzeige-Helfer ────────────────────────────────────────
const SORTE_LABEL: Record<FutterSorte, string> = {
  rind: "rind   ",
  fisch: "fisch  ",
  trocken: "trocken",
};

const SORTE_KURZ: Record<FutterSorte, string> = {
  rind: "R",
  fisch: "F",
  trocken: "T",
};

function pad(s: string, n: number): string {
  if (s.length >= n) return s.slice(0, n);
  return s + " ".repeat(n - s.length);
}

function nowHHMM(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

const LOTTI_BANNER: string[] = [
  "── lotti · fütterungskalender v1.4 ───────────────",
  "── eigenbau, b. marschke, seit 12.10.1992 ────────",
  "",
  "»weil ich mich nicht erinnere und sie nichts sagt.«",
  "",
  "befehle:  heute · woche · geben <sorte> · notiz <text>",
  "          vorrat · liefer · hilfe · exit",
  "",
];

export function lottiStart(state: LottiState): string[] {
  return [...LOTTI_BANNER, ...renderHeute(state)];
}

function renderHeute(s: LottiState): string[] {
  const heute = s.tage[0];
  const out: string[] = [
    `── heute · ${heute.wt} ${heute.datum}1997 ─────────────────────`,
    "",
  ];
  if (heute.eintraege.length === 0) {
    out.push("  (noch keine fütterung eingetragen.)");
  } else {
    for (const e of heute.eintraege) {
      const z = `  ${e.zeit}   ${SORTE_LABEL[e.sorte]}`;
      out.push(e.notiz ? `${z}   — ${e.notiz}` : z);
    }
  }
  if (heute.notiz) {
    out.push("");
    out.push(`  notiz:  ${heute.notiz}`);
  }
  out.push("");
  out.push(
    `  vorrat:  rind ${s.vorrat.rind} · fisch ${s.vorrat.fisch} · trocken ${s.vorrat.trocken}`,
  );
  out.push(`  nächste lieferung:  ${s.liefertermin}`);
  out.push("");
  return out;
}

function renderWoche(s: LottiState): string[] {
  const out: string[] = [
    "── die letzten tage ──────────────────────────────",
    "",
    "  tag           mahlzeiten            notiz",
    "  ─────────────────────────────────────────────",
  ];
  for (const t of s.tage) {
    const slots = t.eintraege.map((e) => SORTE_KURZ[e.sorte]).join(" ");
    const slotsCol = pad(slots || "—", 22);
    const tagCol = pad(`${t.wt} ${t.datum}`, 13);
    let notiz = t.notiz ?? "";
    if (t.vergessen) notiz = (notiz ? notiz + "  " : "") + "[vergessen?]";
    if (notiz.length > 38) notiz = notiz.slice(0, 35) + "…";
    out.push(`  ${tagCol} ${slotsCol} ${notiz}`);
  }
  out.push("");
  out.push("  legende:  R = rind   F = fisch   T = trocken");
  out.push("");
  return out;
}

function renderVorrat(s: LottiState): string[] {
  const lines: string[] = [
    "── vorrat ────────────────────────────────────────",
    "",
    `  rind          ${s.vorrat.rind} dose${s.vorrat.rind === 1 ? "" : "n"}`,
    `  fisch         ${s.vorrat.fisch} dose${s.vorrat.fisch === 1 ? "" : "n"}`,
    `  trocken       ${s.vorrat.trocken} beutel`,
    "",
    `  nächste lieferung:  ${s.liefertermin}`,
    "",
  ];
  if (s.vorrat.rind + s.vorrat.fisch <= 2) {
    lines.push("  ⚠  knapp. vor freitag sparsam einteilen.");
    lines.push("");
  }
  return lines;
}

function renderLiefer(s: LottiState): string[] {
  return [
    "── lieferung ─────────────────────────────────────",
    "",
    `  nächste B3-lieferung:    ${s.liefertermin}`,
    "  ansprechpartner:         ZENTRAL.NETZ / Beschaffung",
    "  letzte lieferung:        31.10. (Fr)  · 8x rind · 6x fisch · 2 beutel trocken",
    "",
    "  hinweis (eigenbau): wenn lieferung 2 tage überfällig:",
    "         lobby anrufen, NICHT die zentrale.",
    "         (lobby ist langsamer, aber sie kommen.)",
    "",
  ];
}

// ── Kommandos ─────────────────────────────────────────────
export interface LottiResult {
  out: string[];
  quit?: boolean;
}

const HILFE: string[] = [
  "befehle:",
  "  heute                — heutige fütterungen anzeigen",
  "  woche                — die letzten tage als tabelle",
  "  geben <sorte>        — fütterung eintragen",
  "                         (sorten: rind, fisch, trocken)",
  "  notiz <text>         — eine zeile an heute anhängen",
  "  vorrat               — aktueller bestand",
  "  liefer               — nächste lieferung",
  "  hilfe                — diese liste",
  "  exit                 — programm beenden",
  "",
];

export function lottiCommand(state: LottiState, input: string): LottiResult {
  const raw = input.trim();
  if (!raw) return { out: [] };
  const lower = raw.toLowerCase();
  const tokens = raw.split(/\s+/);
  const head = (tokens[0] ?? "").toLowerCase();
  const argLower = (tokens[1] ?? "").toLowerCase();
  const restRaw = tokens.slice(1).join(" ");

  if (head === "exit" || head === "quit" || head === "logout" || head === "ende") {
    return {
      out: ["kalender geschlossen. lotti weiß bescheid."],
      quit: true,
    };
  }

  if (head === "hilfe" || head === "help" || head === "?") {
    return { out: HILFE };
  }

  if (head === "heute" || lower === "today") {
    return { out: renderHeute(state) };
  }

  if (head === "woche" || head === "week") {
    return { out: renderWoche(state) };
  }

  if (head === "vorrat" || head === "stock") {
    return { out: renderVorrat(state) };
  }

  if (head === "liefer" || head === "lieferung" || head === "delivery") {
    return { out: renderLiefer(state) };
  }

  if (head === "geben" || head === "feed") {
    if (!argLower) {
      return {
        out: [
          "geben: sorte fehlt. bitte: »geben rind« · »geben fisch« · »geben trocken«",
          "",
        ],
      };
    }
    let sorte: FutterSorte | null = null;
    if (argLower.startsWith("r")) sorte = "rind";
    else if (argLower.startsWith("f")) sorte = "fisch";
    else if (argLower.startsWith("t")) sorte = "trocken";
    if (!sorte) {
      return {
        out: [
          `geben: »${tokens[1]}« kenne ich nicht. (sorten: rind, fisch, trocken)`,
          "",
        ],
      };
    }
    if (state.vorrat[sorte] <= 0) {
      return {
        out: [
          `geben: kein ${sorte} mehr im vorrat.`,
          `       nächste lieferung: ${state.liefertermin}`,
          "       lotti schaut den napf an, dann dich. bekannt.",
          "",
        ],
      };
    }
    state.vorrat[sorte] -= 1;
    const heute = state.tage[0];
    heute.eintraege.push({ zeit: nowHHMM(), sorte });
    return {
      out: [
        `eingetragen: ${nowHHMM()}  ${SORTE_LABEL[sorte].trim()}`,
        `vorrat ${sorte}: jetzt ${state.vorrat[sorte]} dose${state.vorrat[sorte] === 1 ? "" : "n"}.`,
        "",
        ...renderHeute(state),
      ],
    };
  }

  if (head === "notiz" || head === "note") {
    const text = restRaw.trim();
    if (!text) {
      return {
        out: [
          "notiz: text fehlt. bitte: »notiz <was du dir merken willst>«",
          "",
        ],
      };
    }
    const heute = state.tage[0];
    heute.notiz = heute.notiz ? `${heute.notiz}  /  ${text}` : text;
    return {
      out: [
        "notiert.",
        "",
        ...renderHeute(state),
      ],
    };
  }

  // Kleines Eigenbau-Easteregg: wenn man "lotti" tippt, antwortet das
  // Programm mit einem leisen Satz, weil Bodo das so wollte.
  if (head === "lotti") {
    return {
      out: [
        "lotti ist nicht im programm. lotti ist im sessel.",
        "(das programm weiß den unterschied.)",
        "",
      ],
    };
  }

  return {
    out: [
      `unbekannter befehl: »${raw}«. tippe »hilfe«.`,
      "",
    ],
  };
}

// ── Tab-Completion ────────────────────────────────────────
const LOTTI_COMMANDS = [
  "heute",
  "woche",
  "geben",
  "notiz",
  "vorrat",
  "liefer",
  "hilfe",
  "exit",
];

const GEBEN_SORTEN = ["rind", "fisch", "trocken"];

function lcp(strs: string[]): string {
  if (!strs.length) return "";
  let p = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(p) !== 0) {
      p = p.slice(0, -1);
      if (!p) return "";
    }
  }
  return p;
}

export interface LottiCompleteResult {
  newInput: string;
  matches: string[];
}

export function lottiComplete(input: string): LottiCompleteResult {
  const tokens = input.split(/\s+/);
  const last = (tokens[tokens.length - 1] ?? "").toLowerCase();

  // Erstes Token: Befehl
  if (tokens.length <= 1) {
    const matches = LOTTI_COMMANDS.filter((c) => c.startsWith(last));
    if (!matches.length) return { newInput: input, matches: [] };
    const completed = lcp(matches);
    const newLast = matches.length === 1 ? matches[0] + " " : completed;
    return { newInput: newLast, matches };
  }

  // Zweites Token: bei `geben` die Sorten
  const head = tokens[0].toLowerCase();
  if (head === "geben" && tokens.length === 2) {
    const matches = GEBEN_SORTEN.filter((s) => s.startsWith(last));
    if (!matches.length) return { newInput: input, matches: [] };
    const completed = lcp(matches);
    const newLast = matches.length === 1 ? matches[0] + " " : completed;
    const newInput = [tokens[0], newLast].join(" ");
    return { newInput, matches };
  }

  return { newInput: input, matches: [] };
}
