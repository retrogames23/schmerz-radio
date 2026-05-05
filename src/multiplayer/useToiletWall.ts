import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Graffiti {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
  colorIndex: number;
  displayName: string;
  isAnonymous: boolean;
  createdAt: string;
  expiresAt: string | null;
}

const WRITE_COOLDOWN_MS = 8000;

export function useToiletWall(active: boolean) {
  const [graffiti, setGraffiti] = useState<Graffiti[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastWriteRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    (async () => {
      const { data, error: e } = await supabase
        .from("toilet_graffiti")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (e) { setError(e.message); return; }
      setGraffiti((data ?? []).map(toG));
    })();
    const ch = supabase
      .channel("toilet-wall-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "toilet_graffiti" },
        (payload) => {
          const g = toG(payload.new as Parameters<typeof toG>[0]);
          setGraffiti((prev) => (prev.some((p) => p.id === g.id) ? prev : [g, ...prev]));
        },
      )
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(ch); };
  }, [active]);

  async function write(args: {
    userId: string;
    displayName: string;
    isAnonymous: boolean;
    text: string;
  }): Promise<{ ok: boolean; error?: string }> {
    const text = args.text.trim();
    if (!text) return { ok: false, error: "Leer." };
    if (text.length > 140) return { ok: false, error: "Zu lang (max 140 Zeichen)." };
    const now = Date.now();
    if (now - lastWriteRef.current < WRITE_COOLDOWN_MS) {
      const wait = Math.ceil((WRITE_COOLDOWN_MS - (now - lastWriteRef.current)) / 1000);
      return { ok: false, error: `Noch ${wait}s warten.` };
    }
    lastWriteRef.current = now;
    const { x, y } = pickSpot(graffiti);
    const rotation = -8 + Math.random() * 16;
    const colorIndex = Math.floor(Math.random() * 5);
    const { error: e } = await supabase.from("toilet_graffiti").insert({
      user_id: args.userId,
      display_name: args.displayName,
      text, x, y, rotation, color_index: colorIndex,
      is_anonymous: args.isAnonymous,
    });
    if (e) return { ok: false, error: e.message };
    return { ok: true };
  }

  return { graffiti, error, write };
}

// Wand-Fläche (in % der Bühne): links durch Rohr, oben durch Querrohr,
// rechts durch Wandende, unten durch Bodenkante begrenzt.
const WALL = { xMin: 24, xMax: 90, yMin: 16, yMax: 76 };

function pickSpot(existing: Graffiti[]): { x: number; y: number } {
  let best = { x: (WALL.xMin + WALL.xMax) / 2, y: (WALL.yMin + WALL.yMax) / 2 };
  let bestScore = -Infinity;
  for (let i = 0; i < 40; i++) {
    const cx = WALL.xMin + Math.random() * (WALL.xMax - WALL.xMin);
    const cy = WALL.yMin + Math.random() * (WALL.yMax - WALL.yMin);
    let minDist = Infinity;
    for (const g of existing) {
      const dx = g.x - cx;
      const dy = (g.y - cy) * 1.4; // y is shorter visually
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) minDist = d;
    }
    if (minDist > bestScore) {
      bestScore = minDist;
      best = { x: cx, y: cy };
    }
  }
  return best;
}

function toG(row: {
  id: string; text: string; x: number; y: number; rotation: number;
  color_index: number; display_name: string; is_anonymous: boolean;
  created_at: string; expires_at: string | null;
}): Graffiti {
  return {
    id: row.id, text: row.text, x: row.x, y: row.y, rotation: row.rotation,
    colorIndex: row.color_index, displayName: row.display_name,
    isAnonymous: row.is_anonymous, createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}