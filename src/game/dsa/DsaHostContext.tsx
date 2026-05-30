import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useGame } from "@/game/GameContext";
import type { DsaCharacterSummary } from "@/game/types";

/**
 * Schmale Schnittstelle, die alle DSA-UI-Komponenten brauchen
 * (CharacterCreator, CharacterSheet, LlmAdventureScene). Im Stammspiel
 * wird dieser Shape automatisch aus dem GameContext gebaut; auf der
 * Standalone-Seite `/dsa` liefert ein eigener Provider denselben Shape
 * aus slotbasiertem lokalem State.
 */
export interface DsaHostValue {
  // Charakter
  dsaCharacter: DsaCharacterSummary | null;
  setDsaCharacter: (c: DsaCharacterSummary | null) => void;
  clearDsaCharacter: () => void;

  // Charakterbogen (Lese-Overlay)
  dsaSheetOpen: boolean;
  openDsaSheet: () => void;
  closeDsaSheet: () => void;
  toggleDsaSheet: () => void;

  // Charakter-Erschaffung
  dsaCreatorOpen: boolean;
  openDsaCreator: () => void;
  closeDsaCreator: () => void;

  // Abenteuer-Overlay (Tafelrunde)
  dsaAdventureOpen: boolean;
  openDsaAdventure: () => void;
  closeDsaAdventure: () => void;

  // Sitzung (für Server-Persistenz pro Slot/Spielstand)
  getDsaSessionId: () => string;

  // Flags — im Stammspiel: GameContext-Flags. Standalone: stabile no-op.
  setFlag: (flag: string) => void;
  /** Stabile Referenz; wird vom Creator nur als Reset-Dep verwendet. */
  flagsToken: unknown;
}

const DsaHostOverrideContext = createContext<DsaHostValue | null>(null);

/**
 * Provider, mit dem ein anderer Container (z.B. die Standalone-Route)
 * den Host bestimmt. Wird er nicht gerendert, fällt `useDsaHost()`
 * automatisch auf `useGame()` zurück — das ist der Pfad fürs Stammspiel.
 */
export function DsaHostOverrideProvider({
  value,
  children,
}: {
  value: DsaHostValue;
  children: ReactNode;
}) {
  return (
    <DsaHostOverrideContext.Provider value={value}>
      {children}
    </DsaHostOverrideContext.Provider>
  );
}

/**
 * Liefert den DSA-Host. Wenn kein Override gesetzt ist, wird die
 * Stammspiel-Brücke verwendet: GameContext → DsaHostValue.
 */
export function useDsaHost(): DsaHostValue {
  const override = useContext(DsaHostOverrideContext);
  // Wir müssen den Hook unbedingt unbedingt aufrufen (Hook-Regeln),
  // selbst wenn ein Override existiert. Wirft im Standalone-Pfad nicht,
  // weil `useGame()` einen `null`-Fallback-Provider hat? – Nein, hat es
  // nicht. Deshalb: Override-Variante zuerst, Bridge nur fallback.
  if (override) return override;
  // Im Stammspiel-Pfad ist `useGame()` garantiert verfügbar.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const game = useGame();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo<DsaHostValue>(
    () => ({
      dsaCharacter: game.dsaCharacter,
      setDsaCharacter: game.setDsaCharacter,
      clearDsaCharacter: game.api.clearDsaCharacter,
      dsaSheetOpen: game.dsaSheetOpen,
      openDsaSheet: game.openDsaSheet,
      closeDsaSheet: game.closeDsaSheet,
      toggleDsaSheet: game.toggleDsaSheet,
      dsaCreatorOpen: game.dsaCreatorOpen,
      openDsaCreator: game.api.openDsaCreator,
      closeDsaCreator: game.closeDsaCreator,
      dsaAdventureOpen: game.dsaAdventureOpen,
      openDsaAdventure: () => game.api.openDsaAdventure(),
      closeDsaAdventure: game.closeDsaAdventure,
      getDsaSessionId: game.api.getDsaSessionId,
      setFlag: game.api.setFlag,
      flagsToken: game.flags,
    }),
    [game],
  );
}