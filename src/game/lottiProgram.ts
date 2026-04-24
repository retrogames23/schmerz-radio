/**
 * "lotti" — Bodos winziges Begleitprogramm für seine Katze Lotti.
 * Geschrieben hat er es vor Jahren auf einem stillen Sonntag, als
 * Lotti nicht wach werden wollte und er sich nicht traute,
 * sie anzufassen. Seitdem startet er es jeden Morgen.
 *
 * Das Programm ist absichtlich anspruchslos. Bodo wollte
 * keine Sensation. Er wollte nur jemanden, mit dem er
 * sich kurz austauscht, bevor der Korridor anfängt.
 */

export interface LottiState {
  /** 0–10. Voll = 10. Sinkt nicht in Echtzeit (das wäre grausam). */
  satt: number;
  /** 0–10. */
  zufrieden: number;
  /** 0–10. Schlaf. */
  müde: number;
  /** Was Lotti gerade tut, frei formulierter Text. */
  status: string;
  /** Beendet? */
  finished: boolean;
}

export function newLottiState(): LottiState {
  return {
    satt: 6,
    zufrieden: 7,
    müde: 4,
    status: "schläft auf der decke. atmet langsam.",
    finished: false,
  };
}

const LOTTI_BANNER: string[] = [
  "── lotti v0.3 ────────────────────────────────",
  "── eigenbau, b. marschke, sonntag 12.10.1992 ──",
  "",
  "lotti ist ein programm und eine katze.",
  "wenn die katze nicht da ist, ist das programm da.",
  "",
  "befehle: status, füttern, streicheln, rufen,",
  "         schlafen, foto, geschichte, hilfe, exit",
  "",
];

export function lottiStart(state: LottiState): string[] {
  return [...LOTTI_BANNER, ...lottiStatus(state)];
}

function bar(value: number): string {
  const v = Math.max(0, Math.min(10, Math.round(value)));
  return "█".repeat(v) + "░".repeat(10 - v);
}

function lottiStatus(s: LottiState): string[] {
  return [
    "── lotti, jetzt ──────────────────────────────",
    `  satt        [${bar(s.satt)}]  ${s.satt}/10`,
    `  zufrieden   [${bar(s.zufrieden)}]  ${s.zufrieden}/10`,
    `  müde        [${bar(s.müde)}]  ${s.müde}/10`,
    "",
    `  → ${s.status}`,
    "",
  ];
}

const FÜTTER_TEXTE = [
  "lotti hebt den kopf. langsam. dann steht sie auf,",
  "schlurft zum napf, schaut hinein, schaut hoch,",
  "schaut wieder hinein. frisst.",
  "(rind-äquivalent. das mag sie.)",
];

const FÜTTER_LEER = [
  "der napf ist leer und du hast keine dose mehr.",
  "lotti weiß das. sie schaut dich an, als wäre",
  "es deine schuld. (es ist deine schuld.)",
];

const STREICHEL_TEXTE = [
  "du legst die hand auf ihren rücken. sie wird kurz",
  "steif, dann weich. unter den fingern fängt etwas",
  "an zu summen. das ist die einzige stelle in",
  "dieser wohnung, an der etwas summt, das kein",
  "computer ist.",
];

const RUF_TEXTE = [
  "»lotti.« — sie reagiert nicht.",
  "»lotti?« — ein ohr dreht sich. mehr nicht.",
  "»lotti, komm.« — sie steht auf, geht in die",
  "andere richtung. das ist die antwort.",
];

const SCHLAF_TEXTE = [
  "du löschst das licht. lotti rollt sich enger",
  "auf der decke zusammen. du auch, in deinem",
  "stuhl, in deinem korridor, in deinem dienstgrad.",
  "morgen ist auch noch ein tag. dafür gibt es",
  "keinen beweis, aber lotti glaubt es, und das",
  "reicht meistens.",
];

const FOTO_TEXTE = [
  "── ascii-foto, mai 1993 ─────────────────────",
  "        /\\_/\\  ",
  "       ( o.o )  ",
  "        > ^ <  ",
  "    ___________",
  "(handgemalt. lotti hat das original zerkratzt.)",
];

const GESCHICHTEN = [
  [
    "── die geschichte, wie lotti hier eingezogen ist ──",
    "",
    "1983, korridor 26, etage 6. eine katze sitzt",
    "vor tür 2612 und schaut die wand an, als ob",
    "die wand etwas schuldete. ich öffne. sie geht",
    "rein. sie geht nicht wieder.",
    "",
    "die leitstelle hat sie nie eingetragen.",
    "ich auch nicht.",
  ],
  [
    "── die geschichte, wie lotti die nachtschicht überlebt ──",
    "",
    "während der träger 1991 noch manuell nachgeregelt",
    "wurde, saß sie auf dem oszilloskop. wenn die",
    "kurve unsauber wurde, schlug sie mit dem schwanz",
    "auf den schirm. ich habe es nie überprüft, aber",
    "ich glaube, sie konnte 104,6 hören, bevor das",
    "gerät es konnte.",
  ],
  [
    "── die geschichte, wie lotti einmal verschwunden war ──",
    "",
    "drei tage. ich habe nichts gegessen. dann saß",
    "sie wieder auf der decke, als wäre sie nie weg.",
    "ich habe sie nicht gefragt. ich habe nur",
    "rind-äquivalent geöffnet und mich neben sie",
    "gesetzt. sie hat gefressen, dann hat sie",
    "geschnurrt. ich glaube, das war eine entschuldigung.",
  ],
];

