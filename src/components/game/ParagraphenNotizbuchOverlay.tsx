import { useMemo } from "react";
import { useGame } from "@/game/GameContext";
import { PARAGRAPHS } from "@/game/bureaucracyDuel";
import { CloseButton } from "./CloseButton";

/**
 * Paragraphen-Notizbuch (Akt I, Bürokratie-Duell).
 *
 * Ein einfaches Lese-Overlay: listet alle Paragraphen, die Layard im
 * Bürokratie-Duell gelernt hat. Quereinstieg ins Inventar-Item öffnet
 * dieses Overlay.
 */
export function ParagraphenNotizbuchOverlay() {
  const { notizbuchOpen, closeNotizbuch, learnedParagraphs } = useGame();

  // Sortierte Anzeige in Korpus-Reihenfolge, gefiltert auf gelernte.
  // useMemo, damit sich die Liste nicht bei jedem Caption-/Game-State-Tick
  // neu aufbaut, sondern nur bei tatsächlicher Änderung der gelernten Set.
  const ordered = useMemo(
    () =>
      Object.values(PARAGRAPHS).filter((p) => learnedParagraphs.has(p.id)),
    [learnedParagraphs],
  );

  if (!notizbuchOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-4"
      role="dialog"
      aria-label="Paragraphen-Notizbuch"
    >
      <div className="relative w-full max-w-2xl rounded-sm border-2 border-amber-glow/60 bg-[#1f1505] p-5 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={closeNotizbuch}
          tone="amber"
          label="Notizbuch schließen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/70">
          Paragraphen-Notizbuch
        </div>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-amber-glow/80">
          Layards handgeschriebene Sammlung: jede Klausel, jeder Aushang, jede
          Übersagung — nummeriert, datiert, mit Konter-Hinweis am Rand. Was
          hier nicht steht, kann er im Duell nicht zitieren.
        </p>

        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {ordered.length === 0 && (
            <div className="rounded-sm border border-amber-glow/20 bg-black/30 px-3 py-4 font-mono-crt text-sm italic text-amber-glow/60">
              Noch leer. Layard hat noch keinen Paragraphen gelernt. Im
              Bürokratie-Duell an Brusts Tresen werden die ersten Einträge
              entstehen.
            </div>
          )}
          {ordered.map((p) => {
            const counters = p.beatenBy
              .map((id) => PARAGRAPHS[id]?.shortLabel)
              .filter(Boolean);
            return (
              <div
                key={p.id}
                className="rounded-sm border border-amber-glow/30 bg-black/30 px-3 py-2 font-mono-crt text-[12px] leading-relaxed"
              >
                <div className="font-display text-sm uppercase tracking-wider text-amber-glow">
                  {p.shortLabel}
                </div>
                <div className="mt-1 text-amber-glow/85">{p.fullText}</div>
                {p.learnHint && (
                  <div className="mt-1 italic text-amber-glow/60">
                    Notiz am Rand: {p.learnHint}
                  </div>
                )}
                {counters.length > 0 && (
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-amber-glow/55">
                    Wird geschlagen von: {counters.join(" · ")}
                  </div>
                )}
                {counters.length === 0 && (
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-amber-glow/55">
                    Letztes Wort — kein bekannter Konter.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}