import { memo } from "react";
import type { NpcSprite } from "@/game/types";
import type { GameApi, StoryFlag } from "@/game/types";

interface Props {
  npcs: NpcSprite[] | undefined;
  flags: Set<StoryFlag>;
  api: GameApi;
  applyOverride: <T extends { id: string; x: number; y: number; w: number; h: number }>(
    key: string,
    box: T,
  ) => T;
}

/**
 * Reine Render-Schicht für NPC-Sprites einer Szene.
 * Memoisiert, damit Eltern-Re-Renders (z. B. Caption-Updates,
 * Resize-Ticks) die Sprite-Liste nicht erneut diffen.
 */
export const NpcLayer = memo(function NpcLayer({
  npcs,
  flags,
  api,
  applyOverride,
}: Props) {
  if (!npcs?.length) return null;
  return (
    <>
      {npcs.map((rawNpc) => {
        const npc = applyOverride(`npc:${rawNpc.id}`, rawNpc);
        if (npc.requires?.some((f) => !flags.has(f))) return null;
        if (npc.hiddenWhen?.some((f) => flags.has(f))) return null;
        if (npc.visible && !npc.visible(api)) return null;
        return (
          <img
            key={npc.id}
            src={npc.src}
            alt={npc.alt}
            fetchPriority="high"
            decoding="async"
            className="pointer-events-none absolute z-10 select-none object-contain"
            style={{
              left: `${npc.x}%`,
              top: `${npc.y}%`,
              width: `${npc.w}%`,
              height: `${npc.h}%`,
              filter:
                "drop-shadow(0 6px 12px rgba(0,0,0,0.55)) contrast(0.95) saturate(0.85)",
            }}
          />
        );
      })}
    </>
  );
});
