import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSettings } from "./SettingsContext";
import trackSunday from "@/assets/sunday-at-the-bunker.mp3";
import trackMidnight from "@/assets/midnight-at-the-loading-bay.mp3";
import trackSunrise from "@/assets/music/Before_the_Sunrise.mp3";
import trackSteelRain from "@/assets/music/Steel_Rain_at_Midnight.mp3";

/**
 * Background music. Plays a playlist of tracks in sequence and
 * crossfades between them at the transition. Honors musicEnabled /
 * musicVolume from settings.
 *
 * Browsers require a user gesture before audio starts; the title-screen
 * "Spiel beginnen" click satisfies that.
 */
export interface MusicTrack {
  title: string;
  src: string;
}

const PLAYLIST: MusicTrack[] = [
  { title: "Sunday at the Bunker", src: trackSunday },
  { title: "Midnight at the Loading Bay", src: trackMidnight },
  { title: "Before the Sunrise", src: trackSunrise },
  { title: "Steel Rain at Midnight", src: trackSteelRain },
];
const CROSSFADE_SECONDS = 6;
const FADE_TICK_MS = 50;
const MANUAL_FADE_SECONDS = 1.2;

interface MusicCtx {
  tracks: MusicTrack[];
  currentIndex: number;
  next: () => void;
  prev: () => void;
  playIndex: (i: number) => void;
}

const MusicContext = createContext<MusicCtx | null>(null);

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicPlayer");
  return ctx;
}

export function MusicPlayer({ children }: { children?: ReactNode }) {
  const { musicEnabled, musicVolume } = useSettings();

  // Two audio elements so we can crossfade between them.
  const aRef = useRef<HTMLAudioElement | null>(null);
  const bRef = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<"a" | "b">("a");
  const initialIndex = useRef(Math.floor(Math.random() * PLAYLIST.length));
  const indexRef = useRef(initialIndex.current);
  const [currentIndex, setCurrentIndex] = useState(initialIndex.current);
  const fadeTimerRef = useRef<number | null>(null);
  const watchTimerRef = useRef<number | null>(null);
  const enabledRef = useRef(musicEnabled);
  const volumeRef = useRef(musicVolume);

  // Keep refs in sync so timers always read fresh values.
  useEffect(() => {
    enabledRef.current = musicEnabled;
  }, [musicEnabled]);
  useEffect(() => {
    volumeRef.current = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    const a = new Audio();
    const b = new Audio();
    a.preload = "auto";
    b.preload = "auto";
    a.loop = false;
    b.loop = false;
    a.volume = 0;
    b.volume = 0;
    aRef.current = a;
    bRef.current = b;

    return () => {
      if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
      if (watchTimerRef.current) window.clearInterval(watchTimerRef.current);
      a.pause();
      b.pause();
      aRef.current = null;
      bRef.current = null;
    };
  }, []);

  // Volume change — apply to whichever element is currently active and audible.
  useEffect(() => {
    const active = activeRef.current === "a" ? aRef.current : bRef.current;
    if (active && !fadeTimerRef.current) {
      active.volume = clamp(musicVolume);
    }
  }, [musicVolume]);

  // Start / stop based on enabled flag.
  useEffect(() => {
    if (!aRef.current || !bRef.current) return;

    if (musicEnabled) {
      startPlayback();
    } else {
      stopPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled]);

  function pickTrack(i: number) {
    return PLAYLIST[((i % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length].src;
  }

  function startPlayback() {
    const active = activeRef.current === "a" ? aRef.current! : bRef.current!;
    if (!active.src) {
      active.src = pickTrack(indexRef.current);
    }
    active.volume = clamp(volumeRef.current);
    void active.play().catch(() => {
      /* autoplay blocked */
    });
    ensureWatcher();
  }

  function stopPlayback() {
    if (aRef.current) aRef.current.pause();
    if (bRef.current) bRef.current.pause();
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (watchTimerRef.current) {
      window.clearInterval(watchTimerRef.current);
      watchTimerRef.current = null;
    }
  }

  function ensureWatcher() {
    if (watchTimerRef.current) return;
    watchTimerRef.current = window.setInterval(() => {
      if (!enabledRef.current) return;
      if (fadeTimerRef.current) return; // already crossfading
      const active = activeRef.current === "a" ? aRef.current : bRef.current;
      if (!active || !active.duration || isNaN(active.duration)) return;
      const remaining = active.duration - active.currentTime;
      if (remaining <= CROSSFADE_SECONDS && !active.paused) {
        beginCrossfade();
      }
    }, 250);
  }

  function beginCrossfade(durationSeconds = CROSSFADE_SECONDS, advanceBy = 1) {
    const fromKey = activeRef.current;
    const toKey = fromKey === "a" ? "b" : "a";
    const from = fromKey === "a" ? aRef.current! : bRef.current!;
    const to = toKey === "a" ? aRef.current! : bRef.current!;

    indexRef.current =
      ((indexRef.current + advanceBy) % PLAYLIST.length + PLAYLIST.length) %
      PLAYLIST.length;
    setCurrentIndex(indexRef.current);
    to.src = pickTrack(indexRef.current);
    to.currentTime = 0;
    to.volume = 0;
    void to.play().catch(() => {
      /* autoplay blocked */
    });

    const startVol = clamp(volumeRef.current);
    const steps = Math.max(1, Math.floor((durationSeconds * 1000) / FADE_TICK_MS));
    let step = 0;

    if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = window.setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      const target = clamp(volumeRef.current);
      from.volume = clamp(startVol * (1 - t));
      to.volume = clamp(target * t);
      if (t >= 1) {
        from.pause();
        from.currentTime = 0;
        activeRef.current = toKey;
        if (fadeTimerRef.current) {
          window.clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
      }
    }, FADE_TICK_MS);
  }

  const playIndex = useCallback((i: number) => {
    if (!aRef.current || !bRef.current) return;
    const target = ((i % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    if (target === indexRef.current && !aRef.current.paused) return;
    const advance = target - indexRef.current;
    if (!enabledRef.current) {
      // If music is off, just remember choice for next start.
      indexRef.current = target;
      setCurrentIndex(target);
      return;
    }
    beginCrossfade(MANUAL_FADE_SECONDS, advance === 0 ? 1 : advance);
  }, []);

  const next = useCallback(() => {
    playIndex(indexRef.current + 1);
  }, [playIndex]);

  const prev = useCallback(() => {
    playIndex(indexRef.current - 1);
  }, [playIndex]);

  const value = useMemo<MusicCtx>(
    () => ({ tracks: PLAYLIST, currentIndex, next, prev, playIndex }),
    [currentIndex, next, prev, playIndex],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}