import type { ChatMsg, LlmContext, LlmRuntime } from "./runtime";
import { supabase } from "@/integrations/supabase/client";

// Globaler Hook für UI-Side-Effects (Spenden-Modal triggern, Counter aktualisieren).
export type CloudUsageEvent = {
  count: number | null;
  limit: number;
  softLimit: number;
  unlocked: boolean;
};

const usageListeners = new Set<(e: CloudUsageEvent) => void>();
export function onCloudUsage(cb: (e: CloudUsageEvent) => void): () => void {
  usageListeners.add(cb);
  return () => usageListeners.delete(cb);
}
function emitUsage(e: CloudUsageEvent) {
  for (const cb of usageListeners) {
    try {
      cb(e);
    } catch {
      /* ignore */
    }
  }
}

export type CloudErrorEvent = {
  code: "donation_required" | "auth_required" | "other";
  message: string;
};
const errorListeners = new Set<(e: CloudErrorEvent) => void>();
export function onCloudError(cb: (e: CloudErrorEvent) => void): () => void {
  errorListeners.add(cb);
  return () => errorListeners.delete(cb);
}
function emitError(e: CloudErrorEvent) {
  for (const cb of errorListeners) {
    try {
      cb(e);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Cloud-Runtime: schickt den Chat-Verlauf an unsere Server-Route
 * /api/public/npc-chat, die ihrerseits den Lovable AI Gateway anruft.
 * Der API-Key bleibt strikt server-seitig.
 */
export function createCloudRuntime(npcId: string): LlmRuntime {
  return {
    status: { kind: "cloud", ready: true },
    async send(messages, opts) {
      const history = messages.filter((m) => m.role !== "system");
      const last = history[history.length - 1];
      if (!last || last.role !== "user") {
        throw new Error("Letzte Nachricht muss vom Spieler stammen.");
      }
      const priorHistory = history.slice(0, -1).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // User-Token mitsenden, damit der Server den Counter pro Account führt.
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        emitError({
          code: "auth_required",
          message: "Bitte melde dich an, um den Cloud-Chat zu nutzen.",
        });
        throw new Error("Bitte melde dich an, um den Cloud-Chat zu nutzen.");
      }

      const ctx: LlmContext | undefined = opts?.context;
      // Server baut den System-Prompt selbst — wir schicken nur
      // typisierte Felder, keinen Freitext.
      const ctxPayload = ctx
        ? ctx.kind === "persona"
          ? {
              sceneTitle: ctx.sceneTitle,
              resonance: ctx.resonance,
              activeFlags: ctx.activeFlags,
              playedDialogIds: ctx.playedDialogIds,
            }
          : { seatedCount: ctx.seatedCount, myShift: ctx.myShift }
        : {};
      const resp = await fetch("/api/public/npc-chat", {
        method: "POST",
        signal: opts?.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          npcId,
          context: ctxPayload,
          history: priorHistory,
          userMessage: last.content,
        }),
      });

      if (!resp.ok) {
        let err = `HTTP ${resp.status}`;
        let code: string | undefined;
        try {
          const j = (await resp.json()) as { error?: string; code?: string };
          if (j?.error) err = j.error;
          if (j?.code) code = j.code;
        } catch {
          /* ignore */
        }
        if (resp.status === 429) {
          throw new Error(
            "Zu viele Anfragen. Versuch es in einer Minute noch einmal.",
          );
        }
        if (resp.status === 402) {
          if (code === "donation_required") {
            emitError({ code: "donation_required", message: err });
          }
          throw new Error(
            err || "Cloud-Limit erreicht. Bitte spenden, um weiter zu chatten.",
          );
        }
        throw new Error(err);
      }
      const data = (await resp.json()) as {
        reply?: string;
        count?: number | null;
        limit?: number;
        softLimit?: number;
        unlocked?: boolean;
      };
      if (!data.reply) throw new Error("Leere Antwort vom Server.");
      if (typeof data.limit === "number" && typeof data.softLimit === "number") {
        emitUsage({
          count: data.count ?? null,
          limit: data.limit,
          softLimit: data.softLimit,
          unlocked: !!data.unlocked,
        });
      }
      return data.reply;
    },
  };
}