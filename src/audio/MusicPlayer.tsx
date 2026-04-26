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
import trackDsaTavern from "@/assets/music/dsa-tavern.mp3";
import trackDsaTable from "@/assets/music/dsa-table.mp3";

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

/**
 * Szenen-spezifische Override-Tracks. Solange ein Override aktiv ist,
 * läuft dieser Track in Schleife und der normale Watcher springt nicht
 * weiter zur nächsten Playlist-Track. Aktuell genutzt für die
 * DSA-Tafelrunde im Gemeinschaftsraum.
 */
export const MUSIC_OVERRIDES = {
  dsaTavern: { title: "Tavernen-Stube (DSA)", src: trackDsaTavern } as MusicTrack,
  dsaTable: { title: "The Worn Oak Table (DSA)", src: trackDsaTable } as MusicTrack,
};
export type MusicOverrideId = keyof typeof MUSIC_OVERRIDES;
const CROSSFADE_SECONDS = 6;
const FADE_TICK_MS = 50;
const MANUAL_FADE_SECONDS = 1.2;

interface MusicCtx {
  tracks: MusicTrack[];
  currentIndex: number;
  next: () => void;
  prev: () => void;
  playIndex: (i: number) => void;
  /**
   * Multipliziert die effektive Lautstärke mit `factor` (0..1).
   * Wird vom Teleempfänger genutzt, um die Musik zu „ducken", solange
   * eine Sprecher-Meldung läuft. 1 = volle Lautstärke (Standard).
   */
  setDuck: (factor: number) => void;
  /** Hält die Wiedergabe komplett an (z. B. für Cutscenes). */
  pause: () => void;
  /** Setzt die zuvor angehaltene Wiedergabe fort. */
  resume: () => void;
  /**
   * Aktiviert einen Override-Track (z. B. Tavernen-Musik). Wird
   * crossfaded und in Schleife abgespielt, bis `clearOverride()`
   * aufgerufen wird. Wirkt nur, wenn Musik aktiviert ist.
   */
  setOverride: (id: MusicOverrideId | null) => void;
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
  const duckRef = useRef(1);
  const externallyPausedRef = useRef(false);
  const overrideRef = useRef<MusicOverrideId | null>(null);
  const savedIndexRef = useRef<number | null>(null);

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
      active.volume = clamp(musicVolume * duckRef.current);
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
    const overrideId = overrideRef.current;
    const targetSrc = overrideId ? MUSIC_OVERRIDES[overrideId].src : pickTrack(indexRef.current);
    if (!active.src || active.src !== new URL(targetSrc, window.location.href).href) {
      active.src = targetSrc;
      active.currentTime = 0;
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
        // Override-Track: nahtlos zurück an den Anfang loopen statt
        // zur nächsten Playlist-Position zu springen.
        if (overrideRef.current) {
          active.currentTime = 0;
          return;
        }
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

  const setDuck = useCallback((factor: number) => {
    const f = clamp(factor);
    duckRef.current = f;
    const active = activeRef.current === "a" ? aRef.current : bRef.current;
    if (active && !fadeTimerRef.current) {
      active.volume = clamp(volumeRef.current * f);
    }
  }, []);

  const pause = useCallback(() => {
    externallyPausedRef.current = true;
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (aRef.current) aRef.current.pause();
    if (bRef.current) bRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (!externallyPausedRef.current) return;
    externallyPausedRef.current = false;
    if (!enabledRef.current) return;
    const active = activeRef.current === "a" ? aRef.current : bRef.current;
    if (!active) return;
    active.volume = clamp(volumeRef.current * duckRef.current);
    void active.play().catch(() => {
      /* autoplay blocked */
    });
    ensureWatcher();
  }, []);

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

  function crossfadeToSrc(src: string, durationSeconds = MANUAL_FADE_SECONDS) {
    if (!aRef.current || !bRef.current) return;
    const fromKey = activeRef.current;
    const toKey = fromKey === "a" ? "b" : "a";
    const from = fromKey === "a" ? aRef.current : bRef.current;
    const to = toKey === "a" ? aRef.current : bRef.current;
    to.src = src;
    to.currentTime = 0;
    to.volume = 0;
    void to.play().catch(() => {});
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

  const setOverride = useCallback((id: MusicOverrideId | null) => {
    if (overrideRef.current === id) return;
    if (id) {
      // Wechsel auf Override: Playlist-Position merken.
      if (overrideRef.current === null) {
        savedIndexRef.current = indexRef.current;
      }
      overrideRef.current = id;
      if (!enabledRef.current) return; // Musik aus → erst beim Aktivieren übernehmen
      crossfadeToSrc(MUSIC_OVERRIDES[id].src);
      ensureWatcher();
    } else {
      // Zurück auf reguläre Playlist.
      overrideRef.current = null;
      if (!enabledRef.current) return;
      const restoreIndex = savedIndexRef.current ?? indexRef.current;
      indexRef.current = restoreIndex;
      setCurrentIndex(restoreIndex);
      crossfadeToSrc(pickTrack(restoreIndex));
      ensureWatcher();
    }
  }, []);

  const next = useCallback(() => {
    playIndex(indexRef.current + 1);
  }, [playIndex]);

  const prev = useCallback(() => {
    playIndex(indexRef.current - 1);
  }, [playIndex]);

  const value = useMemo<MusicCtx>(
    () => ({ tracks: PLAYLIST, currentIndex, next, prev, playIndex, setDuck, pause, resume, setOverride }),
    [currentIndex, next, prev, playIndex, setDuck, pause, resume, setOverride],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}