import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/GameContext";
import {
  DUEL_UI_TEXT,
  PARAGRAPHS,
  pickEndgameRounds,
  pickTrainingRounds,
  resolveCounters,
  type DuelCounter,
  type DuelMode,
  type DuelRound,
} from "@/game/bureaucracyDuel";
import { CloseButton } from "./CloseButton";

/**
 * Bürokratie-Duell — Mehrstufiges Lernsystem.
 *
 * Trainingsmodus (Brust): Layard übt fiktive Kantinenfälle. Jede Runde
 * lehrt ihn neue Paragraphen ins Notizbuch. Sieg = Streak +1.
 * Endgame-Modus (Vossbeck): Drei Pflicht-Runden gegen den Bürokratiemeister
 * um die Vollmacht 4317. Sieg = B3-Ration freigegeben.
 */

type Phase = "round" | "victory" | "defeat";

export function BureaucracyDuelOverlay() {
  const { duelOpen, duelMode, closeDuel, api } = useGame();

  const mode: DuelMode = duelMode ?? "training";
  const isEndgame = mode === "endgame";

  const [rounds, setRounds] = useState<DuelRound[]>(() => []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [phase, setPhase] = useState<Phase>("round");
  const [feedback, setFeedback] = useState<string[]>([]);
  const [learnedThisRound, setLearnedThisRound] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  // Bei jedem Open: passend zum Modus würfeln + Reset.
  useEffect(() => {
    if (!duelOpen) return;
    setRounds(isEndgame ? pickEndgameRounds() : pickTrainingRounds(3));
    setCurrentIdx(0);
    setHits(0);
    setMisses(0);
    setPhase("round");
    setFeedback([]);
    setLearnedThisRound([]);
    setLocked(false);
  }, [duelOpen, isEndgame]);

  const round = rounds[currentIdx];

  // Im Trainingsmodus lernt Layard den Angriffs-Paragraphen einer Runde
  // automatisch, sobald die Runde startet (Brust nennt ihn vor).
  useEffect(() => {
    if (!duelOpen || !round || isEndgame) return;
    const attackId = round.attackParagraphId;
    if (!api.hasParagraph(attackId)) {
      api.learnParagraph(attackId);
      setLearnedThisRound((prev) =>
        prev.includes(attackId) ? prev : [...prev, attackId],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelOpen, currentIdx, isEndgame]);

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

  const moodKey = useMemo<keyof typeof DUEL_UI_TEXT.brustMood>(() => {
    if (misses >= 2) return "crumbling";
    if (misses === 1 || hits >= 1) return "sweating";
    return "composed";
  }, [hits, misses]);

  const counters: DuelCounter[] = useMemo(
    () => (round ? resolveCounters(round) : []),
    [round],
  );

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
    const counter = counters[idx];
    // Wenn der Spieler einen Paragraphen wählt, den er nicht im Notizbuch
    // hat, geht das nicht — der Button ist eigentlich disabled, aber
    // sicherheitshalber nochmal hier.
    if (!api.hasParagraph(counter.paragraphId)) return;
    setLocked(true);
    if (counter.correct) {
      const nextHits = hits + 1;
      setHits(nextHits);
      const lines = [
        (isEndgame ? "VOSSBECK: " : "BRUST: ") + round.onHit,
        ...(round.kowalkAside && !isEndgame
          ? ["KOWALK (halblaut): " + round.kowalkAside]
          : []),
      ];
      setFeedback(lines);
      window.setTimeout(() => {
        const target = isEndgame ? 3 : 2;
        if (nextHits >= target) {
          setPhase("victory");
          setLocked(false);
        } else {
          advanceRound();
        }
      }, 1800);
    } else {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      // Bei Fehlschuss lernt Layard im Training trotzdem den korrekten
      // Konter — Brust nennt ihn ja in der Belehrung.
      let learnedNow: string | null = null;
      if (!isEndgame) {
        for (const c of counters) {
          if (c.correct && !api.hasParagraph(c.paragraphId)) {
            api.learnParagraph(c.paragraphId);
            learnedNow = c.paragraphId;
            break;
          }
        }
      }
      const lines = [(isEndgame ? "VOSSBECK: " : "BRUST: ") + round.onMiss];
      if (learnedNow) {
        const p = PARAGRAPHS[learnedNow];
        if (p) lines.push(DUEL_UI_TEXT.paragraphLearnedToast(p));
      }
      setFeedback(lines);
      window.setTimeout(() => {
        if (nextMisses >= 3) {
          setPhase("defeat");
          setLocked(false);
        } else {
          advanceRound();
        }
      }, 2200);
    }
  }

  function advanceRound() {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= rounds.length) {
      // Sollte nicht passieren bei sauberer Mechanik, aber sicher ist sicher.
      const fresh = isEndgame ? pickEndgameRounds() : pickTrainingRounds(3);
      setRounds((prev) => [...prev, ...fresh]);
    }
    setCurrentIdx(nextIdx);
    setFeedback([]);
    setLearnedThisRound([]);
    setLocked(false);
  }

  function onAcceptVictory() {
    if (isEndgame) {
      api.setFlag("duelEndgameWon");
      api.setFlag("gotB3Ration");
      api.addItem({
        id: "b3Ration",
        name: "B3-Ration",
        description:
          "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Vossbeck hat sie freigegeben — Argument für Argument, Paragraph für Paragraph. Es war fast schön anzusehen.",
      });
      closeDuel();
      setTimeout(() => {
        api.showText(DUEL_UI_TEXT.endgameVictoryLines);
      }, 60);
    } else {
      // Trainingssieg → Streak hochzählen + entsprechenden Flag setzen
      const next = api.bumpBrustWinStreak();
      api.setFlag("duelWon");
      if (next >= 1) api.setFlag("duelTrainingWon1");
      if (next >= 2) api.setFlag("duelTrainingWon2");
      if (next >= 3) {
        api.setFlag("duelTrainingWon3");
        api.setFlag("vossbeckSummoned");
      }
      const summonLine =
        next >= 3
          ? [
              "Brust legt langsam den Stift ab.",
              "„Drei in Folge, Bewohner Worg. Das ist … selten.“",
              "Aus dem Hintergrund tritt eine Gestalt mit grauem Aktendeckel:",
              "„Oberinspektor Vossbeck. Bewohnervertretung E67, Bürokratiemeisterschaft.“",
              "„Wenn Sie meinen, einen echten Vorgang führen zu können — kommen Sie zu mir.“",
            ]
          : DUEL_UI_TEXT.trainingVictoryLines;
      closeDuel();
      setTimeout(() => {
        api.showText(summonLine);
      }, 60);
    }
  }

  function onAcceptDefeat() {
    if (isEndgame) {
      api.setFlag("duelEndgameLost");
      closeDuel();
      setTimeout(() => api.showText(DUEL_UI_TEXT.endgameDefeatLines), 60);
    } else {
      api.setFlag("duelLost");
      api.resetBrustWinStreak();
      closeDuel();
      setTimeout(() => api.showText(DUEL_UI_TEXT.trainingDefeatLines), 60);
    }
  }

  const title = isEndgame ? DUEL_UI_TEXT.endgameTitle : DUEL_UI_TEXT.trainingTitle;
  const subtitle = isEndgame ? DUEL_UI_TEXT.endgameSubtitle : DUEL_UI_TEXT.trainingSubtitle;
  const moodTextMap = isEndgame ? DUEL_UI_TEXT.vossbeckMood : DUEL_UI_TEXT.brustMood;
  const opponentLabel = isEndgame ? "Vossbeck" : "Brust";
  const totalRounds = isEndgame ? 3 : 3;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-4"
      role="dialog"
      aria-label={title}
    >
      <div className="relative w-full max-w-2xl rounded-sm border-2 border-amber-glow/60 bg-[#1f1505] p-5 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={onAbort}
          tone="amber"
          label="Duell abbrechen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-amber-glow/70">
          {title}
        </div>
        <p className="mt-2 font-mono-crt text-xs leading-relaxed text-amber-glow/80">
          {subtitle}
        </p>

        {/* Status-Leiste */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono-crt text-[11px] uppercase tracking-widest text-amber-glow/70">
          <span>
            {DUEL_UI_TEXT.roundLabel} {Math.min(currentIdx + 1, totalRounds)} /{" "}
            {totalRounds}
          </span>
          <span>
            {DUEL_UI_TEXT.hitsLabel}:{" "}
            <span className="text-amber-glow">{renderDots(hits, isEndgame ? 3 : 2)}</span>
          </span>
          <span>
            {DUEL_UI_TEXT.missesLabel}:{" "}
            <span className="text-amber-glow">{renderDots(misses, 3)}</span>
          </span>
          {!isEndgame && (
            <span>
              Streak: <span className="text-amber-glow">{api.getBrustWinStreak()}</span> / 3
            </span>
          )}
        </div>

        {/* Mimik */}
        <div className="mt-4 rounded-sm border border-amber-glow/20 bg-black/30 px-3 py-2 font-mono-crt text-[12px] italic text-amber-glow/70">
          {phase === "round"
            ? moodTextMap[moodKey]
            : phase === "victory"
              ? moodTextMap.crumbling
              : moodTextMap.triumphant}
        </div>

        {phase === "round" && (
          <>
            {/* Eröffnung */}
            <div className="mt-3 rounded-sm border-l-2 border-amber-glow/60 bg-black/30 px-3 py-2 font-mono-crt text-sm leading-relaxed">
              <div className="mb-1 text-[10px] uppercase tracking-widest text-amber-glow/50">
                {opponentLabel}
              </div>
              {round.opening}
            </div>

            {/* Lern-Hinweis: gerade neu gelernte Paragraphen */}
            {learnedThisRound.length > 0 && (
              <div className="mt-2 rounded-sm border border-amber-glow/30 bg-amber-glow/10 px-3 py-1 font-mono-crt text-[11px] text-amber-glow/90">
                📓 Notiert:{" "}
                {learnedThisRound
                  .map((id) => PARAGRAPHS[id]?.shortLabel ?? id)
                  .join(" · ")}
              </div>
            )}

            {/* Antwortwahl */}
            <div className="mt-3">
              <div className="font-mono-crt text-[11px] uppercase tracking-widest text-amber-glow/60">
                {DUEL_UI_TEXT.prompt}
              </div>
              <div className="mt-2 grid gap-2">
                {counters.map((c, i) => {
                  const known = api.hasParagraph(c.paragraphId);
                  const para = PARAGRAPHS[c.paragraphId];
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={locked || !known}
                      onClick={() => onChoose(i)}
                      title={
                        !known ? DUEL_UI_TEXT.unlearnedHint : para?.shortLabel
                      }
                      className="group w-full rounded-sm border border-amber-glow/30 bg-black/40 px-3 py-2 text-left font-mono-crt text-sm leading-snug text-amber-glow/90 transition hover:border-amber-glow hover:bg-amber-glow/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span>{c.text}</span>
                        <span className="shrink-0 font-mono-crt text-[10px] uppercase tracking-wider opacity-80">
                          {known
                            ? DUEL_UI_TEXT.learnedBadge
                            : DUEL_UI_TEXT.unlearnedBadge}
                        </span>
                      </div>
                      {para && (
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-amber-glow/50">
                          {para.shortLabel}
                        </div>
                      )}
                    </button>
                  );
                })}
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
              {isEndgame
                ? DUEL_UI_TEXT.endgameVictoryHeadline
                : DUEL_UI_TEXT.trainingVictoryHeadline}
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
              {isEndgame
                ? DUEL_UI_TEXT.endgameDefeatHeadline
                : DUEL_UI_TEXT.trainingDefeatHeadline}
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

function renderDots(n: number, total: number): string {
  const filled = "●".repeat(Math.min(total, Math.max(0, n)));
  const empty = "○".repeat(Math.max(0, total - filled.length));
  return filled + empty;
}