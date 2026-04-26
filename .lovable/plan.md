# Plan: DSA-Mini-Spiel ausbauen — Dialog, Abenteuer, Illustrationen, Musik

Ziel: Die drei offenen Punkte schließen und das DSA-Mini-Spiel zu einer eigenständigen, atmosphärischen Mini-Kampagne machen, die sich vom Hauptspiel klar absetzt.

## 1. Begrüßungs-/Smalltalk-Dialog mit Tjark

Ein vollwertiger `DialogTree` `tjarkSmalltalk` in `src/game/dialogs.ts`.

Inhalt — Tjark (Spielleiter, Brille, Tee, etwas oberlehrerhaft):
- **Erstkontakt**: stellt sich vor („Ich bin Tjark, ich leite das hier"), erklärt das Setup (drei Spieler:innen, fehlender Vierter, am liebsten Krieger). Stellt Brem und Yelva kurz vor.
- **Erklärungs-Branches** (jederzeit anwählbar, je nach Flag):
  - „Was ist das hier eigentlich?" → DSA-Erklärung (Aventurien, 2. Edition, Schmidt-Spiele)
  - „Wer seid ihr drei?" → kurze Charakterisierung der Gruppe
  - „Wie funktioniert das?" → Eigenschaften, W6+7, Klassen
  - „Was ist der Plan heute?" → Hinweis auf das Abenteuer („Anreise nach Phexcaer, Wirtshaus, Ruine")
- **Nach Charakter-Erschaffung**: Tjark begrüßt den Helden namentlich, leitet ins Abenteuer ein
- **Wenn Layard nochmal kommt**: kürzere Variante, „Setz dich, wir warten nur noch auf dich"

Dialog wird ausgelöst über den `tjarkSpot`-Hotspot (der aktuelle einfache `showText` wird durch `api.startDialog("tjarkSmalltalk")` ersetzt). Die einfachen Reaktionen von Yelva und Brem bleiben als `showText`, kriegen aber zusätzlich einen kleinen Dialog für nach der Charaktererstellung.

## 2. Drei Abenteuer-Szenen mit klassengebundenen Optionen

Ein neues Modul `src/game/dsa/adventure.ts` und eine UI-Komponente `src/components/game/DsaAdventureScene.tsx`.

### Konzept
Wenn Layard sich nach der Charaktererstellung wieder an den Tisch setzt, öffnet sich ein **Abenteuer-Overlay** (Fullscreen über der Szene, Stil: vergilbtes Pergament + großes Illustrationsbild oben, Erzähltext + Wahloptionen unten — Layout-Inspiration: Unavowed-Choices, Visual Novel). Tjark spricht als Erzähler, die Mitspieler werfen kurze in-character-Bemerkungen ein.

### Drei Szenen (jeweils ein "Abschnitt")
1. **Anreise** — Reise von Gareth nach Phexcaer durch den Reichsforst. Drei Encounter-Beats mit jeweils 2–3 Wahloptionen.
2. **Wirtshaus „Zum durstigen Drachen"** — soziale Begegnung, Auftraggeber, Kneipenschlägerei, Gerücht über die Ruine.
3. **Die Ruine von Hesindes Auge** — Dungeon-Mini: Falle, Wesen, Schatzkammer, Endentscheidung.

### Klassengebundene Optionen
Pro Beat hat jede Wahl eine `requires?: DsaClassId | DsaClassId[] | "magic"`. Beispiele:
- **Krieger**: „Du stellst dich breitbeinig in den Pfad und ziehst das Schwert."
- **Streuner**: „Du schleichst dich um die Wachen herum und stiehlst den Schlüssel."
- **Magier/Druide/Elf** (`magic: true`): „Du sprichst die Formel des Lichts."
- **Elf**: „Du hörst etwas in den Bäumen, das die anderen nicht hören."
- **Zwerg**: „Du klopfst die Wand ab — Hohlraum dahinter."
- **Thorwaler**: „Du leerst den Krug und brüllst zurück."
- **Allgemein**: immer 1–2 Optionen ohne Voraussetzung verfügbar (Layard kann immer mitspielen).

