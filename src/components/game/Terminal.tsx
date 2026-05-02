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
} from "@/game/filesystemBodo";
import {
  FILESYSTEM_MIRA,
  HOME_PATH_MIRA,
  resolveMira,
  pathStringMira,
} from "@/game/filesystemMira";
import { NET_HOSTS, type NetHost } from "@/game/netHosts";
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
import {
  newsCommand,
  newsStart,
  newNewsState,
  newsComplete,
  nextTickerFrame,
  type NewsState,
} from "@/game/newsProgram";
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
  "news",
  "./news",
  "net",
  "telnet",
  "sysupdate",
  "trouble",
  "maint",
  "forge",
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
  resolveFn: (parts: string[]) => FsNode | null,
  hostNames: string[],
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

  // telnet <host|ip> — Hostnamen UND IP-Adressen vervollständigen.
  // Gilt nur für das zweite Token (telnet kennt keine weiteren Argumente).
  if (cmd === "telnet" && tokens.length === 2) {
    const frag = lastToken.toLowerCase();
    const matches = hostNames.filter((n) => n.toLowerCase().startsWith(frag));
    if (!matches.length) return { newInput: input, matches: [] };
    const prefix = commonPrefix(matches);
    const completed =
      matches.length === 1 ? matches[0] + " " : prefix;
    const newInput = [tokens[0], completed].join(" ");
    return { newInput, matches };
  }

  const wantDirs = cmd === "cd";
  const wantFiles = cmd === "cat";

  // Split last token into "directory part" + "name fragment".
  const isAbsolute = lastToken.startsWith("/");
  const segments = lastToken.split("/");
  const fragment = segments.pop() ?? "";
  const baseSegments = segments.filter(Boolean);
  const dirParts = isAbsolute ? baseSegments : [...cwd, ...baseSegments];
  const dir = resolveFn(dirParts);
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

