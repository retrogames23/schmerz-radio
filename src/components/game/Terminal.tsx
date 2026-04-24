import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";
import {
  FILESYSTEM_WORAG,
  HOME_PATH_WORAG,
  resolveWorag,
  pathStringWorag,
  type FsNode,
} from "@/game/filesystemWorag";
import {
  FILESYSTEM_BODO,
  HOME_PATH_BODO,
  resolveBodo,
  pathStringBodo,
  FREIHEIT_TXT,
  LAYARD_TXT,
} from "@/game/filesystemBodo";
import type { StoryFlag } from "@/game/types";
import {
  adventureCommand,
  adventureStart,
  newAdventureState,
  adventureComplete,
  type AdvState,
} from "@/game/adventureGame";
import {
  lottiCommand,
  lottiStart,
  newLottiState,
  lottiComplete,
  type LottiState,
} from "@/game/lottiProgram";
import { CloseButton } from "./CloseButton";

interface Line {
  text: string;
  kind?: "in" | "out" | "system";
}

/** Aktuelle CentralOS-Versionsbezeichnung, abhängig vom Update-Flag.
 *  Bodos Rechner läuft vor dem Update auf altem v2.0; das sysupdate hebt
 *  beide Maschinen auf die gleiche Sektor-Version v2.3.1. */
function osVersion(updated: boolean, bodo = false): string {
  if (updated) return "2.3.1";
  return bodo ? "2.0" : "2.3";
}

/**
 * Ersetzt statische Versions-Strings in Datei-/Banner-Texten durch die
 * aktuell installierte CentralOS-Version. Greift nur, wenn das Update
 * eingespielt wurde — vorher bleiben die Originaltexte unverändert.
 */
function applyOsVersion(text: string, updated: boolean): string {
  if (!updated) return text;
  // Reihenfolge wichtig: erst die längere Form ersetzen.
  return text
    .replace(/CentralOS v2\.3(?!\.\d)/g, "CentralOS v2.3.1")
    .replace(/CENTRALOS v2\.3(?!\.\d)/g, "CENTRALOS v2.3.1");
}

/** Filter children by visibility (hidden files only with -a, locked files only when flag is set). */
function visibleChildren(
  node: FsNode,
  showAll: boolean,
  hasFlag: (f: StoryFlag) => boolean,
): FsNode[] {
  if (node.type !== "dir") return [];
  return node.children.filter((c) => {
    if (c.type === "file" && c.requires && !hasFlag(c.requires as StoryFlag)) return false;
    if (!showAll && c.name.startsWith(".")) return false;
    return true;
  });
}

function formatLs(children: FsNode[]): Line[] {
  if (!children.length) return [{ text: "  (leer)", kind: "out" }];
  return children.map((c) => {
    if (c.type === "dir") {
      return { text: `  ${c.name.padEnd(28)} <DIR>`, kind: "system" } as Line;
    }
    const size = (c.size ?? 0).toString().padStart(6, " ");
    const date = (c.date ?? "—").padEnd(12, " ");
    return { text: `  ${c.name.padEnd(28)} ${size}  ${date}`, kind: "out" } as Line;
  });
}

function buildTree(
  node: FsNode,
  hasFlag: (f: StoryFlag) => boolean,
  prefix = "",
): string[] {
  const out: string[] = [];
  if (node.type !== "dir") return [`${prefix}${node.name}`];
  const kids = visibleChildren(node, false, hasFlag);
  kids.forEach((child, i) => {
    const last = i === kids.length - 1;
    const branch = last ? "└── " : "├── ";
    const label = child.type === "dir" ? `${child.name}/` : child.name;
    out.push(`${prefix}${branch}${label}`);
    if (child.type === "dir") {
      const nextPrefix = prefix + (last ? "    " : "│   ");
      out.push(...buildTree(child, hasFlag, nextPrefix));
    }
  });
  return out;
}

const COMMANDS = [
  "help",
  "inbox",
  "read",
  "status",
  "report",
  "clear",
  "exit",
  "pwd",
  "ls",
  "cd",
  "cat",
  "tree",
  "adventure",
  "./adventure.bin",
  "lotti",
  "./lotti",
  "net",
  "telnet",
  "sysupdate",
  "trouble",
  "maint",
];

/** Longest common string prefix across all candidates. */
function commonPrefix(strs: string[]): string {
  if (!strs.length) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}

interface CompleteResult {
  newInput: string;
  matches: string[];
}

/**
 * Compute tab-completion for the current input.
 * - First token → command names.
 * - cd → directories only.
 * - cat → files only.
 * - Otherwise → both.
 */
function complete(
  input: string,
  cwd: string[],
  hasFlag: (f: StoryFlag) => boolean,
  bodoMode: boolean,
): CompleteResult {
  const tokens = input.split(/\s+/);
  const lastToken = tokens[tokens.length - 1] ?? "";

  // Completing the command itself.
  if (tokens.length === 1) {
    const matches = COMMANDS.filter((c) => c.startsWith(lastToken.toLowerCase()));
    if (!matches.length) return { newInput: input, matches: [] };
    const completed = commonPrefix(matches);
    const newLast = matches.length === 1 ? matches[0] + " " : completed;
    return { newInput: newLast, matches };
  }

  // Completing a path argument.
  const cmd = tokens[0].toLowerCase();
  const wantDirs = cmd === "cd";
  const wantFiles = cmd === "cat";

  // Split last token into "directory part" + "name fragment".
  const isAbsolute = lastToken.startsWith("/");
  const segments = lastToken.split("/");
  const fragment = segments.pop() ?? "";
  const baseSegments = segments.filter(Boolean);
  const dirParts = isAbsolute ? baseSegments : [...cwd, ...baseSegments];
  const dir = bodoMode ? resolveBodo(dirParts) : resolveWorag(dirParts);
  if (!dir || dir.type !== "dir") return { newInput: input, matches: [] };

  // Always show all entries (-a equivalent) so users can complete .hidden_log etc.
  const candidates = visibleChildren(dir, true, hasFlag).filter((c) => {
    if (wantDirs && c.type !== "dir") return false;
    if (wantFiles && c.type !== "file") return false;
    return c.name.startsWith(fragment);
  });
  if (!candidates.length) return { newInput: input, matches: [] };

  const names = candidates.map((c) => c.name);
  const prefix = commonPrefix(names);
  let completedName = prefix;
  if (candidates.length === 1) {
    const only = candidates[0];
    completedName = only.type === "dir" ? only.name + "/" : only.name + " ";
  }

  const dirPrefix = lastToken.slice(0, lastToken.length - fragment.length);
  const newLastToken = dirPrefix + completedName;
  const newInput = [...tokens.slice(0, -1), newLastToken].join(" ");

  // For display when ambiguous, append "/" to dir names.
  const display = candidates.map((c) => (c.type === "dir" ? c.name + "/" : c.name));
  return { newInput, matches: display };
}

const TELNET_COMMANDS = ["ls", "cat", "whoami", "help", "exit", "logout", "quit"];

/**
 * Tab-completion innerhalb einer aktiven Telnet-Sitzung.
 * Erstes Token → Telnet-Befehle. `cat <fragment>` → Dateinamen des Hosts.
 */
function completeTelnet(
  input: string,
  hostFiles: Record<string, string[]>,
): CompleteResult {
  const tokens = input.split(/\s+/);
  const lastToken = tokens[tokens.length - 1] ?? "";

  if (tokens.length === 1) {
    const matches = TELNET_COMMANDS.filter((c) =>
      c.startsWith(lastToken.toLowerCase()),
    );
    if (!matches.length) return { newInput: input, matches: [] };
    const completed = commonPrefix(matches);
    const newLast = matches.length === 1 ? matches[0] + " " : completed;
    return { newInput: newLast, matches };
  }

  const cmd = tokens[0].toLowerCase();
  if (cmd !== "cat" && cmd !== "more" && cmd !== "type") {
    return { newInput: input, matches: [] };
  }

  const names = Object.keys(hostFiles)
    .filter((n) => n.startsWith(lastToken))
    .sort();
  if (!names.length) return { newInput: input, matches: [] };

  const prefix = commonPrefix(names);
  const completedName = names.length === 1 ? names[0] + " " : prefix;
  const newInput = [...tokens.slice(0, -1), completedName].join(" ");
  return { newInput, matches: names };
}

// ── Netzwerk-Hosts im Sektor E67 ─────────────────────────
interface NetHost {
  ip: string;
  host: string;
  desc: string;
  /** Telnet-Passwort. null = kein Telnet-Daemon / Verbindung verweigert. */
  password: string | null;
  /** Wenn true: Passwortvergleich ist case-insensitiv. */
  passwordCaseInsensitive?: boolean;
  motd?: string[];
  files?: Record<string, string[]>;
  /**
   * Optional: zusätzliche Dateien, die abhängig vom Story-Stand entstehen.
   * Werden mit `files` gemerged. Spätere Einträge überschreiben frühere.
   */
  dynamicFiles?: (hasFlag: (f: StoryFlag) => boolean) => Record<string, string[]>;
}

