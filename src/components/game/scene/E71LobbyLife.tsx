import { memo } from "react";

/**
 * Leben-Ebene für den E71-Empfang (e71Lobby): rein dekorativ,
 * pointer-events-none. Bewusst ohne wandernde Figuren — ohne echte
 * Walk-Cycles wirken verschobene Standbilder wie Geister.
 *
 * - Am Tresen blinkt gelegentlich die LED des Telefons.
 */
export const E71LobbyLife = memo(function E71LobbyLife() {
  return (
    <div className="e71-life pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="e71-phone-led absolute" />
    </div>
  );
});