Jede Wahl produziert:
- Erzähltext von Tjark (3–6 Zeilen, eingeblendet wie `TextOverlay`)
- Reaktionsbemerkung von Brem oder Yelva (1 Zeile, kursiv)
- ggf. einen Würfelwurf (z.B. Mut-Probe, GE-Probe → 3W20 unter Eigenschaft, simpel) mit Anzeige der drei Würfel und Erfolg/Misserfolg
- Übergang zum nächsten Beat oder zum nächsten Abschnitt

### Strukturen
```ts
interface DsaBeat {
  id: string;
  illustration?: string;   // Pfad zu generiertem Bild (DSA × Unavowed Stil)
  narration: string[];     // Tjarks Erzähltext
  options: DsaOption[];
}

interface DsaOption {
  text: string;
  requires?: DsaClassId | DsaClassId[] | "magic" | "any";
  attrCheck?: { attr: Attr; modifier?: number };  // optional Probe
  outcome: {
    success?: string[];
    failure?: string[];
    table?: string[];      // Tisch-Reaktion (Brem/Yelva/Tjark)
  };
  next?: string;           // nächste Beat-ID, "scene2" | "scene3" | "end"
}
```

### Tisch verlassen / unterbrechen
Im Overlay gibt es jederzeit den Button „Vom Tisch aufstehen" — schließt das Overlay, setzt einen Flag, dass die Szene weiterlaufen kann (`dsaAdventureBeatId` wird gespeichert), und Layard ist wieder im Gemeinschaftsraum. `FloatingChatter` zeigt dann (wie heute) Hintergrund-Dialoge der drei Spielenden, bis Layard sich wieder hinsetzt.

## 3. Illustrationen (DSA × Unavowed-Stil)

Pro Abschnitt **eine zentrale Illustration** + jeweils 1–2 Beat-Bilder. Insgesamt 5–6 Bilder, generiert mit `imagegen--edit_image` (oder Image-Generation).

Stil-Prompt-Basis: *„Hand-painted fantasy RPG illustration in the style of late-90s Das Schwarze Auge book art crossed with Unavowed adventure-game splash screens. Painterly, slightly desaturated, atmospheric lighting, medium-detail brushwork, no text, 16:9 cinematic framing."*

Konkrete Bilder:
1. `dsa-anreise-forest.jpg` — Reichsforst-Pfad in der Dämmerung, Nebel, drei Wanderer
2. `dsa-anreise-encounter.jpg` — Räuber/Wegelagerer auf einer Waldlichtung
3. `dsa-tavern-exterior.jpg` — Wirtshaus „Zum durstigen Drachen" bei Nacht, warmes Fensterlicht
4. `dsa-tavern-interior.jpg` — verrauchte Schankstube, schmierige Tische, dubiose Gestalten
5. `dsa-ruin-entrance.jpg` — verfallener Tempel von Hesinde im Mondlicht, Efeu, Säulen
6. `dsa-ruin-chamber.jpg` — Kammer mit magischem Auge-Symbol auf dem Boden

Speicherort: `src/assets/dsa/`. Werden in `DsaAdventureScene` als großes Banner-Bild oben angezeigt (mit subtilem Vignette-Effekt + Pergament-Rahmen).

## 4. Musik-Wechsel zu Fantasy-Track

Während Layard im **Gemeinschaftsraum (`commonRoomE67`)** ODER im **Abenteuer-Overlay** ist, soll passende Fantasy-Musik laufen statt der normalen düsteren Bürokratie-Musik.

