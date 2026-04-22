import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";

interface Line {
  text: string;
  kind?: "in" | "out" | "system";
}

const HELP_LINES: Line[] = [
  { text: "VERFÜGBARE BEFEHLE:", kind: "system" },
  { text: "  help          — Diese Liste anzeigen", kind: "out" },
  { text: "  inbox         — Posteingang anzeigen", kind: "out" },
  { text: "  read <id>     — Nachricht öffnen", kind: "out" },
  { text: "  status        — Systemstatus", kind: "out" },
  { text: "  unlock <code> — Sektor-Tür öffnen (8 Ziffern)", kind: "out" },
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
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalOpen) {
      setLines([
        { text: ">> CENTRALOS v2.3 — Terminal Quadrant E67", kind: "system" },
        { text: ">> Benutzer: WORAG, L. (Zimmer 2611)", kind: "system" },
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
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    playBeep(0.4 * sfxVolume);
    const newLines: Line[] = [{ text: `>> ${input}`, kind: "in" }];

    if (cmd === "help") {
      newLines.push(...HELP_LINES);
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
          <span className="font-mono-crt text-phosphor phosphor-glow">{">"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              if (e.target.value.length > input.length) {
                playKeypress(0.3 * sfxVolume);
              }
              setInput(e.target.value);
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