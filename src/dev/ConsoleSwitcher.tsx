import { useEffect, useState } from "react";
import { useGame } from "@/game/GameContext";

/**
 * Eintrag im Konsolen-Switcher. `open` löst die jeweilige Konsole/Overlay
 * über die GameContext-API aus. Reine Dev-Hilfe — Story-Flags werden NICHT
 * angefasst, der Switcher öffnet das Overlay einfach roh.
 */
type GameCtx = ReturnType<typeof useGame>;
type ConsoleEntry = {
  id: string;
  title: string;
  open: (ctx: GameCtx) => void;
};

const consoles: ConsoleEntry[] = [
  {
    id: "terminal-layard",
    title: "Terminal · Layard (E67-Workstation)",
    open: ({ api }) => api.openTerminal(false),
  },
  {
    id: "terminal-bodo",
    title: "Terminal · Bodo-Modus",
    open: ({ api }) => api.openTerminal({ bodo: true }),
  },
  {
    id: "terminal-mira",
    title: "Terminal · Mira (FuckTheSystemOS)",
    open: ({ api }) => api.openTerminal({ mira: true }),
  },
  {
    id: "radio",
    title: "Radio-Panel (Schmerz-Radio 104,6)",
    open: ({ api }) => api.openRadio(),
  },
  {
    id: "keypad",
    title: "Keypad (Tür-/Code-Eingabe)",
    open: ({ api }) => api.openKeypad(),
  },
  {
    id: "television",
    title: "Fernseher (TV-Programm)",
    open: ({ api }) => api.openTelevision(),
  },
  {
    id: "node-5610",
    title: "Node-Terminal · 56.10",
    open: ({ api }) => api.openNode5610(),
  },
  {
    id: "pneumatic",
    title: "Rohrpost (Pneumatic Tube)",
    open: ({ api }) => api.openPneumaticTube(),
  },
  {
    id: "handbook",
    title: "E67-Handbuch",
    open: (ctx) => ctx.openHandbook(),
  },
  {
    id: "id-card",
    title: "Dienstausweis",
    open: (ctx) => ctx.openIdCard(),
  },
  {
    id: "duel",
    title: "Bürokratie-Duell",
    open: ({ api }) => api.openBureaucracyDuel(),
  },
  {
    id: "amiga-workbench",
    title: "Amiga · Workbench + FastWeb (E71)",
    open: ({ api }) => api.openAmigaWorkbench(),
  },
];

/**
 * Dev-only Konsolen-Switcher: Öffnet alle Konsolen/Overlays des Spiels per
 * Klick. Sitzt neben dem Raum-Switcher links unten. Tastenkürzel: "K".
 */
export function ConsoleSwitcher() {
  const ctx = useGame();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "k" && e.key !== "K") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = filter
    ? consoles.filter(
        (c) =>
          c.id.toLowerCase().includes(filter.toLowerCase()) ||
          c.title.toLowerCase().includes(filter.toLowerCase()),
      )
    : consoles;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Dev: Konsolen-Switcher (K)"
        className="fixed bottom-4 left-16 z-[9998] flex h-10 w-10 items-center justify-center rounded-full border border-amber-glow/60 bg-background/80 font-mono-crt text-base text-amber-glow shadow-lg hover:bg-amber-glow/15"
      >
        ▣
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 px-4 py-12"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-sm border border-amber-glow/60 bg-background p-4 shadow-[0_0_60px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-sm uppercase tracking-[0.3em] text-amber-glow amber-glow">
                Dev · Konsolen-Switcher
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono-crt text-xs uppercase text-muted-foreground hover:text-amber-glow"
              >
                schließen [Esc/K]
              </button>
            </div>

            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter (Titel oder ID)…"
              className="mb-3 w-full rounded-sm border border-amber-glow/40 bg-background/60 px-3 py-2 font-mono-crt text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-glow focus:outline-none"
            />

            <div className="max-h-[60vh] overflow-y-auto pr-1 font-mono-crt text-sm">
              {filtered.length === 0 && (
                <div className="px-2 py-4 text-center text-muted-foreground">
                  Keine Treffer.
                </div>
              )}
              <ul className="space-y-1">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        c.open(ctx);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-sm border border-amber-glow/20 px-3 py-2 text-left text-foreground transition hover:border-amber-glow/60 hover:bg-amber-glow/10"
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {c.id}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Tipp: Taste „K" öffnet/schließt den Switcher. Konsolen werden roh
              geöffnet — Story-Flags werden NICHT angepasst.
            </div>
          </div>
        </div>
      )}
    </>
  );
}