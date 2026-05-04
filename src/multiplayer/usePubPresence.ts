import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAuthSession, getDisplayName, getShiftNumber } from "./identity";

export const PUB_MAX_SEATS = 5;

export interface PubOccupant {
  userId: string;
  displayName: string;
  shiftNumber: number;
  seatIndex: number | null;
  isAnonymous: boolean;
  joinedAt: number;
}

export interface PubPresenceState {
  ready: boolean;
  /** Alle Anwesenden inkl. Spieler ohne Sitzplatz. */
  occupants: PubOccupant[];
  /** Sitz-Slot-Belegung (5 Plätze, null = frei). */
  seats: (PubOccupant | null)[];
  /** Eigene Identität (sobald Auth fertig ist). */
  me: { userId: string; displayName: string; shiftNumber: number; isAnonymous: boolean } | null;
  /** Eigener Sitz-Index oder null. */
  mySeat: number | null;
  /** Versucht, Slot zu belegen. Liefert true, wenn erfolgreich. */
  takeSeat: (seatIndex: number) => Promise<boolean>;
  leaveSeat: () => Promise<void>;
  /** Komplett verlassen (z.B. beim Szenenwechsel). */
  disconnect: () => Promise<void>;
}

/**
 * Realtime-Presence für die Kneipe. Jeder Spieler tracked sich selbst
 * im Channel `pub-room`. Maximal 5 Sitze; Spieler ohne Sitz „stehen am
 * Eingang" und werden nicht mitgezählt.
 */
export function usePubPresence(active: boolean): PubPresenceState {
  const [ready, setReady] = useState(false);
  const [occupants, setOccupants] = useState<PubOccupant[]>([]);
  const [me, setMe] = useState<PubPresenceState["me"]>(null);
  const [mySeat, setMySeat] = useState<number | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const meRef = useRef<PubPresenceState["me"]>(null);
  meRef.current = me;
  const seatRef = useRef<number | null>(null);
  seatRef.current = mySeat;

  const track = useCallback(async (seatIndex: number | null) => {
    const ch = channelRef.current;
    const m = meRef.current;
    if (!ch || !m) return;
    await ch.track({
      userId: m.userId,
      displayName: m.displayName,
      shiftNumber: m.shiftNumber,
      isAnonymous: m.isAnonymous,
      seatIndex,
      joinedAt: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      const auth = await ensureAuthSession();
      if (!auth || cancelled) return;
      const shiftNumber = getShiftNumber();
      const displayName = getDisplayName({
        user: { email: auth.email, is_anonymous: auth.isAnonymous },
        shiftNumber,
      });
      const meVal = {
        userId: auth.userId,
        displayName,
        shiftNumber,
        isAnonymous: auth.isAnonymous,
      };
      setMe(meVal);
      meRef.current = meVal;

      const channel = supabase.channel("pub-room", {
        config: { presence: { key: auth.userId } },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PubOccupant[]>;
        const flat: PubOccupant[] = [];
        for (const arr of Object.values(state)) {
          if (arr.length > 0) flat.push(arr[0]!);
        }
        setOccupants(flat);
        // Eigenen Seat synchronisieren (falls anderer Tab uns überschreibt).
        const own = flat.find((o) => o.userId === auth.userId);
        if (own && own.seatIndex !== seatRef.current) {
          setMySeat(own.seatIndex);
        }
      });

      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await track(null);
          if (!cancelled) setReady(true);
        }
      });
    })();

    return () => {
      cancelled = true;
      const ch = channelRef.current;
      if (ch) {
        void ch.untrack().then(() => supabase.removeChannel(ch));
      }
      channelRef.current = null;
      setReady(false);
      setOccupants([]);
      setMySeat(null);
    };
  }, [active, track]);

  const takeSeat = useCallback(
    async (seatIndex: number) => {
      if (seatIndex < 0 || seatIndex >= PUB_MAX_SEATS) return false;
      // Schon belegt?
      const taken = occupants.some(
        (o) => o.seatIndex === seatIndex && o.userId !== meRef.current?.userId,
      );
      if (taken) return false;
      setMySeat(seatIndex);
      seatRef.current = seatIndex;
      await track(seatIndex);
      return true;
    },
    [occupants, track],
  );

  const leaveSeat = useCallback(async () => {
    setMySeat(null);
    seatRef.current = null;
    await track(null);
  }, [track]);

  const disconnect = useCallback(async () => {
    const ch = channelRef.current;
    if (ch) {
      await ch.untrack();
    }
  }, []);

  // Sitze in Slot-Array überführen (deterministisch).
  const seats: (PubOccupant | null)[] = Array.from(
    { length: PUB_MAX_SEATS },
    () => null,
  );
  for (const o of occupants) {
    if (o.seatIndex !== null && o.seatIndex >= 0 && o.seatIndex < PUB_MAX_SEATS) {
      seats[o.seatIndex] = o;
    }
  }

  return {
    ready,
    occupants,
    seats,
    me,
    mySeat,
    takeSeat,
    leaveSeat,
    disconnect,
  };
}

/**
 * Hilfs-Hook: zählt nur die Sitz-Belegung im Channel, ohne dem Channel
 * beizutreten. Wir nutzen ihn an der Kneipentür („voll?"-Anzeige).
 * Implementierung: kurz dem Channel beitreten, presence lesen, wieder raus.
 */
export async function readPubOccupancy(): Promise<{
  seatedCount: number;
  total: number;
}> {
  return new Promise((resolve) => {
    let resolved = false;
    const ch = supabase.channel("pub-room", {
      config: { presence: { key: `peek-${Math.random().toString(36).slice(2)}` } },
    });
    const cleanup = (seated: number, total: number) => {
      if (resolved) return;
      resolved = true;
      void supabase.removeChannel(ch);
      resolve({ seatedCount: seated, total });
    };
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState() as Record<string, PubOccupant[]>;
      let seated = 0;
      let total = 0;
      for (const arr of Object.values(state)) {
        const o = arr[0];
        if (!o) continue;
        // Peek-Einträge nicht mitzählen.
        if (!o.userId) continue;
        total += 1;
        if (o.seatIndex !== null && o.seatIndex !== undefined) seated += 1;
      }
      cleanup(seated, total);
    });
    void ch.subscribe();
    setTimeout(() => cleanup(0, 0), 2500);
  });
}