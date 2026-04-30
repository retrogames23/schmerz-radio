import { useEffect, useState } from "react";
import { scenes, useGame } from "@/game/GameContext";

/**
 * Dev-only Room-Switcher: Listet alle im Spiel registrierten Räume und
 * teleportiert die Figur per Klick dorthin. Nur sichtbar im Dev-Mode
 * (?dev=1). Öffnet sich über den runden „⚡" Button rechts unten oder
 * via Tastenkürzel "G".
 */
export function RoomSwitcher() {
  const { api, scene } = useGame();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "g" && e.key !== "G") return;
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

  const entries = Object.entries(scenes)
    .map(([id, s]) => ({ id, title: (s as { title?: string }).title ?? id }))
    .sort((a, b) => a.title.localeCompare(b.title, "de"));

  const filtered = filter
    ? entries.filter(
        (e) =>
          e.id.toLowerCase().includes(filter.toLowerCase()) ||
          e.title.toLowerCase().includes(filter.toLowerCase()),
      )
    : entries;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Dev: Raum-Switcher (G)"
        className="fixed bottom-4 left-4 z-[120] flex h-10 w-10 items-center justify-center rounded-full border border-amber-glow/60 bg-background/80 font-mono-crt text-base text-amber-glow shadow-lg hover:bg-amber-glow/15"
      >
        ⚡
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center bg-black/70 px-4 py-12"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-sm border border-amber-glow/60 bg-background p-4 shadow-[0_0_60px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-sm uppercase tracking-[0.3em] text-amber-glow amber-glow">
                Dev · Raum-Switcher
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-mono-crt text-xs uppercase text-muted-foreground hover:text-amber-glow"
              >
                schließen [Esc/G]
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
                {filtered.map((e) => {
                  const isCurrent = e.id === scene;
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => {
                          api.goTo(e.id);
                          setOpen(false);
                        }}
                        className={
                          "flex w-full items-center justify-between gap-3 rounded-sm border px-3 py-2 text-left transition " +
                          (isCurrent
                            ? "border-amber-glow bg-amber-glow/10 text-amber-glow amber-glow"
                            : "border-amber-glow/20 text-foreground hover:border-amber-glow/60 hover:bg-amber-glow/10")
                        }
                      >
                        <span className="truncate">{e.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {e.id}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Tipp: Taste „G" öffnet/schließt den Switcher. Klick teleportiert
              die Figur sofort — Story-Flags werden NICHT angepasst.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
