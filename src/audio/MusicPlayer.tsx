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
import trackWohnung from "@/assets/music/Wohnung.mp3";
import trackThreeOClock from "@/assets/music/Three_O_Clock_Skyline.mp3";
import trackDsaTavern from "@/assets/music/dsa-tavern.mp3";
import trackDsaTable from "@/assets/music/dsa-table.mp3";
import trackLinoleumWaltz from "@/assets/music/the-linoleum-waltz.mp3";
import trackCornerBooth from "@/assets/music/The_Corner_Booth.mp3";
import trackVictorySpire from "@/assets/music/victory-over-the-spire.mp3";
import trackCityForgets from "@/assets/music/The_City_Forgets.mp3";
import { pickMoodTrack, type DsaMood } from "./dsaMusic";

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
  { title: "Wohnung", src: trackWohnung },
  { title: "Three O'Clock Skyline", src: trackThreeOClock },
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
  cafeteria: { title: "The Linoleum Waltz", src: trackLinoleumWaltz } as MusicTrack,
  pub: { title: "The Corner Booth", src: trackCornerBooth } as MusicTrack,
  e71Nerds: { title: "Victory over the Spire", src: trackVictorySpire } as MusicTrack,
  sectorThreshold: { title: "The City Forgets", src: trackCityForgets } as MusicTrack,
};
export type MusicOverrideId = keyof typeof MUSIC_OVERRIDES;
const CROSSFADE_SECONDS = 6;
const FADE_TICK_MS = 50;
const MANUAL_FADE_SECONDS = 1.2;
const MOOD_FADE_SECONDS = 2.5;

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
   *
   * Optional `playOnce`: Track läuft einmal komplett durch und der
   * Override löst sich danach automatisch (zurück zur regulären
   * Playlist). Ohne diese Option läuft der Track in Schleife.
   */
  setOverride: (
    id: MusicOverrideId | null,
    opts?: { playOnce?: boolean; force?: boolean },
  ) => void;
  /** Aktuell laufender Override (oder null). UI nutzt das z. B., um den Song-Switcher auszublenden. */
  activeOverride: MusicOverrideId | null;
  /**
   * Aktiviert den DSA-Mood-Pool: Tracks aus dem aktuellen Mood werden
   * geloopt, am Ende eines Tracks wählt der Player einen passenden
   * nächsten Track. `null` deaktiviert den Pool und übergibt wieder an
   * Playlist/Override.
   */
  setMoodPool: (mood: DsaMood | null) => void;
  /**
   * Setzt den aktuell gewünschten Mood. Wirkt erst beim nächsten
   * Trackwechsel — der laufende Track wird NICHT unterbrochen.
   */
  setMood: (mood: DsaMood) => void;
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
  const overridePlayOnceRef = useRef(false);
  // Override spielt auch dann, wenn die Hintergrundmusik in den
  // Einstellungen ausgeschaltet ist (z. B. für Cutscene-Musik).
  const overrideForceRef = useRef(false);
  const [activeOverride, setActiveOverride] = useState<MusicOverrideId | null>(null);
  const savedIndexRef = useRef<number | null>(null);
  // Mood-Pool (LLM-Tafelrunde). Aktiv, wenn moodPoolRef.current !== null.
  const moodPoolRef = useRef<DsaMood | null>(null);
  const currentMoodSrcRef = useRef<string | null>(null);

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
      // Ausgeschaltete Hintergrundmusik: Forced Overrides (z. B.
      // Cutscene-Musik) dürfen weiterlaufen.
      if (!overrideForceRef.current) stopPlayback();
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
      // Standard: Watcher pausiert bei ausgeschalteter Musik.
      // Forced Override (Cutscene) läuft trotzdem und muss überwacht
      // werden, damit `playOnce` sich sauber auflöst.
      if (!enabledRef.current && !overrideForceRef.current) return;
      if (fadeTimerRef.current) return; // already crossfading
      const active = activeRef.current === "a" ? aRef.current : bRef.current;
      if (!active || !active.duration || isNaN(active.duration)) return;
      const remaining = active.duration - active.currentTime;
      if (moodPoolRef.current) {
        // Mood-Pool aktiv: am Ende des aktuellen Tracks neuen Mood-Track wählen.
        if (remaining <= MOOD_FADE_SECONDS && !active.paused) {
          const mood = moodPoolRef.current;
          const nextSrc = pickMoodTrack(mood, currentMoodSrcRef.current);
          currentMoodSrcRef.current = nextSrc;
          crossfadeToSrc(nextSrc, MOOD_FADE_SECONDS);
        }
        return;
      }
      if (overrideRef.current) {
        // Override-Track: vollständig durchlaufen lassen. Bei `playOnce`
        // löst sich der Override am Ende des Tracks automatisch und die
        // reguläre Playlist übernimmt wieder; sonst wird geloopt.
        if (remaining <= 0.1 && !active.paused) {
          if (overridePlayOnceRef.current) {
            setOverrideInternal(null);
          } else {
            active.currentTime = 0;
            void active.play().catch(() => {});
          }
        }
        return;
      }
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

  function setOverrideInternal(
    id: MusicOverrideId | null,
    opts?: { playOnce?: boolean; force?: boolean },
  ) {
    if (overrideRef.current === id && !opts) return;
    // Wenn der Mood-Pool aktiv ist, Override-Wechsel nur bookkeepen — der
    // Mood-Pool gewinnt akustisch. Beim setMoodPool(null) wird auf den
    // aktuell gemerkten Override (oder die Playlist) zurückgewechselt.
    if (moodPoolRef.current) {
      overrideRef.current = id;
      overridePlayOnceRef.current = !!opts?.playOnce;
      overrideForceRef.current = !!opts?.force;
      setActiveOverride(id);
      return;
    }
    if (id) {
      // Wechsel auf Override: Playlist-Position merken.
      if (overrideRef.current === null) {
        savedIndexRef.current = indexRef.current;
      }
      overrideRef.current = id;
      overridePlayOnceRef.current = !!opts?.playOnce;
      overrideForceRef.current = !!opts?.force;
      setActiveOverride(id);
      if (!enabledRef.current && !opts?.force) return; // Musik aus → erst beim Aktivieren übernehmen
      crossfadeToSrc(MUSIC_OVERRIDES[id].src);
      ensureWatcher();
    } else {
      const wasForced = overrideForceRef.current;
      // Zurück auf reguläre Playlist.
      overrideRef.current = null;
      overridePlayOnceRef.current = false;
      overrideForceRef.current = false;
      setActiveOverride(null);
      if (!enabledRef.current) {
        // Musik ist aus. Wenn der Override forciert lief, sauber
        // ausblenden statt hart abzubrechen.
        if (wasForced) {
          const active = activeRef.current === "a" ? aRef.current : bRef.current;
          if (active && !active.paused) {
            const startVol = active.volume;
            const steps = Math.max(1, Math.floor((MANUAL_FADE_SECONDS * 1000) / FADE_TICK_MS));
            let step = 0;
            if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
            fadeTimerRef.current = window.setInterval(() => {
              step += 1;
              const t = Math.min(1, step / steps);
              active.volume = clamp(startVol * (1 - t));
              if (t >= 1) {
                active.pause();
                active.currentTime = 0;
                if (fadeTimerRef.current) {
                  window.clearInterval(fadeTimerRef.current);
                  fadeTimerRef.current = null;
                }
                if (watchTimerRef.current) {
                  window.clearInterval(watchTimerRef.current);
                  watchTimerRef.current = null;
                }
              }
            }, FADE_TICK_MS);
          }
        }
        return;
      }
      const restoreIndex = savedIndexRef.current ?? indexRef.current;
      indexRef.current = restoreIndex;
      setCurrentIndex(restoreIndex);
      crossfadeToSrc(pickTrack(restoreIndex));
      ensureWatcher();
    }
  }

  const setOverride = useCallback(
    (id: MusicOverrideId | null, opts?: { playOnce?: boolean; force?: boolean }) => {
      setOverrideInternal(id, opts);
    },
    [],
  );

  const setMoodPool = useCallback((mood: DsaMood | null) => {
    if (mood === null) {
      if (moodPoolRef.current === null) return;
      moodPoolRef.current = null;
      currentMoodSrcRef.current = null;
      // Zurück zu Override (falls aktiv) oder Playlist.
      if (!enabledRef.current) {
        // Musik aus → sauber ausblenden.
        const active = activeRef.current === "a" ? aRef.current : bRef.current;
        if (active && !active.paused) {
          const startVol = active.volume;
          const steps = Math.max(1, Math.floor((MANUAL_FADE_SECONDS * 1000) / FADE_TICK_MS));
          let step = 0;
          if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = window.setInterval(() => {
            step += 1;
            const t = Math.min(1, step / steps);
            active.volume = clamp(startVol * (1 - t));
            if (t >= 1) {
              active.pause();
              active.currentTime = 0;
              if (fadeTimerRef.current) {
                window.clearInterval(fadeTimerRef.current);
                fadeTimerRef.current = null;
              }
            }
          }, FADE_TICK_MS);
        }
        return;
      }
      const targetSrc = overrideRef.current
        ? MUSIC_OVERRIDES[overrideRef.current].src
        : pickTrack(indexRef.current);
      crossfadeToSrc(targetSrc);
      ensureWatcher();
      return;
    }
    // Mood-Pool aktivieren.
    const wasActive = moodPoolRef.current !== null;
    moodPoolRef.current = mood;
    if (!wasActive) {
      // Playlist-Position merken, falls noch nicht gemerkt.
      if (savedIndexRef.current === null) savedIndexRef.current = indexRef.current;
    }
    if (!enabledRef.current) return;
    const nextSrc = pickMoodTrack(mood, currentMoodSrcRef.current);
    currentMoodSrcRef.current = nextSrc;
    crossfadeToSrc(nextSrc, MOOD_FADE_SECONDS);
    ensureWatcher();
  }, []);

  const setMood = useCallback((mood: DsaMood) => {
    if (moodPoolRef.current === null) return; // Pool nicht aktiv → ignorieren
    moodPoolRef.current = mood;
    // Bewusst KEIN sofortiger Wechsel — der laufende Track spielt aus.
  }, []);

  const next = useCallback(() => {
    playIndex(indexRef.current + 1);
  }, [playIndex]);

  const prev = useCallback(() => {
    playIndex(indexRef.current - 1);
  }, [playIndex]);

  const value = useMemo<MusicCtx>(
    () => ({
      tracks: PLAYLIST,
      currentIndex,
      next,
      prev,
      playIndex,
      setDuck,
      pause,
      resume,
      setOverride,
      activeOverride,
      setMoodPool,
      setMood,
    }),
    [currentIndex, next, prev, playIndex, setDuck, pause, resume, setOverride, activeOverride, setMoodPool, setMood],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}