/**
 * "adventure.bin" — ein winziges Textadventure, das Worag in seinen
 * Nachtschichten geschrieben hat. Er hat aus Datenbank-Fragmenten,
 * geschmuggelten Magazinen und Insas Erzählungen ein Bild der
 * Außenwelt zusammengebastelt — Berlin, ungefähr 2026. Vieles ist
 * fast richtig. Manches ist absurd daneben. Der Charme des Programms
 * liegt in genau diesem Daneben.
 */

export interface AdvRoom {
  id: string;
  title: string;
  description: string[];
  exits: Partial<Record<"nord" | "süd" | "ost" | "west" | "oben" | "unten", string>>;
  items?: string[];
  /** Optional: Sondertexte beim Betreten, je nach Inventar/Flags. */
  onEnter?: (state: AdvState) => string[] | null;
}

export interface AdvItem {
  id: string;
  name: string;
  description: string;
}

export interface AdvState {
  room: string;
  inventory: Set<string>;
  flags: Set<string>;
  finished: boolean;
}

export const ADV_ITEMS: Record<string, AdvItem> = {
  smartphone: {
    id: "smartphone",
    name: "Smartphone",
    description:
      "Ein flaches Glasrechteck. Worag hat es nie gesehen — er beschreibt es als »Spiegel, der zurückspricht«. Akku 12%.",
  },
  bvgTicket: {
    id: "bvgTicket",
    name: "BVG-Tageskarte",
    description:
      "Papier, gelb, mit einem QR-Code. Worag hat den QR-Code aus einem Handbuch abgemalt — er sieht aus wie ein zerbrochenes Fenster.",
  },
  clubMate: {
    id: "clubMate",
    name: "Club-Mate",
    description:
      "Eine kalte braune Flasche. Etikett: »NACH GUTER ALTER HAUSMACHERART«. Macht angeblich wach. Worag glaubt, das sei eine Art Medikament.",
  },
  hausschluessel: {
    id: "hausschluessel",
    name: "Wohnungsschlüssel",
    description:
      "Drei Zacken aus Messing. In E67 gibt es keine Schlüssel — Türen öffnen sich, wenn die Leitstelle es zulässt.",
  },
  parkbankBuch: {
    id: "parkbankBuch",
    name: "Buch von der Parkbank",
    description:
      "Taschenbuch, abgegriffen. Auf dem Cover: ein Mann mit einem Kopfhörer, der in eine leere Wand starrt. Titel: »Der Sender«.",
  },
};

