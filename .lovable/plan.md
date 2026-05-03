Ich habe die aktuelle Ursache eingegrenzt: Die Bühne ist zwar jetzt 16:9, aber die Assets sind nicht alle exakt gleich formatiert. Viele Bilder sind 1376×768 (leicht breiter als 16:9), einige sind echtes 1920×1080, ein Korridor ist 1536×1024 (3:2), der Aufzug ist 1024×768 (4:3). Mit `object-cover` wird je nach Asset unterschiedlich beschnitten. Dadurch liegen Prozent-Hotspots nicht dauerhaft auf denselben Bildpixeln – selbst wenn die Szene selbst korrekt aussieht.

Plan für eine robuste, pixelgenaue Lösung für alle Szenen:

1. Gemeinsames Bild-Koordinatensystem statt Bühnen-Koordinatensystem
   - Hotspots, NPCs und Decals werden nicht mehr relativ zur sichtbaren 16:9-Bühne positioniert, sondern relativ zur echten Hintergrundbild-Fläche.
   - Der Hintergrund und alle interaktiven Layer werden in denselben inneren `scene-image-layer` gelegt.
   - Dieser Layer bekommt dieselbe `object-fit`-Geometrie wie das Bild. Damit stimmen Bildpixel und Hotspot-Pixel immer exakt überein.

2. Szene bekommt explizites Asset-Format
   - Ich erweitere den Scene-Typ um optionale `imageSize` / `imageFit`-Metadaten.
   - Für jede Szene wird die echte Assetgröße hinterlegt, z. B. 1376×768, 1920×1080, 1024×768, 1536×1024.
   - Standard bleibt `cover`, damit das Spiel weiterhin die 16:9-Fläche füllt.

3. Automatische Umrechnung der sichtbaren Bildfläche
   - `SceneView` berechnet aus Bühne und Assetgröße:
     - wie groß das Bild im Container tatsächlich gerendert wird,
     - wie viel links/rechts bzw. oben/unten bei `cover` abgeschnitten wird,
     - wie der Hotspot-Layer identisch darübergelegt werden muss.
   - Dadurch gibt es keine Drift mehr zwischen Hintergrund und Hotspots, auch nicht bei 4:3- oder 3:2-Assets.

   Technisch wird das Prinzip so aussehen:

   ```text
   16:9 stage
   └─ rendered image layer: exakt dieselbe Größe/Position wie das CSS-Bild
      ├─ img fills layer 100% × 100%
      ├─ hotspot buttons in Bild-Prozent
      ├─ NPC sprites in Bild-Prozent
      └─ decals in Bild-Prozent
   ```

4. Koordinaten zurück auf Bild-Prozent normalisieren
   - Die letzte Migration hat viele alte 4:3-Werte in 16:9-Stage-Werte umgerechnet (`x = 12.5 + oldX * 0.75`).
   - Für die Szenen, die dadurch verschoben wurden, rechne ich diese Werte wieder zurück bzw. migriere sie sauber ins neue Bild-Koordinatensystem.
   - Für echte 16:9-Szenen bleiben Werte unverändert, außer wenn sie bereits fälschlich mit der 4:3-Formel bearbeitet wurden.
   - Besonders wichtig: 1376×768-Bilder werden nicht mehr so behandelt, als wären sie exakt 16:9; ihre kleine horizontale Abweichung wird korrekt berücksichtigt.

5. Kein verstecktes `object-cover`-Problem mehr
   - Die `<img>`-Darstellung und der Overlay-Layer nutzen nicht mehr zwei getrennte Koordinatensysteme.
   - Selbst wenn ein Asset später ausgetauscht wird, muss nur dessen `imageSize` stimmen; die Hotspots bleiben pixelgenau.

6. Dev-Editor auf dasselbe System umstellen
   - Der HotspotEditor arbeitet künftig auf dem Bild-Layer, nicht auf der äußeren Bühne.
   - Wenn man in `?dev=1` einen Hotspot zieht, kopiert er Koordinaten, die direkt zu den Bildpixeln passen.
   - Damit können spätere Korrekturen nicht wieder durch Stage-/Cover-Beschnitt verfälscht werden.

7. Sichtbarkeit bleibt wie gewünscht
   - Hotspot-Rahmen bleiben im normalen Spiel versteckt.
   - Mit Leertaste werden sie sichtbar.
   - Beim Ziehen eines Inventarobjekts bleibt eine dezente Ziel-Hervorhebung erhalten.

Dateien, die ich voraussichtlich ändere:
- `src/game/types.ts`
- `src/components/game/SceneView.tsx`
- `src/components/game/Hotspot.tsx` nur falls für Layer-Kompatibilität nötig
- `src/dev/HotspotEditor.tsx`
- `src/game/scenes/*.ts`

Ergebnis: Alle Szenen verwenden weiterhin 16:9 als Spielbühne, aber die interaktiven Bereiche werden pixelgenau an den echten Hintergrundbildern ausgerichtet – unabhängig davon, ob ein Asset minimal breiter, echtes 16:9, 3:2 oder 4:3 ist.