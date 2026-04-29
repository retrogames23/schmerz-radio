import { useEffect, useRef, useState } from "react";
import {
  HANDBOOK_CHAPTERS,
  HANDBOOK_SUBTITLE,
  HANDBOOK_TITLE,
  type HandbookChapter,
} from "@/game/e67Handbook";
import { CloseButton } from "./CloseButton";
import { useGame } from "@/game/GameContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Buchähnliches Lese-Overlay für das E67-Handbuch.
 *  - Linke Spalte: Inhaltsverzeichnis (Kapitelnavigation).
 *  - Rechte Spalte: scrollbarer Inhalt des aktuellen Kapitels.
 *  - Klick außerhalb oder ESC schließt.
 */
export function HandbookOverlay({ open, onClose }: Props) {
  const [chapterId, setChapterId] = useState<string>(HANDBOOK_CHAPTERS[0].id);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { api } = useGame();
  const noticed = api.hasFlag("noticedTransferCode");
  const hasPencil = api.hasItem("pencilStub");
  const alreadyExtracted = api.hasFlag("extractedAushang71");

  // Beim Öffnen: scrollen wir das Kapitel an den Anfang.
  useEffect(() => {
    if (!open) return;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open, chapterId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const chapter =
    HANDBOOK_CHAPTERS.find((c) => c.id === chapterId) ?? HANDBOOK_CHAPTERS[0];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-3 py-4"
      onClick={onClose}
      role="dialog"
      aria-label="E67-Handbuch"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-sm border-2 border-amber-glow/60 bg-[#f4e8c8] text-[#2a1c0a] shadow-[0_20px_80px_rgba(0,0,0,0.7)]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(120,80,20,0.08) 0%, rgba(120,80,20,0.0) 8%, rgba(120,80,20,0.0) 92%, rgba(120,80,20,0.12) 100%)",
        }}
      >
        <CloseButton
          onClick={onClose}
          tone="amber"
          label="Handbuch schließen"
          className="absolute right-2 top-2"
        />

        {/* Linke Spalte: Inhaltsverzeichnis */}
        <aside className="hidden w-56 shrink-0 flex-col border-r-2 border-[#caa861] bg-[#ead8a8] p-4 sm:flex">
          <div className="font-display text-[10px] uppercase tracking-[0.3em] text-[#6b4a16]">
            Inhalt
          </div>
          <div className="mt-1 font-mono-crt text-[10px] uppercase tracking-widest text-[#8a6a2a]">
            {HANDBOOK_CHAPTERS.length} Kapitel
          </div>
          <nav className="mt-3 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
            {HANDBOOK_CHAPTERS.map((c) => {
              const active = c.id === chapter.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChapterId(c.id)}
                  className={`group flex items-center justify-between rounded-sm border px-2 py-1 text-left font-mono-crt text-xs transition ${
                    active
                      ? "border-[#6b4a16] bg-[#f4e8c8] text-[#2a1c0a] shadow-[inset_0_0_0_1px_rgba(107,74,22,0.4)]"
                      : "border-transparent text-[#5a4015] hover:border-[#caa861] hover:bg-[#f0dfb0]"
                  }`}
                >
                  <span className="truncate">{c.shortTitle}</span>
                  {active && <span aria-hidden>▸</span>}
                </button>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-[#caa861] pt-2 font-mono-crt text-[9px] uppercase tracking-widest text-[#8a6a2a]">
            7. rev. Fassung
          </div>
        </aside>

        {/* Mobile: Kapitel-Dropdown */}
        <div className="absolute left-3 top-2 sm:hidden">
          <select
            value={chapter.id}
            onChange={(e) => setChapterId(e.target.value)}
            className="rounded-sm border border-[#6b4a16] bg-[#f4e8c8] px-2 py-1 font-mono-crt text-xs text-[#2a1c0a]"
            aria-label="Kapitel"
          >
            {HANDBOOK_CHAPTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Rechte Spalte: Inhalt */}
        <div className="flex flex-1 flex-col">
          <header className="border-b-2 border-[#caa861] bg-[#ead8a8] px-6 py-3 pr-12">
            <div className="font-mono-crt text-[10px] uppercase tracking-[0.3em] text-[#8a6a2a]">
              {HANDBOOK_TITLE}
            </div>
            <div className="mt-0.5 font-display text-[10px] italic tracking-wide text-[#7a5a20]">
              {HANDBOOK_SUBTITLE}
            </div>
          </header>

          <div
            ref={scrollRef}
            className="prose-handbook flex-1 overflow-y-auto px-6 py-5 pt-12 sm:pt-5"
          >
            <h1 className="mb-4 font-display text-2xl font-bold leading-tight text-[#2a1c0a]">
              {chapter.title}
            </h1>
            <ChapterBody chapter={chapter} />

            {chapter.id === "p71" && noticed && !alreadyExtracted && (
              <div className="mt-5 rounded-sm border border-[#a87d2a] bg-[#ead8a8]/80 p-3 font-mono-crt text-xs text-[#5a4015]">
                {hasPencil ? (
                  <>
                    <p className="mb-2">
                      Layard fährt mit dem Bleistiftstummel die Tesa-Kanten nach.
                      Der Aushang löst sich in einem Stück ab.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        api.setFlag("extractedAushang71");
                        api.addItem({
                          id: "aushang71Original",
                          name: "Aushang 7.1 (Original)",
                          description:
                            "Das aus dem Handbuch herausgelöste, vergilbte Aushangblatt §7.1 — Verfahren bei Verlegung. Trägt den Trockensiegel-Stempel »BEWOHNERVERTRETUNG E67 / SCHICHT A« in der oberen rechten Ecke. Carbon-Durchschlag, zweite Lage.",
                        });
                        onClose();
                        setTimeout(() => {
                          api.showText([
                            "Layard zieht den Aushang heraus. Auf der Rückseite hat",
                            "irgendwer einmal mit Kuli notiert: »7.1 IST OFFIZIELL.«",
                            "Drei Ausrufezeichen. Nicht durchgestrichen.",
                            "[ Aushang 7.1 (Original) eingesteckt. ]",
                          ]);
                        }, 80);
                      }}
                      className="rounded-sm border border-[#6b4a16] bg-[#f4e8c8] px-3 py-1 text-[#2a1c0a] hover:bg-[#f0dfb0]"
                    >
                      ▸ Aushang 7.1 herauslösen
                    </button>
                  </>
                ) : (
                  <p className="italic">
                    Die Tesa-Streifen halten fest. Mit einem Bleistift oder etwas
                    Ähnlichem ließe sich die Klebekante nachfahren.
                  </p>
                )}
              </div>
            )}

            <Divider />

            <ChapterPager
              chapter={chapter}
              onPick={(id) => setChapterId(id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      className="my-6 h-px w-full"
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(107,74,22,0.5) 0 6px, transparent 6px 12px)",
      }}
    />
  );
}