### Vorgehen
1. **Neuen Track generieren** mit ElevenLabs Music API (Server-Funktion `/api/dsa-music` oder einmalig generiert und als `src/assets/music/dsa-tavern.mp3` abgelegt).
   - Prompt: *„Cozy medieval fantasy tavern music, gentle acoustic lute and recorder, warm fireplace atmosphere, slightly mysterious undertone, 90 seconds, loopable, no vocals."*
   - Einmalig generieren, im Repo speichern (kein Live-API-Call zur Laufzeit).
2. **MusicPlayer erweitern** um eine "scene-overrides" Logik:
   - Neue API-Methode `pushOverride(track: MusicTrack)` und `popOverride()`
   - Solange ein Override aktiv ist, wird dieser Track gespielt (geloopt), und der Watcher springt nicht zur nächsten Playlist-Track
   - Crossfade beim Pushen/Poppen (1.2s, wie manueller Wechsel)
3. **Trigger im Spiel**:
   - `useEffect` in `SceneView` (oder `Game`): wenn `scene === "commonRoomE67"` → `pushOverride(dsaTrack)`, beim Verlassen `popOverride()`
   - Funktioniert nur wenn `musicEnabled` — bei deaktivierter Musik bleibt alles still (die bestehende Logik im MusicPlayer prüft das schon)

## 5. Einsetzen statt Platzhalter

Aktuell zeigt der `tableSeat`-Hotspot nach Charaktererstellung nur Platzhalter-Text. Stattdessen:
- Wenn `dsaCharacterRolled` & noch kein Abenteuer → Tjark-Dialog `tjarkSmalltalk` Variante "Auf zum Abenteuer", danach öffnet sich `DsaAdventureScene` bei Beat 1.
- Wenn ein Abenteuer-Beat mittendrin gespeichert ist → direkt `DsaAdventureScene` an gespeichertem Beat öffnen.
- Wenn `dsaCampaignFinished` → kurzer Epilog-Text („Tjark klappt das Buch zu. Ihr habt es geschafft. Ein anderes Mal vielleicht weiter."), danach kein erneutes Öffnen.

## Geänderte / neue Dateien

**Neu**
- `src/game/dsa/adventure.ts` — Abenteuer-Datenstruktur (3 Szenen × ~3 Beats × Optionen)
- `src/components/game/DsaAdventureScene.tsx` — Overlay-Komponente
- `src/assets/dsa/dsa-anreise-forest.jpg`, `…-encounter.jpg`, `…-tavern-exterior.jpg`, `…-tavern-interior.jpg`, `…-ruin-entrance.jpg`, `…-ruin-chamber.jpg`
- `src/assets/music/dsa-tavern.mp3` (generiert via ElevenLabs)

**Geändert**
- `src/game/dialogs.ts` — neuer `tjarkSmalltalk` Tree + kurze Versionen für Brem/Yelva
- `src/game/scenes.ts` — `commonRoomE67`: `tjarkSpot.onUse` → `startDialog`; `tableSeat.onUse` → öffnet ggf. `DsaAdventureScene`
- `src/game/types.ts` — neue StoryFlags für Beat-Progression (z.B. `dsaScene1Beat2Done`); `GameApi` bekommt `openDsaAdventure(beatId?: string)` und `getDsaBeat()`
- `src/game/GameContext.tsx` — State + Persistenz für aktuellen Beat, Override-Wrapper für Musik
- `src/audio/MusicPlayer.tsx` — `pushOverride/popOverride` API
- `src/components/game/Game.tsx` oder `SceneView.tsx` — Render-Slot für `DsaAdventureScene`, `useEffect` für Musik-Override

## Umfang / Aufwand
Voller Build in einem Schritt. Geschätzte 15–20 neue Code-Stellen, ~600–800 Zeilen Dialog/Adventure-Daten, 6 Bild-Generierungen, 1 Musik-Generierung. Das wird ein großer Turn — danach sollte das Mini-Spiel komplett spielbar sein (Anreise → Wirtshaus → Ruine → Epilog).

Soll ich loslegen?