const ROOMS: Record<string, AdvRoom> = {
  wohnung: {
    id: "wohnung",
    title: "Altbauwohnung, Prenzlauer Berg",
    description: [
      "Du stehst in einer Wohnung mit FENSTERN. Hinter den Fenstern: Licht.",
      "Echtes, sich bewegendes Licht. Ein Heizkörper gluckert. Aus einer",
      "Box auf dem Regal kommt Musik, die du anhalten kannst, wenn du",
      "willst. Niemand ruft an, wenn du sie anhältst.",
      "",
      "Auf dem Küchentisch: ein Smartphone, ein Wohnungsschlüssel.",
      "Nach OST führt der Hausflur.",
    ],
    exits: { ost: "hausflur" },
    items: ["smartphone", "hausschluessel"],
  },
  hausflur: {
    id: "hausflur",
    title: "Treppenhaus",
    description: [
      "Ein Treppenhaus mit echten Stufen, nicht mit einem Aufzug.",
      "An der Wand: ein Werbeplakat für eine »Lieferdienst-App«, die",
      "Sushi in 12 Minuten verspricht. Worag hat das Wort »Sushi« in",
      "drei Quellen unterschiedlich übersetzt — er ist sich nicht sicher,",
      "ob es ein Gericht oder ein Gefühl ist.",
      "",
      "Nach UNTEN geht es auf die Straße. Nach WEST zurück.",
    ],
    exits: { unten: "strasse", west: "wohnung" },
  },
  strasse: {
    id: "strasse",
    title: "Schönhauser Allee",
    description: [
      "Eine breite Straße. Eine GELBE BAHN über deinem Kopf — sie heißt",
      "U2, sagt ein Schild, aber sie fährt oben. Worag findet das so",
      "verwirrend, dass er es zweimal eingebaut hat.",
      "",
      "Menschen gehen in alle Richtungen, ohne dass jemand ihnen sagt,",
      "wohin. Niemand trägt einen Empfänger im Ohr. Du bist dir nicht",
      "sicher, wie sie wissen, was sie als nächstes tun sollen.",
      "",
      "NORD: U-Bahn-Station. OST: Späti. SÜD: Park. OBEN zurück.",
    ],
    exits: { nord: "ubahn", ost: "spaeti", süd: "park", oben: "hausflur" },
  },
  spaeti: {
    id: "spaeti",
    title: "Späti »Onkel Hassan 24/7«",
    description: [
      "Ein Laden, kleiner als deine Küche, in dem es ALLES gibt: Brot,",
      "Batterien, Bier, Pflaster, Pflanzen, Pornohefte, Pommes-Gewürz,",
      "fünfzehn Sorten Schokolade. Hinter dem Tresen: ein Mann, der dich",
      "anlächelt, ohne dich zu kennen.",
      "",
      "Im Kühlregal steht eine kalte Club-Mate. Auf dem Tresen liegt",
      "ein Stapel BVG-Tageskarten.",
      "",
      "WEST zurück zur Straße.",
    ],
    exits: { west: "strasse" },
    items: ["clubMate", "bvgTicket"],
  },
  ubahn: {
    id: "ubahn",
    title: "U-Bahnhof Eberswalder Straße",
    description: [
      "Du stehst auf einem Bahnsteig. Eine Stimme aus einem Lautsprecher",
      "sagt: »Zurückbleiben bitte.« Sie sagt es nur einmal. Sie sagt es",
      "ohne Gewicht. Niemand zuckt zusammen.",
      "",
      "Eine Bahn fährt ein. Die Türen öffnen sich. Sie schließen sich.",
      "Sie öffnen sich nicht wieder, nur weil du noch da stehst.",
    ],
    exits: { süd: "strasse" },
    onEnter: (s) => {
      if (!s.inventory.has("bvgTicket")) {
        return [
          "(Worag hat hier eine Notiz hinterlassen: »Ohne Ticket fühlt",
          " es sich falsch an, einzusteigen. Aber niemand hält dich auf.",
          " Niemand hält dich AUF. Das ist die ganze Pointe.«)",
        ];
      }
      return null;
    },
  },
  park: {
    id: "park",
    title: "Mauerpark, Sonntagnachmittag",
    description: [
      "Eine Wiese, die nach Gras riecht. Echte Sonne auf der Haut — Worag",
      "musste das Wort »Sonne« aus drei Lexika rekonstruieren und ist",
      "sich nicht ganz sicher mit der Wärme. Auf seiner Version brennt",
      "die Haut nach 20 Minuten leicht. Er fand das poetisch.",
      "",
      "Auf einer Bank liegt ein Buch. Niemand passt darauf auf.",
      "Im Hintergrund spielt jemand Karaoke, schlecht und glücklich.",
      "",
      "NORD: zurück zur Straße. OST: ein Café mit »WLAN«.",
    ],
    exits: { nord: "strasse", ost: "cafe" },
    items: ["parkbankBuch"],
  },
  cafe: {
    id: "cafe",
    title: "Café »Drittwelle«",
    description: [
      "Holzboden, Pflanzen, eine Maschine, die Milch zum Schäumen bringt.",
      "An den Tischen sitzen Menschen, jeder vor einem flachen Spiegel,",
      "den sie »Laptop« nennen. Niemand spricht miteinander, aber alle",
      "lächeln, wenn ihre Spiegel klingeln.",
      "",
      "Über der Theke: ein handgeschriebenes Schild — »WLAN: gratis,",
      "Passwort: madebyhumans«.",
      "",
      "WEST zurück in den Park.",
    ],
    exits: { west: "park" },
    onEnter: (s) => {
      if (s.inventory.has("smartphone") && !s.flags.has("loggedIn")) {
        s.flags.add("loggedIn");
        return [
          "Dein Smartphone vibriert. Auf dem Bildschirm steht: »Verbunden.«",
          "Du hast keine Ahnung, mit was. Das ist offenbar in Ordnung.",
        ];
      }
      return null;
    },
  },
};

