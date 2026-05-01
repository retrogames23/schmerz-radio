/**
 * Re-export aller Szenen aus dem `scenes/`-Ordner.
 *
 * Historisch lag hier eine 2600-Zeilen-Datei mit allen Schauplätzen.
 * Sie ist jetzt nach Schauplatz-Cluster aufgeteilt
 * (siehe `src/game/scenes/`). Diese Datei bleibt aus
 * Backwards-Kompatibilität bestehen, damit `import { scenes } from
 * "@/game/scenes"` an allen bisherigen Aufrufstellen weiter funktioniert.
 */
export { scenes } from "./scenes/index";
