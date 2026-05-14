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
  | "OKWU"
  | "TJARK"
  | "BREM"
  | "YELVA"
  | "KOWALK"
  | "BRUST"
  | "VOSSBECK"
  | "BRAM"
  | "MARV"
  | "DETLEF"
  | "SIGI"
  | "RUVEN";


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
  // DSA-Runde im Gemeinschaftsraum — drei Jugendliche.
  TJARK: {
    // Liam — junger Mann, leicht förmlich (Spielleiter-Ton).
    voiceId: "TX3LPaxmHKxFdv7VOQHJ",
    speed: 0.98,
    settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  BREM: {
    // Charlie — jünger, schneller, schnoddrig.
    voiceId: "IKne3meq5aSn9XLyUdCD",
    speed: 1.1,
    settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
  },
  YELVA: {
    // Charlotte — junge Frau, ruhig, intelligent.
    voiceId: "XB0fDUnXU5powFXDhCwa",
    speed: 1.0,
    settings: { stability: 0.55, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
  },
  // Kantine 3602 — zwei Mitarbeiter:innen.
  KOWALK: {
    // Sarah — reife, warme Frauenstimme; pragmatisch, leicht müde.
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    speed: 0.95,
    settings: { stability: 0.55, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true },
  },
  BRUST: {
    // Callum — schmal, korrekt, etwas nervös. Bewusst anders als
    // Layards Daniel — höher und gespannter.
    voiceId: "N2lVS1w4EtoT3dr4eOWO",
    speed: 1.05,
    settings: { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true },
  },
  VOSSBECK: {
    // Tief, trocken, formal — der amtierende Bürokratiemeister. Gleiche
    // Voice-ID wie Stegmann (monotone Verwaltungsstimme), aber etwas
    // langsamer und stabiler — Vossbeck ist nicht nervös, sondern abschlie\u00dfend.
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    speed: 0.92,
    settings: { stability: 0.7, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
  },
  BRAM: {
    // Bram, der Wirt der Kneipe „Zum stillen Funk“ — abgewetzt, trocken,
    // ehemaliger Sektorenwart. Tiefe, leicht raue Männerstimme.
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    speed: 0.95,
    settings: { stability: 0.6, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
  },
  MARV: {
    // MARV-9, mechanischer Türsteher — alte Lautsprecher-Maske, leicht
    // verzerrt-blecherne Männerstimme. Wir nehmen Daniel (LAYARDs Voice)
    // als Basis, aber LANGSAMER und mit hoher Stability für müde,
    // melancholisch-trockene Lesung. Der „blecherne“ Effekt entsteht im
    // Browser zusätzlich durch den Audio-Filter (siehe playMarvFilter).
    voiceId: "onwK4e9ZLuTAKqWW03F9",
    speed: 0.82,
    settings: { stability: 0.75, similarity_boost: 0.7, style: 0.1, use_speaker_boost: true },
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

/**
 * Bevorzugte deutsche Browser-Stimmen für den Erzähler (SYSTEM), wenn
 * der ElevenLabs-Fallback greift. Wir nehmen bewusst weibliche, möglichst
 * "natural"/"neural" Stimmen, weil die deutlich weniger roboterhaft
 * klingen als die männlichen Default-Stimmen vieler OS.
 *
 * Reihenfolge = Priorität. Der erste Treffer (case-insensitive Substring)
 * gewinnt. Fallback ist die System-Default-Stimme für `de-DE`.
 */
const NARRATOR_FALLBACK_VOICE_HINTS = [
  // macOS / iOS — Premium/Enhanced sind die "natural"-Varianten
  "Anna (Premium)",
  "Anna (Enhanced)",
  "Petra (Premium)",
  "Petra (Enhanced)",
  "Helena (Premium)",
  "Helena (Enhanced)",
  // Windows / Edge "Online (Natural)"-Stimmen
  "Katja Online (Natural)",
  "Hedda Online (Natural)",
  "Amala Online (Natural)",
  // Google Chrome
  "Google Deutsch",
  // Plain-Varianten als letzter Ausweg
  "Anna",
  "Petra",
  "Helena",
  "Katja",
  "Hedda",
] as const;

function pickNarratorVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const german = voices.filter((v) => /^de(-|_)/i.test(v.lang));
  if (!german.length) return null;

  for (const hint of NARRATOR_FALLBACK_VOICE_HINTS) {
    const match = german.find((v) =>
      v.name.toLowerCase().includes(hint.toLowerCase()),
    );
    if (match) return match;
  }
  // Falls nichts auf der Wunschliste passt: erste deutsche Stimme nehmen,
  // die nach weiblichem Namen klingt — sonst irgendeine deutsche Stimme.
  const female = german.find((v) =>
    /(anna|petra|helena|katja|hedda|amala|marlene|vicki|claudia|sabine|stefanie)/i.test(
      v.name,
    ),
  );
  return female ?? german[0] ?? null;
}

/** Browser-SpeechSynthesis fallback — only used if ElevenLabs request fails. */
function browserFallback(
  text: string,
  volume: number,
  speaker?: Speaker,
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve();
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.volume = volume;

  // Für den Erzähler eine möglichst natürliche deutsche Stimme wählen.
  // Andere Sprecher behalten die System-Default — die TTS-Stimmen sind
  // ohnehin der Normalfall, der Browser-Fallback nur ein Notnagel.
  if (speaker === "SYSTEM") {
    const voice = pickNarratorVoice();
    if (voice) {
      u.voice = voice;
      // Etwas langsamer + etwas tiefer, damit die Stimme erzählerischer
      // wirkt und weniger nach Navi-Ansage klingt.
      u.rate = 0.92;
      u.pitch = 0.95;
    }
  }

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
      await browserFallback(cleaned, volume, speaker);
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
    await browserFallback(cleaned, volume, speaker);
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

/**
 * Vorab die Browser-Stimmenliste initialisieren. Auf Chrome/Edge wird
 * `getVoices()` erst nach dem `voiceschanged`-Event befüllt; ohne Warm-up
 * würde der allererste Fallback noch keine deutsche Stimme finden und
 * auf den globalen Default zurückfallen (oft eine englische Roboter-
 * Stimme).
 */
export function preloadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  // Initial-Aufruf triggert das Laden auf Chrome/Edge.
  window.speechSynthesis.getVoices();
  // Manche Browser feuern `voiceschanged` einmalig nach dem ersten
  // Aufruf; ein No-op-Listener reicht, um die Liste warmzuhalten.
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}