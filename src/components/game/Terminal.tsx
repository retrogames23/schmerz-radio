import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";
import { FILESYSTEM, HOME_PATH, resolvePath, pathString, type FsNode } from "@/game/filesystem";
import type { StoryFlag } from "@/game/types";
import {
  adventureCommand,
  adventureStart,
  newAdventureState,
  adventureComplete,
  type AdvState,
} from "@/game/adventureGame";

interface Line {
  text: string;
  kind?: "in" | "out" | "system";
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
  "unlock",
  "clear",
  "exit",
  "pwd",
  "ls",
  "cd",
  "cat",
  "tree",
  "adventure",
  "./adventure.bin",
  "net",
  "telnet",
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
  const dir = resolvePath(dirParts);
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
          "ich werde dieses dokument nicht löschen,",
          "auch wenn 104,6 das nahelegt.",
          "ich glaube, ich sollte es ihm geben.",
          "ich werde es ihm nicht geben.",
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
];

function findHost(query: string): NetHost | null {
  const q = query.toLowerCase().trim();
  return (
    NET_HOSTS.find((h) => h.host.toLowerCase() === q || h.ip === q) ?? null
  );
}

const HELP_LINES: Line[] = [
  { text: "VERFÜGBARE BEFEHLE:", kind: "system" },
  { text: "  help          — Diese Liste anzeigen", kind: "out" },
  { text: "  inbox         — Posteingang anzeigen", kind: "out" },
  { text: "  read <id>     — Nachricht öffnen", kind: "out" },
  { text: "  status        — Systemstatus", kind: "out" },
  { text: "  unlock <code> — Sektor-Tür öffnen (8 Ziffern)", kind: "out" },
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
  { text: "  adventure     — »Ein Tag draußen« (Worags Textadventure)", kind: "out" },
  { text: "", kind: "out" },
  { text: "TIPP: <Tab> vervollständigt Befehle und Pfade.", kind: "system" },
  { text: "", kind: "out" },
  { text: "  clear         — Bildschirm leeren", kind: "out" },
  { text: "  exit          — Terminal schließen", kind: "out" },
];

