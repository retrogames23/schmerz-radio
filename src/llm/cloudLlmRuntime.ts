import type { ChatMsg, LlmRuntime } from "./runtime";

/**
 * Cloud-Runtime: schickt den Chat-Verlauf an unsere Server-Route
 * /api/public/npc-chat, die ihrerseits den Lovable AI Gateway anruft.
 * Der API-Key bleibt strikt server-seitig.
 */
export function createCloudRuntime(npcId: string): LlmRuntime {
  return {
    status: { kind: "cloud", ready: true },
    async send(messages, opts) {
      const system = messages.find((m) => m.role === "system");
      const history = messages.filter((m) => m.role !== "system");
      const last = history[history.length - 1];
      if (!last || last.role !== "user") {
        throw new Error("Letzte Nachricht muss vom Spieler stammen.");
      }
      const priorHistory = history.slice(0, -1).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const resp = await fetch("/api/public/npc-chat", {
        method: "POST",
        signal: opts?.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npcId,
          systemPrompt: system?.content ?? "",
          history: priorHistory,
          userMessage: last.content,
        }),
      });

      if (!resp.ok) {
        let err = `HTTP ${resp.status}`;
        try {
          const j = (await resp.json()) as { error?: string };
          if (j?.error) err = j.error;
        } catch {
          /* ignore */
        }
        if (resp.status === 429) {
          throw new Error(
            "Zu viele Anfragen. Versuch es in einer Minute noch einmal.",
          );
        }
        if (resp.status === 402) {
          throw new Error(
            "Free-Mode-Kontingent erschöpft. Bitte später erneut versuchen.",
          );
        }
        throw new Error(err);
      }
      const data = (await resp.json()) as { reply?: string };
      if (!data.reply) throw new Error("Leere Antwort vom Server.");
      return data.reply;
    },
  };
}