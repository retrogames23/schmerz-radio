import { createFileRoute } from "@tanstack/react-router";

/**
 * Quartals-Check: Ist GPT-6 Luna noch das beste Modell für uns?
 * Wird per pg_cron alle drei Monate aufgerufen. Läuft höchstens einmal
 * in 60 Tagen (Kostenbremse, da der Bearer-Token öffentlich ist) und
 * speichert das Ergebnis in llm_quarterly_reports.
 */
const CURRENT_MODEL = "openai/gpt-6-luna";
const MIN_INTERVAL_DAYS = 60;
const MAX_CANDIDATES = 5;

const TEST_PROMPT = `Du bist Tjark, Spielleiter einer DSA3-Runde (Das Schwarze Auge, Aventurien). Antworte ausschließlich auf Deutsch.
Format: Erzählung in [TJARK]-Absätzen, direkte Rede von Gefährte Brem in eigenem [BREM]-Absatz. Wenn eine Probe nötig ist, setze genau einen Marker [CHECK: Talent | Modifikator].
Szene: Die Heldin, eine Kriegerin, steht im nächtlichen Gareth vor einem Büttel, der ihr den Zugang zum Praios-Tempel verwehrt. Sie sagt: "Ich versuche, ihn zu überreden."
Beende mit einer offenen Frage an die Spielerin. Maximal 150 Wörter.`;

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function scoreReply(text: string) {
  const checks = {
    tjarkTag: /\[TJARK\]/.test(text),
    checkMarker: /\[CHECK:[^\]]+\]/.test(text),
    noForeignScript: !/[\u0E00-\u0E7F\u0600-\u06FF\u0590-\u05FF\u0400-\u04FF\u0900-\u097F\u4E00-\u9FFF]/.test(text),
    noDndTerms: !/\b(Hit ?Points|Dungeon Master|Rettungswurf|Trefferwürfel|d20)\b/i.test(text),
    germanUmlauts: /[äöüß]/.test(text),
    endsWithQuestion: /\?\s*$/.test(text.trim()),
    lengthOk: text.split(/\s+/).length <= 220,
  };
  const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length;
  return { score: Math.round(score * 100), checks };
}

type OrModel = { id: string; name?: string; context_length?: number; pricing?: { prompt?: string; completion?: string }; created?: number };

export const Route = createFileRoute("/api/public/hooks/llm-benchmark")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return json(500, { error: "OpenRouter nicht konfiguriert." });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const since = new Date(Date.now() - MIN_INTERVAL_DAYS * 86400_000).toISOString();
        const { data: recent } = await supabaseAdmin
          .from("llm_quarterly_reports").select("id").gte("created_at", since).limit(1);
        if (recent && recent.length) return json(200, { skipped: true, reason: "recent report exists" });

        const modelsRes = await fetch("https://openrouter.ai/api/v1/models");
        const models = ((await modelsRes.json()) as { data: OrModel[] }).data ?? [];
        const price = (m: OrModel) => Number(m.pricing?.prompt ?? "0") * 1e6;
        const outPrice = (m: OrModel) => Number(m.pricing?.completion ?? "0") * 1e6;
        const current = models.find((m) => m.id === CURRENT_MODEL);
        const maxIn = current ? price(current) * 3 : 0.5;

        // Kandidaten: große Anbieter, kein Free-Tier, Preis bis 3× Luna, neueste zuerst.
        const candidates = models
          .filter((m) => /^(openai|google|anthropic|mistralai|deepseek|qwen|meta-llama|x-ai)\//.test(m.id))
          .filter((m) => m.id !== CURRENT_MODEL && !m.id.endsWith(":free"))
          .filter((m) => price(m) > 0 && price(m) <= maxIn && (m.context_length ?? 0) >= 64000)
          .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
          .slice(0, MAX_CANDIDATES);

        const testIds = [CURRENT_MODEL, ...candidates.map((c) => c.id)];
        const results = [];
        for (const id of testIds) {
          const m = models.find((x) => x.id === id);
          const t0 = Date.now();
          try {
            const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://schmerz-radio.com",
                "X-Title": "Schmerz-Radio LLM Quartals-Check",
              },
              body: JSON.stringify({ model: id, messages: [{ role: "user", content: TEST_PROMPT }], max_tokens: 500 }),
              signal: AbortSignal.timeout(45_000),
            });
            const body = (await r.json()) as { choices?: { message?: { content?: string } }[] };
            const text = body.choices?.[0]?.message?.content ?? "";
            results.push({
              model: id,
              priceIn: m ? price(m) : null,
              priceOut: m ? outPrice(m) : null,
              latencyMs: Date.now() - t0,
              ...scoreReply(text),
              sample: text.slice(0, 1200),
            });
          } catch (e) {
            results.push({ model: id, error: String(e), latencyMs: Date.now() - t0, score: 0 });
          }
        }

        const base = results[0];
        const better = results
          .slice(1)
          .filter((r) => r.score > base.score || (r.score === base.score && (r.priceOut ?? 99) < (base.priceOut ?? 0) * 0.7))
          .sort((a, b) => b.score - a.score);
        const recommendation = better.length
          ? `Prüfenswert: ${better[0].model} (Score ${better[0].score} vs. Luna ${base.score}). Bitte manuell im Abenteuer testen.`
          : `GPT-6 Luna bleibt die beste Wahl (Score ${base.score}).`;

        await supabaseAdmin.from("llm_quarterly_reports").insert({ current_model: CURRENT_MODEL, recommendation, results });
        return json(200, { ok: true, recommendation, tested: testIds.length });
      },
    },
  },
});
