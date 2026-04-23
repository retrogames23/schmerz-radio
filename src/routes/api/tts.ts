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

// Allowlist of voice IDs we actually use (from src/audio/speech.ts).
const ALLOWED_VOICE_IDS = new Set([
  "onwK4e9ZLuTAKqWW03F9",
  "EXAVITQu4vr4xnSDxMaL",
  "nPczCjzI2devNBz1zQrb",
  "IKne3meq5aSn9XLyUdCD",
  "bIHbv24MWmeRgasZH58o",
  "XrExE9yKIg1WjnnlVkGX",
  "CwhRBWXzGAHq8TQ4Fs17",
  "Xb7hH8MSUJpSbSDYk0k2",
  "XB0fDUnXU5powFXDhCwa",
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

        // ── Same-origin guard: reject obvious cross-origin abuse ─────
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");
        if (origin && host) {
          try {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
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

        let body: { voiceId?: string; text?: string; pitch?: number; speed?: number };
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

        // ── Server-side cache lookup (Lovable Cloud Storage) ────────
        // Every unique (voiceId, speed, text) is only generated once
        // and reused across ALL players from then on.
        const cacheKey = hashKey(voiceId, String(speed), text);
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
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.55,
                similarity_boost: 0.8,
                style: 0.35,
                use_speaker_boost: true,
                speed,
              },
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