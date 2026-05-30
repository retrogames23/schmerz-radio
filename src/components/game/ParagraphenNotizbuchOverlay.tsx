import { useMemo } from "react";
import { useGame } from "@/game/GameContext";
import { COUNTERS, PHRASES } from "@/game/bureaucracyDuel";
import { CloseButton } from "./CloseButton";

/**
 * Phrasenbuch (Akt I, Bürokratie-Duell).
 *
 * Layards handgeschriebene Sammlung schlagfertiger Konter — jede Zeile
 * ein Spruch, mit Lernhinweis am Rand und einer Liste der Phrasen, die
 * der Konter humorvoll erledigt. Der Datei-/Hook-Name bleibt aus
 * Kompatibilitätsgründen „Paragraphen-…“; der Inhalt ist jetzt das
 * Phrasenbuch.
 */
export function ParagraphenNotizbuchOverlay() {
  const { notizbuchOpen, closeNotizbuch, learnedParagraphs } = useGame();

  const ordered = useMemo(
    () =>
      Object.values(COUNTERS).filter((c) => learnedParagraphs.has(c.id)),
    [learnedParagraphs],
  );

  if (!notizbuchOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-4"
      role="dialog"
      aria-label="Phrasenbuch"
    >
      <div className="relative w-full max-w-2xl rounded-sm border-2 border-amber-glow/60 bg-[#1f1505] p-5 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={closeNotizbuch}
          tone="amber"
          label="Phrasenbuch schließen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/70">
          Phrasenbuch
        </div>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-amber-glow/80">
          Layards handgeschriebene Sammlung schlagfertiger Konter. Was hier
          nicht steht, kann er im Duell nicht aus der Hüfte zitieren.
        </p>

        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {ordered.length === 0 && (
            <div className="rounded-sm border border-amber-glow/20 bg-black/30 px-3 py-4 font-mono-crt text-sm italic text-amber-glow/60">
              Noch leer. Layard hat noch keinen Konter gelernt. Im
              Phrasen-Dreschen an Brusts Tresen entstehen die ersten Einträge.
            </div>
          )}
          {ordered.map((c) => {
            const phrasesHit = c.beats
              .map((id) => PHRASES[id]?.shortLabel)
              .filter(Boolean);
            return (
              <div
                key={c.id}
                className="rounded-sm border border-amber-glow/30 bg-black/30 px-3 py-2 font-mono-crt text-[12px] leading-relaxed"
              >
                <div className="font-display text-sm uppercase tracking-wider text-amber-glow">
                  {c.shortLabel}
                </div>
                <div className="mt-1 text-amber-glow/85">»{c.text}«</div>
                {c.learnHint && (
                  <div className="mt-1 italic text-amber-glow/60">
                    Notiz am Rand: {c.learnHint}
                  </div>
                )}
                {phrasesHit.length > 0 && (
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-amber-glow/55">
                    Schlägt: {phrasesHit.join(" · ")}
                  </div>
                )}
                {phrasesHit.length === 0 && (
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-amber-glow/55">
                    Linkischer Eigenversuch — schlägt keine bekannte Phrase.
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