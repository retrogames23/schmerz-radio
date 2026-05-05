import { memo } from "react";
import type { Hotspot as HotspotType } from "@/game/types";
import { Hotspot } from "../Hotspot";

interface Props {
  hotspots: HotspotType[];
  reveal: boolean;
  applyOverride: <T extends { id: string; x: number; y: number; w: number; h: number }>(
    key: string,
    box: T,
  ) => T;
}

/**
 * Hotspot-Schicht. Memoisiert: Re-Rendert nur, wenn sich Szene oder
 * Reveal-Flag ändern — nicht bei jedem Caption-/Resize-Tick.
 */
export const HotspotLayer = memo(function HotspotLayer({
  hotspots,
  reveal,
  applyOverride,
}: Props) {
  return (
    <>
      {hotspots.map((rawH) => {
        const h = applyOverride(rawH.id, rawH);
        return <Hotspot key={h.id} hotspot={h} reveal={reveal} />;
      })}
    </>
  );
});
