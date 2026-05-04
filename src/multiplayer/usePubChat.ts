import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PubChatMessage {
  id: string;
  createdAt: string;
  userId: string;
  displayName: string;
  seatIndex: number | null;
  shiftNumber: number | null;
  text: string;
  isAnonymous: boolean;
}

const MESSAGE_LIMIT = 50;
const SEND_COOLDOWN_MS = 1500;

export function usePubChat(active: boolean) {
  const [messages, setMessages] = useState<PubChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastSendRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      const { data, error: e } = await supabase
        .from("pub_chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(MESSAGE_LIMIT);
      if (cancelled) return;
      if (e) {
        setError(e.message);
        return;
      }
      setMessages(
        (data ?? [])
          .map(toMsg)
          .reverse(),
      );
    })();

    const ch = supabase
      .channel("pub-chat-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pub_chat_messages" },
        (payload) => {
          const m = toMsg(payload.new as Parameters<typeof toMsg>[0]);
          setMessages((prev) => {
            if (prev.some((p) => p.id === m.id)) return prev;
            const next = [...prev, m];
            if (next.length > MESSAGE_LIMIT * 2) next.splice(0, next.length - MESSAGE_LIMIT);
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(ch);
    };
  }, [active]);

  async function send(args: {
    userId: string;
    displayName: string;
    seatIndex: number | null;
    shiftNumber: number;
    text: string;
    isAnonymous: boolean;
  }): Promise<{ ok: boolean; error?: string }> {
    const text = args.text.trim();
    if (!text) return { ok: false, error: "Leer." };
    if (text.length > 240) return { ok: false, error: "Zu lang (max 240 Zeichen)." };
    const now = Date.now();
    if (now - lastSendRef.current < SEND_COOLDOWN_MS) {
      return { ok: false, error: "Langsamer." };
    }
    lastSendRef.current = now;
    const { error: e } = await supabase.from("pub_chat_messages").insert({
      user_id: args.userId,
      display_name: args.displayName,
      seat_index: args.seatIndex,
      shift_number: args.shiftNumber,
      text,
      is_anonymous: args.isAnonymous,
    });
    if (e) return { ok: false, error: e.message };
    return { ok: true };
  }

  return { messages, error, send };
}

function toMsg(row: {
  id: string;
  created_at: string;
  user_id: string;
  display_name: string;
  seat_index: number | null;
  shift_number: number | null;
  text: string;
  is_anonymous: boolean;
}): PubChatMessage {
  return {
    id: row.id,
    createdAt: row.created_at,
    userId: row.user_id,
    displayName: row.display_name,
    seatIndex: row.seat_index,
    shiftNumber: row.shift_number,
    text: row.text,
    isAnonymous: row.is_anonymous,
  };
}