/**
 * Bodos Programm hat einen kleinen Geheim-Befehl: »lotti, sag was«.
 * Wenn er nicht mehr weiterweiß, tippt er das. Das Programm
 * antwortet mit einem zufälligen Satz aus seinen eigenen Notizen,
 * die er beim Schreiben hineingelegt hat. Manche Sätze hat er
 * vergessen, dass er sie geschrieben hat.
 */
const SAG_WAS_TEXTE = [
  "»du bist nicht alleine, b. ich bin auch nur",
  "  ein programm, aber ich bin hier.«",
  "»der korridor ist nicht das ganze haus.«",
  "»wenn du heute morgen nicht weißt, wofür:",
  "  für mich.«",
  "»nicht jede stille muss aufgefüllt werden.«",
  "»du hast 1991 niemandem davon erzählt. das",
  "  ist ok. ich weiß es trotzdem.«",
];

let geschichteIdx = 0;

export interface LottiResult {
  out: string[];
  quit?: boolean;
}

export function lottiCommand(state: LottiState, input: string): LottiResult {
  const raw = input.trim().toLowerCase();
  const tokens = raw.split(/\s+/);
  const head = tokens[0] ?? "";

  if (!raw) return { out: [] };

  if (head === "exit" || head === "quit" || head === "logout" || head === "ende") {
    return {
      out: [
        "lotti dreht sich noch einmal um. dann schließt",
        "das programm sich selbst. (so hat er es geschrieben.)",
      ],
      quit: true,
    };
  }

  if (head === "hilfe" || head === "help" || head === "?") {
    return {
      out: [
        "befehle:",
        "  status         — wie geht es ihr",
        "  füttern        — eine dose B3 öffnen",
        "  streicheln     — kurz die hand auflegen",
        "  rufen          — sie beim namen rufen",
        "  schlafen       — licht aus, programm ruht",
        "  foto           — ascii-bild von 1993",
        "  geschichte     — eine erinnerung erzählen",
        "  exit           — programm beenden",
        "",
        "  (geheim: »sag was«)",
      ],
    };
  }

  if (head === "status") {
    return { out: lottiStatus(state) };
  }

  if (head === "füttern" || head === "fuettern" || head === "feed") {
    if (state.satt >= 10) {
      return {
        out: [
          "lotti schaut den napf an, dann dich, dann den napf,",
          "dann wieder dich. wenn katzen sätze hätten, wäre das:",
          "»nicht jetzt.« sie geht zurück zur decke.",
          "",
        ],
      };
    }
    state.satt = Math.min(10, state.satt + 3);
    state.zufrieden = Math.min(10, state.zufrieden + 1);
    state.status = "frisst, sehr konzentriert. ohren nach hinten.";
    return { out: [...FÜTTER_TEXTE, "", ...lottiStatus(state)] };
  }

  if (head === "streicheln" || head === "pet") {
    state.zufrieden = Math.min(10, state.zufrieden + 2);
    state.status = "schnurrt. das geräusch ist tiefer als 104,6.";
    return { out: [...STREICHEL_TEXTE, "", ...lottiStatus(state)] };
  }

  if (head === "rufen" || head === "call") {
    state.zufrieden = Math.max(0, state.zufrieden - 1);
    state.status = "geht in die küche. nicht wegen dir.";
    return { out: [...RUF_TEXTE, "", ...lottiStatus(state)] };
  }

  if (head === "schlafen" || head === "sleep") {
    state.müde = Math.min(10, state.müde + 4);
    state.zufrieden = Math.min(10, state.zufrieden + 1);
    state.status = "schläft. wirklich diesmal. atmet sehr leise.";
    return { out: [...SCHLAF_TEXTE, "", ...lottiStatus(state)] };
  }

  if (head === "foto" || head === "photo") {
    return { out: [...FOTO_TEXTE, ""] };
  }

  if (head === "geschichte" || head === "story") {
    const g = GESCHICHTEN[geschichteIdx % GESCHICHTEN.length];
    geschichteIdx++;
    return { out: [...g, ""] };
  }

  if (raw === "sag was" || raw === "lotti, sag was" || raw === "sag etwas") {
    const t = SAG_WAS_TEXTE[Math.floor(Math.random() * (SAG_WAS_TEXTE.length / 2)) * 2];
    // Ein zwei-Zeilen-Spruch ausgeben.
    const i = SAG_WAS_TEXTE.indexOf(t);
    const out = [SAG_WAS_TEXTE[i], SAG_WAS_TEXTE[i + 1] ?? "", ""];
    return { out };
  }

  return {
    out: [
      `lotti versteht »${input.trim()}« nicht.`,
      "(bodo hat nicht jeden befehl programmiert. tippe »hilfe«.)",
      "",
    ],
  };
}

const LOTTI_COMMANDS = [
  "status",
  "füttern",
  "streicheln",
  "rufen",
  "schlafen",
  "foto",
  "geschichte",
  "hilfe",
  "exit",
];

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
  if (tokens.length > 1) return { newInput: input, matches: [] };
  const last = (tokens[0] ?? "").toLowerCase();
  const matches = LOTTI_COMMANDS.filter((c) => c.startsWith(last));
  if (!matches.length) return { newInput: input, matches: [] };
  const completed = lcp(matches);
  const newLast = matches.length === 1 ? matches[0] + " " : completed;
  return { newInput: newLast, matches };
}
