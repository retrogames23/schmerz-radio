import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/GameContext";
import {
  buildRoundCounters,
  DUEL_UI_TEXT,
  COUNTERS,
  PHRASES,
  getCounter,
  buildTrainingSession,
  buildEndgameSession,
  buildLayardAttackOptions,
  buildOpponentCounterLine,
  buildOpponentBlindspotLine,
  resolveCounters,
  type DuelCounter,
  type DuelMode,
  type DuelRound,
  type LayardAttackOption,
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

type Phase = "round" | "feedback" | "victory" | "defeat";

export function BureaucracyDuelOverlay() {
  const { duelOpen, duelMode, closeDuel, api, learnedParagraphs } = useGame();

  // Layards gelernte Angriffsphrasen — derived aus Flags (kein eigener State).
  const learnedAttackIds = useMemo<ReadonlySet<string>>(() => {
    const s = new Set<string>();
    if (api.hasFlag("learnedAttackVorgesetzten")) s.add("a-vorgesetzten-bodo");
    if (api.hasFlag("learnedAttackTuerschild")) s.add("a-tuerschild-helka");
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelOpen, api]);

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
  // Index der Antwort, die der Spieler gerade gewählt hat – bleibt während
  // der Feedback-Phase markiert, damit sichtbar ist, was korrekt war.
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  // Was nach dem „Weiter“-Klick passieren soll: nächste Runde, Sieg, Niederlage.
  const [pendingNext, setPendingNext] = useState<
    "advance" | "victory" | "defeat" | null
  >(null);
  const [tutorialShown, setTutorialShown] = useState(false);

  // Bei jedem Open: passend zum Modus würfeln + Reset.
  useEffect(() => {
    if (!duelOpen) return;
    setRounds(isEndgame ? buildEndgameSession() : buildTrainingSession());
    setCurrentIdx(0);
    setHits(0);
    setMisses(0);
    setPhase("round");
    setFeedback([]);
    setLearnedThisRound([]);
    setLocked(false);
    setChosenIdx(null);
    setPendingNext(null);
  }, [duelOpen, isEndgame]);

  const round = rounds[currentIdx];

  // Onboarding-Hinweis von Kowalk beim allerersten Trainingsduell-Öffnen.
  useEffect(() => {
    if (!duelOpen || isEndgame) return;
    if (tutorialShown) return;
    if (api.hasFlag("duelTutorialShown")) {
      setTutorialShown(true);
      return;
    }
    setTutorialShown(true);
    api.setFlag("duelTutorialShown");
    setFeedback([
      "KOWALK (halblaut): „Worag — dein Phrasenbuch ist noch dünn. Wähl trotzdem etwas aus. Auch ein verlorener Trainingsfall lehrt dich, wie der Ton hier läuft.“",
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelOpen, isEndgame]);

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

  // Endgame: strikt nur echte, vorgegebene Counter (Können statt Glück).
  // Training: dynamisch je nach Wissensstand — Monkey-Island-Logik.
  const counters: DuelCounter[] = useMemo(() => {
    if (!round) return [];
    if (isEndgame) return resolveCounters(round);
    return buildRoundCounters(round, learnedParagraphs);
    // currentIdx + duelOpen damit pro Runde frisch gewürfelt wird.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, isEndgame, currentIdx, duelOpen]);

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
    if (!counter) return;
    setLocked(true);
    setChosenIdx(idx);
    if (counter.correct) {
      const nextHits = hits + 1;
      setHits(nextHits);
      // Eigenen korrekten Konter ggf. ins Notizbuch — nur in Typ-A.
      // In Typ-B ist counterId eine Angriffsphrasen-ID, kein Konter.
      let learnedNow: string | null = null;
      if (round.kind !== "layardAttacks" && !api.hasParagraph(counter.counterId)) {
        api.learnParagraph(counter.counterId);
        learnedNow = counter.counterId;
      }
      const lines = [
        (isEndgame ? "VOSSBECK: " : "BRUST: ") + round.onHit,
        ...(round.kowalkAside && !isEndgame
          ? ["KOWALK (halblaut): " + round.kowalkAside]
          : []),
      ];
      if (learnedNow) {
        const c = COUNTERS[learnedNow];
        if (c) lines.push(DUEL_UI_TEXT.paragraphLearnedToast(c));
      }
      setFeedback(lines);
      const target = isEndgame ? 3 : 2;
      setPendingNext(nextHits >= target ? "victory" : "advance");
      setPhase("feedback");
    } else {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      // Typ-B-Miss: Kowalk-Hinweis-Flag setzen, damit Bodo/Helka als
      // Lehrer für Angriffsphrasen sichtbar werden.
      if (round.kind === "layardAttacks" && !api.hasFlag("kowalkHintedBodoHelka")) {
        api.setFlag("kowalkHintedBodoHelka");
      }
      // Bei Typ-A-Fehlschuss lernt Layard im Training trotzdem den
      // korrekten Konter — Brust nennt ihn ja in der Belehrung.
      let learnedNow: string | null = null;
      if (!isEndgame && round.kind !== "layardAttacks") {
        // Korrekten Konter aus dem Runden-Pool finden — derjenige, dessen
        // `beats`-Liste die Angriffsphrase enthält. Bei Fehlschuss lernt
        // Layard ihn, weil Brust ihn in der Belehrung nennt.
        for (const cid of round.counterOptions) {
          const cand = COUNTERS[cid];
          if (
            cand &&
            cand.beats.includes(round.attackPhraseId) &&
            !api.hasParagraph(cid)
          ) {
            api.learnParagraph(cid);
            learnedNow = cid;
            break;
          }
        }
      }
      const lines = [(isEndgame ? "VOSSBECK: " : "BRUST: ") + round.onMiss];
      if (round.kind === "layardAttacks" && round.kowalkAside && !isEndgame) {
        lines.push("KOWALK (halblaut): " + round.kowalkAside);
      }
      if (learnedNow) {
        const c = COUNTERS[learnedNow];
        if (c) lines.push(DUEL_UI_TEXT.paragraphLearnedToast(c));
      }
      setFeedback(lines);
      setPendingNext(nextMisses >= 3 ? "defeat" : "advance");
      setPhase("feedback");
    }
  }

  function advanceRound() {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= rounds.length) {
      // Sollte nicht passieren bei sauberer Mechanik, aber sicher ist sicher.
      const fresh = isEndgame ? buildEndgameSession() : buildTrainingSession();
      setRounds((prev) => [...prev, ...fresh]);
    }
    setCurrentIdx(nextIdx);
    setFeedback([]);
    setLearnedThisRound([]);
    setLocked(false);
    setChosenIdx(null);
    setPendingNext(null);
    setPhase("round");
  }

  function onContinueAfterFeedback() {
    const next = pendingNext;
    setPendingNext(null);
    if (next === "victory") {
      setPhase("victory");
      setLocked(false);
    } else if (next === "defeat") {
      setPhase("defeat");
      setLocked(false);
    } else {
      advanceRound();
    }
  }

  function onAcceptVictory() {
    if (isEndgame) {
      api.setFlag("duelEndgameWon");
      api.setFlag("gotB3Ration");
      api.addItem({
        id: "b3Ration",
        name: "B3-Ration",
        description:
          "Eine grau-amber lackierte Konservendose, Etikett »B3 — KOMPENSATIONSRATION«. Vossbeck hat sie freigegeben — Phrase um Phrase, Floskel um Floskel. Es war fast schön anzusehen.",
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
              "„Wenn Sie meinen, einen echten Vorgang führen zu können — kommen Sie zu mir. Tür 3603. Vor neunzehn Uhr. Nach neunzehn Uhr bin ich auch dort, aber dann ist es offiziell nicht mehr ich.“",
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
      // Drei Versuche bei Vossbeck. Erst beim dritten verlorenen Versuch
      // wird der Vorgang endgültig geschlossen (`duelLost`) — dann kommt
      // Kowalk mit dem Notausgang. Vorher: pedantisch-höfliche Vertagung.
      const a1 = api.hasFlag("vossbeckAttempt1Lost");
      const a2 = api.hasFlag("vossbeckAttempt2Lost");
      const attemptNumber = a2 ? 3 : a1 ? 2 : 1;
      closeDuel();
      if (attemptNumber === 1) {
        api.setFlag("vossbeckAttempt1Lost");
        setTimeout(
          () =>
            api.showText([
              "Vossbeck schlägt die Akte zu, ohne aufzusehen.",
              "„Bewohner Worag. Vorgang Vollmacht 4317 — heute nicht.“",
              "„Aktenlage unverändert. Sie kommen wieder, wenn Sie soweit sind.“",
              "Brust steht hinter ihm. Sehr gerade. Sagt nichts.",
              "[ Erster Versuch verloren. Sie können noch zweimal antreten. ]",
            ]),
          60,
        );
      } else if (attemptNumber === 2) {
        api.setFlag("vossbeckAttempt2Lost");
        setTimeout(
          () =>
            api.showText([
              "Vossbeck legt den Bleistift parallel zum Aktendeckel.",
              "„Bewohner Worag. Zweite Anhörung in dieser Sache.“",
              "„Wenn Sie ein drittes Mal antreten, ist es das letzte Mal. So oder so.“",
              "[ Zweiter Versuch verloren. Ein Versuch bleibt. ]",
            ]),
          60,
        );
      } else {
        // Dritter und letzter Versuch — der Vorgang ist verloren.
        api.setFlag("duelEndgameLost");
        setTimeout(() => api.showText(DUEL_UI_TEXT.endgameDefeatLines), 60);
      }
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
      <div className="relative w-full max-w-4xl rounded-sm border-2 border-amber-glow/60 bg-[#1f1505] p-6 text-amber-glow shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
        <CloseButton
          onClick={onAbort}
          tone="amber"
          label="Duell abbrechen"
          className="absolute right-2 top-2"
        />
        <div className="font-display text-sm uppercase tracking-[0.3em] text-amber-glow/70">
          {title}
        </div>
        <p className="mt-2 font-mono-crt text-sm leading-relaxed text-amber-glow/80">
          {subtitle}
        </p>

        {/* Status-Leiste */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono-crt text-[13px] uppercase tracking-widest text-amber-glow/70">
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
        <div className="mt-4 rounded-sm border border-amber-glow/20 bg-black/30 px-3 py-2 font-mono-crt text-sm italic text-amber-glow/70">
          {phase === "round" || phase === "feedback"
            ? moodTextMap[moodKey]
            : phase === "victory"
              ? moodTextMap.crumbling
              : moodTextMap.triumphant}
        </div>

        {(phase === "round" || phase === "feedback") && (
          <>
            {/* Eröffnung */}
            <div className="mt-3 rounded-sm border-l-2 border-amber-glow/60 bg-black/30 px-3 py-2 font-mono-crt text-base leading-relaxed">
              <div className="mb-1 text-[10px] uppercase tracking-widest text-amber-glow/50">
                {opponentLabel}
              </div>
              {round.opening}
            </div>

            {/* Lern-Hinweis: gerade neu gelernte Paragraphen */}
            {learnedThisRound.length > 0 && (
              <div className="mt-2 rounded-sm border border-amber-glow/30 bg-amber-glow/10 px-3 py-1 font-mono-crt text-[13px] text-amber-glow/90">
                📓 Notiert:{" "}
                {learnedThisRound
                  .map((id) => COUNTERS[id]?.shortLabel ?? id)
                  .join(" · ")}
              </div>
            )}

            {/* Antwortwahl */}
            <div className="mt-3">
              <div className="font-mono-crt text-[13px] uppercase tracking-widest text-amber-glow/60">
                {DUEL_UI_TEXT.prompt}
              </div>
              <div className="mt-2 grid gap-2">
                {counters.map((c, i) => {
                  const counterMeta = getCounter(c.counterId);
                  const reveal = phase === "feedback";
                  const isChosen = chosenIdx === i;
                  const isCorrect = c.correct;
                  let stateClasses =
                    "border-amber-glow/30 bg-black/40 text-amber-glow/90 hover:border-amber-glow hover:bg-amber-glow/10";
                  if (reveal) {
                    if (isCorrect) {
                      stateClasses =
                        "border-emerald-400/70 bg-emerald-400/15 text-emerald-100";
                    } else if (isChosen) {
                      stateClasses =
                        "border-red-400/70 bg-red-500/15 text-red-100";
                    } else {
                      stateClasses =
                        "border-amber-glow/15 bg-black/30 text-amber-glow/40";
                    }
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={locked || phase === "feedback"}
                      onClick={() => onChoose(i)}
                      title={counterMeta?.shortLabel}
                      className={`group w-full rounded-sm border px-3 py-2 text-left font-mono-crt text-base leading-snug transition disabled:cursor-not-allowed ${stateClasses}`}
                    >
                      <div className="leading-snug">
                        {reveal && isCorrect && "✓ "}
                        {reveal && isChosen && !isCorrect && "✗ "}
                        {c.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {feedback.length > 0 && (
              <div className="mt-3 space-y-1 rounded-sm border border-amber-glow/20 bg-black/40 px-3 py-2 font-mono-crt text-sm leading-relaxed text-amber-glow/90">
                {feedback.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onAbort}
                className="rounded-sm border border-amber-glow/40 bg-black/20 px-3 py-1 font-mono-crt text-[13px] uppercase tracking-widest text-amber-glow/70 hover:border-amber-glow hover:text-amber-glow"
              >
                {DUEL_UI_TEXT.abortLabel}
              </button>
              {phase === "feedback" && (
                <button
                  type="button"
                  onClick={onContinueAfterFeedback}
                  className="rounded-sm border border-amber-glow/60 bg-amber-glow/15 px-4 py-1.5 font-display text-[11px] uppercase tracking-widest text-amber-glow hover:bg-amber-glow/25"
                  autoFocus
                >
                  Weiter ▸
                </button>
              )}
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