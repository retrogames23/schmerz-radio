/**
 * Re-export aller Dialog-Trees aus dem `dialogs/`-Ordner.
 *
 * Historisch lag hier eine 5000+-Zeilen-Datei mit allen NPC-Dialogen.
 * Sie ist jetzt nach NPC / Schauplatz in mehrere Module aufgeteilt
 * (siehe `src/game/dialogs/`). Diese Datei bleibt aus
 * Backwards-Kompatibilität bestehen, damit `import { dialogs } from
 * "@/game/dialogs"` an allen bisherigen Aufrufstellen weiter funktioniert.
 */
export { dialogs } from "./dialogs/index";
