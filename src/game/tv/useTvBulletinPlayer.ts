import { authHeaders } from "@/lib/authHeaders";
import { useCallback, useEffect, useRef } from "react";
import type { Channel } from "./channels";

interface Options {
  open: boolean;
  channel: Channel;
  bulletin: string;
  ttsEnabled: boolean;
  setDuck: (v: number) => void;
  onAdvance: () => void;
}

/**
 * Lädt für jedes Bulletin die Sprecher-Audiospur per TTS und schaltet
 * nach `ended` automatisch weiter. Bei deaktiviertem TTS oder Fehlern
 * greift der hold-basierte Fallback-Timer. Aus Television.tsx
 * extrahiert, damit der TV-Renderer nicht das ganze Audio-Setup
 * neu evaluieren muss.
 */
export function useTvBulletinPlayer({
  open,
  channel,
  bulletin,
  ttsEnabled,
  setDuck,
  onAdvance,
}: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
      fetchAbortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    stop();
    setDuck(1);

    if (!ttsEnabled) {
      fallbackTimerRef.current = window.setTimeout(() => {
        onAdvance();
      }, channel.hold * 1000);
      return () => {
        stop();
        setDuck(1);
      };
    }

    const ac = new AbortController();
    fetchAbortRef.current = ac;

    authHeaders()
      .then((auth) =>
        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({
            voiceId: channel.voiceId,
            text: bulletin,
            speed: 0.95,
          }),
          signal: ac.signal,
        }),
      )
      .then(async (resp) => {
        if (ac.signal.aborted) return;
        if (!resp.ok) throw new Error(`TTS ${resp.status}`);
        const blob = await resp.blob();
        if (ac.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const a = new Audio(url);
        a.volume = 1;
        a.onended = () => {
          URL.revokeObjectURL(url);
          setDuck(1);
          onAdvance();
        };
        a.onerror = () => {
          URL.revokeObjectURL(url);
          setDuck(1);
          fallbackTimerRef.current = window.setTimeout(() => {
            onAdvance();
          }, 1500);
        };
        audioRef.current = a;
        setDuck(0.18);
        void a.play().catch(() => {
          setDuck(1);
          fallbackTimerRef.current = window.setTimeout(() => {
            onAdvance();
          }, channel.hold * 1000);
        });
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setDuck(1);
        fallbackTimerRef.current = window.setTimeout(() => {
          onAdvance();
        }, channel.hold * 1000);
      });

    return () => {
      stop();
      setDuck(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, channel, bulletin, ttsEnabled]);

  return stop;
}
