import { supabase } from "@/integrations/supabase/client";
import md5 from "blueimp-md5";

/**
 * Schichtnummer pro Browser-Session — bleibt während der Session stabil,
 * damit Mitspieler einen wiedererkennbaren „Layard · Schicht 23" sehen.
 */
export function getShiftNumber(): number {
  if (typeof window === "undefined") return 1;
  const k = "e67.pub.shiftNumber";
  const cached = window.sessionStorage.getItem(k);
  if (cached) {
    const n = Number.parseInt(cached, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // 2..99 — niemals 1, das wäre zu „besonders".
  const n = 2 + Math.floor(Math.random() * 98);
  window.sessionStorage.setItem(k, String(n));
  return n;
}

export function getDisplayName(opts: {
  user: { id?: string | null; email?: string | null; is_anonymous?: boolean | null } | null;
  shiftNumber: number;
}): string {
  const { user, shiftNumber } = opts;
  // Authentifizierte Spieler bekommen ein stabiles, pseudonymes Nickname
  // (gleiches Format wie der DB-Trigger `enforce_pub_chat_identity`), damit
  // KEIN E-Mail-Local-Part über den Realtime-Presence-Channel leakt.
  if (user && !user.is_anonymous && user.id) {
    return `Bewohner-${md5(user.id).slice(0, 4).toUpperCase()}`;
  }
  return `Layard · Schicht ${shiftNumber}`;
}

/**
 * Stellt sicher, dass eine Auth-Session existiert. Hat der Spieler keinen
 * Account, wird stillschweigend eine anonyme Session angelegt.
 */
export async function ensureAuthSession(): Promise<{
  userId: string;
  isAnonymous: boolean;
  email: string | null;
} | null> {
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user) {
    const u = existing.session.user;
    return {
      userId: u.id,
      isAnonymous: !!u.is_anonymous,
      email: u.email ?? null,
    };
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.error("Anonymous sign-in failed", error);
    return null;
  }
  return {
    userId: data.user.id,
    isAnonymous: true,
    email: null,
  };
}