export function Terminal() {
  const {
    terminalOpen,
    closeTerminal,
    inventory,
    flags,
    api,
    knowledge,
  } = useGame();
  const { sfxVolume } = useSettings();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string[]>([...HOME_PATH]);
  const [advState, setAdvState] = useState<AdvState | null>(null);
  // Aktive Telnet-Sitzung (null = keine).
  const [telnetHost, setTelnetHost] = useState<string | null>(null);
  // Telnet wartet auf Passworteingabe für diesen Host.
  const [telnetAwaitPass, setTelnetAwaitPass] = useState<string | null>(null);
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
      setCwd([...HOME_PATH]);
      setLines([
        { text: ">> CENTRALOS v2.3 — Terminal Quadrant E67", kind: "system" },
        { text: ">> Benutzer: WORAG, L. (Zimmer 2611)", kind: "system" },
        { text: ">> Persönliches Verzeichnis bereit (siehe 'help' › DATEISYSTEM)", kind: "system" },
        { text: ">> Tippe 'help' für Befehle.", kind: "system" },
        { text: "", kind: "out" },
      ]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [terminalOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  if (!terminalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

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
        const names = Object.keys(hostFiles).sort();
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
    const promptPath = pathString(cwd).replace("/home/worag", "~") || "/";
    const newLines: Line[] = [{ text: `worag@e67:${promptPath}$ ${input}`, kind: "in" }];

    if (cmd === "help") {
      newLines.push(...HELP_LINES);
    } else if (cmd === "adventure" || cmd === "./adventure.bin" || cmd === "adventure.bin") {
      const fresh = newAdventureState();
      setAdvState(fresh);
      newLines.push(
        ...adventureStart(fresh).map((t) => ({ text: t, kind: "out" } as Line)),
      );
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
        { text: "  E67.NETZ          [ STABIL ]", kind: "out" },
        {
          text: `  ZENTRAL.NETZ      [ ${flags.has("calledForCode") ? "WARTUNG" : "STÖRUNG: ERROR 4567"} ]`,
          kind: "out",
        },
        { text: "  GATEWAY E67/E71   [ MANUELLER CODE ERFORDERLICH ]", kind: "out" },
      );
    } else if (cmd === "inbox") {
      newLines.push(
        { text: "POSTEINGANG (3):", kind: "system" },
        { text: "  [001] Insa Bauerfeind — Wartungsfenster Gateway", kind: "out" },
        { text: "  [002] Stegmann (IT)  — Bitte: Störungsmeldung einreichen", kind: "out" },
      );
      if (flags.has("calledForCode")) {
        newLines.push({
          text: "  [003] Insa Bauerfeind — Sektor-Tür: Manueller Code  ✶NEU",
          kind: "system",
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
          { text: "Betreff: Sektor-Tür — Manueller Code", kind: "out" },
          { text: "", kind: "out" },
          { text: "Wie besprochen. Sie kennen das Datum.", kind: "out" },
          { text: "Tippen Sie es ohne Punkte ein. Acht Ziffern.", kind: "out" },
          { text: "I. B.", kind: "out" },
          { text: "── Ende ──────────────────────────────", kind: "system" },
        );
      }
    } else if (cmd.startsWith("unlock ")) {
      const code = cmd.slice(7).trim();
      if (code === "06111997") {
        newLines.push(
          { text: ">> AUTHENTIFIZIERUNG …", kind: "system" },
          { text: ">> ZUGANG GEWÄHRT — SEKTOR-TÜR ENTRIEGELT", kind: "system" },
        );
        playUnlock(0.7 * sfxVolume);
        api.setFlag("sectorDoorOpen");
        api.addItem({
          id: "exitCode",
          name: "Ausgangscode 06111997",
          description: "Der Code, der die Tür zwischen E67 und E71 öffnet.",
        });
      } else {
        newLines.push({
          text: `>> FEHLER 4568: Code "${code}" abgelehnt.`,
          kind: "out",
        });
      }
    } else if (head === "pwd") {
      newLines.push({ text: pathString(cwd), kind: "out" });
    } else if (head === "ls") {
      const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const node = resolvePath(cwd);
      if (!node || node.type !== "dir") {
        newLines.push({ text: "ls: aktuelles Verzeichnis ungültig.", kind: "out" });
      } else {
        newLines.push({ text: `Inhalt von ${pathString(cwd)}:`, kind: "system" });
        newLines.push(...formatLs(visibleChildren(node, showAll, (f) => flags.has(f))));
      }
    } else if (head === "cd") {
      const target = args[0] ?? "";
      if (!target || target === "~") {
        setCwd([...HOME_PATH]);
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
          if (!probe || probe.type !== "dir") {
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
        const node = resolvePath([...base, ...segments]);
        if (!node) {
          newLines.push({ text: `cat: ${target}: Datei nicht gefunden.`, kind: "out" });
        } else if (node.type === "dir") {
          newLines.push({ text: `cat: ${target}: ist ein Verzeichnis.`, kind: "out" });
        } else if (node.requires && !flags.has(node.requires as StoryFlag)) {
          newLines.push({ text: `cat: ${target}: Zugriff verweigert.`, kind: "out" });
        } else {
          newLines.push({ text: `── ${node.name} ───────────────────────`, kind: "system" });
          newLines.push(...node.content.map((t) => ({ text: t, kind: "out" } as Line)));
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
      const parts: Record<string, string> = {
        s: "CentralOS",
        n: "e67-2611",
        r: "2.3-resonance",
        v: "#14 Tue Nov 4 11:04:22 1997",
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
    } else {
      newLines.push({
        text: `Unbekannter Befehl: ${cmd}. Tippe 'help'.`,
        kind: "out",
      });
    }

    setLines((prev) => [...prev, ...newLines, { text: "", kind: "out" }]);
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
      <div className="fade-in relative w-full max-w-3xl overflow-hidden rounded-sm border border-phosphor/50 bg-black shadow-[0_0_60px_rgba(0,0,0,0.85)] scanlines">
        <div className="flex items-center justify-between border-b border-phosphor/30 bg-black px-4 py-2">
          <span className="font-mono-crt text-sm uppercase tracking-[0.3em] text-phosphor phosphor-glow">
            CentralOS v2.3
          </span>
          <button
            type="button"
            onClick={closeTerminal}
            className="text-xs uppercase tracking-widest text-phosphor/70 hover:text-phosphor"
          >
            ✕ Sitzung schließen
          </button>
        </div>

        <div
          ref={scrollRef}
          className="h-[55vh] overflow-y-auto bg-black px-4 py-3 font-mono-crt text-sm leading-relaxed crt-flicker"
        >
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.kind === "system"
                  ? "phosphor-glow"
                  : l.kind === "in"
                    ? "text-phosphor"
                    : "text-phosphor-dim"
              }
            >
              {l.text || "\u00A0"}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-phosphor/30 bg-black px-4 py-2"
        >
          <span className="font-mono-crt text-xs text-phosphor phosphor-glow">
            {advState
              ? "adventure>"
              : `worag@e67:${pathString(cwd).replace("/home/worag", "~")}$`}
          </span>
          <input
            ref={inputRef}
            value={input}
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
                const history = advState
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
              const result = advState
                ? adventureComplete(advState, input)
                : complete(input, cwd, (f) => flags.has(f));
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
                const echoPrompt = advState
                  ? "adventure>"
                  : `worag@e67:${pathString(cwd).replace("/home/worag", "~")}$`;
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
            className="flex-1 bg-transparent font-mono-crt text-base text-phosphor caret-phosphor outline-none placeholder:text-phosphor-dim/60"
            placeholder="Befehl eingeben …"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}