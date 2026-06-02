import { createFileRoute, useNavigate, useParams, useSearch, Navigate } from "@tanstack/react-router";
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
  validateSearch: (search: Record<string, unknown>) => {
    const raw = typeof search.returnTo === "string" ? search.returnTo : "";
    // Nur interne Pfade erlauben (kein offener Redirect).
    const returnTo = raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
    return { returnTo };
  },
  component: SlotPage,
});

function SlotPage() {
  const { slot: slotRaw } = useParams({ from: "/dsa/$slot" });
  const { returnTo } = useSearch({ from: "/dsa/$slot" });
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