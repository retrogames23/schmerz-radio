import { useEffect } from "react";
import { CloseButton } from "@/components/game/CloseButton";
import { AventurienMap } from "@/components/game/dsa/AventurienMap";
import { findPlace } from "@/game/dsa/lore/places";

/**
 * Karten-Overlay für das DSA-Standalone-Spiel. Zeigt eine
 * schematische Aventurienkarte mit einem Marker am aktuellen
 * Aufenthaltsort des Helden.
 */
export function DsaMapOverlay({
  open,
  onClose,
  currentLocation,
  heroName,
}: {
  open: boolean;
  onClose: () => void;
  currentLocation?: string | null;
  heroName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const place = currentLocation ? findPlace(currentLocation) : null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/85 p-3 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dsa-adventure-shell relative mx-auto w-full max-w-5xl rounded-md shadow-2xl">
        <div className="sticky top-2 z-[90] flex justify-end pr-3 pt-2 -mb-8">
          <CloseButton onClick={onClose} />
        </div>

        <div className="dsa-adventure-header px-5 sm:px-6 pt-5 pb-3 border-b-2 border-[rgba(30,18,8,0.85)]">
          <div className="dsa-typed text-[11px] uppercase tracking-[0.3em] dsa-ink font-bold">
            Karte Aventuriens
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-2xl sm:text-3xl dsa-ink font-extrabold">
              {place
                ? heroName
                  ? `${heroName} in ${place.name}`
                  : place.name
                : currentLocation
                  ? currentLocation
                  : "Standort unbekannt"}
            </h2>
            {place && (
              <span className="dsa-typed text-sm dsa-ink font-bold opacity-80">
                · {place.region}
              </span>
            )}
          </div>
          {!currentLocation && (
            <p className="dsa-typed mt-2 text-xs italic dsa-ink opacity-80">
              Tjark hat den Standort noch nicht festgehalten. Sobald die Gruppe einen
              Ort erreicht, erscheint hier ein Marker.
            </p>
          )}
        </div>

        <div className="dsa-adventure-body p-3 sm:p-5">
          <div className="dsa-paper rounded-md p-2 sm:p-3">
            <AventurienMap
              currentLocation={currentLocation}
              className="w-full h-auto select-none"
            />
          </div>
        </div>

        <div className="dsa-adventure-footer flex items-center justify-between px-5 sm:px-6 py-3 text-xs">
          <span className="opacity-80">
            Drücke <kbd className="px-1 border border-current rounded">Esc</kbd> zum Schließen.
          </span>
          <button onClick={onClose} className="underline-offset-2 hover:underline">
            Karte einrollen
          </button>
        </div>
      </div>
    </div>
  );
}