import { memo } from "react";
import walkerSrc from "@/assets/npc-e71-walker.png";
import visitorSrc from "@/assets/npc-e71-konbini-visitor.png";

/**
 * Leben-Ebene für den E71-Empfang (e71Lobby): macht die Szene lebendig,
 * ohne die Spiellogik zu berühren. Alle Elemente sind pointer-events-none
 * und rein dekorativ:
 *
 * - Ein Passant mit Aktentasche geht in die Tiefe von Korridor 16
 *   (erscheint am Eingang, schrumpft zum Fluchtpunkt, verblasst).
 * - Eine Besucherin mit Einkaufsnetz steht ab und zu in der Konbini-Tür.
 * - Am Tresen blinkt gelegentlich die LED des Telefons.
 *
 * Positionen in % des Szenenbildes (1376×768), dieselbe Geometrie wie
 * Hotspots/NPCs. Animationen laufen per CSS und respektieren
 * prefers-reduced-motion.
 */
export const E71LobbyLife = memo(function E71LobbyLife() {
  return (
    <div className="e71-life pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Passant in Korridor 16 — geht vom Eingang in die Tiefe */}
      <img
        src={walkerSrc}
        alt=""
        loading="lazy"
        decoding="async"
        className="e71-walker absolute select-none object-contain"
      />
      {/* Besucherin in der Konbini-Tür — taucht auf, steht, verschwindet */}
      <img
        src={visitorSrc}
        alt=""
        loading="lazy"
        decoding="async"
        className="e71-konbini-visitor absolute select-none object-contain"
      />
      {/* Telefon-LED am Empfangstresen */}
      <div className="e71-phone-led absolute" />
    </div>
  );
});
