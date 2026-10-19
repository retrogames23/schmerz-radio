# Workbench: echte Fenster-Gadgets und Größenänderung

Heute sind Zoom- und Tiefen-Knopf in der Titelleiste nur Deko, Fenster lassen sich nur verschieben. Ziel: Verhalten wie auf einem echten Amiga, ohne die Optik zu ändern.

## Was du danach tun kannst

- **Tiefen-Knopf (rechts außen):** Klick schickt das Fenster ganz nach hinten; liegt es schon hinten, holt er es nach vorn. Shift+Klick holt es immer nach vorn.
- **Zoom-Knopf:** schaltet zwischen der aktuellen Größe und fast bildschirmfüllend hin und her (zweiter Klick stellt alte Größe und Position wieder her).
- **Größe ziehen:** unten rechts erscheint das klassische Größen-Gadget; daran ziehen ändert Breite und Höhe (mit Mindestgröße, nicht über den Bildschirm hinaus).
- **Doppelklick auf die Titelleiste:** wie Zoom.
- **Aktives Fenster:** nur das vorderste Fenster hat die gestreifte, aktive Titelleiste; Hintergrundfenster werden grau/flach dargestellt.
- **Verschieben bleibt**, wird aber am Bildschirmrand begrenzt, damit kein Fenster unerreichbar verschwindet.
- **Touch:** Verschieben und Größe ändern funktionieren auch per Finger.
- **Menü „Fenster“ in der oberen Leiste** (falls die Leiste schon Menüs hat, sonst als einfaches Menü): „Alle nach vorn stapeln“ / „Nebeneinander anordnen“ / „Alle schließen“.

Nicht geändert: Inhalte der Programme, Icons, Musikverhalten beim Tycoon.

## Technische Details

- Alles in `src/components/game/AmigaWorkbench.tsx`.
- `WindowFrame` bekommt eigenen State `{x,y,w,h}` in Pixeln (Initialwert aus heutiger Position via `getBoundingClientRect` beim ersten Render), statt `transform` + CSS-Größen; Pointer-Events (`pointerdown/move/up` mit `setPointerCapture`) für Drag und Resize.
- Neue Props: `active`, `onDepth(shift)`, `onZoomToggle`. Parent erweitert `zOrder`-Logik um `sendToBack(id)`; `active = zOrder.at(-1) === id`.
- Zoom speichert vorherige Geometrie in einem Ref.
- Iframe (Tycoon) während Drag/Resize mit `pointerEvents: none` überdecken, damit Mausereignisse nicht verschluckt werden.
- Prüfung: Build-Log und kurzer Playwright-Klicktest (Fenster öffnen, nach hinten schicken, Größe ziehen, Screenshot).