const NET_HOSTS: NetHost[] = [
  {
    ip: "10.67.0.1",
    host: "gateway.e67",
    desc: "Sektor-Gateway (Routing)",
    password: null,
  },
  {
    ip: "10.67.0.2",
    host: "leitstelle.e67",
    desc: "Leitstelle 001 — I. Bauerfeind",
    password: null,
  },
  {
    ip: "10.67.26.11",
    host: "worag.e67",
    desc: "Sie selbst (Zimmer 2611)",
    password: null,
  },
  {
    ip: "10.67.26.13",
    host: "philippe.e67",
    desc: "Bewohner, Zimmer 2613",
    password: "Passwort123",
    passwordCaseInsensitive: true,
    motd: [
      "── philippe.e67 — CentralOS v2.1 ─────────────",
      "Letzte Anmeldung: 06.11.1997 04:11 (lokal)",
      "Du bist eingeloggt als: philippe",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "notiz.txt": [
        "die wand antwortet wenn ich klopfe",
        "die wand antwortet wenn ich klopfe",
        "die wand antwortet wenn ich klopfe",
        "ich glaube layard ist auch da drin",
        "ich klopfe weiter",
      ],
      "passwort.txt": [
        "ich vergesse alles. das hier nicht.",
        "Passwort123",
        "(insa hat gelacht. soll sie.)",
      ],
      "tagebuch.txt": [
        "tag 4012",
        "104,6 war heute drei minuten still",
        "ich habe in den drei minuten meinen namen vergessen",
        "als es wieder anging hieß ich wieder philippe",
        "ich glaube das ist gut",
      ],
    },
    // Beobachtungen über Layard. Eine pro geführtem Dialog.
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      if (hasFlag("philippeNote1")) {
        out["beobachtung_layard_01.txt"] = [
          "── notiz, kurz nach er kam ────────────────────",
          "",
          "der nachbar aus 2611. layard worag.",
          "geöffnet hat er erst beim dritten klingeln.",
          "die augen: wach, aber zu lange nicht benutzt.",
          "",
          "er hat nicht gezögert mitzukommen.",
          "das hat mich mehr überrascht als das klopfen.",
          "in diesem korridor öffnet niemand für niemanden.",
          "",
          "vermutung: er hat sich darauf vorbereitet,",
          "ohne es selbst zu wissen.",
          "vermutung: er ist einsamer als ich.",
          "",
          "ich werde das im auge behalten.",
        ];
      }
      if (hasFlag("philippeNote2")) {
        out["beobachtung_layard_02.txt"] = [
          "── notiz, während wir gewartet haben ──────────",
          "",
          "er redet wenig. wenn, dann präzise.",
          "er sagt »B2« wie andere »ich«. ohne nachzudenken.",
          "",
          "als ich von kantine angefangen habe, hat er",
          "von seinem schreiben gesprochen. unaufgefordert.",
          "drei sätze, dann hat er sich erschrocken.",
          "",
          "diagnose (laienhaft): er hat seit jahren mit",
          "niemandem ein längeres gespräch geführt.",
          "er weiß nicht mehr, wie viel er teilen darf.",
          "",
          "soziale beziehungen, geschätzt: 0–1.",
          "die 1 ist möglicherweise insa.",
          "ich glaube nicht, dass das eine beziehung ist.",
          "",
          "ich glaube, ich mag ihn.",
        ];
      }
      if (hasFlag("philippeNote3")) {
        out["beobachtung_layard_03.txt"] = [
          "── notiz, nach den sanitätern ────────────────",
          "",
          "er ist gegangen. wirklich gegangen.",
          "vor mir hat das niemand gemacht. nicht einer.",
          "",
          "charakter: stiller mut. nicht laut. nicht performt.",
          "er hat das protokoll geholt, ohne zu fragen warum.",
          "vielleicht weil ihn das »warum« seit jahren erstickt.",
          "",
          "persönlichkeit: ein mensch, der zu lange",
          "geschwiegen hat und jetzt nicht mehr weiß,",
          "wie laut seine eigene stimme klingen darf.",
          "",
          "soziale beziehungen, korrigiert:",
          "  insa  — auftraggeberin, nicht freundin",
          "  philippe — ich. unklarer status.",
          "  und vielleicht: dieser alte mann in 1534.",
          "",
          "ich hoffe, er kommt wieder. ich klopfe dann.",
        ];
      }
      if (hasFlag("philippeNote4")) {
        out["beobachtung_layard_04.txt"] = [
          "── notiz, später ─────────────────────────────",
          "",
          "wir haben heute über essen geredet.",
          "er hat gelacht. einmal, kurz.",
          "ich habe es aufgeschrieben.",
          "",
          "er ist nicht beschädigt. er ist konserviert.",
          "wie etwas, das man eingelegt hat,",
          "weil man nicht wusste, wann man es brauchen würde.",
          "",
          "wenn jemand ihn aus dem glas nimmt:",
          "ich glaube, er kann noch alles sein.",
        ];
      }
      if (hasFlag("philippeNote5")) {
        out["beobachtung_layard_05.txt"] = [
          "── notiz, nach unserem letzten gespräch ──────",
          "",
          "ich höre alles, das ist wahr.",
          "aber ihn höre ich anders.",
          "",
          "fazit, vorläufig:",
          "  charakter        — leise, lehrbarer mut",
          "  persönlichkeit   — ein autor ohne publikum",
          "  beziehungen      — bisher: keine. jetzt: zwei.",
          "                     (insa zählt nicht.)",
          "",
          "ich werde dieses dokument nicht löschen.",
          "von 104,6 kommt kein wort dazu, nur das gefühl —",
          "diese stille wärme, die keine sprache braucht.",
          "ich glaube, ich sollte es ihm geben.",
          "ich werde es ihm nicht geben.",
        ];
      }
      if (hasFlag("philippeProbeNote1")) {
        out["spekulation_layard_01.txt"] = [
          "── spekulation, weil die wand jetzt still ist ─",
          "",
          "frage gestellt: herkunft. eltern. geschwister.",
          "antwort erhalten: »niemand mehr«.",
          "",
          "vermutung A: er hat jemanden verloren,",
          "  und zwar nicht durch transfer.",
          "vermutung B: er hat jemanden verlassen,",
          "  und gibt sich dafür die schuld.",
          "vermutung C: beides. wahrscheinlichkeit: hoch.",
          "",
          "korrelation: er hat heute zum ersten mal",
          "  eine fremde tür geöffnet. das passt zu A.",
          "  und auch zu B. natürlich passt das zu beidem.",
          "",
          "ich habe keinerlei beleg.",
          "ich werde es trotzdem aufschreiben.",
        ];
      }
      if (hasFlag("philippeProbeNote2")) {
        out["spekulation_layard_02.txt"] = [
          "── spekulation, schreiben & motiv ─────────────",
          "",
          "er schreibt »über menschen, die nicht zurückkommen«.",
          "er schreibt »über räume, die zu lange leer stehen«.",
          "",
          "schlussfolgerung (ohne beweis):",
          "  jemand ist nicht zurückgekommen.",
          "  ein raum steht zu lange leer.",
          "  vermutlich beides derselbe vorgang.",
          "",
          "subtheorie: 2615 hat ihn deshalb so getroffen.",
          "  ein leerer raum, ein verschwundener mensch.",
          "  archetyp seiner eigenen erzählungen.",
          "  er ist heute in seine eigene geschichte gelaufen.",
          "",
          "literarisch interessant. menschlich besorgniserregend.",
          "(diese unterscheidung gibt es vielleicht nicht.)",
        ];
      }
      if (hasFlag("philippeProbeNote3")) {
        out["spekulation_layard_03.txt"] = [
          "── spekulation, 104,6 ────────────────────────",
          "",
          "selbstauskunft: »fast durchgehend«.",
          "selbstauskunft: »dann höre ich mich selbst«.",
          "",
          "diagnose, ferndiagnose, anmaßend:",
          "  abhängigkeit von 104,6: gesichert.",
          "  inhalt der eigenen stimme: angstauslösend.",
          "  ursache der eigenen stimme: unbekannt,",
          "  vermutlich kohärent mit notiz 01 und 02.",
          "",
          "hypothese: die leitstelle weiß das.",
          "hypothese: die leitstelle nutzt das.",
          "hypothese: ich werde diese hypothesen löschen,",
          "  bevor jemand mein terminal liest.",
          "  ich werde sie nicht löschen.",
          "",
          "(104,6 läuft währenddessen leise im hintergrund.)",
          "(ich höre es nicht mehr. das ist der punkt.)",
        ];
      }
      if (hasFlag("philippeProbeNote4")) {
        out["spekulation_layard_04.txt"] = [
          "── spekulation, insa bauerfeind ──────────────",
          "",
          "drei anrufe an einem tag. eine telefonistin",
          "stellt drei mal denselben mann durch. das",
          "passiert nicht zufällig. das passiert nicht",
          "ohne dass die telefonistin sich beteiligt.",
          "",
          "er sagt: »pausen. eine frage, die sie nicht",
          "stellen müsste.« das ist alles, was er sagt.",
          "es ist alles, was nötig ist.",
          "",
          "vermutung A: insa testet ihn.",
          "vermutung B: insa rekrutiert ihn.",
          "vermutung C: insa hofft auf etwas, das sie",
          "  selbst nicht benennen kann. dann ist sie",
          "  jetzt da, wo er war, bevor er heute aufstand.",
          "",
          "(C) ist die unwahrscheinlichste. mir gefällt sie",
          "trotzdem am besten. ich behalte sie.",
        ];
      }
      if (hasFlag("philippeProbeNote5")) {
        out["spekulation_layard_05.txt"] = [
          "── spekulation, der mann von nebenan ─────────",
          "",
          "frage: hat 2615 freiwillig geklopft, oder",
          "  hat ihn etwas geklopft.",
          "antwort: »ich weiß heute sehr vieles nicht«.",
          "",
          "das ist die antwort, die ich brauche.",
          "das ist die antwort, die ich nicht brauche.",
          "",
          "vermutung, große:",
          "  104,6 hat in 2615 etwas eingeklopft, das",
          "  er irgendwann zurückgegeben hat — an die wand.",
          "  er war kein opfer. er war ein lautsprecher.",
          "",
          "vermutung, kleinere, ehrlichere:",
          "  ich habe keine ahnung. niemand hat ahnung.",
          "  wir sortieren menschen nach quadranten,",
          "  damit niemand merkt, dass wir nicht sortieren können.",
          "",
          "schlussbemerkung über layard:",
          "  er kommt vielleicht wieder. vielleicht nicht.",
          "  beides ist heute zum ersten mal denkbar.",
          "  das ist, glaube ich, das wichtigste,",
          "  was ich heute aufschreiben kann.",
          "",
          "ich werde ihm das niemals zeigen.",
          "ich werde es niemals löschen.",
        ];
      }
      return out;
    },
  },
  {
    ip: "10.67.26.07",
    host: "kamenev.e67",
    desc: "Bewohnerin, Zimmer 2607",
    password: null,
  },
  {
    ip: "10.67.26.10",
    host: "helka.e67",
    desc: "Bewohnerin, Zimmer 2610 (H. Vint)",
    password: "bibliothek",
    passwordCaseInsensitive: true,
    motd: [
      "── helka.e67 — CentralOS v2.1 ─────────────────",
      "Letzte Anmeldung: 06.11.1997 03:42 (lokal)",
      "Du bist eingeloggt als: helka",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "wortliste.txt": [
        "── wörter, die in offiziellen mitteilungen ───",
        "── seit 1991 nicht mehr vorgekommen sind ─────",
        "",
        "  zärtlich",
        "  beliebig",
        "  sehnsucht",
        "  vielleicht",
        "  zuhause     (ersetzt durch: 'wohneinheit')",
        "  freund      (ersetzt durch: 'kontakt')",
        "  weiter      (gestrichen, ohne ersatz)",
        "  nachbar     (gestrichen, ohne ersatz)",
        "  einsam      (nie vorgekommen)",
        "",
        "── ende der liste, geführt seit 12.07.1985 ───",
      ],
      "tagebuch_kurz.txt": [
        "ich führe kein tagebuch mehr.",
        "ich führe nur noch listen.",
        "das ist auch ein tagebuch.",
        "",
        "heute: ein bewohner aus 2611 hat geklopft.",
        "er hat 'nachbarschaft' gesagt.",
        "wort steht auf liste. ich habe es ihm nicht gesagt.",
      ],
    },
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      out["gemeldet.log"] = [
        "── meldungs-archiv, h. vint ──────────────────",
        "",
        "12.04.1989  bewohner 2614 (vater korr) — verdacht",
        "            frequenzmanipulation, lötkolben.",
        "            status: bearbeitet (E81-versetzung)",
        "            ergebnis für meldende: keine reaktion.",
        "",
        ...(hasFlag("helkaWarned")
          ? [
              "06.11.1997  bewohner 2611 (worag) — flugblatt",
              "            Z.K.S. wortgleich zu 1989, fast.",
              "            status: NICHT gemeldet.",
              "            ergebnis für meldende: ungewiss.",
              "            (zum ersten mal: bewusst nicht gemeldet.)",
            ]
          : []),
      ];
      return out;
    },
  },
  {
    ip: "10.67.26.12",
    host: "bodo.e67",
    desc: "Bewohner, Zimmer 2612 (B. Marschke)",
    password: "Lotti",
    passwordCaseInsensitive: true,
    motd: [
      "── bodo.e67 — CentralOS v2.1 ──────────────────",
      "Letzte Anmeldung: 05.11.1997 19:08 (lokal)",
      "Du bist eingeloggt als: bodo",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "tagebuch.txt": [
        "── notizen, ohne datum ───────────────────────",
        "",
        "lotti hat heute wieder geniest.",
        "vermutlich der staub aus dem schacht.",
        "ich werde wischen müssen.",
        "",
        "die katze ist die einzige, die hier zuhört,",
        "ohne mitzuschreiben.",
        "",
        "wenn ich mich an etwas erinnern muss,",
        "schreibe ich es auf eine notiz an die wand.",
        "wenn ich mich an LOTTI erinnern muss —",
        "und das vergesse ich manchmal, weil das gehirn",
        "alt wird — dann steht das auch da.",
      ],
      "lotti_futter.txt": [
        "── monatsbestellung B3, intern ───────────────",
        "",
        "  6 dosen B3-paste 'rind-äquivalent'",
        "  4 dosen B3-paste 'fisch-äquivalent'",
        "  1 packung trockenfutter (resterampe E71)",
        "",
        "anmerkung an insa b.:",
        "  ja, ich weiß, B3 ist nicht für tiere zertifiziert.",
        "  ja, ich weiß, tiere sind im sektor nicht zertifiziert.",
        "  bitte trotzdem durchwinken. wie immer. danke.",
      ],
      "notiz_an_mich.txt": [
        "wenn du das hier liest, weil du wieder",
        "vergessen hast, warum du heute aufgestanden bist:",
        "",
        "LOTTI.",
        "",
        "das ist der grund. das ist immer der grund.",
      ],
      "funkprotokoll_alt.txt": [
        "── stadtwerke, abt. fernmelde, archiv ────────",
        "── auszug, mitgenommen 1991 ──────────────────",
        "",
        "trägersignal 104,6 MHz, sektor E67:",
        "  amplitudenstabilität automatisch:  ausgefallen",
        "  amplitudenstabilität manuell:      aktiv",
        "  zuständig:                          1 person/schicht",
        "  nachregelintervall:                 ca. 90 sek.",
        "",
        "anmerkung techniker (b.m.):",
        "  wenn die schicht ausfällt, fällt der träger.",
        "  wenn der träger fällt, hört der sektor",
        "  ungefiltert sich selbst. das war zweimal,",
        "  beide male nicht länger als drei minuten.",
        "  beide male haben bewohner gegen wände geschlagen.",
        "",
        "abschlussvermerk: niemand hat das je dokumentiert.",
        "ich auch nicht. ich hab nur das hier mitgenommen.",
      ],
      ".freiheit.txt": FREIHEIT_TXT,
    },
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      if (hasFlag("bodoToldCarrierTruth")) {
        out["funkprotokoll_neu.txt"] = [
          "── nachtrag, 06.11.1997 ──────────────────────",
          "",
          "heute zum ersten mal jemandem davon erzählt.",
          "ein bewohner aus 2611. layard worag.",
          "er hat ein flugblatt dabei gehabt. Z.K.S.",
          "",
          "ich habe ihm das mit der schicht gesagt.",
          "ich habe ihm nicht gesagt, dass ich von 1986",
          "bis 1991 selbst diese schicht war.",
          "",
          "vielleicht das nächste mal. wenn lotti dabei ist.",
        ];
      }
      if (hasFlag("bodoLeftForB3")) {
        out[".layard.txt"] = LAYARD_TXT;
      }
      return out;
    },
  },
  {
    ip: "10.67.26.14",
    host: "ennis.e67",
    desc: "Bewohner, Zimmer 2614 (E. Korr)",
    password: "vater",
    passwordCaseInsensitive: true,
    motd: [
      "── ennis.e67 — CentralOS v2.1 ─────────────────",
      "Letzte Anmeldung: 06.11.1997 02:14 (lokal)",
      "Du bist eingeloggt als: ennis",
      "",
      "WARNUNG: PRIVATER RECHNER. ZUGRIFF PROTOKOLLIERT.",
      "(das ist gelogen. ich protokolliere nichts.)",
      "",
      "Tippe 'ls', 'cat <datei>' oder 'exit'.",
    ],
    files: {
      "dienstplan.txt": [
        "── nachtschicht, sektor-logistik, KW 45 ──────",
        "",
        "  Mo  22:00 — 06:00   schacht 3 + 4",
        "  Di  22:00 — 06:00   schacht 3 + 4",
        "  Mi  FREI",
        "  Do  22:00 — 06:00   schacht 3 + 4 + 7",
        "  Fr  22:00 — 06:00   schacht 3 + 4 + 7",
        "  Sa  22:00 — 06:00   schacht 3 + 4 + 7",
        "  So  FREI",
        "",
        "anmerkung: drei schächte allein sind regelwidrig.",
        "ich beschwere mich nicht. linientreue zählt mehr.",
      ],
      "meldungen_offen.log": [
        "── meldungen, status: offen ──────────────────",
        "",
        "  (keine.)",
        "",
        "── meldungen, status: zurückgezogen ──────────",
        "",
        "  06.11.1997 01:12  bewohner 2611 — verdacht",
        "                    auf abweichendes verhalten",
        "                    ZURÜCKGEZOGEN um 01:14",
        "                    grund: keine angabe",
      ],
    },
    dynamicFiles: (hasFlag) => {
      const out: Record<string, string[]> = {};
      if (hasFlag("ennisCracked")) {
        out[".versteckt_presse.txt"] = [
          "── private sammlung, nicht weitergeben ───────",
          "",
          "1991  abendkurier:    'sektor E67 hört zu'",
          "1992  morgenblatt:    'frequenzkritik wächst'",
          "1993  freie presse:   'sektor E81 — was bleibt'",
          "1994  abendkurier:    'die letzten freien funker'",
          "1995  (alles ab hier nur noch in ZENTRAL.NETZ)",
          "",
          "warum ich das sammle:",
          "  weil mein vater drinsteht. einmal, kleine notiz.",
          "  '1993, korr, fernmeldetechniker, E67 → E81.'",
          "  ein satz. mein vater war ein satz.",
        ];
        out[".brief_an_vater.txt"] = [
          "── nie abgeschickt ───────────────────────────",
          "",
          "lieber vater,",
          "",
          "ich hab heute zum ersten mal seit sechs jahren",
          "wieder dein wort gesagt. laut. einem fremden.",
          "der hatte ein flugblatt. so eins wie deins.",
          "",
          "ich weiß nicht, ob du noch lebst.",
          "ich weiß nicht, ob diese frage noch erlaubt ist.",
          "",
          "ich werde diesen brief nicht abschicken.",
          "es gibt keine post nach E81.",
          "es gibt nur die schicht, die katze von nebenan,",
          "und die hoffnung, dass jemand wie heute wiederkommt.",
          "",
          "                                            — e.",
        ];
      }
      return out;
    },
  },
  {
    ip: "10.67.36.01",
    host: "abschnitt.e67",
    desc: "Abschnittsverantwortlicher (Etage 3, 3601)",
    password: null,
  },
  {
    ip: "10.67.46.18",
    host: "drucker46.e67",
    desc: "Etagendrucker, Etage 4",
    password: "drucker",
    motd: [
      "── drucker46.e67 — PrintOS 1.1 ───────────────",
      "Tonerstand: 4%. Papierschacht 2: leer.",
      "Letzter Auftrag: »flugblatt_v3.ps« (412 Seiten)",
      "Tippe 'ls' oder 'exit'.",
    ],
    files: {
      "queue.log": [
        "06.11.1997 02:14  flugblatt_v3.ps  412 S.  USER: ?",
        "06.11.1997 02:51  flugblatt_v3.ps  abgebrochen (Toner)",
        "06.11.1997 03:02  flugblatt_v3.ps  WIEDER GESTARTET",
      ],
    },
  },
  {
    ip: "10.67.56.04",
    host: "kantine.e67",
    desc: "Kantinen-Terminal (Etage 5)",
    password: "B2B2B2",
    motd: [
      "── kantine.e67 — MealNet 0.9 ────────────────",
      "Heute: Eintopf §3, B2-Tabletten, Wasser.",
      "Tippe 'ls' oder 'exit'.",
    ],
    files: {
      "speiseplan.txt": [
        "Mo  Eintopf §3 + B2",
        "Di  Eintopf §3 + B2",
        "Mi  Eintopf §3 + B2",
        "Do  Eintopf §3 + B2",
        "Fr  Eintopf §3 + B2 (Doppelration)",
        "Sa  Eintopf §3",
        "So  geschlossen — bitte Vorräte planen",
      ],
    },
  },
  {
    ip: "10.71.0.1",
    host: "gateway.e71",
    desc: "Gateway Nachbarsektor E71",
    password: null,
  },
  {
    ip: "10.71.15.34",
    host: "sprechzimmer.e71",
    desc: "Sprechzimmer Sanitäter (E71)",
    password: null,
  },
  {
    // Miras Rechner — kein offizieller Eintrag, taucht aber im Routing auf,
    // weil sie sich an einen freien Port am Etagendrucker geklemmt hat.
    // IP-Bereich „99“ wird vom System eigentlich für Wartung reserviert.
    ip: "10.67.99.16",
    host: "mira.zks",
    desc: "Unbekannt — kein Eintrag im Bewohnerverzeichnis",
    password: "ZENTRUMKAEFIGSTILLE",
    passwordCaseInsensitive: true,
    motd: [
      "── mira.zks — kein offizielles system ────────",
      "wenn du das hier liest, bist du entweder",
      "  (a) jemand, der zuhört, oder",
      "  (b) jemand, der zuhört, weil er muss.",
      "ich gehe vom ersten aus. das ist bereits eine entscheidung.",
      "",
      "Tippe 'ls' oder 'exit'. Wenn du nicht weißt, was Z.K.S.",
      "bedeutet: lies 'manifest.txt'. Wenn du es weißt: 'logbuch.txt'.",
    ],
    files: {
      "manifest.txt": [
        "── Z.K.S. — Zentrum.Käfig.Stille ─────────────",
        "",
        "1. 104,6 ist kein medikament. 104,6 ist eine leine.",
        "   ein gutes mittel würde den schmerz nehmen,",
        "   nicht dich an den schmerz gewöhnen.",
        "",
        "2. die quadranten sind keine wohnform.",
        "   die quadranten sind eine sortieranlage.",
        "   du bist nicht zuhause. du bist abgelegt.",
        "",
        "3. die leitstelle hört zu. das schmerz-radio sendet.",
        "   wer empfängt, sendet auch. wer sendet, wird gehört.",
        "   wer gehört wird, wird verwaltet.",
        "",
        "4. der weg hinaus beginnt mit einer minute stille.",
        "   schalt das radio aus. eine minute.",
        "   du wirst dich erschrecken. das ist der punkt.",
        "",
        "5. wir sind keine bewegung. wir sind eine vermutung.",
        "   eine vermutung, die sich weitergibt.",
        "",
        "                                              — Z.K.S.",
      ],
      "logbuch.txt": [
        "tag 0   ich habe einen freien port am etagendrucker gefunden.",
        "tag 0   ich habe einen rechner angeschlossen.",
        "tag 0   niemand hat es gemerkt.",
        "",
        "tag 12  flugblatt v1 — 18 seiten, zu lang. niemand liest 18 seiten.",
        "tag 19  flugblatt v2 — 6 seiten, zu höflich. niemand reagiert auf höflich.",
        "tag 27  flugblatt v3 — 1 seite. die richtige.",
        "",
        "tag 31  drucker46 hat 412 seiten ausgespuckt, bevor ihm der toner ausging.",
        "        ich war stolz. ich war auch dumm.",
        "        die putzkolonne hat 397 davon weggeworfen.",
        "        15 sind in der welt. das reicht.",
        "",
        "tag 33  ein bewohner aus E67 läuft heute durch die etagen.",
        "        kein empfänger im ohr. ungewöhnlich.",
        "        ich werde ihn ansprechen, wenn er an mir vorbeikommt.",
        "        wenn er nicht vorbeikommt, war es nicht der richtige.",
      ],
      "verteiler.txt": [
        "── verteilerliste, intern. nicht ausdrucken. ─",
        "",
        "  E67  philippe.2613   — hört zu. schreibt mit.",
        "  E67  worag.2611      — heute zum ersten mal sichtbar.",
        "  E67  bauerfeind, I.  — komplizierter fall. siehe weiter.",
        "  E71  mikael, 1534    — ursprung. hat angefangen, hört auf.",
        "  E71  rezeption       — keine option. nie.",
        "",
        "  ALLE: keine namen aussprechen. keine namen telefonieren.",
        "        keine namen ins ZENTRAL.NETZ.",
      ],
      "frequenzen.txt": [
        "── frequenzen, jenseits der erlaubten ────────",
        "",
        "  102,3   einsamkeit  (sendet, wer empfängt)",
        "  104,6   schmerz     (offiziell. die leine.)",
        "  107,9   stille      (nicht dokumentiert.",
        "          erreichbar nur mit getuntem empfänger.",
        "          wer dort hört, hört nichts. das ist alles.)",
        "",
        "  wer das hier weitergibt: bitte nur mündlich.",
      ],
      "passwort.hint": [
        "drei worte, die du jeden tag im kopf hast,",
        "auch wenn du sie nie aussprichst.",
        "in der reihenfolge: ZENTRUM. KAEFIG. STILLE.",
        "(zusammengeschrieben. ohne umlaut. ohne punkt.)",
      ],
    },
  },
];

