import { memo } from "react";
import type { SceneDecal, StoryFlag } from "@/game/types";

interface Props {
  decals: SceneDecal[] | undefined;
  flags: Set<StoryFlag>;
  applyOverride: <T extends { id: string; x: number; y: number; w: number; h: number }>(
    key: string,
    box: T,
  ) => T;
}

const LED_TICKER_TEXT =
  "+++ KONBINI E67 · TYP K-4 +++ ABENDVERKAUF RUHT 19:00–06:00 +++ AUSGABE NUR MIT BERECHTIGUNGSSCHEIN S/D ODER DRINGLICHKEITS-BEZUGSSCHEIN DER LEITSTELLE +++ VERSORGUNGSRAT SEKTOR 28: RUHEZEITEN BEACHTEN +++ MISCHGEMÜSE II WIEDER LIEFERBAR +++ LINIE 28 VERKEHRT NACH SONDERFAHRPLAN +++ RESONANZ-HYGIENE IST GEMEINSCHAFTSAUFGABE +++ いらっしゃいませ +++ ";

/**
 * Statische „Wandgeräte" / Aufkleber. Eigene memoisierte Schicht, weil
 * sich die Decals einer Szene praktisch nie ändern, der Parent aber
 * häufig re-rendert (Caption, Resize, Reveal-Toggle).
 */
export const DecalLayer = memo(function DecalLayer({
  decals,
  flags,
  applyOverride,
}: Props) {
  if (!decals?.length) return null;
  return (
    <>
      {decals.map((rawD) => {
        const d = applyOverride(`decal:${rawD.id}`, rawD);
        if (d.requires?.some((f) => !flags.has(f))) return null;
        if (d.hiddenWhen?.some((f) => flags.has(f))) return null;
        if (d.kind === "ledTicker") {
          const tickerText = d.tickerText ?? LED_TICKER_TEXT;
          return (
            <div
              key={d.id}
              className="led-ticker pointer-events-none absolute z-10 select-none"
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%`, transform: d.skewY ? `skewY(${d.skewY}deg)` : undefined }}
              aria-hidden
            >
              <div className="led-ticker-track">
                <span>{tickerText}</span>
                <span>{tickerText}</span>
              </div>
            </div>
          );
        }
        if (d.kind !== "television") return null;
        return (
          <div
            key={d.id}
            className="pointer-events-none absolute z-10 select-none"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.w}%`,
              height: `${d.h}%`,
            }}
            aria-hidden
          >
            <div className="relative h-full w-full rounded-sm border-2 border-zinc-800 bg-zinc-900 shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-[10%] overflow-hidden rounded-[1px] border border-black/60 bg-black">
                <div className="tv-decal-screen h-full w-full" />
                <div className="pointer-events-none absolute inset-0 tv-decal-scan" />
              </div>
              <div className="absolute bottom-[3%] right-[6%] h-[8%] w-[5%] rounded-full bg-red-500/80 shadow-[0_0_4px_rgba(255,0,0,0.8)]" />
            </div>
          </div>
        );
      })}
    </>
  );
});
