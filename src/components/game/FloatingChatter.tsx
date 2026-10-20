import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CHATTER_TOPICS, type ChatterNpcId } from "@/game/dsa/chatter";
import {
  CAFETERIA_CHATTER_TOPICS,
  type CafeteriaNpcId,
} from "../../game/cafeteriaChatter";
import {
  E71_NERDS_CHATTER_TOPICS,
  type E71NerdNpcId,
} from "../../game/e71NerdsChatter";

/**
 * Position einer Sprechblase je NPC, in % der Szene.
 * Punkt zeigt den Mund/Kopf-Anker — die Blase wird darüber positioniert.
 * Werte stimmen mit den Sprite-Positionen in scenes.ts überein.
 */
const DSA_ANCHOR: Record<ChatterNpcId, { x: number; y: number }> = {
  tjark: { x: 70, y: 12 },
  brem: { x: 26, y: 18 },
  yelva: { x: 84, y: 42 },
};

const DSA_LABEL: Record<ChatterNpcId, string> = {
  tjark: "Tjark",
  brem: "Brem",
  yelva: "Yelva",
};

const CAFETERIA_ANCHOR: Record<CafeteriaNpcId, { x: number; y: number }> = {
  // Kopfpositionen im vollständigen Kantinenbild, nicht im beschnittenen Ausschnitt.
  kowalk: { x: 24, y: 43 },
  brust: { x: 78, y: 39 },
};

const CAFETERIA_LABEL: Record<CafeteriaNpcId, string> = {
  kowalk: "Frau Kowalk",
  brust: "Herr Brust",
};

const E71_ANCHOR: Record<E71NerdNpcId, { x: number; y: number }> = {
  // Werte passen zu den Hotspot-Positionen in commonRoomE71.
  detlef: { x: 21, y: 38 },
  sigi: { x: 44, y: 32 },
  ruven: { x: 85, y: 30 },
};

const E71_LABEL: Record<E71NerdNpcId, string> = {
  detlef: "Detlef",
  sigi: "Sigi",
  ruven: "Ruven",
};

type AnyNpcId = ChatterNpcId | CafeteriaNpcId | E71NerdNpcId;

interface ChatterTopicLike {
  id: string;
  lines: ReadonlyArray<{ npc: AnyNpcId; text: string }>;
}

interface ChatterConfig {
  topics: ReadonlyArray<ChatterTopicLike>;
  anchors: Record<string, { x: number; y: number }>;
  labels: Record<string, string>;
}

const DSA_CONFIG: ChatterConfig = {
  topics: CHATTER_TOPICS as unknown as ReadonlyArray<ChatterTopicLike>,
  anchors: DSA_ANCHOR as Record<string, { x: number; y: number }>,
  labels: DSA_LABEL as Record<string, string>,
};

const CAFETERIA_CONFIG: ChatterConfig = {
  topics: CAFETERIA_CHATTER_TOPICS as unknown as ReadonlyArray<ChatterTopicLike>,
  anchors: CAFETERIA_ANCHOR as Record<string, { x: number; y: number }>,
  labels: CAFETERIA_LABEL as Record<string, string>,
};

const E71_CONFIG: ChatterConfig = {
  topics: E71_NERDS_CHATTER_TOPICS as unknown as ReadonlyArray<ChatterTopicLike>,
  anchors: E71_ANCHOR as Record<string, { x: number; y: number }>,
  labels: E71_LABEL as Record<string, string>,
};

interface ActiveBubble {
  id: string;
  npc: AnyNpcId;
  text: string;
  fadingOut: boolean;
}

function pickTopic(lastIdx: number, total: number): number {
  if (total <= 1) return 0;
  let next = lastIdx;
  while (next === lastIdx) {
    next = Math.floor(Math.random() * total);
  }
  return next;
}

function durationFor(text: string): number {
  // 60 ms pro Zeichen, mindestens 2.6 s, höchstens 6.5 s.
  const base = Math.max(2600, Math.min(6500, text.length * 60));
  return base;
}

/**
 * Hintergrundgespräche zweier oder mehrerer NPCs, wenn Layard sich in
 * einem Raum befindet, in dem die Funktion aktiviert ist (`enabled`).
 * Welcher Topic-Pool gezogen wird, steuert `variant`.
 */
