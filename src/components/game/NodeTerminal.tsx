import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { useSettings } from "@/audio/SettingsContext";
import { playBeep, playKeypress, playUnlock } from "@/audio/sfx";
import {
  SECTOR_CHATTER,
  chatterDelayMs,
  chatterTimestamp,
} from "@/game/sectorChatter";
import { CloseButton } from "./CloseButton";

interface Line {
  text: string;
  kind?: "in" | "out" | "system" | "warn";
}

/**
 * Wartungsterminal hinter Tür 5610 — eigenes UI.
 * Drei sinnvolle Befehle: tap, reroute, burn.
 * Jede Aktion ist einmalig pro Run und beeinflusst das Ende.
 */
export function NodeTerminal() {
  const { nodeOpen, closeNode, api, flags, ending } = useGame();
  const { sfxVolume } = useSettings();
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenIndexRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nodeOpen) return;
    const tapped = flags.has("tappedNode5610");
    const rerouted = flags.has("reroutedNode5610");
    const burned = flags.has("burnedNode5610");
    const status = burned
      ? "OFFLINE (Hardware)"
      : rerouted
        ? "LOOPBACK (Echo only)"
        : "AKTIV — Pakete: 1.04k/s";
    setLines([
      { text: "── NODE-MAINT 5610 · E67 ──────────────────", kind: "system" },
      { text: "── Lokaler Resonanz-Konzentrator         ──", kind: "system" },
      { text: "── Träger: 104,6 MHz · Quelle: aggregiert ──", kind: "system" },
      { text: "", kind: "out" },
      { text: `Status: ${status}`, kind: tapped || rerouted || burned ? "warn" : "out" },
      { text: "", kind: "out" },
      { text: "Verfügbare Befehle:", kind: "system" },
      {
        text: "  tap      — passiv mithören (10 s)",
        kind: tapped ? "out" : "out",
      },
      {
        text: "  listen   — Live-Mitschnitt des Sektor-Verkehrs",
        kind: "out",
      },
      {
        text: "  reroute  — Knoten in Echo-Schleife legen",
        kind: "out",
      },
      {
        text: "  burn     — Hardware-Reset (irreversibel, ALARM)",
        kind: "warn",
      },
      { text: "  exit     — Terminal schließen", kind: "out" },
      { text: "", kind: "out" },
    ]);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [nodeOpen, flags]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Stop Listen-Loop sobald Terminal geschlossen wird ODER Komponente unmountet.
  // Vorher wurde der Timer nur während eines Renders mit nodeOpen=false beräumt,
  // wodurch nach Schließen weiter Geräusche/Zeilen kamen.
  useEffect(() => {
    if (!nodeOpen) {
      if (listenTimerRef.current) {
        clearTimeout(listenTimerRef.current);
        listenTimerRef.current = null;
      }
      setListening(false);
    }
    return () => {
      if (listenTimerRef.current) {
        clearTimeout(listenTimerRef.current);
        listenTimerRef.current = null;
      }
    };
  }, [nodeOpen]);

  // Sobald das Ending startet, brechen wir einen laufenden Listen-Loop
  // halten wir die Beeps stumm — die Chatter-Zeilen sollen aber als
  // stille Atmosphäre weiterlaufen (visuell, ohne Ton).
  const endingRef = useRef(false);
  useEffect(() => {
    endingRef.current = ending;
  }, [ending]);

  if (!nodeOpen) return null;

  const append = (more: Line[]) => setLines((p) => [...p, ...more]);

  const stopListening = (silent = false) => {
    if (listenTimerRef.current) {
      clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
    }
    setListening(false);
    if (!silent) {
      append([
        { text: ">> listen: Mitschnitt beendet.", kind: "system" },
        { text: "", kind: "out" },
      ]);
    }
  };

  /** Mischt die Chatter-Liste neu durch (Fisher–Yates auf einer Kopie). */
  const shuffledChatter = () => {
    const arr = SECTOR_CHATTER.map((m) => m);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startListening = () => {
    setListening(true);
    const stream = shuffledChatter();
    listenIndexRef.current = 0;
    const tick = () => {
      const idx = listenIndexRef.current;
      const msg = stream[idx % stream.length];
      const ts = chatterTimestamp();
      // Einrückungen so wählen, dass von/an unterschiedlich gut lesbar bleiben.
      const header = `[${ts}]  ${msg.from}  →  ${msg.to}`;
      const body = `         » ${msg.text}«`;
      // Leiser Beep für Eingang — im Abspann stumm, damit nur die
      // Zeilen als Atmosphäre durchscrollen.
      if (!endingRef.current) playBeep(0.18 * sfxVolume);
      setLines((prev) => [
        ...prev,
        { text: header, kind: "system" },
        { text: body, kind: "out" },
      ]);
      listenIndexRef.current = idx + 1;
      listenTimerRef.current = setTimeout(tick, chatterDelayMs());
    };
    // Erstes Paket nach kurzer Anlaufzeit (1–2 s), damit der Banner sichtbar bleibt.
    listenTimerRef.current = setTimeout(tick, 1200);
  };

  const runScripted = (
    steps: { text: string; delayMs: number; kind?: Line["kind"]; beep?: boolean }[],
    done?: () => void,
  ) => {
    setBusy(true);
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
      setBusy(false);
      done?.();
      setTimeout(() => inputRef.current?.focus(), 30);
    }, acc + 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    // Während gelauscht wird beendet jede Eingabe (auch leer) den Mitschnitt.
    if (listening) {
      const echo: Line = { text: `node-5610# ${input || ""}`, kind: "in" };
      setInput("");
      append([echo]);
      stopListening();
      return;
    }
    const raw = input.trim().toLowerCase();
    if (!raw) return;
    playBeep(0.4 * sfxVolume);
    const echo: Line = { text: `node-5610# ${input}`, kind: "in" };
    setInput("");

    if (raw === "exit" || raw === "quit" || raw === "logout") {
      append([echo, { text: ">> Verbindung zum Knoten geschlossen.", kind: "system" }]);
      setTimeout(() => closeNode(), 500);
      return;
    }

    if (raw === "help" || raw === "?") {
      append([
        echo,
        { text: "Befehle: tap | listen | reroute | burn | exit", kind: "out" },
        { text: "", kind: "out" },
      ]);
      return;
    }

    if (raw === "listen") {
      if (flags.has("burnedNode5610")) {
        append([
          echo,
          { text: "listen: Knoten ist offline (burn).", kind: "warn" },
          { text: "", kind: "out" },
        ]);
        return;
      }
      append([
        echo,
        { text: ">> Öffne passiven Listen-Port am Sektor-Bus …", kind: "system" },
        {
          text: ">> [Enter drücken, um den Mitschnitt zu beenden]",
          kind: "system",
        },
        { text: "", kind: "out" },
      ]);
      playBeep(0.3 * sfxVolume);
      startListening();
      return;
    }

    if (raw === "tap") {
      if (flags.has("burnedNode5610")) {
        append([echo, { text: "tap: Knoten ist offline (burn).", kind: "warn" }, { text: "", kind: "out" }]);
        return;
      }
      if (flags.has("tappedNode5610")) {
        append([
          echo,
          { text: "tap: bereits abgehört. Das war genug.", kind: "out" },
          { text: "", kind: "out" },
        ]);
        return;
      }
      append([echo]);
      runScripted(
        [
          { text: ">> Öffne passiven Tap-Port …", delayMs: 0, kind: "system", beep: true },
          { text: ">> Demoduliere 104,6 MHz (Roh-Stream) …", delayMs: 420 },
          { text: ">> ─────── AFFEKT-TELEMETRIE ───────", delayMs: 380, kind: "system" },
          { text: "   Knoten:        5610  (Sektor E67, 412 Empfänger)", delayMs: 360 },
          { text: "   Trägerpegel:   -18,2 dBm   stabil", delayMs: 280 },
          { text: "   SNR:            27,4 dB", delayMs: 240 },
          { text: "   Filter-Last:    87 %        (Soll: < 60 %)", delayMs: 280, kind: "warn" },
          { text: "   Kompressor:     3:1 → 6:1   (dyn. nachgeführt)", delayMs: 280 },
          { text: "   ─── Affektbänder (gleitender Mittelwert, 60 s) ───", delayMs: 380, kind: "system" },
          { text: "   Trauer          ████████████░░░░  74 %", delayMs: 320, kind: "warn" },
          { text: "   Erschöpfung     ██████████░░░░░░  62 %", delayMs: 320, kind: "warn" },
          { text: "   Scham           ███████░░░░░░░░░  41 %", delayMs: 320, kind: "warn" },
          { text: "   Wut (gedämpft)  ████░░░░░░░░░░░░  22 %", delayMs: 320, kind: "warn" },
          { text: "   Sehnsucht       ██░░░░░░░░░░░░░░  11 %", delayMs: 320, kind: "warn" },
          { text: "   ─── Quell-Signatur ───", delayMs: 380, kind: "system" },
          { text: "   1 Sender dominiert den Mix zu 38 %.", delayMs: 500, kind: "warn" },
          { text: "   Signatur-Hash: 0x4E67·LAYARD·WORAG", delayMs: 600, kind: "warn" },
          { text: ">> ─── EINGANG: DAS BIST DU. GEFILTERT. ──", delayMs: 800, kind: "system" },
          { text: ">> Tap geschlossen.", delayMs: 500, kind: "system", beep: true },
        ],
        () => {
          api.setFlag("tappedNode5610");
          api.setKnowledge("radioOrigin");
        },
      );
      return;
    }

    if (raw === "reroute") {
      if (flags.has("burnedNode5610")) {
        append([echo, { text: "reroute: Knoten ist offline (burn).", kind: "warn" }, { text: "", kind: "out" }]);
        return;
      }
      if (flags.has("reroutedNode5610")) {
        append([
          echo,
          { text: "reroute: Loopback ist bereits aktiv.", kind: "out" },
          { text: "", kind: "out" },
        ]);
        return;
      }
      append([echo]);
      runScripted(
        [
          { text: ">> Lade Routing-Tabelle …", delayMs: 0, kind: "system", beep: true },
          { text: ">> Setze Ziel-IP: 127.0.0.1 (loopback) …", delayMs: 400 },
          { text: ">> Schreibe Konfiguration …", delayMs: 380 },
          { text: ">> Sende SIGHUP an carrier-daemon …", delayMs: 380, beep: true },
          { text: ">> Knoten 5610 sendet jetzt nur noch sein eigenes Echo.", delayMs: 600, kind: "system" },
          { text: ">> Niemand wird das in den nächsten Stunden bemerken.", delayMs: 500, kind: "system" },
          { text: ">> Sektor E67 — still, von oben nach unten.", delayMs: 500, kind: "system" },
        ],
        () => {
          playUnlock(0.5 * sfxVolume);
          api.setFlag("reroutedNode5610");
          api.setFlag("crossLinkSevered");
          api.playBurnSequence("reroute");
        },
      );
      return;
    }

    if (raw === "burn") {
      if (flags.has("burnedNode5610")) {
        append([
          echo,
          { text: "burn: bereits durchgeführt. Der Knoten ist tot.", kind: "warn" },
          { text: "", kind: "out" },
        ]);
        return;
      }
      if (flags.has("reroutedNode5610")) {
        append([
          echo,
          {
            text: "burn: Knoten läuft im Loopback. Reset würde den Loop durchbrechen.",
            kind: "warn",
          },
          { text: "Trotzdem ausführen? Tippe 'burn confirm'.", kind: "out" },
          { text: "", kind: "out" },
        ]);
        return;
      }
      append([echo]);
      runScripted(
        [
          { text: ">> WARNUNG: Hardware-Reset gestartet.", delayMs: 0, kind: "warn", beep: true },
          { text: ">> Überspannung an PSU-1 …", delayMs: 400, kind: "warn" },
          { text: ">> Rauchmelder Sektor 5/Tech: ALARM ausgelöst.", delayMs: 500, kind: "warn", beep: true },
          { text: ">> Carrier-Daemon: SEGFAULT. Core dumped.", delayMs: 500, kind: "warn" },
          { text: ">> 104,6 — KEIN TRÄGER.", delayMs: 600, kind: "system" },
          { text: ">> Lobby-Pult E67: eingehender Anruf an 001.", delayMs: 600, kind: "warn" },
          { text: ">> Querkopplung E67↔E71: GETRENNT.", delayMs: 500, kind: "warn", beep: true },
        ],
        () => {
          api.setFlag("burnedNode5610");
          api.setFlag("crossLinkSevered");
          api.playBurnSequence("burn");
        },
      );
      return;
    }

    if (raw === "burn confirm") {
      append([echo]);
      runScripted(
        [
          { text: ">> Loopback wird mit dem Knoten zerstört …", delayMs: 0, kind: "warn", beep: true },
          { text: ">> Vollständiger Hardware-Reset …", delayMs: 500, kind: "warn" },
          { text: ">> 104,6 — KEIN TRÄGER.", delayMs: 600, kind: "system" },
          { text: ">> Querkopplung E67↔E71: GETRENNT.", delayMs: 500, kind: "warn", beep: true },
        ],
        () => {
          api.setFlag("burnedNode5610");
          api.setFlag("crossLinkSevered");
          api.playBurnSequence("burn");
        },
      );
      return;
    }

    append([
      echo,
      { text: `Unbekannter Befehl: ${raw}. Tippe 'help'.`, kind: "out" },
      { text: "", kind: "out" },
    ]);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 px-4">
      <div className="fade-in relative w-full max-w-3xl overflow-hidden rounded-sm border border-amber-glow/40 bg-black shadow-[0_0_60px_rgba(0,0,0,0.85)] scanlines">
        <div className="flex items-center justify-between border-b border-amber-glow/30 bg-black px-4 py-2">
          <span className="font-mono-crt text-base uppercase tracking-[0.3em] text-amber-glow amber-glow">
            NODE-MAINT 5610
          </span>
          <CloseButton onClick={closeNode} tone="amber" label="Wartungsterminal schließen" />
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
                  ? "text-amber-glow amber-glow"
                  : l.kind === "warn"
                    ? "text-destructive"
                    : l.kind === "in"
                      ? "text-amber-glow"
                      : "text-amber-glow/70"
              }
            >
              {l.text || "\u00A0"}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-amber-glow/30 bg-black px-4 py-2"
        >
          <span className="font-mono-crt text-sm text-amber-glow amber-glow">
            node-5610#
          </span>
          <input
            ref={inputRef}
            value={input}
            disabled={busy}
            onChange={(e) => {
              if (e.target.value.length > input.length) {
                playKeypress(0.3 * sfxVolume);
              }
              setInput(e.target.value);
            }}
            className="flex-1 bg-transparent font-mono-crt text-base text-amber-glow caret-amber-glow outline-none disabled:opacity-40 placeholder:text-amber-glow/40"
            placeholder={
              busy
                ? "… Ausgabe läuft …"
                : listening
                  ? "… Mitschnitt läuft. Enter beendet."
                  : "listen | tap | reroute | burn | exit"
            }
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}