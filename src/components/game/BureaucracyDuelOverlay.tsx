import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/GameContext";
import {
  DUEL_UI_TEXT,
  pickDuelRounds,
  type DuelRound,
} from "@/game/bureaucracyDuel";
import { CloseButton } from "./CloseButton";

/**
 * Bürokratie-Duell (Akt I, Brust-Tresen). Drei Runden Verwaltungs-Floskeln
 * im Monkey-Island-Schwertkampf-Stil: Brust eröffnet mit einem Paragraphen,
 * Layard wählt aus vier Antworten die richtige Konter-Floskel. Drei Treffer
 * → B3-Ration. Drei Fehler → höflicher Rauswurf, neuer Versuch nach Cooldown.
 */

type Phase = "round" | "victory" | "defeat";

export function BureaucracyDuelOverlay() {
  const { duelOpen, closeDuel, api } = useGame();

  // Runden werden EINMAL pro Duell-Sitzung gezogen. Beim Schließen
  // (egal ob Sieg/Niederlage/Abbruch) zurückgesetzt, damit der nächste
  // Versuch frische Runden bekommt.
  const [rounds, setRounds] = useState<DuelRound[]>(() => []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [phase, setPhase] = useState<Phase>("round");
  // Letztes Feedback (Brust/Kowalk-Zeile), das unter den Buttons erscheint.
  const [feedback, setFeedback] = useState<string[]>([]);
  // Lock, während Feedback gezeigt wird, damit man nicht doppelt klickt.
  const [locked, setLocked] = useState(false);

  // Bei jedem Open: neu würfeln + Reset.
  useEffect(() => {
    if (!duelOpen) return;
    setRounds(pickDuelRounds());
    setCurrentIdx(0);
    setHits(0);
    setMisses(0);
    setPhase("round");
    setFeedback([]);
    setLocked(false);
  }, [duelOpen]);

  // ESC → Abbruch (zählt nicht als Niederlage).
  useEffect(() => {
    if (!duelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onAbort();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelOpen]);

  const round = rounds[currentIdx];

  const moodKey = useMemo<keyof typeof DUEL_UI_TEXT.brustMood>(() => {
    if (misses >= 2) return "crumbling";
    if (misses === 1) return "sweating";
    if (hits >= 1) return "sweating";
    return "composed";
  }, [hits, misses]);

  if (!duelOpen) return null;
  if (!round) return null;

  function onAbort() {
    closeDuel();
    setTimeout(() => {
      api.showText(DUEL_UI_TEXT.abortLines);
    }, 60);
  }

  function onChoose(idx: number) {
    if (locked || phase !== "round") return;
    const counter = round.counters[idx];
    setLocked(true);
    if (counter.correct) {
      const nextHits = hits + 1;
      setHits(nextHits);
      const lines = [
        "BRUST: " + round.brustOnHit,
        ...(round.kowalkAside ? ["KOWALK (halblaut): " + round.kowalkAside] : []),
      ];
      setFeedback(lines);
      window.setTimeout(() => {
        if (nextHits >= 3) {
          setPhase("victory");
          setLocked(false);
        } else {
          advanceRound();
        }
      }, 1800);
    } else {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      setFeedback(["BRUST: " + round.brustOnMiss]);
      window.setTimeout(() => {
        if (nextMisses >= 3) {
          setPhase("defeat");
          setLocked(false);
        } else {
          advanceRound();
        }
      }, 1800);
    }
  }

  function advanceRound() {
    const nextIdx = currentIdx + 1;
    // Wenn die gepickten Runden ausgehen, ziehen wir nach (sehr selten,
    // braucht's nur, wenn der Spieler 6+ Runden ohne Sieg/Niederlage spielt).
    if (nextIdx >= rounds.length) {
      const fresh = pickDuelRounds();
      setRounds((prev) => [...prev, ...fresh]);
    }
    setCurrentIdx(nextIdx);
    setFeedback([]);
    setLocked(false);
  }

  function onAcceptVictory() {
    api.setFlag("duelWon");
    api.setFlag("gotB3Ration");
    api.addItem({
      id: "b3Ration",
      name: "B3-Ration",
      description:
        "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Brust hat sie ausgegeben — nicht weil er wollte, sondern weil sein eigenes Regelwerk ihn dazu zwang. Argument für Argument. Es war fast schön anzusehen.",
    });
    closeDuel();
    setTimeout(() => {
      api.showText(DUEL_UI_TEXT.victoryLines);
    }, 60);
  }

  function onAcceptDefeat() {
    api.setFlag("duelLost");
    closeDuel();
    setTimeout(() => {
      api.showText(DUEL_UI_TEXT.defeatLines);
    }, 60);
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-4"
      role="dialog"
      aria-label={DUEL_UI_TEXT.overlayTitle}
    >
      <div className="relative w-full max-w-2xl rounded-sm border-2 border-amber-glow/60 bg-[#1f1505] p-5 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={onAbort}
          tone="amber"
          label="Duell abbrechen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/70">
          {DUEL_UI_TEXT.overlayTitle}
        </div>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-amber-glow/80">
          {DUEL_UI_TEXT.overlaySubtitle}
        </p>

        {/* Status-Leiste */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono-crt text-[11px] uppercase tracking-widest text-amber-glow/70">
          <span>
            {DUEL_UI_TEXT.roundLabel} {Math.min(currentIdx + 1, 3)} / 3
          </span>
          <span>
            {DUEL_UI_TEXT.hitsLabel}:{" "}
            <span className="text-amber-glow">{renderDots(hits)}</span>
          </span>
          <span>
            {DUEL_UI_TEXT.missesLabel}:{" "}
            <span className="text-amber-glow">{renderDots(misses)}</span>
          </span>
        </div>

        {/* Brust-Mimik */}
        <div className="mt-4 rounded-sm border border-amber-glow/20 bg-black/30 px-3 py-2 font-mono-crt text-[12px] italic text-amber-glow/70">
          {phase === "round"
            ? DUEL_UI_TEXT.brustMood[moodKey]
            : phase === "victory"
              ? DUEL_UI_TEXT.brustMood.crumbling
              : DUEL_UI_TEXT.brustMood.triumphant}
        </div>

        {phase === "round" && (
          <>
            {/* Brust-Eröffnung */}
            <div className="mt-3 rounded-sm border-l-2 border-amber-glow/60 bg-black/30 px-3 py-2 font-mono-crt text-sm leading-relaxed">
              <div className="mb-1 text-[10px] uppercase tracking-widest text-amber-glow/50">
                Brust
              </div>
              {round.brustOpening}
            </div>

            {/* Antwortwahl */}
            <div className="mt-3">
              <div className="font-mono-crt text-[11px] uppercase tracking-widest text-amber-glow/60">
                {DUEL_UI_TEXT.prompt}
              </div>
              <div className="mt-2 grid gap-2">
                {round.counters.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={locked}
                    onClick={() => onChoose(i)}
                    className="w-full rounded-sm border border-amber-glow/30 bg-black/40 px-3 py-2 text-left font-mono-crt text-sm leading-snug text-amber-glow/90 transition hover:border-amber-glow hover:bg-amber-glow/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            </div>

            {feedback.length > 0 && (
              <div className="mt-3 space-y-1 rounded-sm border border-amber-glow/20 bg-black/40 px-3 py-2 font-mono-crt text-[12px] leading-relaxed text-amber-glow/90">
                {feedback.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onAbort}
                className="rounded-sm border border-amber-glow/40 bg-black/20 px-3 py-1 font-mono-crt text-[11px] uppercase tracking-widest text-amber-glow/70 hover:border-amber-glow hover:text-amber-glow"
              >
                {DUEL_UI_TEXT.abortLabel}
              </button>
            </div>
          </>
        )}

        {phase === "victory" && (
          <div className="mt-4">
            <div className="font-display text-lg font-bold text-amber-glow">
              {DUEL_UI_TEXT.victoryHeadline}
            </div>
            <button
              type="button"
              onClick={onAcceptVictory}
              className="mt-3 w-full rounded-sm border border-amber-glow/60 bg-amber-glow/15 px-3 py-2 font-display uppercase tracking-widest hover:bg-amber-glow/25"
            >
              {DUEL_UI_TEXT.victoryAccept}
            </button>
          </div>
        )}

        {phase === "defeat" && (
          <div className="mt-4">
            <div className="font-display text-lg font-bold text-amber-glow">
              {DUEL_UI_TEXT.defeatHeadline}
            </div>
            <button
              type="button"
              onClick={onAcceptDefeat}
              className="mt-3 w-full rounded-sm border border-amber-glow/60 bg-amber-glow/15 px-3 py-2 font-display uppercase tracking-widest hover:bg-amber-glow/25"
            >
              {DUEL_UI_TEXT.defeatAccept}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Drei Punkte, gefüllt nach Anzahl. Z. B. 2 → "●●○". */
function renderDots(n: number): string {
  const filled = "●".repeat(Math.min(3, Math.max(0, n)));
  const empty = "○".repeat(3 - filled.length);
  return filled + empty;
}