import { createFileRoute, useNavigate, useParams, useSearch, Navigate } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef } from "react";
import { StandaloneDsaHost } from "@/components/dsa-standalone/StandaloneDsaHost";
import { DsaCharacterSheet } from "@/components/game/DsaCharacterSheet";
import { useDsaHost } from "@/game/dsa/DsaHostContext";
import { parseSlot } from "@/components/dsa-standalone/slotStorage";

const DsaCharacterCreator = lazy(() =>
  import("@/components/game/DsaCharacterCreator").then((m) => ({
    default: m.DsaCharacterCreator,
  })),
);
const DsaLlmAdventureScene = lazy(() =>
  import("@/components/game/DsaLlmAdventureScene").then((m) => ({
    default: m.DsaLlmAdventureScene,
  })),
);

export const Route = createFileRoute("/dsa/$slot")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = typeof search.returnTo === "string" ? search.returnTo : "";
    // Nur interne Pfade erlauben (kein offener Redirect).
    const returnTo = raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
    const view = search.view === "sheet" ? "sheet" : undefined;
    return { returnTo, view };
  },
  component: SlotPage,
});

function SlotPage() {
  const { slot: slotRaw } = useParams({ from: "/dsa/$slot" });
  const { returnTo, view } = useSearch({ from: "/dsa/$slot" });
  const navigate = useNavigate();
  const slot = parseSlot(slotRaw);
  if (!slot) return <Navigate to="/dsa" />;

  const exit = () =>
    returnTo
      ? navigate({ to: returnTo })
      : navigate({ to: "/dsa" });
  const onCharacterCreated = returnTo
    ? () => navigate({ to: returnTo })
    : undefined;

  // Reiner Bogen-Modus: nur den Charakterbogen anzeigen (kein Creator,
  // keine Abenteuer-Scene), damit das Öffnen aus dem Multiplayer-
  // Spielraum nicht versehentlich ein Solo-Abenteuer startet.
  if (view === "sheet") {
    return (
      <div className="min-h-screen w-full bg-[#1a120a]">
        <StandaloneDsaHost slot={slot} onExit={exit}>
          <SheetOnly onClose={exit} />
        </StandaloneDsaHost>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#1a120a]">
      <StandaloneDsaHost
        slot={slot}
        onExit={exit}
        onCharacterCreated={onCharacterCreated}
      >
        <DsaCharacterSheet />
        <Suspense fallback={null}>
          <DsaCharacterCreator />
          <DsaLlmAdventureScene />
        </Suspense>
      </StandaloneDsaHost>
    </div>
  );
}

function SheetOnly({ onClose }: { onClose: () => void }) {
  const { openDsaSheet, dsaSheetOpen, dsaCharacter } = useDsaHost();
  const wasOpenRef = useRef(false);
  useEffect(() => {
    openDsaSheet();
  }, [openDsaSheet]);
  // Wenn der Bogen geschlossen wird (z. B. via X/ESC), zurück navigieren.
  useEffect(() => {
    if (dsaSheetOpen) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) onClose();
  }, [dsaSheetOpen, onClose, wasOpenRef]);
  // Wenn (noch) kein Held im Slot liegt, lieber direkt zurück.
  useEffect(() => {
    if (!dsaCharacter) onClose();
  }, [dsaCharacter, onClose]);
  return <DsaCharacterSheet />;
}