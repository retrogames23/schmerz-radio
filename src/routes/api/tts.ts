import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * ElevenLabs Text-to-Speech proxy.
 * Receives { voiceId, text } and returns the MP3 bytes.
 * Keeps ELEVENLABS_API_KEY server-side.
 *
 * The game is playable without login, so this endpoint is public.
 * Abuse is mitigated by:
 *   - Same-origin check (rejects requests from foreign sites)
 *   - Strict input validation (voiceId allowlist, text length cap)
 *   - In-memory per-IP rate limit
 *   - Long-lived response cache (lines are reused across players)
 *
 * Generated audio is additionally persisted to a public Lovable Cloud storage
 * bucket (`tts-cache`) so every line is only ever paid for ONCE across all
 * players — subsequent requests for the same voice+text are served from
 * storage without hitting ElevenLabs.
 */

const TTS_BUCKET = "tts-cache";

/** Stable, short hash for arbitrary strings (FNV-1a 32-bit hex). Mirrors client. */
function hashKey(...parts: string[]): string {
  const s = parts.join("\u0001");
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ── Deutsche Zahlen-Normalisierung für TTS ────────────────────────
// ElevenLabs spricht „E67“, „104,6“, „2613“ oder „B-3a“ in der Regel
// englisch oder ziffernweise aus („ee six seven“). Wir schreiben die
// häufigsten Muster im Spiel vor der TTS-Anfrage so um, dass deutsche
// Aussprache zuverlässig getroffen wird. Kommt eine Variante hier nicht
// vor, fällt der Text unverändert durch.

const ONES = [
  "null", "eins", "zwei", "drei", "vier", "fünf",
  "sechs", "sieben", "acht", "neun",
] as const;
const TEENS = [
  "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn",
  "sechzehn", "siebzehn", "achtzehn", "neunzehn",
] as const;
const TENS = [
  "", "", "zwanzig", "dreißig", "vierzig", "fünfzig",
  "sechzig", "siebzig", "achtzig", "neunzig",
] as const;

/** 0–99 als deutsches Wort. */
function germanUnder100(n: number): string {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const t = Math.floor(n / 10);
  const o = n % 10;
  if (o === 0) return TENS[t];
  // „einundzwanzig“ — Eins wird hier zu „ein“.
  const onesWord = o === 1 ? "ein" : ONES[o];
  return `${onesWord}und${TENS[t]}`;
}

/** 0–999 als deutsches Wort (ohne Million etc. — reicht für Sektorennamen). */
function germanUnder1000(n: number): string {
  if (n < 100) return germanUnder100(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hundredPart = h === 1 ? "einhundert" : `${ONES[h]}hundert`;
  return rest === 0 ? hundredPart : `${hundredPart}${germanUnder100(rest)}`;
}

/**
 * 4-stellige „Wohnungs-Nummer“ wie 2613 wird im Spiel als „sechsundzwanzig
 * dreizehn“ gelesen — nicht „zweitausend…“. Wir splitten in zwei 2-stellige
 * Blöcke, was für 4-stellige Codes natürlich klingt.
 */
function germanFourDigitCode(n: number): string {
  const a = Math.floor(n / 100);
  const b = n % 100;
  if (b === 0) return `${germanUnder100(a)}hundert`;
  return `${germanUnder100(a)} ${germanUnder100(b)}`;
}

/** Buchstabe → ausgeschriebenes deutsches Buchstabieralphabet (für „E71“ etc.). */
function germanLetter(ch: string): string {
  const map: Record<string, string> = {
    A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H",
    I: "I", J: "Jot", K: "Ka", L: "L", M: "M", N: "N", O: "O", P: "P",
    Q: "Ku", R: "R", S: "S", T: "T", U: "U", V: "Vau", W: "W",
    X: "X", Y: "Ypsilon", Z: "Z",
  };
  return map[ch.toUpperCase()] ?? ch;
}

/**
 * Schreibt Codes/Zahlen im Eingabetext für deutsche TTS um.
 * - „E67“ / „E71-Süd“      → „E siebenundsechzig“ / „E einundsiebzig-Süd“
 * - „2613“, „2615“ etc.    → „sechsundzwanzig dreizehn“
 * - „104,6“                → „hundertvier Komma sechs“
 * - „B-3a“                 → „B drei a“
 * - „Korridor 15“          → „Korridor fünfzehn“
 * Alles andere bleibt unangetastet.
 */
export function normalizeForGermanTTS(input: string): string {
  let out = input;

  // 1) Sektorcodes: ein einzelner Großbuchstabe + Zahl, z. B. E67, B12.
  //    Wir behandeln nur 1–3-stellige Folgen, damit 4-stellige Wohnungs-
  //    nummern (2613) unten von der eigenen Regel erfasst werden.
  out = out.replace(/\b([A-ZÄÖÜ])(\d{1,3})\b/g, (_, letter: string, digits: string) => {
    return `${germanLetter(letter)} ${germanUnder1000(parseInt(digits, 10))}`;
  });

  // 2) Code mit Bindestrich: „B-3a“, „B-3“, „B-12c“.
  out = out.replace(
    /\b([A-ZÄÖÜ])-(\d{1,3})([a-zäöü])?\b/g,
    (_, letter: string, digits: string, suffix?: string) => {
      const head = `${germanLetter(letter)} ${germanUnder1000(parseInt(digits, 10))}`;
      return suffix ? `${head} ${suffix}` : head;
    },
  );

  // 3) Dezimalzahl mit Komma: „104,6“ → „hundertvier Komma sechs“.
  //    Der Nachkomma-Anteil wird ziffernweise vorgelesen, was bei
  //    Frequenzangaben (wie 104,6) genau dem üblichen Sprachgebrauch
  //    entspricht.
  out = out.replace(/\b(\d{1,4}),(\d{1,3})\b/g, (_, intPart: string, frac: string) => {
    const intWord = germanUnder1000(parseInt(intPart, 10));
    const fracWord = frac
      .split("")
      .map((d) => ONES[parseInt(d, 10)])
      .join(" ");
    return `${intWord} Komma ${fracWord}`;
  });

  // 4) 4-stellige Wohnungs-/Türnummern (2611, 2613, 2615 …): in zwei
  //    Blöcken sprechen.
  out = out.replace(/\b(\d{4})\b/g, (_, num: string) => {
    return germanFourDigitCode(parseInt(num, 10));
  });

  // 5) Übrige 1–3-stellige Zahlen ausschreiben (Korridor 15, 36, …).
  //    Erst nach den vorigen Regeln, damit z. B. „67“ in „E67“ schon
  //    konsumiert wurde.
  out = out.replace(/\b(\d{1,3})\b/g, (_, num: string) => {
    return germanUnder1000(parseInt(num, 10));
  });

  return out;
}

// Allowlist of voice IDs we actually use (from src/audio/speech.ts).
const ALLOWED_VOICE_IDS = new Set([
  "onwK4e9ZLuTAKqWW03F9",
  "EXAVITQu4vr4xnSDxMaL",
  "FGY2WhTYpPnrIDTdsKH5", // Laura — Insa
  "nPczCjzI2devNBz1zQrb",
  "IKne3meq5aSn9XLyUdCD",
  "bIHbv24MWmeRgasZH58o",
  "N2lVS1w4EtoT3dr4eOWO", // Callum — Sanitäter
  "XrExE9yKIg1WjnnlVkGX",
  "CwhRBWXzGAHq8TQ4Fs17",
  "Xb7hH8MSUJpSbSDYk0k2",
  "XB0fDUnXU5powFXDhCwa",
  "TX3LPaxmHKxFdv7VOQHJ", // Liam — Ennis
  "iP95p4xoKVk53GoZ742B", // Chris — Stegmann
  // TV-Sender-Sprecher (Teleempfänger)
  "JBFqnCBsd6RMkjVDRZzb", // George — BV-Aktuell, älter & paternalistisch
  "pFZP5JQG7iQjIQuC4Bku", // Lily — Reserve / Wetter-Alternative
]);

// Naive in-memory rate limiter (per worker instance).
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60; // 60 lines/minute/IP — well above normal play
const ipHits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    ipHits.set(ip, arr);
    return true;
  }
  arr.push(now);
  ipHits.set(ip, arr);
  return false;
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // ── Origin guard: nur offensichtliche Cross-Origin-Aufrufe blocken.
        // Im Lovable Preview/Worker stimmt `host` (interner Worker-Host) nicht
        // immer mit dem Browser-Origin (z. B. *.lovableproject.com) überein,
        // ein strikter Vergleich produziert daher false positives. Wir lassen
        // bekannte Lovable-/lokale Hosts immer zu, ohne Origin-Header (z. B.
        // server-to-server oder gleicher Origin) ebenfalls. Missbrauchsschutz
        // läuft über voiceId-Allowlist, Längenlimit und Rate-Limit.
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            const originHost = new URL(origin).host;
            const allowed =
              originHost === request.headers.get("host") ||
              /\.lovable\.app$/.test(originHost) ||
              /\.lovableproject\.com$/.test(originHost) ||
              /\.lovable\.dev$/.test(originHost) ||
              originHost === "localhost" ||
              originHost.startsWith("localhost:") ||
              originHost.startsWith("127.0.0.1");
            if (!allowed) {
              return new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
              });
            }
          } catch {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
        }

        // ── Per-IP rate limit ───────────────────────────────────────
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(ip)) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded" }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }

        let body: {
          voiceId?: string;
          text?: string;
          pitch?: number;
          speed?: number;
          settings?: {
            stability?: number;
            similarity_boost?: number;
            style?: number;
            use_speaker_boost?: boolean;
          };
        };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const voiceId = body.voiceId;
        const text = body.text;
        if (!voiceId || typeof voiceId !== "string" || !ALLOWED_VOICE_IDS.has(voiceId)) {
          return new Response(JSON.stringify({ error: "Invalid voiceId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (!text || typeof text !== "string" || text.length === 0 || text.length > 2000) {
          return new Response(JSON.stringify({ error: "Invalid text (1-2000 chars)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const speed = typeof body.speed === "number"
          ? Math.max(0.7, Math.min(1.2, body.speed))
          : 1.0;

        // Per-Sprecher voice_settings (optional). Wir clampen jeden Wert
        // in die ElevenLabs-Range [0,1], damit kaputter Input keine
        // 400er-Antwort produziert.
        const reqSettings = body.settings ?? {};
        const clamp01 = (v: unknown, fb: number) =>
          typeof v === "number" && Number.isFinite(v)
            ? Math.max(0, Math.min(1, v))
            : fb;
        const voiceSettings = {
          stability: clamp01(reqSettings.stability, 0.55),
          similarity_boost: clamp01(reqSettings.similarity_boost, 0.8),
          style: clamp01(reqSettings.style, 0.35),
          use_speaker_boost:
            typeof reqSettings.use_speaker_boost === "boolean"
              ? reqSettings.use_speaker_boost
              : true,
          speed,
        };

        // Vor dem Senden: deutschen Aussprache-Fix anwenden. Sektorcodes,
        // Wohnungsnummern, Frequenzen werden zu deutschen Wörtern, damit
        // ElevenLabs sie korrekt liest.
        const ttsText = normalizeForGermanTTS(text);

        // ── Server-side cache lookup (Lovable Cloud Storage) ────────
        // Every unique (voiceId, speed, text) is only generated once
        // and reused across ALL players from then on.
        // Cache-Key auf dem normalisierten Text — sonst würde ein alter
        // (falsch ausgesprochener) Cache-Eintrag den neuen Fix maskieren.
        // Settings sind Teil des Keys: Insa mit style:0 darf nicht den
        // alten style:0.35-Cache treffen.
        const settingsKey = JSON.stringify(voiceSettings);
        const cacheKey = hashKey(voiceId, String(speed), settingsKey, "v3", ttsText);
        const objectPath = `${cacheKey}.mp3`;

        try {
          const { data: cached } = await supabaseAdmin.storage
            .from(TTS_BUCKET)
            .download(objectPath);
          if (cached) {
            const buf = await cached.arrayBuffer();
            return new Response(buf, {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-TTS-Cache": "hit",
              },
            });
          }
        } catch {
          // Miss or transient storage error — fall through to ElevenLabs.
        }

        const elResp = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: ttsText,
              model_id: "eleven_multilingual_v2",
              voice_settings: voiceSettings,
            }),
          },
        );

        if (!elResp.ok) {
          const errText = await elResp.text();
          // Log details server-side only; never forward upstream provider
          // internals (rate-limit info, plan tier, model errors) to clients.
          console.error("ElevenLabs TTS failed", elResp.status, errText);
          let userMessage = "TTS service temporarily unavailable";
          if (elResp.status === 429) userMessage = "Rate limit exceeded, please try again later";
          else if (elResp.status === 400) userMessage = "Invalid TTS request";
          else if (elResp.status === 401 || elResp.status === 403)
            userMessage = "TTS service authentication failed";
          return new Response(
            JSON.stringify({ error: userMessage }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }

        const audio = await elResp.arrayBuffer();

        // Persist to Cloud Storage so future requests (from ANY player)
        // skip ElevenLabs. Fire-and-forget; do not block the response.
        void supabaseAdmin.storage
          .from(TTS_BUCKET)
          .upload(objectPath, audio, {
            contentType: "audio/mpeg",
            cacheControl: "31536000",
            upsert: false,
          })
          .then(({ error }) => {
            if (error && !/already exists|duplicate/i.test(error.message)) {
              console.warn("TTS cache upload failed:", error.message);
            }
          });

        return new Response(audio, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-TTS-Cache": "miss",
          },
        });
      },
    },
  },
});