# Spielbühne auf echte 16:9 umstellen

## Was du heute siehst

Auf deinem MacBook Pro bleibt links und rechts ein dicker schwarzer Streifen, weil die Bühne intern auf **4:3** zugeschnitten ist, obwohl die Hintergrundbilder im **16:9**-Format vorliegen. Das Spiel verzerrt nichts — es zeigt nur einen kleineren Bildausschnitt als möglich, und das Asset wird dabei sogar links/rechts beschnitten (rund 5 % Bildrand auf jeder Seite verschwindet hinter `object-cover`).

## Ziel

- Szenen füllen 16:9-Laptops fast komplett aus (statt nur ~75 % der Breite).
- Keine Verzerrung — Seitenverhältnisse von Bildern und Sprites bleiben korrekt.
- Kein Crop mehr — du siehst alles, was im Hintergrundbild gemalt ist.
- Hotspots, NPCs und Wandobjekte sitzen weiterhin exakt da, wo sie sollen.

## Konkreter Effekt

Auf einem 16"-MacBook Pro (≈ 1728×900 nutzbarer Bühnenbereich):

```
heute:    [████ schwarzer Rand 264px ████ Szene 4:3 1200×900 ████ Rand 264px ████]
nachher:  [█ Rand 64px █ Szene 16:9 1600×900 █ Rand 64px █]
```

→ ca. **+33 % sichtbare Spielbreite**, schwarze Ränder schrumpfen von ~530 px auf ~130 px Gesamt.

Auf 16:10-Displays bleibt ein dünner Letterbox-Streifen unten/oben — das ist mathematisch unvermeidbar, ohne entweder zu verzerren oder vom Hintergrundbild abzuschneiden.

## Was technisch passiert

1. **`SceneView.tsx`**: Innerer Stage-Container von `aspect-[4/3]` auf `aspect-[16/9]` umstellen. Damit verschwindet der `object-cover`-Crop, das ganze Hintergrundasset wird sichtbar.

2. **Hotspot-/NPC-/Decal-Koordinaten umrechnen**: Heute sind alle x/w-Werte in `src/game/scenes.ts` so kalibriert, dass sie sich auf den 4:3-Ausschnitt beziehen (sichtbar sind nur ~5,4 %–94,6 % der Bildbreite). Auf der neuen 16:9-Bühne werden 0–100 % Bildbreite sichtbar. Ich rechne alle x/w-Werte deterministisch um:

   ```
   neues_x = (altes_x − 5.4) ÷ 89.2 × 100
   neues_w = altes_w        ÷ 89.2 × 100
   ```

   y/h bleiben unverändert (vertikales Verhältnis ändert sich nicht).

   Betrifft in `scenes.ts`: alle `hotspots[].{x,w}`, alle `npcs[].{x,w}`, alle `decals[].{x,w}`. Ich mache das per Skript-Pass mit Vorher/Nachher-Vergleich, damit keine Werte vergessen werden.

3. **Mobile-Bühne**: `STAGE_W`/`STAGE_H` in `MobileStage.tsx` von 1024×640 auf 1024×576 (echtes 16:9) anpassen, damit die Skalierung im Hochformat passt. Die Rotations-Logik bleibt gleich.

4. **Veraltete Kommentare** in `scenes.ts` zur „5,4 %..94,6 %"-Kalibrierung entfernen.

## QA

Nach der Umstellung gehe ich in jeder Szene visuell durch:
- Hintergrundbild zeigt jetzt den vollen 16:9-Ausschnitt (kein Beschnitt links/rechts).
- Hotspots reagieren noch über den richtigen Objekten (Türen, NPCs, Wandelementen).
- NPC-Sprites stehen an der richtigen Stelle.
- Mobile (Querformat) skaliert sauber.

Ich prüfe stichprobenartig: Lobby, Korridor, Gemeinschaftsraum, Kantine, Sprechzimmer, ein Außenraum.

## Was sich für dich nicht ändert

- Die Hintergrund-Assets selbst werden **nicht neu generiert**. Sie sind ohnehin schon 16:9 — du siehst nur künftig die vollen 100 % statt nur 89,2 %.
- Spiellogik, Dialoge, Rätsel, Inventar bleiben identisch.
- Die Karte und Tjarks Bleistift bleiben unverändert.
