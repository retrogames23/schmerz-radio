/**
 * Miras Filesystem — FuckTheSystemOS 0.2.
 *
 * Eigenständiger, sehr kleiner Baum. Keine /etc, keine /system. Was
 * Mira hier liegen hat, ist persönlich: ein Manifest, ein paar Briefe,
 * eine Liste mit Hosts, die sie ohne Passwort erreicht. Der eigentliche
 * Trick liegt im Terminal: im Mira-Modus akzeptiert `telnet` jede
 * Verbindung ohne Authentifizierung (Root-Tunnel über Drucker 5601).
 */

import {
  type FsDir,
  type FsNode,
} from "./filesystemBodo";

export type { FsNode, FsDir };

export const HOME_PATH_MIRA: string[] = ["home", "mira"];

export const Z_K_S_MANIFEST: string[] = [
  "── manifest.txt ──────────────────────────────",
  "",
  "                Z. K. S.",
  "       Zelle Kleine Stille (E67, intern)",
  "",
  "Dies ist keine Bewegung. Dies ist eine Vermutung,",
  "die sich weitergibt.",
  "",
  "1.  Wir glauben, dass 104,6 keine Frequenz ist,",
  "    die uns hilft. Sie ist eine Leine.",
  "    Lang genug, dass wir uns frei fühlen.",
  "    Kurz genug, dass wir nicht wegrennen.",
  "",
  "2.  Wir wollen nichts stürzen. Stürzen ist Lärm,",
  "    und Lärm ist genau das, was sie senden.",
  "    Wir wollen Stille. Eine Etage, eine Stunde,",
  "    eines Abends — und dann der Beweis:",
  "    es ist niemand gestorben.",
  "",
  "3.  Wir nennen das den TAG DER STILLE.",
  "    Wir wissen noch nicht wann.",
  "    Wir sammeln Leute, die ihn aushalten.",
  "",
  "4.  Wer das hier liest und es nicht versteht:",
  "    leg den Zettel zurück. Du bist nicht gemeint.",
  "    Wer das hier liest und es versteht:",
  "    sag niemandem unseren Namen.",
  "    Sag ihnen den Gedanken.",
  "",
  "                              — m. (16, E67/4601)",
  "                                und zwei andere.",
];

const HOME_MIRA: FsDir = {
  type: "dir",
  name: "mira",
  desc: "Persönliches Verzeichnis — m. (FuckTheSystemOS)",
  children: [
    {
      type: "file",
      name: "manifest.txt",
      kind: "text",
      size: 1180,
      date: "—",
      content: Z_K_S_MANIFEST,
    },
    {
      type: "file",
      name: "tag_der_stille.md",
      kind: "text",
      size: 640,
      date: "—",
      content: [
        "── tag_der_stille.md ─────────────────────────",
        "",
        "plan, version 7 (immer noch falsch):",
        "",
        "  - eine etage. wahrscheinlich 4. ich kenne sie.",
        "  - eine stunde. abends, wenn die schicht wechselt.",
        "  - alle radios aus. nicht leise. AUS.",
        "  - niemand klingelt. niemand klopft. niemand singt.",
        "  - danach: warten. nichts erklären.",
        "",
        "fragen, an mich selbst:",
        "  - was, wenn jemand wirklich stirbt? (-> NICHT MEINE",
        "    schuld. die frequenz ist nicht das herz.)",
        "  - was, wenn niemand mitmacht? (-> dann wars üben.)",
        "  - was, wenn ich es nicht aushalte? (-> aushalten.)",
      ],
    },
    {
      type: "file",
      name: "brieffreunde.txt",
      kind: "text",
      size: 720,
      date: "—",
      content: [
        "── brieffreunde.txt ──────────────────────────",
        "",
        "drei. nie namen. nie quadrant + zimmer in einer zeile.",
        "",
        "  E54 — »kupfer«        zuletzt: vor 12 tagen",
        "                         redet zu viel über musik.",
        "                         lieb.",
        "  E72 — »wand«          zuletzt: vor 6 tagen",
        "                         schreibt nur fragen.",
        "                         keine einzige antwort.",
        "  E81 — »haar«          ZULETZT: VOR 47 TAGEN.",
        "                         entweder transferiert,",
        "                         oder hat aufgehört.",
        "                         oder schlimmer.",
        "                         ich glaube schlimmer.",
        "",
        "(wenn du das liest und du bist nicht ich:",
        " du hast einen fehler gemacht. ich auch.)",
      ],
    },
    {
      type: "file",
      name: "leute.txt",
      kind: "text",
      size: 820,
      date: "—",
      content: [
        "── leute.txt — meine notizen, NICHT teilen ────",
        "",
        "layard (2611):  neugierig oder kaputt. vielleicht",
        "                beides. liest. das ist selten.",
        "                kann ich vertrauen? prüfen.",
        "",
        "philippe (2613): schreibt mit. ALLES. wem?",
        "                ich erzähle ihm nichts. nichts.",
        "",
        "bodo (2612):    hat lotti. wer einen anker hat,",
        "                hat etwas zu verlieren. das ist",
        "                kein vorwurf. es ist physik.",
        "",
        "helka (2610):   schweigt aus stärke. unterschätzt.",
        "                vielleicht die einzige hier, die",
        "                den TAG schon mal gemacht hat,",
        "                allein, ohne plan, ohne uns.",
        "",
        "insa:           meint es gut. das ist genau das",
        "                problem. wer es gut meint, hört",
        "                nicht zu, wenn man nein sagt.",
        "",
        "mikael (1534):  hat aufgehört. das ist das",
        "                mutigste, was ich kenne.",
        "                ich habe ihn nie kennengelernt.",
      ],
    },
    {
      type: "file",
      name: ".roald.txt",
      kind: "text",
      size: 320,
      date: "—",
      content: [
        "── nicht teilen, auch nicht mit den zwei anderen ─",
        "",
        "onkel roald, 4604. weiß bescheid. weiß ZU viel.",
        "wenn er trinkt, redet er. wenn er nicht trinkt,",
        "auch. ich liebe ihn. das macht es nicht besser.",
        "",
        "wenn die zelle hochgeht, geht sie über ihn hoch.",
        "ich kann das nicht ändern. nur planen.",
      ],
    },
  ],
};

/** Unix-like root für Miras gehackte Maschine. */
export const FILESYSTEM_MIRA: FsDir = {
  type: "dir",
  name: "",
  desc: "FuckTheSystemOS 0.2 — root tunnel via Drucker 5601",
  children: [
    {
      type: "dir",
      name: "home",
      desc: "Benutzerverzeichnisse.",
      children: [HOME_MIRA],
    },
  ],
};

/** Liefert den Knoten an einem absoluten Pfad (analog zu resolveBodo/Worag). */
export function resolveMira(parts: string[]): FsNode | null {
  let node: FsNode = FILESYSTEM_MIRA;
  for (const p of parts) {
    if (node.type !== "dir") return null;
    const next: FsNode | undefined = node.children.find((c) => c.name === p);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function pathStringMira(parts: string[]): string {
  return "/" + parts.join("/");
}