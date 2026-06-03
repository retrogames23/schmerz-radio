import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DsaHostOverrideProvider,
  type DsaHostValue,
} from "@/game/dsa/DsaHostContext";
import type { DsaCharacterSummary } from "@/game/types";
import {
  loadSlotCharacter,
  saveSlotCharacter,
  loadSlotHero,
  saveSlotHero,
  slotSessionId,
  rotateSlotSessionId,
  setSlotSessionId,
  type SlotIndex,
} from "./slotStorage";
import { upgradeToHero } from "@/game/dsa/advancement";
import type { DsaHero } from "@/game/types";
import { useAuth } from "@/auth/AuthContext";
import {
  cloudFetchHero,
  cloudUpsertHero,
  cloudFetchActiveSessionId,
} from "./cloudHeroSync";

type View = "creator" | "adventure";

/**
 * Liefert den DSA-Host für einen einzelnen Standalone-Slot (1/2/3).
 * - Charakter persistiert in localStorage (`dsa.standalone.slot-N`).
 * - SessionId ist pro Slot stabil (`dsa-slot-N`), damit der Server
 *   pro Slot ein eigenes Abenteuer führt (skopiert nach user_id/anon_id).
 * - "Vom Tisch aufstehen" ruft `onExit()` → die Route navigiert zurück.
 */