function ChapterPager({
  chapter,
  onPick,
}: {
  chapter: HandbookChapter;
  onPick: (id: string) => void;
}) {
  const idx = HANDBOOK_CHAPTERS.findIndex((c) => c.id === chapter.id);
  const prev = idx > 0 ? HANDBOOK_CHAPTERS[idx - 1] : null;
  const next =
    idx < HANDBOOK_CHAPTERS.length - 1 ? HANDBOOK_CHAPTERS[idx + 1] : null;
  return (
    <div className="flex items-center justify-between font-mono-crt text-xs text-[#6b4a16]">
      <div>
        {prev ? (
          <button
            type="button"
            onClick={() => onPick(prev.id)}
            className="rounded-sm border border-[#caa861] bg-[#f0dfb0] px-2 py-1 hover:bg-[#e6d196]"
          >
            ◂ {prev.shortTitle}
          </button>
        ) : (
          <span className="opacity-40">— Anfang —</span>
        )}
      </div>
      <div className="opacity-70">
        Seite {idx + 1} / {HANDBOOK_CHAPTERS.length}
      </div>
      <div>
        {next ? (
          <button
            type="button"
            onClick={() => onPick(next.id)}
            className="rounded-sm border border-[#caa861] bg-[#f0dfb0] px-2 py-1 hover:bg-[#e6d196]"
          >
            {next.shortTitle} ▸
          </button>
        ) : (
          <span className="opacity-40">— Ende —</span>
        )}
      </div>
    </div>
  );
}

/* ---------- Mini-Renderer für Body-Zeilen ---------- */

function ChapterBody({ chapter }: { chapter: HandbookChapter }) {
  const blocks = groupBlocks(chapter.body);
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-[#2a1c0a]">
      {blocks.map((b, i) => {
        if (b.kind === "p") {
          return <p key={i}>{renderInline(b.lines.join(" "))}</p>;
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} className="ml-5 list-disc space-y-1">
              {b.lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^- /, ""))}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === "quote") {
          return (
            <div
              key={i}
              className="rounded-sm border-l-4 border-[#a87d2a] bg-[#ead8a8]/70 px-3 py-2 italic text-[#5a4015]"
            >
              {b.lines.map((line, j) => (
                <div key={j}>{renderInline(line.replace(/^> ?/, ""))}</div>
              ))}
            </div>
          );
        }
        if (b.kind === "table") {
          const [header, ...rows] = b.lines.map(parseTableRow);
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#ead8a8] text-left">
                    {header.map((cell, j) => (
                      <th
                        key={j}
                        className="border border-[#caa861] px-2 py-1 font-display text-[12px] uppercase tracking-wide text-[#5a4015]"
                      >
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((cells, ri) => (
                    <tr key={ri} className={ri % 2 ? "bg-[#f0dfb0]/40" : ""}>
                      {cells.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-[#caa861] px-2 py-1 align-top"
                        >
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; lines: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "table"; lines: string[] };

function groupBlocks(lines: string[]): Block[] {
  const out: Block[] = [];
  for (const raw of lines) {
    const line = raw;
    const last = out[out.length - 1];
    if (line.startsWith("- ")) {
      if (last && last.kind === "ul") last.lines.push(line);
      else out.push({ kind: "ul", lines: [line] });
    } else if (line.startsWith("> ")) {
      if (last && last.kind === "quote") last.lines.push(line);
      else out.push({ kind: "quote", lines: [line] });
    } else if (line.startsWith("|")) {
      if (last && last.kind === "table") last.lines.push(line);
      else out.push({ kind: "table", lines: [line] });
    } else {
      out.push({ kind: "p", lines: [line] });
    }
  }
  return out;
}

function parseTableRow(line: string): string[] {
  // line beginnt mit "|", Spalten sind durch "|" getrennt.
  return line
    .replace(/^\|/, "")
    .split("|")
    .map((s) => s.trim());
}

/**
 * Sehr einfacher Inline-Renderer für **fett** und *kursiv*. Erlaubt nur
 * diese beiden Markups, alles andere wird als Plain-Text ausgegeben.
 */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-bold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}