const DIRS = ["nord", "süd", "sued", "ost", "west", "oben", "unten"] as const;

function normDir(d: string): keyof AdvRoom["exits"] | null {
  const x = d.toLowerCase();
  if (x === "n" || x === "nord") return "nord";
  if (x === "s" || x === "süd" || x === "sued") return "süd";
  if (x === "o" || x === "ost") return "ost";
  if (x === "w" || x === "west") return "west";
  if (x === "oben" || x === "hoch" || x === "u") return "oben";
  if (x === "unten" || x === "runter" || x === "d") return "unten";
  return null;
}

export function newAdventureState(): AdvState {
  return {
    room: "wohnung",
    inventory: new Set(),
    flags: new Set(),
    finished: false,
  };
}

export const ADV_INTRO: string[] = [
  "╔══════════════════════════════════════════════════════════╗",
  "║   ADVENTURE.BIN  v0.4   © 1996  L. Worag, Zimmer 2611    ║",
  "║   »Ein Tag draußen« — eine spekulative Simulation        ║",
  "║                                                          ║",
  "║   Schauplatz: Berlin, ungefähr im Jahr 2026.             ║",
  "║   (rekonstruiert aus Zentral-Datenbank Sektion 7,        ║",
  "║    Magazinrückläufen und Erzählungen von I. B.)          ║",
  "╚══════════════════════════════════════════════════════════╝",
  "",
  "Befehle: schau / geh <richtung> / nimm <ding> / inventar /",
  "         benutze <ding> / hilfe / beenden",
  "",
];

export const ADV_HELP: string[] = [
  "ADVENTURE.BIN — Befehle:",
  "  schau                  — aktuellen Raum noch einmal beschreiben",
  "  schau <ding>           — ein Ding genauer ansehen",
  "  geh <richtung>         — n/s/o/w/oben/unten",
  "  nimm <ding>            — ein Ding einstecken",
  "  inventar               — was du bei dir hast",
  "  benutze <ding>         — etwas anwenden",
  "  hilfe                  — diese Liste",
  "  beenden                — zurück zu CentralOS",
];

export interface AdvResult {
  /** Ausgabezeilen. */
  out: string[];
  /** Wenn true, beendet das Spiel und kehrt ins Hauptterminal zurück. */
  quit?: boolean;
}

function describeRoom(state: AdvState): string[] {
  const room = ROOMS[state.room];
  const lines: string[] = [];
  lines.push(`── ${room.title} ──`);
  lines.push(...room.description);
  const items = (room.items ?? []).filter((id) => !state.flags.has(`taken:${id}`));
  if (items.length) {
    lines.push("");
    lines.push(
      "Hier liegt: " + items.map((id) => ADV_ITEMS[id]?.name ?? id).join(", "),
    );
  }
  const exits = Object.keys(room.exits) as (keyof AdvRoom["exits"])[];
  if (exits.length) {
    lines.push("");
    lines.push("Ausgänge: " + exits.join(", "));
  }
  return lines;
}

