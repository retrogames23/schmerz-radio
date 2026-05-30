import { createFileRoute, useNavigate, useParams, Navigate } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { StandaloneDsaHost } from "@/components/dsa-standalone/StandaloneDsaHost";
import { DsaCharacterSheet } from "@/components/game/DsaCharacterSheet";
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
  component: SlotPage,
});

function SlotPage() {
  const { slot: slotRaw } = useParams({ from: "/dsa/$slot" });
  const navigate = useNavigate();
  const slot = parseSlot(slotRaw);
  if (!slot) return <Navigate to="/dsa" />;

  const exit = () => navigate({ to: "/dsa" });

  return (
    <div className="min-h-screen w-full bg-[#1a120a]">
      <StandaloneDsaHost slot={slot} onExit={exit}>
        <DsaCharacterSheet />
        <Suspense fallback={null}>
          <DsaCharacterCreator />
          <DsaLlmAdventureScene />
        </Suspense>
      </StandaloneDsaHost>
    </div>
  );
}