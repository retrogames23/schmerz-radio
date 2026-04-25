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
  | "MIRA"
  | "BODO"
  | "HELKA"
  | "ENNIS"
  | "STEGMANN"
  | "OKWU";


interface VoiceProfile {
  /** ElevenLabs voice ID. */
  voiceId: string;
  /** Speech speed (0.7–1.2). */
  speed: number;
  /** Optional per-character voice settings override (sent to server). */
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

/**
 * Character → ElevenLabs voice mapping.
 * Picked for warm/cinematic narrative tone.
 */
const PROFILES: Record<Speaker, VoiceProfile> = {
  LAYARD: { voiceId: "onwK4e9ZLuTAKqWW03F9", speed: 0.92 }, // Daniel — tief, kontemplativ
  INSA: {
    voiceId: "FGY2WhTYpPnrIDTdsKH5", // Laura
    speed: 0.96,
    // Hohe stability + style 0 zwingt Laura in eine ruhige, neutrale
    // Aussprache. Mit den Default-Settings (style 0.35) verfällt sie
    // bei kurzen deutschen Sätzen häufig in englische Phonetik.
    settings: {
      stability: 0.85,
      similarity_boost: 0.85,
      style: 0,
      use_speaker_boost: false,
    },
  },
  MIKAEL: { voiceId: "nPczCjzI2devNBz1zQrb", speed: 0.85 }, // Brian — autoritär, ruhig
  PHILIPPE: { voiceId: "IKne3meq5aSn9XLyUdCD", speed: 1.05 }, // Charlie — jünger, freundlich
  SANITÄTER: {
    // Callum — etwas tiefer, sachlich, weniger stark amerikanisch
    // gefärbt als „Will". Mit hoher stability + style 0 wird er
    // zuverlässig in deutsche Phonetik gezwungen (analog zu Insa),
    // sonst rutschten kurze deutsche Sätze in englischen Akzent.
    voiceId: "N2lVS1w4EtoT3dr4eOWO",
    speed: 1.0,
    settings: {
      stability: 0.85,
      similarity_boost: 0.85,
      style: 0,
      use_speaker_boost: false,
    },
  },
  RADIO: { voiceId: "XrExE9yKIg1WjnnlVkGX", speed: 0.92 }, // Matilda — mystisch, weich
  SYSTEM: { voiceId: "CwhRBWXzGAHq8TQ4Fs17", speed: 0.95 }, // Roger — nüchtern
  RECEPTION: { voiceId: "Xb7hH8MSUJpSbSDYk0k2", speed: 1.1 }, // Alice — klar
  MIRA: { voiceId: "XB0fDUnXU5powFXDhCwa", speed: 1.08 }, // Charlotte — jung, neugierig
  BODO: { voiceId: "JBFqnCBsd6RMkjVDRZzb", speed: 0.88 }, // George — älter, knurrig
  HELKA: { voiceId: "pFZP5JQG7iQjIQuC4Bku", speed: 0.92 }, // Lily — ruhig, älter klingend
  ENNIS: { voiceId: "TX3LPaxmHKxFdv7VOQHJ", speed: 1.0 }, // Liam — junger Mann, leicht nervös
  STEGMANN: { voiceId: "iP95p4xoKVk53GoZ742B", speed: 1.0 }, // Chris — sachlich, nüchtern
  OKWU: { voiceId: "EXAVITQu4vr4xnSDxMaL", speed: 1.0 }, // Sarah — warm, mittlere Frauenstimme, Anfang 50
};

/** Currently playing audio element — cancelled before each new line. */
let currentAudio: HTMLAudioElement | null = null;
/** AbortController for in-flight TTS fetch — aborted on stop. */
let currentFetch: AbortController | null = null;

const DIGIT_WORDS: Record<string, string> = {
  "0": "null",
  "1": "eins",
  "2": "zwei",
  "3": "drei",
  "4": "vier",
  "5": "fünf",
  "6": "sechs",
  "7": "sieben",
  "8": "acht",
  "9": "neun",
};

function speakDigits(value: string): string {
  return value
    .split("")
    .map((char) => DIGIT_WORDS[char] ?? char)
    .join(" ");
}

function speakNumericToken(value: string): string {
  if (value.includes(",") || value.includes(".")) {
    return value
      .split(/([,.])/)
      .filter(Boolean)
      .map((part) => {
        if (part === ",") return "Komma";
        if (part === ".") return "Punkt";
        return speakDigits(part);
      })
      .join(" ");
  }

  return speakDigits(value);
}

function normalizeNumbersForSpeech(text: string): string {
  return text
    .replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g, (_match, day, month, year) => {
      return `${speakDigits(day)} Punkt ${speakDigits(month)} Punkt ${speakDigits(year)}`;
    })
    .replace(/\b([A-Za-zÄÖÜäöü])(\d+(?:[.,]\d+)*)\b/g, (_match, prefix, numeric) => {
      return `${prefix} ${speakNumericToken(numeric)}`;
    })
    .replace(/\b\d+(?:[.,]\d+)+\b/g, (match) => speakNumericToken(match))
    .replace(/\b\d+\b/g, (match) => speakDigits(match));
}

function cleanText(text: string): string {
  const normalized = text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[„"”]/g, "")
    .replace(/—/g, ", ")
    .replace(/…/g, "...")
    .trim();

  // Wenn nach dem Säubern nur noch Punkte/Kommas/Whitespace übrig sind
  // (z. B. Zeilen wie "…" oder "..."), kein TTS abspielen — sonst erzeugt
  // ElevenLabs ein kurzes, befremdliches Klick-/Atemgeräusch.
  if (!/[A-Za-zÄÖÜäöüß0-9]/.test(normalized)) return "";

  return normalizeNumbersForSpeech(normalized);
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
  const settingsKey = profile.settings
    ? JSON.stringify(profile.settings)
    : "";
  const key = hashKey(profile.voiceId, String(profile.speed), settingsKey, cleaned);

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
      settings: profile.settings,
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