function findHost(query: string): NetHost | null {
  const q = query.toLowerCase().trim();
  return (
    NET_HOSTS.find((h) => h.host.toLowerCase() === q || h.ip === q) ?? null
  );
}

/**
 * Hilfetext, kontextabhängig.
 * Layards Terminal (Worag-Modus) erwähnt Bodos Maschine an keiner Stelle —
 * weder das Lotti-Programm noch die Hausmeister-Wartungsbefehle, noch
 * Hinweise wie „nur 2611". Auf Bodos Konsole bleibt alles sichtbar.
 */
function buildHelpLines(bodoMode: boolean): Line[] {
  const lines: Line[] = [
    { text: "VERFÜGBARE BEFEHLE:", kind: "system" },
    { text: "  help          — Diese Liste anzeigen", kind: "out" },
    { text: "  inbox         — Posteingang anzeigen", kind: "out" },
    { text: "  read <id>     — Nachricht öffnen", kind: "out" },
    { text: "  status        — Systemstatus", kind: "out" },
    { text: "", kind: "out" },
    { text: "DATEISYSTEM:", kind: "system" },
    { text: "  pwd           — Aktuelles Verzeichnis", kind: "out" },
    { text: "  ls [-a]       — Inhalt auflisten (-a: versteckte Dateien)", kind: "out" },
    { text: "  cd <pfad>     — Verzeichnis wechseln (.. = aufwärts, / = root)", kind: "out" },
    { text: "  cat <datei>   — Datei lesen", kind: "out" },
    { text: "  tree          — Baumansicht ab aktuellem Pfad", kind: "out" },
    { text: "", kind: "out" },
    { text: "NETZWERK:", kind: "system" },
    { text: "  net           — Bekannte Hosts im Sektornetz auflisten", kind: "out" },
    { text: "  telnet <host> — Verbindungsversuch zu einem Host", kind: "out" },
    { text: "", kind: "out" },
    { text: "PROGRAMME:", kind: "system" },
  ];
  if (bodoMode) {
    lines.push(
      { text: "  lotti         — Fütterungskalender (Eigenbau, für Lotti)", kind: "out" },
      { text: "", kind: "out" },
      { text: "WARTUNG (nur Hausmeister):", kind: "system" },
      { text: "  maint list                — offene Wartungsanfragen anzeigen", kind: "out" },
      { text: "  maint cancel <id>         — Anfrage stornieren", kind: "out" },
      { text: "", kind: "out" },
    );
  } else {
    lines.push(
      { text: "  adventure     — »Ein Tag draußen« (Textadventure)", kind: "out" },
      { text: "", kind: "out" },
    );
  }
  lines.push(
    { text: "TAB-VERVOLLSTÄNDIGUNG:", kind: "system" },
    { text: "  <Tab>         — Aktuelles Wort vervollständigen", kind: "out" },
    { text: "                  (Befehle, Verzeichnisse, Dateinamen)", kind: "out" },
    { text: "  <Tab><Tab>    — Bei mehreren Treffern: Liste anzeigen", kind: "out" },
    { text: "  Funktioniert auch im Adventure und in Telnet-Sitzungen.", kind: "out" },
    { text: "  ↑ / ↓         — Im Befehlsverlauf navigieren", kind: "out" },
    { text: "", kind: "out" },
    { text: "  clear         — Bildschirm leeren", kind: "out" },
    { text: "  exit          — Terminal schließen", kind: "out" },
  );
  return lines;
}

