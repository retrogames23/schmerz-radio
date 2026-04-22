import { useEffect, useRef } from "react";
import { useSettings } from "./SettingsContext";
import musicTrack from "@/assets/sunday-at-the-bunker.mp3";

/**
 * Background music loop. Honors musicEnabled / musicVolume from settings.
 * Browsers require a user gesture before audio starts; the title-screen
 * "Spiel beginnen" click satisfies that.
 */
export function MusicPlayer() {
  const { musicEnabled, musicVolume } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(musicTrack);
    a.loop = true;
    a.preload = "auto";
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = Math.max(0, Math.min(1, musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (musicEnabled) {
      void a.play().catch(() => {
        /* autoplay blocked — will start on next user interaction */
      });
    } else {
      a.pause();
    }
  }, [musicEnabled]);

  return null;
}