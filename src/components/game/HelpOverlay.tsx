import { useEffect, useMemo, useRef, useState } from "react";
import { Search, HelpCircle, Lightbulb, RotateCcw } from "lucide-react";
import { CloseButton } from "./CloseButton";
import { filterHelp, HELP_SECTIONS, type HelpEntry } from "@/game/helpTopics";
import {
  getActiveHints,
  HINTS_UI_TEXT,
  type HintQuest,
} from "@/game/hints";
import { useGame } from "@/game/GameContext";

export type HelpTab = "cheatsheet" | "hints";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Mit welchem Tab das Overlay öffnen soll. Default: "cheatsheet". */
  initialTab?: HelpTab;
}

const HINT_STATE_PREFIX = "hint:";

/** Liest die enthüllte Stufe (1..3) aus sessionStorage. 0 = nichts enthüllt. */
function readRevealed(questId: string): number {
  if (typeof window === "undefined") return 1;
  const raw = window.sessionStorage.getItem(HINT_STATE_PREFIX + questId);
  const n = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n >= 1 && n <= 3 ? n : 1;
}
function writeRevealed(questId: string, level: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(HINT_STATE_PREFIX + questId, String(level));
}
function clearRevealed(questId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(HINT_STATE_PREFIX + questId);
}

/**
 * Spielehilfe — zwei Tabs:
 *  - "Spickzettel": durchsuchbare Mechanik-Hilfe (Tastatur, Maus, Touch).
 *  - "Tipps": gestaffelte Hinweise (vage → konkret → exakt) zu offenen Quests.
 */