/** Eingabe verarbeiten. Rückgabe: Ausgabe + ggf. quit. */
export function adventureCommand(state: AdvState, raw: string): AdvResult {
  const input = raw.trim().toLowerCase();
  if (!input) return { out: [] };
  const tokens = input.split(/\s+/);
  const head = tokens[0];
  const rest = tokens.slice(1).join(" ");

  if (head === "hilfe" || head === "help" || head === "?") {
    return { out: ADV_HELP };
  }

  if (head === "beenden" || head === "quit" || head === "exit") {
    state.finished = true;
    return {
      out: [
        "",
        ">> SPEICHERN … OK",
        ">> ADVENTURE.BIN beendet. Zurück zu CentralOS.",
      ],
      quit: true,
    };
  }

  if (head === "schau" || head === "look" || head === "l") {
    if (!rest) return { out: describeRoom(state) };
    // schau <ding>
    const item = findItemInScope(state, rest);
    if (!item) return { out: [`Du siehst hier kein »${rest}«.`] };
    return { out: [item.description] };
  }

  if (head === "inventar" || head === "i" || head === "inv") {
    if (!state.inventory.size) return { out: ["Du hast nichts dabei."] };
    return {
      out: [
        "Du trägst:",
        ...[...state.inventory].map((id) => "  – " + (ADV_ITEMS[id]?.name ?? id)),
      ],
    };
  }

  if (head === "nimm" || head === "take") {
    if (!rest) return { out: ["Was nimmst du?"] };
    const room = ROOMS[state.room];
    const itemId = (room.items ?? []).find(
      (id) =>
        !state.flags.has(`taken:${id}`) &&
        ADV_ITEMS[id]?.name.toLowerCase().includes(rest),
    );
    if (!itemId) return { out: [`Hier gibt es kein »${rest}«.`] };
    state.inventory.add(itemId);
    state.flags.add(`taken:${itemId}`);
    return { out: [`Du nimmst: ${ADV_ITEMS[itemId].name}.`] };
  }

  if (head === "geh" || head === "go") {
    const dir = normDir(rest || tokens[1] || "");
    if (!dir) return { out: ["Wohin? (nord/süd/ost/west/oben/unten)"] };
    const room = ROOMS[state.room];
    const next = room.exits[dir];
    if (!next) return { out: ["Da kommst du nicht hin."] };
    state.room = next;
    const out = describeRoom(state);
    const extra = ROOMS[next].onEnter?.(state);
    if (extra) out.push("", ...extra);
    return { out };
  }

  // bare direction: "nord", "n" …
  const justDir = normDir(head);
  if (justDir) {
    return adventureCommand(state, `geh ${justDir}`);
  }

  if (head === "benutze" || head === "use") {
    if (!rest) return { out: ["Was benutzt du?"] };
    if (rest.includes("smartphone") && state.inventory.has("smartphone")) {
      if (state.flags.has("loggedIn")) {
        return {
          out: [
            "Du tippst auf den Spiegel. Er zeigt dir Bilder von Menschen,",
            "die du nicht kennst, in Räumen, die wie deiner aussehen,",
            "nur mit Fenstern. Du legst ihn weg.",
          ],
        };
      }
      return { out: ["»Kein Netz«, sagt der Spiegel. Suche WLAN."] };
    }
    if (rest.includes("club-mate") || rest.includes("mate")) {
      if (state.inventory.has("clubMate")) {
        state.flags.add("drankMate");
        return {
          out: [
            "Du trinkst. Es schmeckt nach kaltem Tee und Aufmerksamkeit.",
            "Dein Herz schlägt einmal zu schnell, dann normal weiter.",
            "Worag hat hier eine Notiz: »Ich glaube, das ist Glück.«",
          ],
        };
      }
    }
    if (rest.includes("buch") && state.inventory.has("parkbankBuch")) {
      return {
        out: [
          "Du schlägst »Der Sender« auf, irgendwo in der Mitte:",
          "  »…er drehte den Empfänger ab und das Brummen blieb.«",
          "  »Er begriff in diesem Moment, dass die Frequenz nie im«",
          "  »Gerät gewesen war. Sie war in ihm. Sie war er.«",
          "",
          "Du klappst das Buch zu. Du legst es zurück, wo du es",
          "gefunden hast. (Worag hat diese Stelle dreimal überarbeitet.)",
        ],
      };
    }
    return { out: [`Damit kannst du gerade nichts anfangen.`] };
  }

  return {
    out: [
      `Verstanden habe ich »${head}« nicht. Tippe »hilfe«.`,
    ],
  };
}

function findItemInScope(state: AdvState, query: string): AdvItem | null {
  const room = ROOMS[state.room];
  const candidates = [
    ...(room.items ?? []).filter((id) => !state.flags.has(`taken:${id}`)),
    ...state.inventory,
  ];
  const id = candidates.find((id) =>
    ADV_ITEMS[id]?.name.toLowerCase().includes(query),
  );
  return id ? ADV_ITEMS[id] : null;
}

/** Anfangsbeschreibung beim Start. */
export function adventureStart(state: AdvState): string[] {
  return [...ADV_INTRO, ...describeRoom(state)];
}