export function Terminal() {
  const {
    terminalOpen,
    closeTerminal,
    inventory,
    flags,
    api,
    knowledge,
    terminalBodoMode,
  } = useGame();
  const { sfxVolume } = useSettings();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string[]>([...HOME_PATH_WORAG]);
  const [advState, setAdvState] = useState<AdvState | null>(null);
  const [lottiState, setLottiState] = useState<LottiState | null>(null);
  // Aktive Telnet-Sitzung (null = keine).
  const [telnetHost, setTelnetHost] = useState<string | null>(null);
  // Telnet wartet auf Passworteingabe für diesen Host.
  const [telnetAwaitPass, setTelnetAwaitPass] = useState<string | null>(null);
  // True während eine scriptgesteuerte Ausgabesequenz läuft (sysupdate, trouble net).
  const [scriptedRunning, setScriptedRunning] = useState(false);
  // Wenn Bodo gerade B3 für Lotti holt, sitzen wir an seinem Terminal —
  // ohne Login, mit seinem Hostnamen, mit altem CentralOS v2.0.
  // Wird explizit über openTerminal(true) am Hotspot in Bodos Wohnung gesetzt.
  // Layards eigenes Terminal (TopBar, Wohnung 2611, Sektor-Türen-Terminal)
  // läuft immer im normalen Phosphor-Grün-Modus.
  const bodoMode = terminalBodoMode;
  const userName = bodoMode ? "bodo" : "worag";
  // Beide Maschinen hängen am Sektor-Netz E67 — der Hostname ist
  // konsistent „e67“, nur der Benutzer wechselt.
  const hostName = "e67";
  const homePath = bodoMode ? HOME_PATH_BODO : HOME_PATH_WORAG;
  const homeLabel = bodoMode ? "/home/bodo" : "/home/worag";
  // ── Filesystem-Adapter: leiten je nach Modus auf den jeweiligen Baum.
  // Damit bleibt der Rest der Komponente unverändert lesbar; alle
  // resolvePath/pathString-Aufrufe greifen automatisch auf den richtigen
  // Baum (Worag oder Bodo). Mono-`FILESYSTEM` gibt es nicht mehr.
  const resolvePath = bodoMode ? resolveBodo : resolveWorag;
  const pathString = bodoMode ? pathStringBodo : pathStringWorag;
  const FILESYSTEM = bodoMode ? FILESYSTEM_BODO : FILESYSTEM_WORAG;
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTabRef = useRef<{ input: string; matches: string[] } | null>(null);
  // Befehlsverlauf — getrennt für Hauptterminal und Adventure.
  const termHistoryRef = useRef<string[]>([]);
  const advHistoryRef = useRef<string[]>([]);
  // Aktueller Verlaufs-Cursor (-1 = nicht im Verlauf, sonst Index von hinten).
  const historyCursorRef = useRef<number>(-1);
  // Eingabe, die der Nutzer gerade getippt hat, bevor er in den Verlauf gesprungen ist.
  const draftRef = useRef<string>("");

  useEffect(() => {
    if (terminalOpen) {
      setCwd([...homePath]);
      if (bodoMode) {
        const updated = flags.has("centralOsUpdatedBodo");
        const banner: Line[] = [
          {
            text: `>> CENTRALOS v${osVersion(updated, true)} — Terminal 2612`,
            kind: "system",
          },
          { text: ">> Benutzer: BODO (eingeloggt — keine Sperre aktiv)", kind: "system" },
          { text: ">> Letzte Anmeldung: 06.11.1997 09:11", kind: "system" },
          { text: "", kind: "out" },
        ];
        if (!updated) {
          banner.push(
            {
              text: "╔════════════════════════════════════════════════╗",
              kind: "system",
            },
            {
              text: "║  AKTUALISIERUNG VERFÜGBAR — DRINGEND EMPFOHLEN ║",
              kind: "system",
            },
            {
              text: "║  Ihr System: CentralOS v2.0  →  v2.3.1         ║",
              kind: "system",
            },
            {
              text: "║  Tippen Sie:  sysupdate                        ║",
              kind: "system",
            },
            {
              text: "║  (Sie wurden 1.247 Mal daran erinnert.)        ║",
              kind: "system",
            },
            {
              text: "╚════════════════════════════════════════════════╝",
              kind: "system",
            },
            { text: "", kind: "out" },
          );
        }
        banner.push({ text: ">> Tippe 'help' für Befehle.", kind: "system" });
        banner.push({ text: "", kind: "out" });
        setLines(banner);
      } else {
        setLines([
          {
            text: `>> CENTRALOS v${osVersion(flags.has("centralOsUpdated"))} — Terminal Quadrant E67`,
            kind: "system",
          },
          { text: ">> Benutzer: WORAG, L. (Zimmer 2611)", kind: "system" },
          { text: ">> Persönliches Verzeichnis bereit (siehe 'help' › DATEISYSTEM)", kind: "system" },
          { text: ">> Tippe 'help' für Befehle.", kind: "system" },
          { text: "", kind: "out" },
        ]);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    // bodoMode-Wechsel beim Öffnen ist statisch; banner einmal pro Open setzen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  if (!terminalOpen) return null;

  // Spielt eine scriptgesteuerte Sequenz ab: hängt Zeilen mit gestaffelten
  // Verzögerungen an, deaktiviert die Eingabe und ruft am Ende `done` auf.
  const runScriptedSequence = (
    steps: { text: string; delayMs: number; kind?: Line["kind"]; beep?: boolean }[],
    done?: () => void,
  ) => {
    setScriptedRunning(true);
    let acc = 0;
    for (const step of steps) {
      acc += Math.max(0, step.delayMs);
      setTimeout(() => {
        if (step.beep) playBeep(0.25 * sfxVolume);
        setLines((prev) => [...prev, { text: step.text, kind: step.kind ?? "out" }]);
      }, acc);
    }
    setTimeout(() => {
      setLines((prev) => [...prev, { text: "", kind: "out" }]);
      setScriptedRunning(false);
      done?.();
      setTimeout(() => inputRef.current?.focus(), 30);
    }, acc + 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scriptedRunning) return;
    const raw = input.trim();
    if (!raw) return;

    // ── Undokumentierter Cheat ─────────────────────────────
    // »cheat 2611« an *jedem* Terminal verwandelt das aktuelle
    // Terminal bis zum Exit in das Wartungsterminal hinter Tür 5610.
    // Funktioniert auch innerhalb laufender Sub-Programme
    // (adventure, lotti, telnet-Passwort-Prompt) — daher steht es
    // ganz oben, vor allen Sub-Modus-Weichen.
    if (raw.toLowerCase() === "cheat 2611") {
      playBeep(0.5 * sfxVolume);
      setInput("");
      // Sub-States sauber zurücksetzen, damit beim nächsten regulären
      // Öffnen kein Sub-Programm mehr aktiv ist.
      setAdvState(null);
      setLottiState(null);
      // Direkt in den Server-Knoten springen. openNode5610 schließt
      // das Terminal und blendet NodeTerminal ein. „Bis zum Exit"
      // ergibt sich von selbst: der Knoten schließt mit exit.
      api.openNode5610();
      return;
    }

    // ── Debug-Cheat »cheat 0001« ──────────────────────────
    // Springt mitten in Akt 1: Sanitäter waren da, Layard hat das
    // Einsatzprotokoll, die Aufzugswartung 4711 ist bereits storniert,
    // und er weiß bereits, dass der Abschnittsverantwortliche in 3601
    // nicht da ist. Endpunkt: Wohnung 2611 — Telefon ist freigeschaltet
    // (sawEmptyOffice), so dass der nächste Anruf bei Insa direkt zu
    // E71/Stegmann weiterleitet.
    if (raw.toLowerCase() === "cheat 0001") {
      playBeep(0.5 * sfxVolume);
      setInput("");
      setAdvState(null);
      setLottiState(null);

      // Story-Flags der vorausliegenden Akt-1-Szenen.
      const flagsToSet: StoryFlag[] = [
        // Philippe-Begegnung & Notruf
        "metPhilippeBefore",
        "knockingHeard",
        "talkedPhilippe2613",
        "calledLeitstelle",
        "paramedicsArrived",
        "doorBrokenOpen",
        // Wohnung 2615 / Patient / Protokoll
        "sawCatatonic",
        "protocolReceived",
        // Aufzugs-Wartungssperre wurde gesetzt UND wieder gelöscht
        "elevatorMaintBlocked",
        "elevatorMaintCleared",
        // E67 erkundet, Abschnittsverantwortlicher abwesend
        "sawEmptyOffice",
      ];
      for (const f of flagsToSet) api.setFlag(f);

      // Wissens-Flag, das der Sanitäter normalerweise vergibt.
      api.setKnowledge("responsibilityE67");

      // Inventar: Einsatzprotokoll (verschlüsselt), wie vom Sanitäter übergeben.
      if (!api.hasItem("protocol")) {
        api.addItem({
          id: "protocol",
          name: "Einsatzprotokoll (verschlüsselt)",
          description:
            "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
        });
      }

      setLines((prev) => [
        ...prev,
        { text: `worag@centralos:~$ ${raw}`, kind: "in" },
        { text: ">> [DEBUG] Akt-1-Sprungpunkt geladen.", kind: "system" },
        { text: ">> Flags gesetzt: Protokoll erhalten, Aufzug 4711 storniert,", kind: "out" },
        { text: ">> Büro 3601 (Abschnittsverantwortlicher) als leer markiert.", kind: "out" },
        { text: ">> Rückkehr in Wohnung 2611.", kind: "system" },
        { text: "", kind: "out" },
      ]);

      // Terminal schließen und Spieler in Wohnung 2611 absetzen.
      setTimeout(() => {
        closeTerminal();
        api.goTo("apartment");
      }, 250);
      return;
    }

    // ── Debug-Cheat »cheat 0002« ──────────────────────────
    // Springt direkt vor den letzten Insa-Anruf: alles aus Akt 1
    // ist erledigt, Layard war in E71, hat Mikael getroffen, der
    // das Protokoll abgelehnt hat. Endpunkt: Wohnung 2611 — der
    // nächste Klick aufs Telefon startet `insaAct2Return` und
    // damit den Abspann.
    if (raw.toLowerCase() === "cheat 0002") {
      playBeep(0.5 * sfxVolume);
      setInput("");
      setAdvState(null);
      setLottiState(null);

      const flagsToSet: StoryFlag[] = [
        // Akt 1 (identisch zu cheat 0001)
        "metPhilippeBefore",
        "knockingHeard",
        "talkedPhilippe2613",
        "calledLeitstelle",
        "paramedicsArrived",
        "doorBrokenOpen",
        "sawCatatonic",
        "protocolReceived",
        "elevatorMaintBlocked",
        "elevatorMaintCleared",
        "sawEmptyOffice",
        // Übergang Akt 1 → Akt 2: Sektor-Tür offen, E71 betreten
        "elevatorTaken",
        "sectorDoorOpen",
        "enteredE71",
        // Empfang E71 + Mikael — Protokoll wurde abgelehnt
        "metReceptionist",
        "foundRoom1534",
        "metMikael",
        "heardMikaelTruth",
        "mikaelRejectedProtocol",
        // Korridor 56 / Serverraum 5610 vollständig zugänglich
        "saw5610Door",
        "insaSentTo5610",
        "serverRoom5610OverrideArmed",
        "serverRoom5610Open",
      ];
      for (const f of flagsToSet) api.setFlag(f);

      // Wissens-Flag, das der Sanitäter normalerweise vergibt.
      api.setKnowledge("responsibilityE67");

      // Inventar: das (abgelehnte) Einsatzprotokoll trägt Layard
      // nach dem Mikael-Gespräch unverändert wieder zurück.
      if (!api.hasItem("protocol")) {
        api.addItem({
          id: "protocol",
          name: "Einsatzprotokoll (verschlüsselt)",
          description:
            "Eine versiegelte Datenkapsel. Ziel: Sektor E71, Zimmer 1534. Etikett: „Fall-ID 5245@E67@2613“.",
        });
      }

      setLines((prev) => [
        ...prev,
        { text: `worag@centralos:~$ ${raw}`, kind: "in" },
        { text: ">> [DEBUG] Akt-2-Endsprung geladen.", kind: "system" },
        { text: ">> Mikael hat das Protokoll abgelehnt. Layard ist zurück in 2611.", kind: "out" },
        { text: ">> Nächster Klick aufs Telefon → Abspann.", kind: "system" },
        { text: "", kind: "out" },
      ]);

      setTimeout(() => {
        closeTerminal();
        api.goTo("apartment");
      }, 250);
      return;
    }

    // ── Sub-Modus: adventure.bin läuft ─────────────────────
    if (advState) {
      playBeep(0.3 * sfxVolume);
      const echo: Line = { text: `> ${input}`, kind: "in" };
      const result = adventureCommand(advState, raw);
      const out: Line[] = result.out.map((t) => ({ text: t, kind: "out" } as Line));
      setLines((prev) => [...prev, echo, ...out, { text: "", kind: "out" }]);
      // History des Adventures pflegen (keine direkten Duplikate hintereinander).
      const h = advHistoryRef.current;
      if (h[h.length - 1] !== raw) h.push(raw);
      historyCursorRef.current = -1;
      draftRef.current = "";
      if (result.quit) {
        setAdvState(null);
      } else {
        // force re-render after mutation
        setAdvState({ ...advState });
      }
      setInput("");
      return;
    }

    // ── Sub-Modus: lotti läuft (Bodos Programm) ────────────
    if (lottiState) {
      playBeep(0.3 * sfxVolume);
      const echo: Line = { text: `lotti> ${input}`, kind: "in" };
      const result = lottiCommand(lottiState, raw);
      const out: Line[] = result.out.map((t) => ({ text: t, kind: "out" } as Line));
      setLines((prev) => [...prev, echo, ...out, { text: "", kind: "out" }]);
      const h = advHistoryRef.current;
      if (h[h.length - 1] !== raw) h.push(raw);
      historyCursorRef.current = -1;
      draftRef.current = "";
      if (result.quit) {
        setLottiState(null);
      } else {
        setLottiState({ ...lottiState });
      }
      setInput("");
      return;
    }

    // ── Sub-Modus: Telnet wartet auf Passwort ─────────────
    if (telnetAwaitPass) {
      const host = findHost(telnetAwaitPass);
      const echo: Line = { text: `Password: ${"*".repeat(input.length)}`, kind: "in" };
      const out: Line[] = [];
      const passOk =
        host && host.password
          ? host.passwordCaseInsensitive
            ? raw.toLowerCase() === host.password.toLowerCase()
            : raw === host.password
          : false;
      if (passOk && host) {
        playUnlock(0.5 * sfxVolume);
        out.push({ text: ">> Authentifizierung erfolgreich.", kind: "system" });
        if (host.motd) {
          out.push(...host.motd.map((t) => ({ text: t, kind: "out" } as Line)));
        }
        setTelnetHost(telnetAwaitPass);
        setTelnetAwaitPass(null);
        // Easter-Egg: Philippe-Login als Flag merken (für späteren Story-Hook).
        if (host.host === "philippe.e67") {
          api.setFlag("hackedPhilippe");
        }
      } else {
        playBeep(0.3 * sfxVolume);
        out.push({ text: ">> FEHLER: Passwort abgelehnt. Verbindung getrennt.", kind: "out" });
        setTelnetAwaitPass(null);
      }
      setLines((prev) => [...prev, echo, ...out, { text: "", kind: "out" }]);
      setInput("");
      return;
    }

    // ── Sub-Modus: aktive Telnet-Sitzung ──────────────────
    if (telnetHost) {
      const host = findHost(telnetHost);
      const hostFiles: Record<string, string[]> = {
        ...(host?.files ?? {}),
        ...(host?.dynamicFiles?.((f) => flags.has(f)) ?? {}),
      };
      const tTokens = raw.split(/\s+/);
      const echo: Line = {
        text: `${host?.host ?? telnetHost}:~$ ${input}`,
        kind: "in",
      };
      const out: Line[] = [];
      const tHead = tTokens[0]?.toLowerCase() ?? "";
      const tArgs = tTokens.slice(1);
      if (tHead === "exit" || tHead === "logout" || tHead === "quit") {
        out.push({ text: ">> Verbindung geschlossen.", kind: "system" });
        setTelnetHost(null);
      } else if (tHead === "ls" || tHead === "dir") {
        const showAll = tArgs.includes("-a") || tArgs.includes("-la") || tArgs.includes("-al");
        const names = Object.keys(hostFiles)
          .filter((n) => showAll || !n.startsWith("."))
          .sort();
        if (!names.length) out.push({ text: "  (leer)", kind: "out" });
        else out.push(...names.map((n) => ({ text: `  ${n}`, kind: "out" } as Line)));
      } else if (tHead === "cat" || tHead === "more" || tHead === "type") {
        const fname = tArgs[0];
        const files = hostFiles;
        if (!fname) out.push({ text: "cat: Dateiname fehlt.", kind: "out" });
        else if (!files[fname]) out.push({ text: `cat: ${fname}: nicht gefunden.`, kind: "out" });
        else {
          out.push({ text: `── ${fname} ───────────────`, kind: "system" });
          out.push(...files[fname].map((t) => ({ text: t, kind: "out" } as Line)));
          out.push({ text: "── EOF ───────────────────", kind: "system" });
        }
      } else if (tHead === "whoami") {
        out.push({ text: host?.host.split(".")[0] ?? "guest", kind: "out" });
      } else if (tHead === "help" || tHead === "?") {
        out.push(
          { text: "Verfügbar: ls, cat <datei>, whoami, exit", kind: "out" },
        );
      } else {
        out.push({ text: `${tHead}: Befehl in Sitzung nicht verfügbar.`, kind: "out" });
      }
      setLines((prev) => [...prev, echo, ...out, { text: "", kind: "out" }]);
      const h = termHistoryRef.current;
      if (h[h.length - 1] !== raw) h.push(raw);
      historyCursorRef.current = -1;
      draftRef.current = "";
      setInput("");
      return;
    }

    const cmd = raw.toLowerCase();
    const argsRaw = raw.split(/\s+/);
    const head = argsRaw[0]?.toLowerCase() ?? "";
    const args = argsRaw.slice(1);
    playBeep(0.4 * sfxVolume);
    const promptPath = pathString(cwd).replace(homeLabel, "~") || "/";
    const newLines: Line[] = [
      { text: `${userName}@${hostName}:${promptPath}$ ${input}`, kind: "in" },
    ];

    if (cmd === "help") {
      newLines.push(...buildHelpLines(bodoMode));
      if (!bodoMode && flags.has("calledInsa2") && !flags.has("calledStegmann")) {
        newLines.push(
          { text: "", kind: "out" },
          {
            text: "  report exit  — Ausgangsmeldung an Leitstelle übermitteln",
            kind: "out",
          },
        );
      }
      if (
        !bodoMode &&
        flags.has("calledStegmann") &&
        !(flags.has("centralOsUpdated") && flags.has("troubleReported"))
      ) {
        newLines.push(
          { text: "", kind: "out" },
          { text: "WARTUNG (Anweisung Stegmann):", kind: "system" },
          {
            text: `  sysupdate     — CentralOS-Aktualisierung (E67-Netz)        ${flags.has("centralOsUpdated") ? "" : "✶ERFORDERLICH"}`.trimEnd(),
            kind: "out",
          },
          {
            text: `  trouble net   — Netzwerkproblem an Leitstelle E67 melden  ${flags.has("troubleReported") ? "" : flags.has("centralOsUpdated") ? "✶ERFORDERLICH" : ""}`.trimEnd(),
            kind: "out",
          },
        );
      }
    } else if (cmd === "adventure" || cmd === "./adventure.bin" || cmd === "adventure.bin") {
      if (bodoMode) {
        // Worags Textadventure liegt in /home/worag — nicht auf Bodos Maschine.
        newLines.push(
          {
            text: "bash: adventure: Befehl nicht gefunden.",
            kind: "out",
          },
          {
            text: "(»adventure.bin« liegt im /home/worag — andere Maschine.)",
            kind: "out",
          },
        );
      } else {
        const fresh = newAdventureState();
        setAdvState(fresh);
        newLines.push(
          ...adventureStart(fresh).map((t) => ({ text: t, kind: "out" } as Line)),
        );
      }
    } else if (cmd === "lotti" || cmd === "./lotti" || cmd === "lotti.bin") {
      if (!bodoMode) {
        newLines.push(
          { text: "bash: lotti: Befehl nicht gefunden.", kind: "out" },
        );
      } else {
        const fresh = newLottiState();
        setLottiState(fresh);
        newLines.push(
          ...lottiStart(fresh).map((t) => ({ text: t, kind: "out" } as Line)),
        );
      }
    } else if (cmd === "clear") {
      setLines([]);
      setInput("");
      return;
    } else if (cmd === "exit") {
      closeTerminal();
      setInput("");
      return;
    } else if (cmd === "status") {
      newLines.push(
        { text: "SYSTEMSTATUS:", kind: "system" },
        {
          text: `  CENTRALOS         [ v${osVersion(flags.has(bodoMode ? "centralOsUpdatedBodo" : "centralOsUpdated"), bodoMode)} ]`,
          kind: "out",
        },
        { text: "  E67.NETZ          [ STABIL ]", kind: "out" },
        {
          text: `  ZENTRAL.NETZ      [ ${flags.has("centralOsUpdated") || flags.has("calledForCode") ? "WARTUNG" : "STÖRUNG: ERROR 4567"} ]`,
          kind: "out",
        },
        { text: "  GATEWAY E67/E71   [ MANUELLER CODE ERFORDERLICH ]", kind: "out" },
      );
    } else if (cmd === "inbox") {
      const showExitMail =
        flags.has("calledInsa2") &&
        !flags.has("reportedExit") &&
        !flags.has("calledStegmann");
      const showStegmannMail = flags.has("calledStegmann");
      const showTicketMail = flags.has("troubleReported");
      const count =
        2 +
        (flags.has("calledForCode") ? 1 : 0) +
        (showExitMail ? 1 : 0) +
        (showStegmannMail ? 1 : 0) +
        (showTicketMail ? 1 : 0);
      newLines.push(
        { text: `POSTEINGANG (${count}):`, kind: "system" },
        { text: "  [001] 06.11.1997  Insa Bauerfeind — Wartungsfenster Gateway", kind: "out" },
        { text: "  [002] 04.11.1997  Stegmann (IT)    — Bitte: Störungsmeldung einreichen", kind: "out" },
      );
      if (showExitMail) {
        newLines.push({
          text: "  [004] 06.11.1997  Leitstelle E67   — Ausgangsmeldung: Standardprotokoll  ✶NEU",
          kind: "system",
        });
      }
      if (flags.has("calledForCode")) {
        newLines.push({
          text: "  [003] 06.11.1997  Insa Bauerfeind — Sektor-Tür: Manueller Code  ✶NEU",
          kind: "system",
        });
      }
      if (showStegmannMail) {
        newLines.push({
          text: `  [005] 06.11.1997  Stegmann (IT)    — Anweisung: sysupdate + trouble net  ${flags.has("centralOsUpdated") && flags.has("troubleReported") ? "" : "✶NEU"}`.trimEnd(),
          kind: "system",
        });
      }
      if (showTicketMail) {
        newLines.push({
          text: "  [006] 06.11.1997  ZENTRAL.NETZ     — Ticket #E67-19971106-0042 angenommen",
          kind: "out",
        });
      }
    } else if (cmd === "read 001") {
      newLines.push(
        { text: "── Nachricht 001 ─────────────────────", kind: "system" },
        { text: "Von:    Bauerfeind, I. (Leitstelle E67)", kind: "out" },
        { text: "Datum:  06.11.1997 14:23", kind: "out" },
        { text: "Betreff: Wartungsfenster Gateway", kind: "out" },
        { text: "", kind: "out" },
        { text: "Sehr geehrter Bewohner Worag,", kind: "out" },
        { text: "im Zeitraum vom 06.11. bis 12.11. werden am", kind: "out" },
        { text: "Sektor-Gateway E67/E71 Wartungsarbeiten durchgeführt.", kind: "out" },
        { text: "Bitte beachten Sie, dass Authentifizierungsfehler", kind: "out" },
        { text: "(ERROR 4567) auftreten können. Im Zweifel: 001.", kind: "out" },
        { text: "── Ende ──────────────────────────────", kind: "system" },
      );
    } else if (cmd === "read 002") {
      newLines.push(
        { text: "── Nachricht 002 ─────────────────────", kind: "system" },
        { text: "Von:    Stegmann (Zentral-IT)", kind: "out" },
        { text: "Datum:  04.11.1997 09:12", kind: "out" },
        { text: "Betreff: Störungsmeldungen", kind: "out" },
        { text: "", kind: "out" },
        { text: "Bitte melden Sie Netzstörungen umgehend.", kind: "out" },
        { text: "Jede Meldung beschleunigt das Ticket-System.", kind: "out" },
        { text: "── Ende ──────────────────────────────", kind: "system" },
      );
    } else if (cmd === "read 003") {
      if (!flags.has("calledForCode")) {
        newLines.push({ text: "FEHLER: Nachricht existiert nicht.", kind: "out" });
      } else {
        newLines.push(
          { text: "── Nachricht 003 ─────────────────────", kind: "system" },
          { text: "Von:    Bauerfeind, I.", kind: "out" },
          { text: "Datum:  06.11.1997 16:48", kind: "out" },
          { text: "Betreff: Sektor-Tür — Manueller Code", kind: "out" },
          { text: "", kind: "out" },
          { text: "Wie besprochen. Ich habe den Code extra für Sie geändert.", kind: "out" },
          { text: "Sie kennen das Datum. Tippen Sie es am Keypad ein —", kind: "out" },
          { text: "ohne Punkte. Acht Ziffern.", kind: "out" },
          { text: "I. B.", kind: "out" },
          { text: "── Ende ──────────────────────────────", kind: "system" },
        );
      }
    } else if (cmd === "read 004") {
      if (
        !flags.has("calledInsa2") ||
        flags.has("reportedExit") ||
        flags.has("calledStegmann")
      ) {
        newLines.push({ text: "FEHLER: Nachricht existiert nicht.", kind: "out" });
      } else {
        newLines.push(
          { text: "── Nachricht 004 ─────────────────────", kind: "system" },
          { text: "Von:    Bauerfeind, I. (Leitstelle E67)", kind: "out" },
          { text: "Datum:  06.11.1997 15:55", kind: "out" },
          { text: "Betreff: Ausgangsmeldung — Standardprotokoll", kind: "out" },
          { text: "", kind: "out" },
          { text: "Bitte melden Sie Ihren Ausgang aus E67 elektronisch:", kind: "out" },
          { text: "  > report exit", kind: "system" },
          { text: "Adressat: LEITSTELLE25@ZENTRAL.NETZ.", kind: "out" },
          { text: "── Ende ──────────────────────────────", kind: "system" },
        );
      }
    } else if (cmd === "report exit" || cmd === "report") {
      if (cmd === "report") {
        newLines.push({
          text: "report: Argument fehlt. Versuchen Sie: report exit",
          kind: "out",
        });
      } else if (!flags.has("calledInsa2")) {
        newLines.push({
          text: "report: Keine Ausgangsmeldung erforderlich.",
          kind: "out",
        });
      } else if (
        flags.has("calledStegmann") &&
        flags.has("centralOsUpdated") &&
        flags.has("troubleReported") &&
        !flags.has("reportedExit")
      ) {
        playBeep(0.4 * sfxVolume);
        setTimeout(() => playUnlock(0.4 * sfxVolume), 360);
        newLines.push(
          { text: ">> AUSGANGSMELDUNG → LEITSTELLE25@ZENTRAL.NETZ", kind: "system" },
          { text: ">> Verbindung zu ROUTER567.ZENTRAL.NETZ … OK", kind: "out" },
          { text: ">> Übermittle Standardprotokoll …", kind: "out" },
          { text: ">> Bestätigungs-Token: AUSG-19971106-WORAG-OK", kind: "out" },
          { text: ">> Meldung zugestellt.", kind: "system" },
        );
        api.setFlag("reportedExit");
      } else if (flags.has("reportedExit")) {
        newLines.push(
          { text: ">> AUSGANGSMELDUNG → LEITSTELLE25@ZENTRAL.NETZ", kind: "system" },
          { text: ">> Bereits zugestellt. Bestätigungs-Token: AUSG-19971106-WORAG-OK", kind: "out" },
        );
      } else {
        playBeep(0.4 * sfxVolume);
        setTimeout(() => playBeep(0.3 * sfxVolume), 220);
        newLines.push(
          { text: ">> AUSGANGSMELDUNG → LEITSTELLE25@ZENTRAL.NETZ", kind: "system" },
          { text: ">> Verbindung zu ROUTER567.ZENTRAL.NETZ …", kind: "out" },
          { text: ">> ……………………………………………", kind: "out" },
          { text: ">> ERROR 4567: ZENTRAL.NETZ nicht erreichbar.", kind: "out" },
          { text: ">> Meldung NICHT zugestellt.", kind: "out" },
        );
        api.setFlag("reportedExit");
      }
    } else if (cmd === "read 005") {
      if (!flags.has("calledStegmann")) {
        newLines.push({ text: "FEHLER: Nachricht existiert nicht.", kind: "out" });
      } else {
        newLines.push(
          { text: "── Nachricht 005 ─────────────────────", kind: "system" },
          { text: "Von:    Stegmann (Zentral-IT)", kind: "out" },
          { text: "Datum:  06.11.1997 16:02", kind: "out" },
          { text: "Betreff: Anweisung — CentralOS aktualisieren & Störung melden", kind: "out" },
          { text: "", kind: "out" },
          { text: "Sehr geehrter Bewohner Worag,", kind: "out" },
          { text: "wie telefonisch besprochen, führen Sie bitte aus:", kind: "out" },
          { text: "", kind: "out" },
          { text: "  1.  sysupdate        — CentralOS-Aktualisierung (E67-Netz)", kind: "system" },
          { text: "  2.  trouble net      — Netzwerkproblem an Leitstelle E67", kind: "system" },
          { text: "", kind: "out" },
          { text: "Bitte in dieser Reihenfolge. Erst nach beiden Schritten", kind: "out" },
          { text: "wird die Ausgangsmeldung (»report exit«) zugestellt.", kind: "out" },
          { text: "", kind: "out" },
          { text: "Hinweis (intern): Die Aktualisierung kann mit dem Schalter", kind: "out" },
          { text: "»--fast« beschleunigt werden, wenn Sie sie wiederholen müssen.", kind: "out" },
          { text: "Stegmann", kind: "out" },
          { text: "── Ende ──────────────────────────────", kind: "system" },
        );
      }
    } else if (cmd === "read 006") {
      if (!flags.has("troubleReported")) {
        newLines.push({ text: "FEHLER: Nachricht existiert nicht.", kind: "out" });
      } else {
        newLines.push(
          { text: "── Nachricht 006 ─────────────────────", kind: "system" },
          { text: "Von:    ZENTRAL.NETZ — Ticket-System", kind: "out" },
          { text: "Datum:  06.11.1997 16:31", kind: "out" },
          { text: "Betreff: Ticket #E67-19971106-0042 angenommen", kind: "out" },
          { text: "", kind: "out" },
          { text: "Ihr Ticket wurde aufgenommen.", kind: "out" },
          { text: "Klassifizierung: ROUTING (Code 4567).", kind: "out" },
          { text: "Bearbeitungszeit: unbestimmt.", kind: "out" },
          { text: "Vielen Dank für Ihre Mitarbeit.", kind: "out" },
          { text: "── Ende ──────────────────────────────", kind: "system" },
        );
      }
    } else if (head === "sysupdate") {
      if (bodoMode) {
        if (flags.has("centralOsUpdatedBodo")) {
          newLines.push({ text: "sysupdate: System ist bereits aktuell.", kind: "out" });
        } else {
          const fast = args.includes("--fast");
          const t = (ms: number) => (fast ? Math.max(40, Math.round(ms / 8)) : ms);
          setLines((prev) => [...prev, ...newLines]);
          runScriptedSequence(
            [
              { text: ">> sysupdate: Verbinde mit update.e67 …", delayMs: t(0), kind: "system", beep: true },
              { text: ">> Suche Pakete für CentralOS v2.0 …", delayMs: t(380) },
              { text: ">> 6 Jahre an Patches gefunden. Konsolidiere …", delayMs: t(420) },
              { text: "   [██████████] 100%", delayMs: t(520), beep: true },
              { text: ">> Patch /usr/bin/centralos … OK", delayMs: t(360) },
              { text: ">> Migriere /etc/motd ……… OK", delayMs: t(280) },
              { text: ">> CentralOS v2.0 → v2.3.1   [OK]", delayMs: t(420), kind: "system", beep: true },
              { text: ">> Hinweis: Diese Aktualisierung wurde an die Leitstelle gemeldet.", delayMs: t(320), kind: "system" },
            ],
            () => api.setFlag("centralOsUpdatedBodo"),
          );
          const h = termHistoryRef.current;
          if (h[h.length - 1] !== raw) h.push(raw);
          historyCursorRef.current = -1;
          draftRef.current = "";
          setInput("");
          return;
        }
      } else if (!flags.has("calledStegmann")) {
        newLines.push({
          text: "sysupdate: Befehl nicht freigeschaltet. Voraussetzung: Anweisung der Zentral-IT.",
          kind: "out",
        });
      } else if (flags.has("centralOsUpdated")) {
        newLines.push({ text: "sysupdate: Bereits aktuell (CentralOS v2.3.1).", kind: "out" });
      } else {
        const fast = args.includes("--fast");
        const t = (ms: number) => (fast ? Math.max(40, Math.round(ms / 8)) : ms);
        setLines((prev) => [...prev, ...newLines]);
        runScriptedSequence(
          [
            { text: ">> sysupdate: Verbinde mit update.e67 …", delayMs: t(0), kind: "system", beep: true },
            { text: ">> Authentifizierung … OK", delayMs: t(420) },
            { text: ">> Lade Manifest centralos-2.3.1.pkg …", delayMs: t(380) },
            { text: "   [████░░░░░░] 12%", delayMs: t(280) },
            { text: "   [██████░░░░] 47%", delayMs: t(360) },
            { text: "   [██████████] 100%", delayMs: t(400), beep: true },
            { text: ">> Verifiziere SHA … OK", delayMs: t(320) },
            { text: ">> Stoppe Dienste:", delayMs: t(260), kind: "system" },
            { text: "   carrier-daemon …………… OK", delayMs: t(220) },
            { text: "   inbox-relay …………………… OK", delayMs: t(200) },
            { text: "   gateway-watch ……………… OK", delayMs: t(220) },
            { text: ">> Patch /usr/bin/centralos … OK", delayMs: t(380) },
            { text: ">> Patch /usr/bin/report …… OK", delayMs: t(360) },
            { text: ">> Migriere /etc/motd ……… OK", delayMs: t(280) },
            { text: ">> Starte Dienste neu:", delayMs: t(260), kind: "system" },
            { text: "   carrier-daemon …………… OK", delayMs: t(220) },
            { text: "   inbox-relay …………………… OK", delayMs: t(200) },
            { text: "   gateway-watch ……………… OK", delayMs: t(220) },
            { text: ">> CentralOS v2.3 → v2.3.1   [OK]", delayMs: t(420), kind: "system", beep: true },
            { text: ">> Bitte führen Sie nun »trouble net« aus.", delayMs: t(320), kind: "system" },
          ],
          () => api.setFlag("centralOsUpdated"),
        );
        // History pflegen, Eingabe leeren — Ausgabe läuft asynchron weiter.
        const h = termHistoryRef.current;
        if (h[h.length - 1] !== raw) h.push(raw);
        historyCursorRef.current = -1;
        draftRef.current = "";
        setInput("");
        return;
      }
    } else if (head === "trouble") {
      const sub = (args[0] ?? "").toLowerCase();
      if (!flags.has("calledStegmann")) {
        newLines.push({
          text: "trouble: Befehl nicht freigeschaltet. Voraussetzung: Anweisung der Zentral-IT.",
          kind: "out",
        });
      } else if (sub !== "net") {
        newLines.push({
          text: "trouble: Argument fehlt oder unbekannt. Versuchen Sie: trouble net",
          kind: "out",
        });
      } else if (!flags.has("centralOsUpdated")) {
        newLines.push({
          text: "trouble: Update erforderlich. Bitte zuerst »sysupdate« ausführen.",
          kind: "out",
        });
      } else if (flags.has("troubleReported")) {
        newLines.push({
          text: "trouble: Ticket bereits offen (#E67-19971106-0042).",
          kind: "out",
        });
      } else {
        setLines((prev) => [...prev, ...newLines]);
        runScriptedSequence(
          [
            { text: ">> trouble: Automatische Problemermittlung gestartet …", delayMs: 0, kind: "system", beep: true },
            { text: ">> Scanne lokales Segment E67 …………………… OK", delayMs: 520 },
            { text: ">> Scanne Gateway E67/E71 ……………………………… STÖRUNG", delayMs: 620 },
            { text: ">> Klassifizierung: ROUTING (Code 4567)", delayMs: 380 },
            { text: ">> Erzeuge Ticket #E67-19971106-0042 …… OK", delayMs: 460, beep: true },
            { text: ">> Übermittle an LEITSTELLE25@ZENTRAL.NETZ", delayMs: 380 },
            { text: ">> Ticket angenommen. Bearbeitungszeit: unbestimmt.", delayMs: 420, kind: "system" },
            { text: ">> Vielen Dank für Ihre Mitarbeit.", delayMs: 320 },
          ],
          () => api.setFlag("troubleReported"),
        );
        const h = termHistoryRef.current;
        if (h[h.length - 1] !== raw) h.push(raw);
        historyCursorRef.current = -1;
        draftRef.current = "";
        setInput("");
        return;
      }
    } else if (head === "pwd") {
      newLines.push({ text: pathString(cwd), kind: "out" });
    } else if (head === "ls") {
      const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const node = resolvePath(cwd);
      if (!node || node.type !== "dir") {
        newLines.push({ text: "ls: aktuelles Verzeichnis ungültig.", kind: "out" });
      } else {
        const hideHomeName = bodoMode ? "worag" : "bodo";
        newLines.push({ text: `Inhalt von ${pathString(cwd)}:`, kind: "system" });
        let kids = visibleChildren(node, showAll, (f) => flags.has(f));
        // /home zeigt jeweils nur das eigene Heimatverzeichnis — Sektor-
        // Privatsphäre. Layard sieht bodo dort nicht, Bodo nicht worag.
        if (pathString(cwd) === "/home") {
          kids = kids.filter((c) => c.name !== hideHomeName);
        }
        newLines.push(...formatLs(kids));
      }
    } else if (head === "cd") {
      const target = args[0] ?? "";
      const hideHomeName = bodoMode ? "worag" : "bodo";
      const isHiddenHome = (parts: string[]) =>
        parts.length >= 2 && parts[0] === "home" && parts[1] === hideHomeName;
      if (!target || target === "~") {
        setCwd([...homePath]);
      } else if (target === "/") {
        setCwd([]);
      } else if (target === "..") {
        setCwd((p) => p.slice(0, -1));
      } else {
        // support multi-segment paths like tagebuch/1986-09-12.txt's parent
        const segments = target.split("/").filter(Boolean);
        const base = target.startsWith("/") ? [] : [...cwd];
        let trial = base;
        let ok = true;
        for (const seg of segments) {
          if (seg === "..") {
            trial = trial.slice(0, -1);
            continue;
          }
          const probe = resolvePath([...trial, seg]);
          if (!probe || probe.type !== "dir" || isHiddenHome([...trial, seg])) {
            ok = false;
            break;
          }
          trial = [...trial, seg];
        }
        if (ok) {
          setCwd(trial);
        } else {
          newLines.push({ text: `cd: ${target}: Verzeichnis nicht gefunden.`, kind: "out" });
        }
      }
    } else if (head === "cat") {
      const target = args[0];
      if (!target) {
        newLines.push({ text: "cat: Dateiname fehlt.", kind: "out" });
      } else {
        const segments = target.split("/").filter(Boolean);
        const base = target.startsWith("/") ? [] : [...cwd];
        const fullParts = [...base, ...segments];
        const hideHomeName = bodoMode ? "worag" : "bodo";
        const isHiddenHome =
          fullParts.length >= 2 &&
          fullParts[0] === "home" &&
          fullParts[1] === hideHomeName;
        const node = isHiddenHome ? null : resolvePath(fullParts);
        if (!node) {
          newLines.push({ text: `cat: ${target}: Datei nicht gefunden.`, kind: "out" });
        } else if (node.type === "dir") {
          newLines.push({ text: `cat: ${target}: ist ein Verzeichnis.`, kind: "out" });
        } else if (node.requires && !flags.has(node.requires as StoryFlag)) {
          newLines.push({ text: `cat: ${target}: Zugriff verweigert.`, kind: "out" });
        } else {
          newLines.push({ text: `── ${node.name} ───────────────────────`, kind: "system" });
          const updated = bodoMode
            ? flags.has("centralOsUpdatedBodo")
            : flags.has("centralOsUpdated");
          newLines.push(
            ...node.content.map(
              (t) => ({ text: applyOsVersion(t, updated), kind: "out" } as Line),
            ),
          );
          newLines.push({ text: "── EOF ──────────────────────────────", kind: "system" });
        }
      }
    } else if (head === "tree") {
      const node = resolvePath(cwd) ?? FILESYSTEM;
      newLines.push({ text: pathString(cwd), kind: "system" });
      newLines.push(
        ...buildTree(node, (f) => flags.has(f)).map(
          (t) => ({ text: t, kind: "out" } as Line),
        ),
      );
    } else if (head === "net") {
      newLines.push({ text: "BEKANNTE HOSTS — Sektornetz E67/E71:", kind: "system" });
      newLines.push(
        { text: "  IP                HOST                  BESCHREIBUNG", kind: "out" },
        { text: "  ──                ────                  ────────────", kind: "out" },
      );
      for (const h of NET_HOSTS) {
        newLines.push({
          text: `  ${h.ip.padEnd(17)} ${h.host.padEnd(21)} ${h.desc}`,
          kind: "out",
        });
      }
      newLines.push({
        text: "TIPP: 'telnet <host>' — Verbindungsversuch.",
        kind: "system",
      });
    } else if (head === "telnet") {
      const target = args[0];
      if (!target) {
        newLines.push({ text: "telnet: Host fehlt. Beispiel: telnet philippe.e67", kind: "out" });
      } else {
        const host = findHost(target);
        if (!host) {
          newLines.push({ text: `telnet: ${target}: Host nicht gefunden.`, kind: "out" });
        } else if (!host.password) {
          newLines.push(
            { text: `Versuche ${host.host} (${host.ip})…`, kind: "out" },
            { text: `>> Verbindung verweigert: kein telnet-daemon auf Port 23.`, kind: "out" },
          );
        } else {
          newLines.push(
            { text: `Versuche ${host.host} (${host.ip})…`, kind: "out" },
            { text: ">> Verbunden. Authentifizierung erforderlich.", kind: "system" },
          );
          setTelnetAwaitPass(host.host);
        }
      }
    } else if (head === "ps") {
      newLines.push(
        { text: "  PID USER       %CPU %MEM  COMMAND", kind: "system" },
        { text: "    1 root        0.0  0.4  /usr/bin/centralos --boot", kind: "out" },
        { text: "   23 root        2.1  1.8  /usr/bin/carrier-daemon --keepalive", kind: "out" },
        { text: "   41 leitstelle  0.3  0.5  /opt/leitstelle-tools/trace --ping", kind: "out" },
        { text: "   88 root        0.1  0.2  /usr/bin/centralos --rotate-logs", kind: "out" },
        { text: "  142 worag       0.0  0.1  -sh", kind: "out" },
        { text: "  143 worag       0.5  0.3  /home/worag/adventure.bin (idle)", kind: "out" },
        { text: "  201 root        0.0  0.1  [resonance-feedback]", kind: "out" },
        { text: "  ???   ?           ?    ?  [???]", kind: "out" },
      );
    } else if (head === "uname") {
      const showAll = args.includes("-a");
      const updated = flags.has(
        bodoMode ? "centralOsUpdatedBodo" : "centralOsUpdated",
      );
      const parts: Record<string, string> = {
        s: "CentralOS",
        n: bodoMode ? "e67-2612" : "e67-2611",
        r: `${osVersion(updated, bodoMode)}-resonance`,
        v: updated
          ? "#15 Thu Nov 6 16:04:22 1997"
          : "#14 Tue Nov 4 11:04:22 1997",
        m: "syn33",
        o: "CentralOS",
      };
      if (!args.length || args.includes("-s")) {
        if (showAll) {
          newLines.push({
            text: `${parts.s} ${parts.n} ${parts.r} ${parts.v} ${parts.m} ${parts.o}`,
            kind: "out",
          });
        } else {
          newLines.push({ text: parts.s, kind: "out" });
        }
      } else if (showAll) {
        newLines.push({
          text: `${parts.s} ${parts.n} ${parts.r} ${parts.v} ${parts.m} ${parts.o}`,
          kind: "out",
        });
      } else {
        const out: string[] = [];
        if (args.includes("-n")) out.push(parts.n);
        if (args.includes("-r")) out.push(parts.r);
        if (args.includes("-v")) out.push(parts.v);
        if (args.includes("-m")) out.push(parts.m);
        if (args.includes("-o")) out.push(parts.o);
        newLines.push({ text: out.join(" "), kind: "out" });
      }
    } else if (head === "whoami") {
      newLines.push({ text: "worag", kind: "out" });
    } else if (head === "id") {
      newLines.push({
        text: "uid=2611(worag) gid=100(bewohner) groups=100(bewohner),104(radio-rx)",
        kind: "out",
      });
    } else if (head === "date") {
      newLines.push({ text: "Don 06 Nov 1997 09:14:42 MEZ", kind: "out" });
    } else if (head === "uptime") {
      newLines.push({
        text: " 09:14:42 up 4012 days, 17:14,  1 user,  load average: 1.04, 1.04, 1.04",
        kind: "out",
      });
    } else if (head === "history") {
      const h = termHistoryRef.current;
      if (!h.length) newLines.push({ text: "(leerer Verlauf)", kind: "out" });
      else {
        h.forEach((cmd, i) => {
          newLines.push({
            text: `  ${(i + 1).toString().padStart(3)}  ${cmd}`,
            kind: "out",
          });
        });
      }
    } else if (head === "echo") {
      newLines.push({ text: args.join(" "), kind: "out" });
    } else if (head === "sudo") {
      newLines.push({
        text: "sudo: worag ist nicht in der sudoers-Datei. Dieser Vorfall wird gemeldet.",
        kind: "out",
      });
    } else if (head === "man") {
      newLines.push({
        text: `man: kein Handbuch für "${args[0] ?? ""}" — Tippe 'help'.`,
        kind: "out",
      });
    } else if (head === "maint") {
      // Hausmeister-Werkzeug. Beide Accounts dürfen `list`, nur Bodo darf
      // `cancel`. Eingebaut für das Aufzug-Rätsel (Wartung 4711).
      const sub = (args[0] ?? "").toLowerCase();
      // Worag (Layard) hat keinen Hausmeister-Account — das Tool gibt es
      // dort gar nicht. Auf Bodos Terminal dagegen ist `maint` immer
      // verfügbar; zeigt mindestens die Routine-Wartung des Blocks.
      if (!bodoMode && !flags.has("elevatorMaintBlocked")) {
        newLines.push({
          text: "bash: maint: Befehl nicht gefunden.",
          kind: "out",
        });
      } else if (sub === "" || sub === "list" || sub === "ls") {
        newLines.push(
          { text: "── offene Wartungsanfragen — Block 26 ────", kind: "system" },
          { text: "  ID    OBJEKT          STATUS    AUSGELÖST", kind: "out" },
          { text: "  ──    ──────          ──────    ─────────", kind: "out" },
        );
        if (flags.has("elevatorMaintBlocked") && !flags.has("elevatorMaintCleared")) {
          newLines.push(
            {
              text: "  4711  Aufzug E67/2   GESPERRT  06.11.1997 09:42",
              kind: "out",
            },
            {
              text: "        Grund: »lokale Resonanz-Übersteuerung« (autom.)",
              kind: "out",
            },
            { text: "", kind: "out" },
          );
        } else if (flags.has("elevatorMaintCleared")) {
          newLines.push(
            {
              text: "  4711  Aufzug E67/2   STORNIERT 06.11.1997 (manuell)",
              kind: "out",
            },
            { text: "", kind: "out" },
          );
        }
        newLines.push(
          {
            text: "  ── Tech-Wartung Etage 5 (Routine) ──",
            kind: "system",
          },
          {
            text: "  5610  Tech-Knoten 5/6 OFFEN     letzte: 02.11.1997",
            kind: "out",
          },
          {
            text: bodoMode
              ? "        Zugang: Wartungskarte · Letzte Wartung: B. Marschke"
              : "        Zugang: ████████████ · Letzte Wartung: ████████████",
            kind: "out",
          },
          { text: "", kind: "out" },
        );
        // Im Bodo-Modus: Wartungskarte für Tür 5610 abgreifen,
        // sobald `maint list` ausgeführt wurde.
        if (bodoMode && !api.hasItem("wartungsnotiz5610")) {
          api.addItem({
            id: "wartungsnotiz5610",
            name: "Wartungskarte (E67 · Korridor 56)",
            description:
              "Eine abgegriffene blaue Plastikkarte aus Bodos zweiter Schublade. Auf der Rückseite mit Bleistift: »5610 · nur Bodo«. Öffnet den Kartenleser an der Wartungstür im Korridor 56.",
          });
          newLines.push(
            {
              text: ">> Bodo zieht eine abgegriffene blaue Karte aus der Schublade.",
              kind: "system",
            },
            {
              text: ">> »Falls Sie da mal hinmüssen, Worag — die hier öffnet 5610.«",
              kind: "system",
            },
            {
              text: ">> [ Wartungskarte (E67 · Korridor 56) ins Inventar ]",
              kind: "system",
            },
            { text: "", kind: "out" },
          );
        }
        if (flags.has("elevatorMaintBlocked") && !flags.has("elevatorMaintCleared")) {
          newLines.push({
            text: bodoMode
              ? "TIPP: 'maint cancel 4711' storniert die Anfrage."
              : "Stornierung erfordert Hausmeister-Konsole (gid=hausmeister).",
            kind: "system",
          });
        }
      } else if (sub === "cancel" || sub === "rm") {
        const id = (args[1] ?? "").trim();
        if (id !== "4711") {
          newLines.push({
            text: `maint: Anfrage »${id || "?"}« nicht gefunden.`,
            kind: "out",
          });
        } else if (!bodoMode) {
          newLines.push(
            {
              text: "maint: cancel: ZUGRIFF VERWEIGERT.",
              kind: "out",
            },
            {
              text:
                "       Account 'worag' nicht in Gruppe 'hausmeister'.",
              kind: "out",
            },
            {
              text:
                "       Hinweis: Block-Hausmeister: Marschke (2612).",
              kind: "system",
            },
          );
        } else if (flags.has("elevatorMaintCleared")) {
          newLines.push({
            text: "maint: Anfrage 4711 wurde bereits storniert.",
            kind: "out",
          });
        } else {
          setLines((prev) => [...prev, ...newLines]);
          runScriptedSequence(
            [
              {
                text: ">> maint: Storniere Anfrage 4711 …",
                delayMs: 0,
                kind: "system",
                beep: true,
              },
              {
                text: ">> Sende Stop-Signal an Aufzugssteuerung E67/2 …",
                delayMs: 380,
              },
              {
                text: ">> Bestätigung empfangen … OK",
                delayMs: 460,
                beep: true,
              },
              {
                text: ">> Aufzug freigegeben.",
                delayMs: 280,
                kind: "system",
              },
              {
                text: ">> Vermerk: Bodo Marschke, 06.11.1997 (manuell).",
                delayMs: 320,
              },
            ],
            () => api.setFlag("elevatorMaintCleared"),
          );
          const h = termHistoryRef.current;
          if (h[h.length - 1] !== raw) h.push(raw);
          historyCursorRef.current = -1;
          draftRef.current = "";
          setInput("");
          return;
        }
      } else {
        newLines.push({
          text: `maint: Unbekannter Unterbefehl »${sub}«. Versuchen Sie: maint list  /  maint cancel <id>`,
          kind: "out",
        });
      }
    } else {
      newLines.push({
        text: `Unbekannter Befehl: ${cmd}. Tippe 'help'.`,
        kind: "out",
      });
    }

    setLines((prev) => [...prev, ...newLines, { text: "", kind: "out" }]);
    // Bodo-Modus: solange nicht aktualisiert, drängelt das System bei jedem
    // Befehl mit einer kleinen Warnzeile. Verschwindet nach sysupdate.
    if (bodoMode && !flags.has("centralOsUpdatedBodo") && head !== "sysupdate") {
      setTimeout(() => {
        setLines((prev) => [
          ...prev,
          {
            text: ">> Hinweis: Aktualisierung ausstehend. Tippe 'sysupdate'.",
            kind: "system",
          },
          { text: "", kind: "out" },
        ]);
      }, 80);
    }
    // History des Hauptterminals pflegen.
    const h = termHistoryRef.current;
    if (h[h.length - 1] !== raw) h.push(raw);
    historyCursorRef.current = -1;
    draftRef.current = "";
    setInput("");
  };

  // unused var hint suppression
  void inventory;
  void knowledge;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 px-4">
      <div
        className={`fade-in relative w-full max-w-4xl overflow-hidden rounded-sm border bg-black shadow-[0_0_60px_rgba(0,0,0,0.85)] scanlines ${
          bodoMode ? "border-sepia/50" : "border-phosphor/50"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b bg-black px-4 py-2 ${
            bodoMode ? "border-sepia/30" : "border-phosphor/30"
          }`}
        >
          <span
            className={`font-mono-crt text-base uppercase tracking-[0.3em] ${
              bodoMode ? "text-sepia sepia-glow" : "text-phosphor phosphor-glow"
            }`}
          >
            CentralOS v
            {osVersion(
              flags.has(bodoMode ? "centralOsUpdatedBodo" : "centralOsUpdated"),
              bodoMode,
            )}
            {bodoMode ? " — 2612" : ""}
          </span>
          <CloseButton
            onClick={closeTerminal}
            tone={bodoMode ? "amber" : "phosphor"}
            label="Terminal schließen"
          />
        </div>

        <div
          ref={scrollRef}
          className="h-[55vh] overflow-y-auto bg-black px-4 py-3 font-mono-crt text-base leading-relaxed crt-flicker"
        >
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.kind === "system"
                  ? bodoMode
                    ? "sepia-glow"
                    : "phosphor-glow"
                  : l.kind === "in"
                    ? bodoMode
                      ? "text-sepia"
                      : "text-phosphor"
                    : bodoMode
                      ? "text-sepia-dim"
                      : "text-phosphor-dim"
              }
            >
              {l.text || "\u00A0"}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`flex items-center gap-2 border-t bg-black px-4 py-2 ${
            bodoMode ? "border-sepia/30" : "border-phosphor/30"
          }`}
        >
          <span
            className={`font-mono-crt text-sm ${
              bodoMode ? "text-sepia sepia-glow" : "text-phosphor phosphor-glow"
            }`}
          >
            {advState
              ? "adventure>"
              : lottiState
                ? "lotti>"
                : `${userName}@${hostName}:${pathString(cwd).replace(homeLabel, "~") || "/"}$`}
          </span>
          <input
            ref={inputRef}
            value={input}
            disabled={scriptedRunning}
            onChange={(e) => {
              if (e.target.value.length > input.length) {
                playKeypress(0.3 * sfxVolume);
              }
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              // ── Verlaufs-Navigation mit ↑/↓ ───────────────────
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                const history =
                  advState || lottiState
                    ? advHistoryRef.current
                    : termHistoryRef.current;
                if (!history.length) return;
                let cursor = historyCursorRef.current;
                if (e.key === "ArrowUp") {
                  if (cursor === -1) {
                    // Aktuelle Eingabe als Entwurf merken.
                    draftRef.current = input;
                    cursor = history.length - 1;
                  } else if (cursor > 0) {
                    cursor -= 1;
                  }
                } else {
                  // ArrowDown
                  if (cursor === -1) return;
                  if (cursor < history.length - 1) {
                    cursor += 1;
                  } else {
                    // Zurück zum gespeicherten Entwurf.
                    historyCursorRef.current = -1;
                    setInput(draftRef.current);
                    return;
                  }
                }
                historyCursorRef.current = cursor;
                setInput(history[cursor]);
                lastTabRef.current = null;
                return;
              }

              if (e.key !== "Tab") {
                lastTabRef.current = null;
                return;
              }
              e.preventDefault();
              // Tab-Completion — im Adventure kontextuell, sonst klassisch.
              let result: CompleteResult;
              if (advState) {
                result = adventureComplete(advState, input);
              } else if (lottiState) {
                result = lottiComplete(input);
              } else if (telnetHost) {
                const host = findHost(telnetHost);
                const hostFiles: Record<string, string[]> = {
                  ...(host?.files ?? {}),
                  ...(host?.dynamicFiles?.((f) => flags.has(f)) ?? {}),
                };
                result = completeTelnet(input, hostFiles);
              } else {
                result = complete(input, cwd, (f) => flags.has(f), bodoMode);
              }
              if (!result.matches.length) {
                playBeep(0.2 * sfxVolume);
                return;
              }
              if (result.newInput !== input) {
                // Successful expansion — single match or common-prefix grew.
                setInput(result.newInput);
                playKeypress(0.3 * sfxVolume);
                lastTabRef.current = { input: result.newInput, matches: result.matches };
                return;
              }
              // No expansion possible. On second consecutive Tab, list candidates.
              const prev = lastTabRef.current;
              if (prev && prev.input === input && result.matches.length > 1) {
                let echoPrompt: string;
                if (advState) {
                  echoPrompt = "adventure>";
                } else if (lottiState) {
                  echoPrompt = "lotti>";
                } else if (telnetHost) {
                  const host = findHost(telnetHost);
                  echoPrompt = `${host?.host ?? telnetHost}:~$`;
                } else {
                  echoPrompt = `${userName}@${hostName}:${pathString(cwd).replace(homeLabel, "~") || "/"}$`;
                }
                setLines((p) => [
                  ...p,
                  { text: `${echoPrompt} ${input}`, kind: "in" },
                  { text: result.matches.join("   "), kind: "out" },
                  { text: "", kind: "out" },
                ]);
                lastTabRef.current = null;
              } else {
                lastTabRef.current = { input, matches: result.matches };
                playBeep(0.2 * sfxVolume);
              }
            }}
            className={`flex-1 bg-transparent font-mono-crt text-base outline-none disabled:opacity-40 ${
              bodoMode
                ? "text-sepia caret-sepia placeholder:text-sepia-dim/60"
                : "text-phosphor caret-phosphor placeholder:text-phosphor-dim/60"
            }`}
            placeholder={scriptedRunning ? "… Ausgabe läuft …" : "Befehl eingeben …"}
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}