export function FloatingChatter({
  enabled,
  variant = "dsa",
}: {
  enabled: boolean;
  variant?: "dsa" | "cafeteria" | "e71Nerds";
}) {
  const { dialogId, dsaCreatorOpen } = useGame();
  const [bubble, setBubble] = useState<ActiveBubble | null>(null);
  const cancelRef = useRef(false);
  const seqRef = useRef(0);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState({ left: 0, top: 0, width: 260, tail: 130 });

  const isActive = enabled && !dialogId && !dsaCreatorOpen;
  const config =
    variant === "cafeteria"
      ? CAFETERIA_CONFIG
      : variant === "e71Nerds"
        ? E71_CONFIG
        : DSA_CONFIG;

  useLayoutEffect(() => {
    const element = bubbleRef.current;
    const layer = element?.parentElement;
    const stage = layer?.parentElement;
    const anchor = bubble ? config.anchors[bubble.npc] : undefined;
    if (!element || !layer || !stage || !anchor) return;

    const position = () => {
      const layerRect = layer.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const scale = layerRect.width / layer.offsetWidth;
      if (!scale) return;
      // The image can extend beyond the stage (object-cover). Clamp to the
      // visible crop, while keeping the tail attached to the real speaker.
      const visibleLeft = Math.max(0, (stageRect.left - layerRect.left) / scale);
      const visibleRight = Math.min(layer.offsetWidth, (stageRect.right - layerRect.left) / scale);
      const visibleTop = Math.max(0, (stageRect.top - layerRect.top) / scale);
      const width = Math.min(260, visibleRight - visibleLeft - 24);
      const anchorX = layer.offsetWidth * anchor.x / 100;
      const anchorY = layer.offsetHeight * anchor.y / 100;
      const left = Math.max(visibleLeft + 12, Math.min(visibleRight - width - 12, anchorX - width / 2));
      setPlacement({
        left,
        top: Math.max(visibleTop + 12, anchorY - element.offsetHeight - 14),
        width,
        tail: Math.max(12, Math.min(width - 12, anchorX - left)),
      });
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(element);
    observer.observe(layer);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [bubble?.id, config]);

  useEffect(() => {
    if (!isActive) {
      cancelRef.current = true;
      setBubble(null);
      return;
    }
    cancelRef.current = false;
    seqRef.current += 1;
    const mySeq = seqRef.current;
    let topicIdx = -1;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = window.setTimeout(resolve, ms);
        // Wenn sich Active-Status ändert, Promise einfach lassen — Cancel-Check fängt es ab.
        void t;
      });

    const run = async () => {
      // Kleine Anlaufzeit, damit das Erscheinen nicht überrumpelt.
      await sleep(900);
      while (!cancelRef.current && seqRef.current === mySeq) {
        topicIdx = pickTopic(topicIdx, config.topics.length);
        const topic = config.topics[topicIdx];
        for (const line of topic.lines) {
          if (cancelRef.current || seqRef.current !== mySeq) return;
          const id = `${topic.id}-${line.npc}-${Math.random().toString(36).slice(2, 7)}`;
          setBubble({ id, npc: line.npc, text: line.text, fadingOut: false });
          await sleep(durationFor(line.text));
          if (cancelRef.current || seqRef.current !== mySeq) return;
          // Fade-out
          setBubble((b) => (b && b.id === id ? { ...b, fadingOut: true } : b));
          await sleep(380);
          if (cancelRef.current || seqRef.current !== mySeq) return;
          setBubble(null);
          await sleep(450);
        }
        // Pause zwischen Themen.
        await sleep(7000);
      }
    };

    void run();
    return () => {
      cancelRef.current = true;
    };
  }, [isActive, config]);

  if (!isActive || !bubble) return null;

  const label = config.labels[bubble.npc] ?? bubble.npc;

  return (
    <div
      ref={bubbleRef}
      className={`chatter-bubble pointer-events-none absolute z-30 ${
        bubble.fadingOut ? "is-out" : ""
      }`}
      style={{
        left: placement.left,
        top: placement.top,
        width: placement.width,
      }}
      aria-live="polite"
    >
      <div className="relative rounded-md border border-amber-glow/50 bg-background/95 px-3 py-2 shadow-lg">
        <div className="font-mono-crt text-[9px] uppercase tracking-[0.25em] text-amber-glow/80">
          {label}
        </div>
        <div className="mt-1 font-display text-[13px] leading-snug text-foreground">
          {bubble.text}
        </div>
        {/* Sprechblasen-Schwanz nach unten */}
        <div
          className="absolute top-full h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[10px] border-x-transparent border-t-background/95"
          style={{
            left: placement.tail,
          }}
        />
      </div>
    </div>
  );
}