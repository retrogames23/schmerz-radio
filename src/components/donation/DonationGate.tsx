import { useEffect, useState } from "react";
import { onCloudError, onCloudUsage } from "@/llm/cloudLlmRuntime";
import { useDonationStatus } from "@/hooks/useDonationStatus";
import { useAuth } from "@/auth/AuthContext";
import { DonationModal } from "./DonationModal";

/**
 * Lädt den WebLLM-Loader erst bei Bedarf (Soft-Limit erreicht). So
 * landen weder das Loader-Modul noch die WebLLM-Engine im initialen
 * GameShell-Bundle.
 */
async function preloadLocalLlmInBackground() {
  try {
    const mod = await import("@/llm/webLlmLoader");
    if (!mod.isWebGpuAvailable()) return;
    void mod.startLocalLlmLoad().catch(() => {
      /* still ignorieren — UI zeigt es im Free-Chat ggf. nochmal an */
    });
  } catch {
    /* Loader-Modul nicht verfügbar — kein Hindernis. */
  }
}

/**
 * Globaler Listener: zeigt das Spenden-Modal bei Soft-Limit (Warnung)
 * und Hard-Limit (Block). Soft wird nur einmal pro Session angezeigt.
 */
export function DonationGate() {
  const { user } = useAuth();
  const status = useDonationStatus();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<"soft" | "hard" | "manual">("soft");
  const [shownSoftAt, setShownSoftAt] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  // Hard-Limit aus 402-Response
  useEffect(() => {
    return onCloudError((e) => {
      if (e.code === "donation_required" && user && !status.unlocked) {
        setVariant("hard");
        setCount(status.hardLimit);
        setOpen(true);
      }
    });
  }, [user, status.unlocked, status.hardLimit]);

  // Soft-Limit beim Erreichen von 30 (einmal pro Session)
  useEffect(() => {
    return onCloudUsage((e) => {
      if (e.unlocked || !user) return;
      const c = e.count ?? 0;
      if (c >= e.softLimit && c < e.limit && shownSoftAt !== c) {
        setShownSoftAt(c);
        setVariant("soft");
        setCount(c);
        setOpen(true);
        // Spieler hat das Soft-Limit erreicht und wird gefragt, ob er
        // spenden möchte. Falls nicht, wird er bald in den Free-Mode mit
        // lokalem LLM gedrängt — also fangen wir JETZT an, das Modell
        // im Hintergrund vorzuladen. Vorher nicht: Spieler, die nie an
        // dieses Limit kommen, müssen die GB-große Datei nie ziehen.
        void preloadLocalLlmInBackground();
      }
    });
  }, [user, shownSoftAt]);

  // Erfolgs-/Cancel-Banner aus URL nach Stripe-Redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const donation = params.get("donation");
    if (donation === "success") {
      void status.refresh();
      params.delete("donation");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    } else if (donation === "cancel") {
      params.delete("donation");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    }
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DonationModal
      open={open}
      onClose={() => setOpen(false)}
      variant={variant}
      count={count}
      hardLimit={status.hardLimit}
    />
  );
}