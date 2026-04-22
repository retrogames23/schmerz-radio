/**
 * Browser SpeechSynthesis wrapper with a fixed voice per character.
 * German voices preferred; falls back to default voice.
 */

type Speaker = "LAYARD" | "INSA" | "PHILIPPE" | "SANITÄTER" | "SYSTEM" | "RADIO";

interface VoiceProfile {
  pitch: number;
  rate: number;
  /** Preference order for voice selection */
  prefer: Array<"male" | "female" | "any">;
}

const PROFILES: Record<Speaker, VoiceProfile> = {
  LAYARD: { pitch: 0.85, rate: 0.92, prefer: ["male"] },
  INSA: { pitch: 1.05, rate: 1.0, prefer: ["female"] },
  PHILIPPE: { pitch: 1.1, rate: 1.08, prefer: ["male"] },
  SANITÄTER: { pitch: 0.95, rate: 1.05, prefer: ["male"] },
  SYSTEM: { pitch: 0.7, rate: 0.95, prefer: ["any"] },
  RADIO: { pitch: 1.15, rate: 0.9, prefer: ["female"] },
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
  };
}

function pickVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
  const voices = getVoices();
  if (!voices.length) return null;
  const german = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  const pool = german.length ? german : voices;

  // Heuristic: name contains "male"/"female", or known German voice names
  const femaleHints = ["female", "anna", "petra", "katja", "marlene", "vicki", "hedda"];
  const maleHints = ["male", "stefan", "markus", "yannick", "conrad", "google deutsch"];

  for (const want of profile.prefer) {
    if (want === "any") return pool[0];
    const hints = want === "female" ? femaleHints : maleHints;
    const found = pool.find((v) => {
      const n = v.name.toLowerCase();
      return hints.some((h) => n.includes(h));
    });
    if (found) return found;
  }
  // Stable pseudo-assignment by speaker — different speakers get different voices
  return pool[0];
}

/** Stable voice assignment: cycle through pool so each speaker has a unique voice when possible. */
const speakerVoiceCache = new Map<Speaker, SpeechSynthesisVoice>();

function voiceFor(speaker: Speaker): SpeechSynthesisVoice | null {
  const cached = speakerVoiceCache.get(speaker);
  if (cached) return cached;
  const voices = getVoices();
  if (!voices.length) return null;

  const german = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));
  const pool = german.length ? german : voices;

  // First pass: hint-based pick
  const profile = PROFILES[speaker];
  const hinted = pickVoice(profile);

  // Avoid clashes: if another speaker already uses `hinted`, try a different one
  const used = new Set(Array.from(speakerVoiceCache.values()).map((v) => v.name));
  let chosen = hinted;
  if (chosen && used.has(chosen.name)) {
    const alternative = pool.find((v) => !used.has(v.name));
    if (alternative) chosen = alternative;
  }
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