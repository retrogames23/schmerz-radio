import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  type SlotIndex,
} from "./slotStorage";
import { upgradeToHero } from "@/game/dsa/advancement";
import type { DsaHero } from "@/game/types";

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
  children,
}: {
  slot: SlotIndex;
  onExit: () => void;
  children: ReactNode;
}) {
  const [character, setCharacterState] = useState<DsaCharacterSummary | null>(
    () => loadSlotHero(slot) ?? loadSlotCharacter(slot),
  );
  const heroRef = useRef<DsaHero | null>(loadSlotHero(slot));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<View>(character ? "adventure" : "creator");

  // Wenn der Slot wechselt (Navigation), Inhalt neu laden.
  useEffect(() => {
    const h = loadSlotHero(slot);
    heroRef.current = h;
    const c = h ?? loadSlotCharacter(slot);
    setCharacterState(c);
    setView(c ? "adventure" : "creator");
    setSheetOpen(false);
  }, [slot]);

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
      } else {
        heroRef.current = null;
        saveSlotHero(slot, null);
        saveSlotCharacter(slot, null);
      }
    },
    [slot],
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
    },
    [slot],
  );

  const value = useMemo<DsaHostValue>(() => {
    const sessionId = slotSessionId(slot);
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
        if (!character) {
          onExit();
          return;
        }
        setView("adventure");
      },

      dsaAdventureOpen: view === "adventure",
      openDsaAdventure: () => setView("adventure"),
      closeDsaAdventure: () => onExit(),

      getDsaSessionId: () => sessionId,
      setFlag: () => {
        /* Stammspiel-Flags spielen im Standalone keine Rolle. */
      },
      flagsToken: slot,
      creditHeroAp,
    };
  }, [character, setCharacter, sheetOpen, view, slot, onExit, creditHeroAp]);

  return (
    <DsaHostOverrideProvider value={value}>{children}</DsaHostOverrideProvider>
  );
}

// Stillschweigend genutzt, damit das Rotieren beim Held-Löschen einen
// stabilen Pfad hat — die Landing ruft `saveSlotHero(slot, null)` auf,
// das intern bereits `rotateSlotSessionId` triggert.
void rotateSlotSessionId;