import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";
import { FILESYSTEM, resolvePath, pathString, type FsNode } from "@/game/filesystem";
import type { StoryFlag } from "@/game/types";
import {
  adventureCommand,
  adventureStart,
  newAdventureState,
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
  const [cwd, setCwd] = useState<string[]>([]);
  const [advState, setAdvState] = useState<AdvState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTabRef = useRef<{ input: string; matches: string[] } | null>(null);

  useEffect(() => {
    if (terminalOpen) {
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
      if (result.quit) {
        setAdvState(null);
      } else {
        // force re-render after mutation
        setAdvState({ ...advState });
      }
      setInput("");
      return;
    }

    const cmd = raw.toLowerCase();
    const argsRaw = raw.split(/\s+/);
    const head = argsRaw[0]?.toLowerCase() ?? "";
    const args = argsRaw.slice(1);
    playBeep(0.4 * sfxVolume);
    const promptPath = pathString(cwd).replace("/home/worag", "~");
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
      if (!target || target === "~" || target === "/") {
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
    } else {
      newLines.push({
        text: `Unbekannter Befehl: ${cmd}. Tippe 'help'.`,
        kind: "out",
      });
    }

    setLines((prev) => [...prev, ...newLines, { text: "", kind: "out" }]);
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
              if (e.key !== "Tab") {
                lastTabRef.current = null;
                return;
              }
              e.preventDefault();
              // No tab-completion inside the adventure sub-mode.
              if (advState) return;
              const result = complete(input, cwd, (f) => flags.has(f));
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
                const promptPath = pathString(cwd).replace("/home/worag", "~");
                setLines((p) => [
                  ...p,
                  { text: `worag@e67:${promptPath}$ ${input}`, kind: "in" },
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