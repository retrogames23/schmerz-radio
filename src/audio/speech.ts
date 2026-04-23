/**
 * Browser SpeechSynthesis wrapper with a fixed voice per character.
 * German voices preferred; falls back to default voice.
 */

type Speaker =
  | "LAYARD"
  | "INSA"
  | "PHILIPPE"
  | "SANITÄTER"
  | "SYSTEM"
  | "RADIO"
  | "MIKAEL"
  | "RECEPTION";

interface VoiceProfile {
  pitch: number;
  rate: number;
  /** Required gender — voice MUST match this. "any" allows fallback. */
  gender: "male" | "female" | "any";
}

const PROFILES: Record<Speaker, VoiceProfile> = {
  LAYARD: { pitch: 0.85, rate: 0.92, gender: "male" },
  INSA: { pitch: 1.05, rate: 1.0, gender: "female" },
  PHILIPPE: { pitch: 1.1, rate: 1.08, gender: "male" },
  SANITÄTER: { pitch: 0.95, rate: 1.05, gender: "male" },
  SYSTEM: { pitch: 0.7, rate: 0.95, gender: "any" },
  RADIO: { pitch: 1.15, rate: 0.9, gender: "female" },
  MIKAEL: { pitch: 0.7, rate: 0.78, gender: "male" },
  RECEPTION: { pitch: 1.0, rate: 1.15, gender: "female" },
};

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  if (cachedVoices && cachedVoices.length) return cachedVoices;
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    // Voice list arrived/changed — reset assignments so gender matching uses the full list.
    speakerVoiceCache.clear();
  };
}

// Voice-name heuristics (covers macOS, Windows, Chrome, Edge German voices).
const FEMALE_HINTS = [
  "female", "frau", "anna", "petra", "katja", "marlene", "vicki", "hedda",
  "helga", "steffi", "claudia", "eva", "google deutsch", // Google's "Deutsch" voice is typically female
];
const MALE_HINTS = [
  "male", "mann", "herr", "stefan", "markus", "yannick", "conrad",
  "michael", "thomas", "klaus", "hans",
];

function classifyVoice(v: SpeechSynthesisVoice): "male" | "female" | "unknown" {
  const n = v.name.toLowerCase();
  if (FEMALE_HINTS.some((h) => n.includes(h))) return "female";
  if (MALE_HINTS.some((h) => n.includes(h))) return "male";
  return "unknown";
}

function getPools(): {
  male: SpeechSynthesisVoice[];
  female: SpeechSynthesisVoice[];
  any: SpeechSynthesisVoice[];
} {
  const voices = getVoices();
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  const base = german.length ? german : voices;
  const male: SpeechSynthesisVoice[] = [];
  const female: SpeechSynthesisVoice[] = [];
  for (const v of base) {
    const g = classifyVoice(v);
    if (g === "male") male.push(v);
    else if (g === "female") female.push(v);
  }
  return { male, female, any: base };
}

/** Stable voice assignment per speaker. Guarantees gender match when possible. */
const speakerVoiceCache = new Map<Speaker, SpeechSynthesisVoice>();

function voiceFor(speaker: Speaker): SpeechSynthesisVoice | null {
  const cached = speakerVoiceCache.get(speaker);
  if (cached) return cached;
  const voices = getVoices();
  if (!voices.length) return null;

  const profile = PROFILES[speaker];
  const pools = getPools();

  // Determine which pool to draw from based on REQUIRED gender.
  let primary: SpeechSynthesisVoice[];
  if (profile.gender === "female") {
    // Prefer classified-female; if none, fall back to any voice NOT already used as male.
    primary = pools.female.length ? pools.female : pools.any;
  } else if (profile.gender === "male") {
    primary = pools.male.length ? pools.male : pools.any;
  } else {
    primary = pools.any;
  }

  // Avoid clashes within the same gender pool: pick first unused.
  const used = new Set(Array.from(speakerVoiceCache.values()).map((v) => v.name));
  const unused = primary.find((v) => !used.has(v.name));
  const chosen = unused ?? primary[0] ?? null;

  if (chosen) speakerVoiceCache.set(speaker, chosen);
  return chosen;
}

export function speak(speaker: Speaker, text: string, volume = 1) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  // Cancel previous line so we never overlap dialog
  synth.cancel();

  // Strip stage-direction-style brackets so TTS doesn't read symbols.
  const cleaned = text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[„"”]/g, "")
    .replace(/—/g, ", ")
    .replace(/…/g, "...")
    .trim();
  if (!cleaned) return;

  const u = new SpeechSynthesisUtterance(cleaned);
  const profile = PROFILES[speaker];
  u.lang = "de-DE";
  u.pitch = profile.pitch;
  u.rate = profile.rate;
  u.volume = volume;
  const v = voiceFor(speaker);
  if (v) u.voice = v;
  synth.speak(u);
}

export function stopSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

/** Warm up the voice list (Chrome lazy-loads it). */
export function preloadVoices() {
  getVoices();
}