const TELNET_COMMANDS = ["ls", "cat", "pwd", "whoami", "help", "exit", "logout", "quit"];

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
      { text: "  news          — Quadranten-Bote (Textbrowser, ZENTRAL.NETZ)", kind: "out" },
      { text: "", kind: "out" },
      { text: "WARTUNG (nur Hausmeister):", kind: "system" },
      { text: "  maint list                — offene Wartungsanfragen anzeigen", kind: "out" },
      { text: "  maint cancel <id>         — Anfrage stornieren", kind: "out" },
      { text: "", kind: "out" },
    );
  } else {
    lines.push(
      { text: "  adventure     — »Ein Tag draußen« (Textadventure)", kind: "out" },
      { text: "  news          — Quadranten-Bote (Textbrowser, ZENTRAL.NETZ)", kind: "out" },
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
    terminalMiraMode,
  } = useGame();
  const { sfxVolume } = useSettings();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string[]>([...HOME_PATH_WORAG]);
  const [advState, setAdvState] = useState<AdvState | null>(null);
  const [lottiState, setLottiState] = useState<LottiState | null>(null);
  const [newsState, setNewsState] = useState<NewsState | null>(null);
  // Ticker-Loop: schaltet den NewsState im Sekundentakt eine Meldung weiter,
  // solange `view === "ticker"`. Wird beim Verlassen, beim Schließen oder
  // bei jeder Eingabe sauber gestoppt.
  const newsTickerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Aktive Telnet-Sitzung (null = keine).
  const [telnetHost, setTelnetHost] = useState<string | null>(null);
  // Telnet wartet auf Passworteingabe für diesen Host.
  const [telnetAwaitPass, setTelnetAwaitPass] = useState<string | null>(null);
  // Wenn die Telnet-Sitzung auf bodo.e67 oder worag.e67 läuft, schalten
  // wir bis `exit` in den vollen Terminalmodus des Zielhosts um — gleiche
  // Befehle (`ls -a`, `cd`, `cat`, `tree`, …) wie am eigenen Rechner,
  // aber mit dem fremden Filesystem. `null` = keine vollwertige Remote-
  // Sitzung aktiv (Mini-Modus für alle anderen Hosts).
  const [remoteMode, setRemoteMode] = useState<"worag" | "bodo" | null>(null);
  // Cwd-Stack: pro Remote-Sitzung sichern wir den lokalen cwd, damit
  // `exit` ihn wiederherstellen kann.
  const savedCwdRef = useRef<string[] | null>(null);
  // Undokumentierter Cheat „cheat superuser" in Layards Terminal: solange
  // aktiv, überspringt `telnet` jede Passwortabfrage. Wird beim Schließen
  // des Terminals zurückgesetzt — kein dauerhafter Story-Flag.
  const [superuser, setSuperuser] = useState(false);
  // True während eine scriptgesteuerte Ausgabesequenz läuft (sysupdate, trouble net).
  const [scriptedRunning, setScriptedRunning] = useState(false);
  // Wenn Bodo gerade B3 für Lotti holt, sitzen wir an seinem Terminal —
  // ohne Login, mit seinem Hostnamen, mit altem CentralOS v2.0.
  // Wird explizit über openTerminal(true) am Hotspot in Bodos Wohnung gesetzt.
  // Layards eigenes Terminal (TopBar, Wohnung 2611, Sektor-Türen-Terminal)
  // läuft immer im normalen Phosphor-Grün-Modus.
  // „Lokaler" Modus = an welchem physischen Terminal sitzt man tatsächlich.
  const localBodoMode = terminalBodoMode;
  // „Effektiver" Modus = welche Maschine wir gerade bedienen. Während
  // einer vollwertigen Telnet-Sitzung kann das ein anderer Host sein.
  // Mira-Modus: Layard sitzt an Miras gehackter Maschine (FuckTheSystemOS).
  // Hat Vorrang vor jedem anderen Modus, solange keine Remote-Sitzung läuft.
  const miraMode = terminalMiraMode && !remoteMode;
  const bodoMode = remoteMode
    ? remoteMode === "bodo"
    : !miraMode && localBodoMode;
  const userName = miraMode ? "root" : bodoMode ? "bodo" : "worag";
  // Beide Maschinen hängen am Sektor-Netz E67 — der Hostname ist
  // konsistent „e67“, nur der Benutzer wechselt. In einer Remote-Sitzung
  // zeigt der Prompt zusätzlich den Zielhost (z. B. `worag@bodo:~$`).
  const hostName = remoteMode
    ? remoteMode === "bodo"
      ? "bodo"
      : "worag"
    : miraMode
      ? "miranet"
      : "e67";
  const homePath = miraMode
    ? HOME_PATH_MIRA
    : bodoMode
      ? HOME_PATH_BODO
      : HOME_PATH_WORAG;
  const homeLabel = miraMode
    ? "/home/mira"
    : bodoMode
      ? "/home/bodo"
      : "/home/worag";
  // ── Filesystem-Adapter: leiten je nach Modus auf den jeweiligen Baum.
  // Damit bleibt der Rest der Komponente unverändert lesbar; alle
  // resolvePath/pathString-Aufrufe greifen automatisch auf den richtigen
  // Baum (Worag oder Bodo). Mono-`FILESYSTEM` gibt es nicht mehr.
  const resolvePath = miraMode
    ? resolveMira
    : bodoMode
      ? resolveBodo
      : resolveWorag;
  const pathString = miraMode
    ? pathStringMira
    : bodoMode
      ? pathStringBodo
      : pathStringWorag;
  const FILESYSTEM = miraMode
    ? FILESYSTEM_MIRA
    : bodoMode
      ? FILESYSTEM_BODO
      : FILESYSTEM_WORAG;
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
      // Beim Öffnen immer im lokalen Heimatverzeichnis starten — eine
      // evtl. noch hängende Remote-Sitzung wird hart zurückgesetzt.
      setRemoteMode(null);
      savedCwdRef.current = null;
      const startHome = terminalMiraMode
        ? HOME_PATH_MIRA
        : localBodoMode
          ? HOME_PATH_BODO
          : HOME_PATH_WORAG;
      setCwd([...startHome]);
      setTelnetHost(null);
      setTelnetAwaitPass(null);
      // Cheat-Status gilt nur innerhalb einer Sitzung.
      setSuperuser(false);
      // News-Programm (samt eventuell laufendem Ticker) zurücksetzen.
      setNewsState(null);
      if (newsTickerTimerRef.current) {
        clearInterval(newsTickerTimerRef.current);
        newsTickerTimerRef.current = null;
      }
      // Banner explizit vom lokalen Modus aus aufbauen — eine zuvor
      // aktive Remote-Sitzung wurde gerade zurückgesetzt, der nächste
      // Render hat aber noch das alte (effektive) bodoMode-Flag.
      if (terminalMiraMode) {
        const banner: Line[] = [
          {
            text: ">> FuckTheSystemOS 0.2 — root tunnel via 5601",
            kind: "system",
          },
          { text: ">> Benutzer: root  (kein Login. kein Logfile.)", kind: "system" },
          { text: ">> Letzter Boot: gestern 23:11. Uptime: zu lang.", kind: "system" },
          { text: "", kind: "out" },
          {
            text: "  »wenn du das hier liest, bist du in meinem zimmer.",
            kind: "out",
          },
          { text: "   sei freundlich. — m.«", kind: "out" },
          { text: "", kind: "out" },
          {
            text: ">> NETZWERK: telnet umgeht alle Auth (root tunnel).",
            kind: "system",
          },
          { text: ">> Tippe 'help' oder 'cat manifest.txt'.", kind: "system" },
          { text: "", kind: "out" },
        ];
        setLines(banner);
      } else if (localBodoMode) {
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

  // Sicherheitsnetz: Beim Unmount des Terminals einen evtl. noch
  // laufenden News-Ticker-Loop sauber abräumen.
  useEffect(() => {
    return () => {
      if (newsTickerTimerRef.current) {
        clearInterval(newsTickerTimerRef.current);
        newsTickerTimerRef.current = null;
      }
    };
  }, []);

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

    // ── Undokumentierter Cheat »cheat superuser« ──────────
    // Nur in Layards eigenem Terminal (nicht an Bodos Maschine, nicht in
    // einer aktiven Remote-Sitzung). Aktiviert einen Modus, in dem
    // `telnet <host>` jede Passwortabfrage überspringt.
    if (raw.toLowerCase() === "cheat superuser") {
      if (!localBodoMode && !remoteMode) {
        playBeep(0.5 * sfxVolume);
        setSuperuser(true);
        setLines((prev) => [
          ...prev,
          { text: `worag@centralos:~$ ${raw}`, kind: "in" },
          { text: ">> [DEBUG] superuser-mode aktiviert.", kind: "system" },
          { text: ">> telnet umgeht ab jetzt jede Authentifizierung.", kind: "out" },
          { text: "", kind: "out" },
        ]);
        setInput("");
        return;
      }
      // Sonst durchfallen lassen — wird unten als unbekannter Befehl behandelt.
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

    // ── Sub-Modus: news läuft (Quadranten-Bote) ────────────
    if (newsState) {
      playBeep(0.3 * sfxVolume);
      const echo: Line = { text: `news> ${input}`, kind: "in" };
      const result = newsCommand(newsState, raw);
      const out: Line[] = result.out.map((t) => ({ text: t, kind: "out" } as Line));
      setLines((prev) => [...prev, echo, ...out, { text: "", kind: "out" }]);
      const h = advHistoryRef.current;
      if (h[h.length - 1] !== raw) h.push(raw);
      historyCursorRef.current = -1;
      draftRef.current = "";
      // Ticker stoppen, falls eine Eingabe ihn beendet hat.
      if (result.stopTicker && newsTickerTimerRef.current) {
        clearInterval(newsTickerTimerRef.current);
        newsTickerTimerRef.current = null;
      }
      // Ticker starten: alle 2,2 s die nächste Frame anhängen, bis er
      // gestoppt wird oder eine Eingabe kommt.
      if (result.startTicker) {
        if (newsTickerTimerRef.current) clearInterval(newsTickerTimerRef.current);
        newsTickerTimerRef.current = setInterval(() => {
          // Wenn der Nutzer währenddessen weggeklickt oder etwas getippt
          // hat, beendet das Polling im nächsten Tick: view ist dann nicht
          // mehr "ticker".
          if (newsState.view !== "ticker") {
            if (newsTickerTimerRef.current) {
              clearInterval(newsTickerTimerRef.current);
              newsTickerTimerRef.current = null;
            }
            return;
          }
          const frame = nextTickerFrame(newsState);
          setLines((prev) => [
            ...prev,
            ...frame.map((t) => ({ text: t, kind: "out" } as Line)),
          ]);
        }, 2200);
      }
      if (result.quit) {
        if (newsTickerTimerRef.current) {
          clearInterval(newsTickerTimerRef.current);
          newsTickerTimerRef.current = null;
        }
        setNewsState(null);
      } else {
        setNewsState({ ...newsState });
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
        // bodo.e67 / worag.e67 sind keine flachen Mini-Hosts, sondern
        // vollständige Maschinen mit eigenem Filesystem. Hier wechseln wir
        // bis `exit` in den vollwertigen Terminalmodus des Zielhosts.
        const targetUser =
          host.host === "bodo.e67"
            ? "bodo"
            : host.host === "worag.e67"
              ? "worag"
              : null;
        const sameAsLocal =
          (targetUser === "bodo" && localBodoMode) ||
          (targetUser === "worag" && !localBodoMode);
        if (targetUser && !sameAsLocal) {
          savedCwdRef.current = cwd;
          setRemoteMode(targetUser);
          // Im Remote-Modus starten wir im Home des Zielhosts.
          setCwd(targetUser === "bodo" ? [...HOME_PATH_BODO] : [...HOME_PATH_WORAG]);
        } else {
          setTelnetHost(telnetAwaitPass);
        }
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
      } else if (tHead === "pwd") {
        const user = host?.host.split(".")[0] ?? "guest";
        out.push({ text: `/home/${user}`, kind: "out" });
      } else if (tHead === "help" || tHead === "?") {
        out.push(
          { text: "Verfügbar in dieser Sitzung:", kind: "system" },
          { text: "  ls [-a]        — Verzeichnis anzeigen", kind: "out" },
          { text: "  cat <datei>    — Datei ausgeben", kind: "out" },
          { text: "  pwd            — aktuelles Verzeichnis", kind: "out" },
          { text: "  whoami         — eingeloggter Benutzer", kind: "out" },
          { text: "  exit           — Verbindung schließen", kind: "out" },
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

    // ── Remote-Sitzung: nur dateisystem- und info-bezogene Befehle.
    // Story-Werkzeuge (Inbox, Wartung, sysupdate, Adventure, …) gehören
    // zur eigenen Maschine und sind hier gesperrt — analog zu echtem
    // Telnet, wo Sub-Programme der Quellmaschine nicht durchgreifen.
    if (remoteMode) {
      const REMOTE_ALLOWED = new Set([
        "help", "?", "clear", "exit", "logout", "quit",
        "pwd", "ls", "dir", "cd", "cat", "more", "type",
        "tree", "whoami", "id", "date", "uptime", "history",
        "echo", "man", "uname", "ps",
      ]);
      if (!REMOTE_ALLOWED.has(head)) {
        newLines.push({
          text: `${head}: Befehl in Sitzung nicht verfügbar.`,
          kind: "out",
        });
        setLines((prev) => [...prev, ...newLines, { text: "", kind: "out" }]);
        const h = termHistoryRef.current;
        if (h[h.length - 1] !== raw) h.push(raw);
        historyCursorRef.current = -1;
        draftRef.current = "";
        setInput("");
        return;
      }
    }

    if (cmd === "help") {
      newLines.push(...buildHelpLines(bodoMode));
      // Hausmeister-Werkstatt: Macro »forge« taucht nur dann in der Hilfe
      // auf, wenn Layard wirklich anfangen kann, eine Quittung zu bauen
      // (Aushang 7.1 herausgelöst).
      if (bodoMode && flags.has("extractedAushang71") && !flags.has("forgedQuittung4317")) {
        newLines.push(
          { text: "", kind: "out" },
          { text: "WERKSTATT (intern):", kind: "system" },
          { text: "  forge         — Quittungsmacher (.forge.macro / Schicht-B-Vorlage)", kind: "out" },
        );
      }
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
    } else if (cmd === "news" || cmd === "./news" || cmd === "news.bin") {
      const fresh = newNewsState();
      setNewsState(fresh);
      newLines.push(
        ...newsStart(fresh).map((t) => ({ text: t, kind: "out" } as Line)),
      );
    } else if (cmd === "clear") {
      setLines([]);
      setInput("");
      return;
    } else if (cmd === "exit") {
      if (remoteMode) {
        // Remote-Sitzung beenden: zurück an die eigene Maschine.
        const target = remoteMode === "bodo" ? "bodo.e67" : "worag.e67";
        setLines((prev) => [
          ...prev,
          {
            text: `${userName}@${hostName}:${pathString(cwd).replace(homeLabel, "~") || "/"}$ ${input}`,
            kind: "in",
          },
          { text: `>> Verbindung zu ${target} geschlossen.`, kind: "system" },
          { text: "", kind: "out" },
        ]);
        setRemoteMode(null);
        setCwd(savedCwdRef.current ?? [...(localBodoMode ? HOME_PATH_BODO : HOME_PATH_WORAG)]);
        savedCwdRef.current = null;
        setInput("");
        return;
      }
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
        const hideHomeName = miraMode ? null : bodoMode ? "worag" : "bodo";
        newLines.push({ text: `Inhalt von ${pathString(cwd)}:`, kind: "system" });
        let kids = visibleChildren(node, showAll, (f) => flags.has(f));
        // /home zeigt jeweils nur das eigene Heimatverzeichnis — Sektor-
        // Privatsphäre. Layard sieht bodo dort nicht, Bodo nicht worag.
        if (pathString(cwd) === "/home" && hideHomeName) {
          kids = kids.filter((c) => c.name !== hideHomeName);
        }
        newLines.push(...formatLs(kids));
      }
    } else if (head === "cd") {
      const target = args[0] ?? "";
      const hideHomeName = miraMode ? null : bodoMode ? "worag" : "bodo";
      const isHiddenHome = (parts: string[]) =>
        hideHomeName !== null &&
        parts.length >= 2 &&
        parts[0] === "home" &&
        parts[1] === hideHomeName;
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
        const hideHomeName = miraMode ? null : bodoMode ? "worag" : "bodo";
        const isHiddenHome =
          hideHomeName !== null &&
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
          // Mira-Manifest gelesen → Trust-Voraussetzung erfüllt.
          if (miraMode && node.name === "manifest.txt") {
            api.setFlag("readMiraManifest");
          }
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
        } else if (superuser || miraMode) {
          // Cheat aktiv: Auth-Schritt komplett überspringen, direkt in
          // die authentifizierte Sitzung wechseln. Im Mira-Modus kommt
          // dasselbe Verhalten vom »root tunnel« über Drucker 5601.
          playUnlock(0.5 * sfxVolume);
          newLines.push(
            { text: `Versuche ${host.host} (${host.ip})…`, kind: "out" },
            { text: ">> Verbunden.", kind: "system" },
            {
              text: miraMode
                ? ">> [root tunnel] Authentifizierung übersprungen."
                : ">> [superuser] Authentifizierung übersprungen.",
              kind: "system",
            },
          );
          if (host.motd) {
            newLines.push(
              ...host.motd.map((t) => ({ text: t, kind: "out" } as Line)),
            );
          }
          const targetUser =
            host.host === "bodo.e67"
              ? "bodo"
              : host.host === "worag.e67"
                ? "worag"
                : null;
          const sameAsLocal =
            (targetUser === "bodo" && localBodoMode) ||
            (targetUser === "worag" && !localBodoMode);
          if (targetUser && !sameAsLocal) {
            savedCwdRef.current = cwd;
            setRemoteMode(targetUser);
            setCwd(
              targetUser === "bodo" ? [...HOME_PATH_BODO] : [...HOME_PATH_WORAG],
            );
          } else {
            setTelnetHost(host.host);
          }
          if (host.host === "philippe.e67") {
            api.setFlag("hackedPhilippe");
          }
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
        // Hinweis: Die Wartungskarte für 5610 vergibt Bodo selbst, bevor er
        // zum B3-Holen aufbricht (siehe Dialog `bodoLeavesForB3`). Hier wird
        // im Listing nur bestätigt, dass Bodos Auftrag echt ist.
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
    } else if (head === "forge") {
      // Akt-I-Pflichträtsel „Quittung 4317". Nur auf Bodos Konsole sinnvoll —
      // die Macro-Datei /home/bodo/.forge.macro liegt nur dort. Auf Worags
      // Maschine ist der Befehl unbekannt.
      if (!bodoMode) {
        newLines.push({
          text: "bash: forge: Befehl nicht gefunden.",
          kind: "out",
        });
      } else if (api.hasItem("quittungForged4317")) {
        newLines.push({
          text: "forge: Eine fertige Quittung 4317-K liegt bereits in der Aktentasche.",
          kind: "out",
        });
      } else {
        const need: Array<[string, string]> = [
          ["quittungBlankoB", "Quittungsbogen Schicht B (blanko)"],
          ["siegelAbdruck", "Trockensiegel-Abdruck"],
          ["aushang71Original", "Aushang 7.1 (Original)"],
        ];
        const missing = need.filter(([id]) => !api.hasItem(id as never));
        const signed = api.hasFlag("bodoSignedForTilla");
        if (missing.length > 0 || !signed) {
          newLines.push(
            { text: "── forge — Quittungsmacher (intern) ──", kind: "system" },
            { text: "  Voraussetzungen:", kind: "out" },
          );
          need.forEach(([id, label]) => {
            const ok = api.hasItem(id as never);
            newLines.push({
              text: `  [${ok ? "✓" : " "}] ${label}`,
              kind: ok ? "out" : "system",
            });
          });
          newLines.push({
            text: `  [${signed ? "✓" : " "}] Bodos Gegenzeichnung (Schicht-B)`,
            kind: signed ? "out" : "system",
          });
          newLines.push(
            { text: "", kind: "out" },
            {
              text: "forge: noch nicht alles beisammen. Bitte fehlende Posten beschaffen.",
              kind: "out",
            },
          );
        } else {
          setLines((prev) => [...prev, ...newLines]);
          runScriptedSequence(
            [
              { text: ">> forge: lade .forge.macro …", delayMs: 0, kind: "system", beep: true },
              { text: ">> Übernehme Trockensiegel-Kontur …", delayMs: 360 },
              { text: ">> Übernehme Aushang-7.1-Kopfzeile …", delayMs: 380 },
              { text: ">> Setze Code: 4317-K   Schicht: B   Empfänger: E70-K", delayMs: 400, beep: true },
              { text: ">> Übernehme Gegenzeichnung: B. Marschke (Schicht-B-Kulanz)", delayMs: 380 },
              { text: ">> Drucke Carbon-Durchschlag …", delayMs: 320 },
              { text: ">> Fertig. Quittung liegt in der Aktentasche.", delayMs: 280, kind: "system" },
            ],
            () => {
              api.setFlag("forgedQuittung4317");
              api.addItem({
                id: "quittungForged4317",
                name: "Quittung 4317-K (Schicht B, fertig)",
                description:
                  "Hellblauer Carbon-Quittungsbogen, akkurat ausgefüllt: »QUITTUNG / SCHICHT B / KOPIE FÜR E70 / CODE 4317-K«. Trockensiegel-Abdruck Schicht A in der oberen Ecke, daneben Bodos Wartungs-Signatur. Sieht aus, als wäre sie nie etwas anderes gewesen als echt.",
              });
            },
          );
          const h = termHistoryRef.current;
          if (h[h.length - 1] !== raw) h.push(raw);
          historyCursorRef.current = -1;
          draftRef.current = "";
          setInput("");
          return;
        }
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
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/85 sm:items-center sm:px-4">
      <div
        className={`fade-in relative flex h-full w-full flex-col overflow-hidden rounded-none border-0 bg-black shadow-[0_0_60px_rgba(0,0,0,0.85)] scanlines sm:h-auto sm:max-w-4xl sm:rounded-sm sm:border ${
          miraMode
            ? "border-destructive/60"
            : bodoMode
              ? "border-sepia/50"
              : "border-phosphor/50"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b bg-black px-4 py-2 ${
            miraMode
              ? "border-destructive/40"
              : bodoMode
                ? "border-sepia/30"
                : "border-phosphor/30"
          }`}
        >
          <span
            className={`font-mono-crt text-base uppercase tracking-[0.3em] ${
              miraMode
                ? "text-destructive"
                : bodoMode
                  ? "text-sepia sepia-glow"
                  : "text-phosphor phosphor-glow"
            }`}
          >
            {miraMode ? (
              <>FuckTheSystemOS 0.2 — root@miranet</>
            ) : (
              <>
                CentralOS v
                {osVersion(
                  flags.has(bodoMode ? "centralOsUpdatedBodo" : "centralOsUpdated"),
                  bodoMode,
                )}
                {bodoMode ? " — 2612" : ""}
              </>
            )}
          </span>
          <CloseButton
            onClick={closeTerminal}
            tone={miraMode ? "amber" : bodoMode ? "amber" : "phosphor"}
            label="Terminal schließen"
          />
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto bg-black px-4 py-3 font-mono-crt text-[15px] leading-relaxed crt-flicker sm:h-[55vh] sm:flex-none sm:text-base"
        >
          {lines.map((l, i) => (
            <div
              key={i}
              className={
                l.kind === "system"
                  ? miraMode
                    ? "text-destructive"
                    : bodoMode
                      ? "sepia-glow"
                      : "phosphor-glow"
                  : l.kind === "in"
                    ? miraMode
                      ? "text-destructive"
                      : bodoMode
                        ? "text-sepia"
                        : "text-phosphor"
                    : miraMode
                      ? "text-destructive/80"
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
            miraMode
              ? "border-destructive/40"
              : bodoMode
                ? "border-sepia/30"
                : "border-phosphor/30"
          }`}
        >
          <span
            className={`font-mono-crt text-[15px] sm:text-sm ${
              miraMode
                ? "text-destructive"
                : bodoMode
                  ? "text-sepia sepia-glow"
                  : "text-phosphor phosphor-glow"
            }`}
          >
            {advState
              ? "adventure>"
              : lottiState
                ? "lotti>"
                : newsState
                  ? "news>"
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
                  advState || lottiState || newsState
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
              } else if (newsState) {
                result = newsComplete(input);
              } else if (telnetHost) {
                const host = findHost(telnetHost);
                const hostFiles: Record<string, string[]> = {
                  ...(host?.files ?? {}),
                  ...(host?.dynamicFiles?.((f) => flags.has(f)) ?? {}),
                };
                result = completeTelnet(input, hostFiles);
              } else {
                result = complete(
                  input,
                  cwd,
                  (f) => flags.has(f),
                  resolvePath,
                  NET_HOSTS.flatMap((h) => [h.host, h.ip]),
                );
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
                } else if (newsState) {
                  echoPrompt = "news>";
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
              miraMode
                ? "text-destructive caret-destructive placeholder:text-destructive/40"
                : bodoMode
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