/**
 * Character speech via ElevenLabs (server-proxied, cached per line).
 * Falls back to browser SpeechSynthesis if the server request fails.
 */
import { getCachedAudio, setCachedAudio, hashKey } from "./ttsCache";

type Speaker =
  | "LAYARD"
  | "INSA"
  | "PHILIPPE"
  | "SANITÄTER"
  | "SYSTEM"
  | "RADIO"
  | "MIKAEL"
  | "RECEPTION"
  | "MIRA";


interface VoiceProfile {
  /** ElevenLabs voice ID. */
  voiceId: string;
  /** Speech speed (0.7–1.2). */
  speed: number;
}

/**
 * Character → ElevenLabs voice mapping.
 * Picked for warm/cinematic narrative tone.
 */
const PROFILES: Record<Speaker, VoiceProfile> = {
  LAYARD: { voiceId: "onwK4e9ZLuTAKqWW03F9", speed: 0.92 }, // Daniel — tief, kontemplativ
  INSA: { voiceId: "EXAVITQu4vr4xnSDxMaL", speed: 1.0 }, // Sarah — warm, professionell
  MIKAEL: { voiceId: "nPczCjzI2devNBz1zQrb", speed: 0.85 }, // Brian — autoritär, ruhig
  PHILIPPE: { voiceId: "IKne3meq5aSn9XLyUdCD", speed: 1.05 }, // Charlie — jünger, freundlich
  SANITÄTER: { voiceId: "bIHbv24MWmeRgasZH58o", speed: 1.05 }, // Will — sachlich
  RADIO: { voiceId: "XrExE9yKIg1WjnnlVkGX", speed: 0.92 }, // Matilda — mystisch, weich
  SYSTEM: { voiceId: "CwhRBWXzGAHq8TQ4Fs17", speed: 0.95 }, // Roger — nüchtern
  RECEPTION: { voiceId: "Xb7hH8MSUJpSbSDYk0k2", speed: 1.1 }, // Alice — klar
  MIRA: { voiceId: "XB0fDUnXU5powFXDhCwa", speed: 1.08 }, // Charlotte — jung, neugierig
};

/** Currently playing audio element — cancelled before each new line. */
let currentAudio: HTMLAudioElement | null = null;
/** AbortController for in-flight TTS fetch — aborted on stop. */
let currentFetch: AbortController | null = null;

function cleanText(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[„"”]/g, "")
    .replace(/—/g, ", ")
    .replace(/…/g, "...")
    .trim();
}

/** Browser-SpeechSynthesis fallback — only used if ElevenLabs request fails. */
function browserFallback(text: string, volume: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.volume = volume;
  synth.speak(u);
}

async function fetchAndCache(
  speaker: Speaker,
  cleaned: string,
  signal: AbortSignal,
): Promise<Blob | null> {
  const profile = PROFILES[speaker];
  const key = hashKey(profile.voiceId, String(profile.speed), cleaned);

  const cached = await getCachedAudio(key);
  if (cached) return cached;

  const resp = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voiceId: profile.voiceId,
      text: cleaned,
      speed: profile.speed,
    }),
    signal,
  });
  if (!resp.ok) {
    console.warn(`TTS request failed: ${resp.status}`);
    return null;
  }
  const blob = await resp.blob();
  void setCachedAudio(key, blob);
  return blob;
}

export async function speak(speaker: Speaker, text: string, volume = 1) {
  if (typeof window === "undefined") return;

  // Cancel any line currently playing or in-flight.
  stopSpeech();

  const cleaned = cleanText(text);
  if (!cleaned) return;

  const ac = new AbortController();
  currentFetch = ac;

  try {
    const blob = await fetchAndCache(speaker, cleaned, ac.signal);
    if (ac.signal.aborted) return;
    if (!blob) {
      browserFallback(cleaned, volume);
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    currentAudio = audio;
    void audio.play().catch((err) => {
      console.warn("Audio playback failed:", err);
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    console.warn("speak() failed, using browser fallback:", err);
    browserFallback(cleaned, volume);
  } finally {
    if (currentFetch === ac) currentFetch = null;
  }
}

export function stopSpeech() {
  if (currentFetch) {
    currentFetch.abort();
    currentFetch = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/** No-op kept for backwards-compatibility (used to warm up browser voices). */
export function preloadVoices() {
  /* no longer needed — ElevenLabs voices are server-side */
}