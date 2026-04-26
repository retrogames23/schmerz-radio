import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { CHATTER_TOPICS, type ChatterNpcId } from "@/game/dsa/chatter";

/**
 * Position einer Sprechblase je NPC, in % der Szene.
 * Punkt zeigt den Mund/Kopf-Anker — die Blase wird darüber positioniert.
 * Werte stimmen mit den Sprite-Positionen in scenes.ts (commonRoomE67) überein.
 */
// Anker zeigen ungefähr auf den Kopf der jeweils ins Hintergrund-
// bild gemalten Figur (Werte in % der Szene).
const NPC_ANCHOR: Record<ChatterNpcId, { x: number; y: number }> = {
  tjark: { x: 70, y: 12 },
  brem: { x: 26, y: 18 },
  yelva: { x: 84, y: 42 },
};

const NPC_LABEL: Record<ChatterNpcId, string> = {
  tjark: "Tjark",
  brem: "Brem",
  yelva: "Yelva",
};

interface ActiveBubble {
  id: string;
  npc: ChatterNpcId;
  text: string;
  fadingOut: boolean;
}

function pickTopic(lastIdx: number): number {
  if (CHATTER_TOPICS.length <= 1) return 0;
  let next = lastIdx;
  while (next === lastIdx) {
    next = Math.floor(Math.random() * CHATTER_TOPICS.length);
  }
  return next;
}

function durationFor(text: string): number {
  // 60 ms pro Zeichen, mindestens 2.6 s, höchstens 6.5 s.
  const base = Math.max(2600, Math.min(6500, text.length * 60));
  return base;
}

/**
 * Hintergrundgespräche der DSA-Runde, wenn Layard im
 * Gemeinschaftsraum ist und gerade NICHT am Tisch sitzt
 * (kein Dialog/Modal/Char-Creator offen).
 *
 * Nur eine Blase gleichzeitig sichtbar. Eine Themenrunde läuft am
 * Stück durch, dann eine kurze Pause, dann das nächste Thema.
 */
export function FloatingChatter({ enabled }: { enabled: boolean }) {
  const { dialogId, dsaCreatorOpen } = useGame();
  const [bubble, setBubble] = useState<ActiveBubble | null>(null);
  const cancelRef = useRef(false);
  const seqRef = useRef(0);

  const isActive = enabled && !dialogId && !dsaCreatorOpen;

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
        topicIdx = pickTopic(topicIdx);
        const topic = CHATTER_TOPICS[topicIdx];
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
  }, [isActive]);

  if (!isActive || !bubble) return null;

  const anchor = NPC_ANCHOR[bubble.npc];

  return (
    <div
      className={`chatter-bubble pointer-events-none absolute z-30 ${
        bubble.fadingOut ? "is-out" : ""
      }`}
      style={{
        left: `${anchor.x}%`,
        top: `${anchor.y}%`,
      }}
      aria-live="polite"
    >
      <div className="relative max-w-[260px] -translate-x-1/2 rounded-md border border-amber-glow/50 bg-background/95 px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
        <div className="font-mono-crt text-[9px] uppercase tracking-[0.25em] text-amber-glow/80">
          {NPC_LABEL[bubble.npc]}
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