export function HelpOverlay({ open, onClose, initialTab = "cheatsheet" }: Props) {
  const [tab, setTab] = useState<HelpTab>(initialTab);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Beim Öffnen: gewünschten Tab setzen, Suche leeren, Suchfeld fokussieren
  // (nur im Spickzettel-Tab).
  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setQuery("");
    if (initialTab === "cheatsheet") {
      const t = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open, initialTab]);

  // ESC schließt; "/" fokussiert das Suchfeld (nur im Spickzettel-Tab).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (
        tab === "cheatsheet" &&
        e.key === "/" &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, tab]);

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
            {tab === "cheatsheet" ? "Spickzettel" : "Tipps"}
          </div>
          <div className="mt-1 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
            {tab === "cheatsheet"
              ? "Tastatur, Maus & Touch — keine Spoiler"
              : "Gestaffelte Hinweise zu deinen offenen Aufgaben"}
          </div>
        </header>

        {/* Tab-Switcher */}
        <div className="flex border-b border-border bg-secondary/20 px-3">
          <TabButton
            active={tab === "cheatsheet"}
            onClick={() => setTab("cheatsheet")}
            icon={<HelpCircle className="h-3.5 w-3.5" strokeWidth={2.25} />}
            label={HINTS_UI_TEXT.tabCheatsheet}
          />
          <TabButton
            active={tab === "hints"}
            onClick={() => setTab("hints")}
            icon={<Lightbulb className="h-3.5 w-3.5" strokeWidth={2.25} />}
            label={HINTS_UI_TEXT.tabHints}
          />
        </div>

        {tab === "cheatsheet" ? (
          <CheatsheetPane
            query={query}
            setQuery={setQuery}
            sections={sections}
            totalEntries={totalEntries}
            shownEntries={shownEntries}
            inputRef={inputRef}
          />
        ) : (
          <HintsPane />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 font-display text-xs uppercase tracking-[0.2em] transition-colors ${
        active
          ? "border-amber-glow text-amber-glow"
          : "border-transparent text-muted-foreground hover:text-amber-glow/80"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Spickzettel-Pane (das alte Verhalten)                              */
/* ------------------------------------------------------------------ */

function CheatsheetPane({
  query,
  setQuery,
  sections,
  totalEntries,
  shownEntries,
  inputRef,
}: {
  query: string;
  setQuery: (v: string) => void;
  sections: ReturnType<typeof filterHelp>;
  totalEntries: number;
  shownEntries: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <>
      {/* Suchleiste */}
      <div className="border-b border-border bg-secondary/30 px-5 py-3">
        <label className="flex items-center gap-2 rounded-sm border border-border bg-background/70 px-2 py-1.5 focus-within:border-amber-glow/60">
          <Search className="h-4 w-4 text-muted-foreground" strokeWidth={2.25} aria-hidden />
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
            {query ? `${shownEntries} / ${totalEntries} Treffer` : `${totalEntries} Einträge`}
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
                  <p className="mt-1 text-xs italic text-muted-foreground">{sec.intro}</p>
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
    </>
  );
}

function HelpRow({ entry, highlight }: { entry: HelpEntry; highlight: string }) {
  return (
    <li className="rounded-sm border border-border bg-secondary/20 p-3 transition hover:border-amber-glow/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-display text-sm text-foreground">{hl(entry.label, highlight)}</div>
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

function hl(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const tokens = Array.from(new Set(q.split(/\s+/).filter((t) => t.length > 0)));
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

/* ------------------------------------------------------------------ */
/*  Tipps-Pane (neu)                                                   */
/* ------------------------------------------------------------------ */

function HintsPane() {
  const game = useGame();
  // Quests aus dem aktuellen Spielzustand ableiten. Re-evaluieren bei jedem
  // Render reicht — das Overlay öffnet/schließt selten genug.
  const quests = useMemo(() => getActiveHints(game.api), [game.api, game.flags]);

  const [selectedId, setSelectedId] = useState<string | null>(
    quests[0]?.id ?? null,
  );
  // Wenn die Auswahl nicht mehr offen ist (Quest erledigt), neu wählen.
  useEffect(() => {
    if (!selectedId || !quests.find((q) => q.id === selectedId)) {
      setSelectedId(quests[0]?.id ?? null);
    }
  }, [quests, selectedId]);

  const selected = quests.find((q) => q.id === selectedId) ?? null;
  const [revealed, setRevealed] = useState<number>(() =>
    selected ? readRevealed(selected.id) : 1,
  );
  useEffect(() => {
    if (selected) setRevealed(readRevealed(selected.id));
  }, [selected]);

  const reveal = (level: number) => {
    if (!selected) return;
    const next = Math.min(3, Math.max(1, level));
    setRevealed(next);
    writeRevealed(selected.id, next);
  };
  const reset = () => {
    if (!selected) return;
    clearRevealed(selected.id);
    setRevealed(1);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {/* Spoiler-Warnung */}
      <div className="mb-4 rounded-sm border border-amber-glow/40 bg-amber-glow/5 px-3 py-2 font-mono-crt text-[11px] leading-relaxed text-amber-glow/90">
        {HINTS_UI_TEXT.spoilerWarning}
      </div>

      {quests.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border p-6 text-center font-mono-crt text-sm text-muted-foreground">
          {HINTS_UI_TEXT.noOpenQuests}
        </div>
      ) : (
        <>
          {/* Quest-Auswahl */}
          <div className="mb-4">
            <div className="mb-1.5 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground">
              {HINTS_UI_TEXT.questPickerLabel}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quests.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedId(q.id)}
                  aria-pressed={q.id === selectedId}
                  className={`rounded-sm border px-2.5 py-1 text-left font-display text-xs transition-colors ${
                    q.id === selectedId
                      ? "border-amber-glow bg-amber-glow/15 text-amber-glow"
                      : "border-border bg-secondary/30 text-foreground/80 hover:border-amber-glow/50 hover:text-amber-glow"
                  }`}
                >
                  {q.title}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] italic text-muted-foreground">
              {HINTS_UI_TEXT.introHint}
            </p>
          </div>

          {/* Tipp-Stufen */}
          {selected && (
            <HintLevels
              quest={selected}
              revealed={revealed}
              onReveal={reveal}
              onReset={reset}
            />
          )}
        </>
      )}
    </div>
  );
}

function HintLevels({
  quest,
  revealed,
  onReveal,
  onReset,
}: {
  quest: HintQuest;
  revealed: number;
  onReveal: (level: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((level) => {
        const isOpen = level <= revealed;
        const text = quest.hints[level - 1];
        return (
          <div
            key={level}
            className={`rounded-sm border p-3 transition-colors ${
              isOpen
                ? "border-amber-glow/50 bg-secondary/30"
                : "border-dashed border-border bg-secondary/10"
            }`}
          >
            <div className="font-mono-crt text-[10px] uppercase tracking-widest text-amber-glow/80">
              {HINTS_UI_TEXT.hintLevelLabel(level as 1 | 2 | 3)}
            </div>
            {isOpen ? (
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                {text}
              </p>
            ) : (
              <p className="mt-1.5 text-xs italic text-muted-foreground">
                — verborgen —
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {revealed < 3 ? (
          <button
            type="button"
            onClick={() => onReveal(revealed + 1)}
            className="inline-flex items-center gap-2 rounded-sm border border-amber-glow/60 bg-amber-glow/10 px-3 py-1.5 font-display text-xs uppercase tracking-[0.2em] text-amber-glow transition-colors hover:bg-amber-glow/20"
          >
            <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.25} />
            {HINTS_UI_TEXT.revealNext}
          </button>
        ) : (
          <span className="font-mono-crt text-[11px] italic text-muted-foreground">
            {HINTS_UI_TEXT.allRevealed}
          </span>
        )}
        {revealed > 1 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 font-mono-crt text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-amber-glow/50 hover:text-amber-glow"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2.25} />
            {HINTS_UI_TEXT.reset}
          </button>
        )}
      </div>
    </div>
  );
}