export function StandaloneDsaHost({
  slot,
  onExit,
  onCharacterCreated,
  children,
}: {
  slot: SlotIndex;
  onExit: () => void;
  /**
   * Wird aufgerufen, sobald im Creator ein Held fertig unterschrieben
   * ist (statt direkt ins Solo-Abenteuer zu springen). Genutzt, wenn
   * der Standalone-Host aus dem Gruppen-Vorzimmer geöffnet wurde.
   */
  onCharacterCreated?: () => void;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [character, setCharacterState] = useState<DsaCharacterSummary | null>(
    () => loadSlotHero(slot) ?? loadSlotCharacter(slot),
  );
  const heroRef = useRef<DsaHero | null>(loadSlotHero(slot));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<View>(character ? "adventure" : "creator");
  // SessionId reaktiv halten, damit Konsument:innen (z. B. die
  // LLM-Scene) ein erneutes Laden auslösen, wenn nach dem Login die
  // Cloud-SessionId vom anderen Gerät übernommen wird.
  const [sessionId, setSessionIdState] = useState<string>(() => slotSessionId(slot));

  // Wenn der Slot wechselt (Navigation), Inhalt neu laden.
  useEffect(() => {
    const h = loadSlotHero(slot);
    heroRef.current = h;
    const c = h ?? loadSlotCharacter(slot);
    setCharacterState(c);
    setView(c ? "adventure" : "creator");
    setSheetOpen(false);
    setSessionIdState(slotSessionId(slot));
  }, [slot]);

  // Eingeloggt? Dann ist die Cloud die Wahrheit: Hero + laufende
  // Abenteuer-SessionId für diesen Slot vom Server hydrieren, lokalen
  // Cache überschreiben und ggf. die View neu wählen.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [cloudHero, activeSid] = await Promise.all([
        cloudFetchHero(slot),
        cloudFetchActiveSessionId(slot),
      ]);
      if (cancelled) return;
      if (activeSid) {
        setSlotSessionId(slot, activeSid);
        setSessionIdState(activeSid);
      }
      if (cloudHero) {
        heroRef.current = cloudHero;
        saveSlotHero(slot, cloudHero);
        setCharacterState(cloudHero);
        // Wenn der lokale Cache leer war, hatten wir den Creator offen
        // gezeigt — jetzt direkt ins Abenteuer wechseln.
        setView("adventure");
      } else {
        // Cloud kennt diesen Slot noch nicht — falls lokal ein Held
        // existiert (z. B. vor dem Login angelegt), einmalig hochladen.
        const local = loadSlotHero(slot);
        if (local) void cloudUpsertHero(user.id, slot, local);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, slot]);

  const setCharacter = useCallback(
    (c: DsaCharacterSummary | null) => {
      setCharacterState(c);
      if (c) {
        const merged = upgradeToHero({
          ...(heroRef.current ?? {}),
          ...c,
        } as DsaHero);
        heroRef.current = merged;
        saveSlotHero(slot, merged);
        if (user && merged) void cloudUpsertHero(user.id, slot, merged);
      } else {
        heroRef.current = null;
        saveSlotHero(slot, null);
        saveSlotCharacter(slot, null);
      }
    },
    [slot, user],
  );

  const creditHeroAp = useCallback(
    (ap: number, _reason: string, won: boolean) => {
      const h = heroRef.current;
      if (!h) return;
      const next: DsaHero = {
        ...h,
        apTotal: (h.apTotal ?? 0) + Math.max(0, ap),
        adventuresPlayed: (h.adventuresPlayed ?? 0) + 1,
        adventuresWon: (h.adventuresWon ?? 0) + (won ? 1 : 0),
      };
      heroRef.current = next;
      saveSlotHero(slot, next);
      setCharacterState(next);
      if (user) void cloudUpsertHero(user.id, slot, next);
    },
    [slot, user],
  );

  const updateHero = useCallback(
    (hero: DsaHero) => {
      heroRef.current = hero;
      saveSlotHero(slot, hero);
      setCharacterState(hero);
      if (user) void cloudUpsertHero(user.id, slot, hero);
    },
    [slot, user],
  );

  // Schickt eine kurze Notiz an den laufenden LLM-Meister (z. B. bei
  // Umrüsten am Heldenbogen). Best effort — wenn keine Session läuft,
  // wirft der Server 404; wir schlucken den Fehler still.
  const notifyMaster = useCallback(
    (note: string) => {
      const text = `[INVENTAR] ${note}`.slice(0, 480);
      void (async () => {
        try {
          const { getFreshAccessToken } = await import("@/auth/freshToken");
          const token = await getFreshAccessToken().catch(() => null);
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) headers.Authorization = `Bearer ${token}`;
          let anonId: string | null = null;
          if (!token) {
            try {
              anonId = window.localStorage.getItem("dsa.anonId");
            } catch {
              anonId = null;
            }
          }
          await fetch("/api/public/dsa-master", {
            method: "POST",
            headers,
            body: JSON.stringify({
              action: "say",
              text,
              heroSlot: slot,
              sessionId,
              ...(token ? {} : { anonId: anonId ?? "anon000000000000" }),
            }),
          });
        } catch {
          /* still */
        }
      })();
    },
    [slot, sessionId],
  );

  const value = useMemo<DsaHostValue>(() => {
    return {
      dsaCharacter: character,
      setDsaCharacter: setCharacter,
      clearDsaCharacter: () => setCharacter(null),

      dsaSheetOpen: sheetOpen,
      openDsaSheet: () => setSheetOpen(true),
      closeDsaSheet: () => setSheetOpen(false),
      toggleDsaSheet: () => setSheetOpen((v) => !v),

      dsaCreatorOpen: view === "creator",
      openDsaCreator: () => setView("creator"),
      closeDsaCreator: () => {
        // Abbruch ohne Charakter → zurück zur Übersicht.
        // heroRef wird in setCharacter synchron gesetzt, daher zuverlässiger
        // als das (durch React-State verzögerte) `character`.
        if (!heroRef.current && !character) {
          onExit();
          return;
        }
        setView("adventure");
      },

      dsaAdventureOpen: view === "adventure",
      openDsaAdventure: () => {
        if (onCharacterCreated) {
          onCharacterCreated();
          return;
        }
        setView("adventure");
      },
      closeDsaAdventure: () => onExit(),

      getDsaSessionId: () => sessionId,
      dsaHeroSlot: slot,
      setFlag: () => {
        /* Stammspiel-Flags spielen im Standalone keine Rolle. */
      },
      flagsToken: slot,
      creditHeroAp,
      updateHero,
      notifyMaster,
    };
  }, [character, setCharacter, sheetOpen, view, slot, sessionId, onExit, onCharacterCreated, creditHeroAp, updateHero, notifyMaster]);

  return (
    <DsaHostOverrideProvider value={value}>{children}</DsaHostOverrideProvider>
  );
}

// Stillschweigend genutzt, damit das Rotieren beim Held-Löschen einen
// stabilen Pfad hat — die Landing ruft `saveSlotHero(slot, null)` auf,
// das intern bereits `rotateSlotSessionId` triggert.
void rotateSlotSessionId;