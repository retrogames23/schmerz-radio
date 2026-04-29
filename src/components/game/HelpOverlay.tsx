import { useEffect, useMemo, useRef, useState } from "react";
import { Search, HelpCircle } from "lucide-react";
import { CloseButton } from "./CloseButton";
import { filterHelp, HELP_SECTIONS, type HelpEntry } from "@/game/helpTopics";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Spielehilfe — durchsuchbarer Spickzettel für Tastatur- und
 * Touch-Bedienung. Erklärt Mechaniken (z. B. Leertaste = Hotspots
 * hervorheben, Tap-to-Use auf Mobile) ohne Story-Spoiler.
 */
export function HelpOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ESC schließt; "/" fokussiert das Suchfeld.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Beim Öffnen: Suchfeld leeren und fokussieren.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const sections = useMemo(() => filterHelp(query), [query]);

  if (!open) return null;

  const totalEntries = HELP_SECTIONS.reduce(
    (n, s) => n + s.entries.length,
    0,
  );
  const shownEntries = sections.reduce((n, s) => n + s.entries.length, 0);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-4"
      onClick={onClose}
      role="dialog"
      aria-label="Spielehilfe"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-sm border-2 border-amber-glow/60 bg-background/95 text-foreground shadow-[0_20px_80px_rgba(0,0,0,0.7)] backdrop-blur"
      >
        <CloseButton
          onClick={onClose}
          tone="amber"
          label="Spielehilfe schließen"
          className="absolute right-2 top-2"
        />

        {/* Kopf */}
        <header className="border-b border-amber-glow/30 bg-gradient-to-b from-amber-glow/10 to-transparent px-5 py-3 pr-12">
          <div className="flex items-center gap-2 font-mono-crt text-[10px] uppercase tracking-[0.3em] text-amber-glow/70">
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
            Spielehilfe
          </div>
          <div className="mt-0.5 font-display text-lg uppercase tracking-[0.2em] text-amber-glow amber-glow">
            Spickzettel
          </div>
          <div className="mt-1 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
            Tastatur, Maus & Touch — keine Spoiler
          </div>
        </header>

        {/* Suchleiste */}
        <div className="border-b border-border bg-secondary/30 px-5 py-3">
          <label className="flex items-center gap-2 rounded-sm border border-border bg-background/70 px-2 py-1.5 focus-within:border-amber-glow/60">
            <Search
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={2.25}
              aria-hidden
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Suchen: z. B. Leertaste, Inventar, ESC, Mobile …"
              className="w-full bg-transparent font-mono-crt text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              aria-label="Hilfe durchsuchen"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="rounded-sm border border-border px-1.5 py-0.5 font-mono-crt text-[10px] uppercase text-muted-foreground hover:border-amber-glow/60 hover:text-amber-glow"
              >
                Leeren
              </button>
            )}
          </label>
          <div className="mt-1.5 flex items-center justify-between font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>
              {query
                ? `${shownEntries} / ${totalEntries} Treffer`
                : `${totalEntries} Einträge`}
            </span>
            <span className="hidden sm:inline">
              Tipp: <kbd className="rounded border border-border px-1">/</kbd>{" "}
              fokussiert die Suche, <kbd className="rounded border border-border px-1">ESC</kbd> schließt.
            </span>
          </div>
        </div>

        {/* Inhalt */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {sections.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border p-6 text-center font-mono-crt text-sm text-muted-foreground">
              Keine Treffer für „{query}".
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((sec) => (
                <section key={sec.id}>
                  <h2 className="font-display text-sm uppercase tracking-[0.25em] text-amber-glow/90">
                    {sec.title}
                  </h2>
                  {sec.intro && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      {sec.intro}
                    </p>
                  )}
                  <ul className="mt-3 space-y-2">
                    {sec.entries.map((e) => (
                      <HelpRow key={e.label} entry={e} highlight={query} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HelpRow({ entry, highlight }: { entry: HelpEntry; highlight: string }) {
  return (
    <li className="rounded-sm border border-border bg-secondary/20 p-3 transition hover:border-amber-glow/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-display text-sm text-foreground">
          {hl(entry.label, highlight)}
        </div>
        <div className="flex flex-wrap gap-1">
          {entry.keys.map((k) => (
            <kbd
              key={k}
              className="rounded-sm border border-amber-glow/40 bg-background/60 px-1.5 py-0.5 font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow/90"
            >
              {k}
            </kbd>
          ))}
        </div>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {hl(entry.description, highlight)}
      </p>
    </li>
  );
}

/** Markiert Treffer im Text farblich. Robust für Mehrwort-Queries. */
function hl(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const tokens = Array.from(
    new Set(q.split(/\s+/).filter((t) => t.length > 0)),
  );
  if (tokens.length === 0) return text;
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "ig");
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="rounded-sm bg-amber-glow/30 text-amber-glow">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}