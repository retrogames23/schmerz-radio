/**
 * Server-only Helper: embedded eine Spielerfrage und holt die ähnlichsten
 * Regelpassagen aus der pgvector-Tabelle `dsa_rulebook_chunks` (gespeist
 * aus dem DSA3-Grundregelwerk-PDF).
 *
 * Nur aus Server-Function-/Route-Handlern aufrufen — verwendet
 * `supabaseAdmin` (Service-Role) und `LOVABLE_API_KEY`.
 */

const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings";

async function embedQuery(query: string): Promise<number[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetch(EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: query }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`embed failed ${r.status}: ${txt.slice(0, 200)}`);
  }
  const data = (await r.json()) as { data?: Array<{ embedding?: number[] }> };
  const emb = data.data?.[0]?.embedding;
  if (!Array.isArray(emb)) throw new Error("embed: no vector in response");
  return emb;
}

export type RulebookHit = {
  source: string;
  page_start: number;
  page_end: number;
  content: string;
  similarity: number;
};

/**
 * Sucht im Regelwerk die top-`k` Passagen zu `query`.
 * Gibt einen für das LLM lesbaren Block zurück (oder Hinweistext, wenn nichts gefunden).
 */
export async function searchDsaRulebook(
  query: string,
  k: number = 4,
): Promise<string> {
  const trimmed = query.trim();
  if (!trimmed) return "Leere Anfrage. Stelle eine konkrete Regel-Frage.";
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let embedding: number[];
  try {
    embedding = await embedQuery(trimmed.slice(0, 2000));
  } catch (e) {
    console.error("[dsaRulebook] embed failed", e);
    return "Regelwerk-Lookup nicht verfügbar (Embedding-Fehler).";
  }
  const { data, error } = await supabaseAdmin.rpc("match_dsa_rulebook", {
    query_embedding: embedding as unknown as string,
    match_count: Math.max(1, Math.min(k, 8)),
    source_filter: null,
  });
  if (error) {
    console.error("[dsaRulebook] rpc error", error);
    return "Regelwerk-Lookup nicht verfügbar (DB-Fehler).";
  }
  const hits = (data ?? []) as RulebookHit[];
  if (hits.length === 0) {
    return "Keine passende Stelle im Regelwerk gefunden.";
  }
  const blocks = hits.map((h, i) => {
    const score = (h.similarity * 100).toFixed(0);
    const pages =
      h.page_start === h.page_end
        ? `S. ${h.page_start}`
        : `S. ${h.page_start}–${h.page_end}`;
    return `[#${i + 1} ${pages} · sim ${score}%]\n${h.content.trim()}`;
  });
  return [
    `REGELWERK-AUSZUG (DSA3 Grundregeln, eigene Worte zusammenfassen, NIE wörtlich zitieren):`,
    "",
    blocks.join("\n\n---\n\n"),
  ].join("\n");
}