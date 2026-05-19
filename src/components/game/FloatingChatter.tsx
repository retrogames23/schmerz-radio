import { useEffect, useRef, useState } from "react";
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
  // Werte passen zu den Sprite-Positionen in cafeteriaE67 (siehe scenes.ts).
  // Kowalk steht ganz links — Bubble-Anker bewusst nach rechts versetzt,
  // damit die Sprechblase aus Spielersicht rechts neben ihr erscheint.
  kowalk: { x: 36, y: 45 },
  brust: { x: 84, y: 42 },
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

  const isActive = enabled && !dialogId && !dsaCreatorOpen;
  const config =
    variant === "cafeteria"
      ? CAFETERIA_CONFIG
      : variant === "e71Nerds"
        ? E71_CONFIG
        : DSA_CONFIG;

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

  const anchor = config.anchors[bubble.npc];
  const label = config.labels[bubble.npc] ?? bubble.npc;

  // Sprechblase ist max. 260 px breit und um -50 % horizontal verschoben,
  // ragt also je nach Anker links/rechts aus dem Bild heraus. Auf Mobile
  // (rotierte Stage, schmale Szene) muss der Anker stärker eingeklemmt
  // werden, sonst wird die Blase links/rechts angeschnitten.
  const clampedX = Math.min(64, Math.max(36, anchor.x));

  return (
    <div
      className={`chatter-bubble pointer-events-none absolute z-30 ${
        bubble.fadingOut ? "is-out" : ""
      }`}
      style={{
        left: `${clampedX}%`,
        top: `${anchor.y}%`,
      }}
      aria-live="polite"
    >
      <div className="relative max-w-[260px] -translate-x-1/2 rounded-md border border-amber-glow/50 bg-background/95 px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
        <div className="font-mono-crt text-[9px] uppercase tracking-[0.25em] text-amber-glow/80">
          {label}
        </div>
        <div className="mt-1 font-display text-[13px] leading-snug text-foreground">
          {bubble.text}
        </div>
        {/* Sprechblasen-Schwanz nach unten */}
        <div
          className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2"
          style={{
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid hsl(0 0% 6% / 0.95)",
            filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.4))",
          }}
        />
      </div>
    </div>
  );
}