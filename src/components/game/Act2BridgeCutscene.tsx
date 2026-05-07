import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import {
  ACT2_BRIDGE_BEATS,
  ACT2_BRIDGE_MIRA_BEATS,
  ACT2_BRIDGE_UI_TEXT,
  type Act2BridgeBeat,
} from "@/game/cutscenes";
import { getHintsUsedCount, HINTS_UI_TEXT } from "@/game/hints";
import {
  computeMiraEndState,
  persistMiraEndState,
} from "@/game/miraState";

/**
 * Schmale Bridge-Cutscene für den Akt-II-Einstieg.
 *
 * Bewusst schlicht gehalten: schwarze Tafeln mit Untertiteln im Stil des
 * Endings, dazu ein dezenter Style-Wechsel (amber/clinical) je Beat. Keine
 * neuen Bild-Assets nötig — kommende Loops können einzelne Beats mit
 * echten Hintergrundbildern hinterlegen.
 *
 * Setzt am Ende:
 *   - StoryFlag `act2BridgeSeen`
 *   - StoryFlag `radioOnPause`  (weiche Resonanz-Pause)
 * und springt Layard zurück in seine Wohnung.
 */
export function Act2BridgeCutscene() {
  const { cutscene, endCutscene, api } = useGame();
  const active = cutscene === "act2Bridge";

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);
  // Mira-State wird beim Start der Bridge einmal berechnet und persistiert,
  // damit Akt II danach nur noch ein einziges Flag lesen muss.
  const [beats, setBeats] = useState<readonly Act2BridgeBeat[]>(ACT2_BRIDGE_BEATS);
  // Snapshot der Tipp-Nutzung beim Start der Bridge — soll während der
  // Cutscene nicht mehr ändern (der Spieler kann hier nichts mehr lesen).
  const [hintsUsed, setHintsUsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    setHintsUsed(getHintsUsedCount());
    const state = computeMiraEndState(api);
    persistMiraEndState(api, state);
    // Spiegel-Beat passend zum State direkt vor dem Okwu-Sprechzimmer
    // einfügen (Index 7 = "E71 · Sprechzimmer 1532 · später").
    const mirror = ACT2_BRIDGE_MIRA_BEATS[state];
    const composed: Act2BridgeBeat[] = [
      ...ACT2_BRIDGE_BEATS.slice(0, 7),
      mirror,
      ...ACT2_BRIDGE_BEATS.slice(7),
    ];
    setBeats(composed);
  }, [active, api]);

  // Reset, sobald die Cutscene wieder geschlossen wird.
  useEffect(() => {
    if (active) return;
    setIdx(0);
    setVisible(true);
    finishedRef.current = false;
  }, [active]);

  // Auto-Advance pro Beat: 3.4s Sockel + 1.6s pro Zeile.
  useEffect(() => {
    if (!active) return;
    if (idx >= beats.length) return;
    const beat = beats[idx];
    const hold = 3400 + beat.lines.length * 1600;
    const t = window.setTimeout(() => {
      // Kurzer Crossfade zwischen den Tafeln.
      setVisible(false);
      const t2 = window.setTimeout(() => {
        setIdx((i) => i + 1);
        setVisible(true);
      }, 350);
      // Cleanup-Innenstop wird vom äußeren Cleanup mit erfasst, da idx-Update
      // den Effekt neu aufsetzt.
      return () => window.clearTimeout(t2);
    }, hold);
    return () => window.clearTimeout(t);
  }, [active, idx, beats]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (!api.hasFlag("act2BridgeSeen")) api.setFlag("act2BridgeSeen");
    if (!api.hasFlag("radioOnPause")) api.setFlag("radioOnPause");
    if (!api.hasFlag("act2Started")) api.setFlag("act2Started");
    endCutscene();
    api.goTo("apartment");
  };

  // Wenn alle Beats durch sind, beenden.
  useEffect(() => {
    if (!active) return;
    if (idx < beats.length) return;
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, idx, beats]);

  // Esc / Enter überspringen die Cutscene.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;
  if (idx >= beats.length) return null;

  const beat = beats[idx];
  const isLastBeat = idx === beats.length - 1;

  // Sehr dezenter Style-Wechsel: schwarz + leichter Farbschimmer am Rand.
  const accentClass =
    beat.style === "amber"
      ? "before:bg-amber-glow/[0.04]"
      : beat.style === "clinical"
        ? "before:bg-foreground/[0.03]"
        : "before:bg-transparent";

  return (
    <div
      className={`absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black px-6 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] ${accentClass}`}
      onClick={finish}
      role="presentation"
    >
      {visible && (
        <div key={idx} className="slow-fade-in mx-auto max-w-2xl space-y-4">
          {beat.header && (
            <div className="mb-6 font-mono-crt text-xs uppercase tracking-[0.4em] text-amber-glow/70 amber-glow">
              {beat.header}
            </div>
          )}
          {beat.lines.map((line, i) => (
            <p
              key={i}
              className="font-display text-lg text-foreground sm:text-xl"
            >
              {line}
            </p>
          ))}
        </div>
      )}
      <div className="absolute bottom-6 left-0 right-0 text-center font-mono-crt text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
        {isLastBeat ? (
          <>
            <div className="mb-2 text-amber-glow/70">
              {HINTS_UI_TEXT.hintsUsedSummary(hintsUsed)}
            </div>
            {ACT2_BRIDGE_UI_TEXT.skipHint}
          </>
        ) : (
          ACT2_BRIDGE_UI_TEXT.skipHint
        )}
      </div>
    </div>
  );
}