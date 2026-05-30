import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DsaHostOverrideProvider,
  type DsaHostValue,
} from "@/game/dsa/DsaHostContext";
import type { DsaCharacterSummary } from "@/game/types";
import {
  loadSlotCharacter,
  saveSlotCharacter,
  slotSessionId,
  type SlotIndex,
} from "./slotStorage";

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
    () => loadSlotCharacter(slot),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<View>(character ? "adventure" : "creator");

  // Wenn der Slot wechselt (Navigation), Inhalt neu laden.
  useEffect(() => {
    const c = loadSlotCharacter(slot);
    setCharacterState(c);
    setView(c ? "adventure" : "creator");
    setSheetOpen(false);
  }, [slot]);

  const setCharacter = useCallback(
    (c: DsaCharacterSummary | null) => {
      setCharacterState(c);
      saveSlotCharacter(slot, c);
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
    };
  }, [character, setCharacter, sheetOpen, view, slot, onExit]);

  return (
    <DsaHostOverrideProvider value={value}>{children}</DsaHostOverrideProvider>
  );
}