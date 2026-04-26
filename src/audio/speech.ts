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
  // ── ElevenLabs eleven_v3 Voice-Settings ───────────────────────────
  // v3 nutzt drei "Stability-Modi":
  //   stability 0.0 = Creative (sehr expressiv, kann driften)
  //   stability 0.5 = Natural   (ausgewogen — Default)
  //   stability 1.0 = Robust    (sehr konsistent, weniger Emotion)
  // Für deutsche Erzähltexte funktioniert "Natural" am besten.
  // similarity_boost und style sind in v3 weniger entscheidend, wir
  // setzen sie aber konservativ, damit die Stimmen nicht abdriften.
  LAYARD: {
    voiceId: "onwK4e9ZLuTAKqWW03F9", // Daniel — tief, kontemplativ
    speed: 0.92,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  INSA: {
    voiceId: "FGY2WhTYpPnrIDTdsKH5", // Laura
    speed: 0.96,
    // v3 hält Laura auch bei "Natural"-Stability im Deutschen — der
    // alte v2-Trick mit stability 0.85 war ein Workaround für v2.
    settings: { stability: 0.5, similarity_boost: 0.85, style: 0.15, use_speaker_boost: true },
  },
  MIKAEL: {
    voiceId: "nPczCjzI2devNBz1zQrb", // Brian — autoritär, ruhig
    speed: 0.85,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  PHILIPPE: {
    voiceId: "IKne3meq5aSn9XLyUdCD", // Charlie — jünger, freundlich
    speed: 1.05,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
  },
  SANITÄTER: {
    // Eric — sachlicher, mittlerer Männerton. Klar abgegrenzt vom
    // Erzähler (Callum). v3 "Natural" + leichter Stil.
    voiceId: "cjVigY5qzO86Huf0OWal",
    speed: 1.0,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  RADIO: {
    voiceId: "XrExE9yKIg1WjnnlVkGX", // Matilda — mystisch, weich
    speed: 0.92,
    settings: { stability: 0.5, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true },
  },
  SYSTEM: {
    // Bill — warmer, älterer Erzähler. Klingt im Deutschen deutlich
    // organischer als Callum (der auf kurzen Beschreibungen schnell
    // roboterhaft wirkt). Niedrigere Stability + höherer Style-Wert
    // geben der Lesung mehr Atem und Phrasierung.
    voiceId: "pqHfZKP75CvOlQylNhV4",
    speed: 0.9,
    settings: { stability: 0.35, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true },
  },
  RECEPTION: {
    voiceId: "Xb7hH8MSUJpSbSDYk0k2", // Alice — klar
    speed: 1.1,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  },
  MIRA: {
    voiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte — jung, neugierig
    speed: 1.08,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
  },
  BODO: {
    voiceId: "JBFqnCBsd6RMkjVDRZzb", // George — älter, knurrig
    speed: 0.88,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  HELKA: {
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily — ruhig, älter klingend
    speed: 0.92,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  ENNIS: {
    voiceId: "TX3LPaxmHKxFdv7VOQHJ", // Liam — junger Mann, leicht nervös
    speed: 1.0,
    settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
  },
  STEGMANN: {
    voiceId: "iP95p4xoKVk53GoZ742B", // Chris — sachlich, nüchtern
    speed: 1.0,
    settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  },
  OKWU: {
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah — warm, mittlere Frauenstimme, Anfang 50
    speed: 1.0,
    settings: { stability: 0.5, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true },
  },
};

/** Currently playing audio element — cancelled before each new line. */
let currentAudio: HTMLAudioElement | null = null;
/** AbortController for in-flight TTS fetch — aborted on stop. */
let currentFetch: AbortController | null = null;
/** Resolves the promise returned by speak() when playback is stopped externally. */
let currentSpeechFinalizer: (() => void) | null = null;

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
function browserFallback(text: string, volume: number): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve();
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.volume = volume;
  return new Promise((resolve) => {
    let settled = false;
    const finalize = () => {
      if (settled) return;
      settled = true;
      if (currentSpeechFinalizer === finalize) currentSpeechFinalizer = null;
      resolve();
    };
    currentSpeechFinalizer = finalize;
    u.onend = () => finalize();
    u.onerror = () => finalize();
    synth.speak(u);
  });
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
      await browserFallback(cleaned, volume);
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    currentAudio = audio;
    await new Promise<void>((resolve) => {
      let settled = false;
      const finalize = () => {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(url);
        if (currentAudio === audio) currentAudio = null;
        if (currentSpeechFinalizer === finalize) currentSpeechFinalizer = null;
        resolve();
      };
      currentSpeechFinalizer = finalize;
      audio.onended = finalize;
      audio.onerror = finalize;
      void audio.play().catch((err) => {
        console.warn("Audio playback failed:", err);
        finalize();
      });
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    console.warn("speak() failed, using browser fallback:", err);
    await browserFallback(cleaned, volume);
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
  if (currentSpeechFinalizer) {
    const finalize = currentSpeechFinalizer;
    currentSpeechFinalizer = null;
    finalize();
  }
}

/** No-op kept for backwards-compatibility (used to warm up browser voices). */
export function preloadVoices() {
  /* no longer needed — ElevenLabs voices are server-side */
}