# Konbini E71 — der medizinische Ableger

## Idee

E71 ist der Medizin-Quadrant („Resonanz-Hygiene — bitte respektieren"). Sein Konbini ist derselbe Typ K-4 wie in E67, aber vom Quadranten geprägt: halb Laden, halb Sanitätsausgabe. Die Ware ist klinisch — Verbandsmaterial, OP-Masken, Kräutertees, Haltbarmilch, Desinfektionsseife, Tabletten gegen „resonanzbedingte Schlafstörungen". Dieselben japanischen Geräte (Wirtschaftsabkommen 1979), aber die Ansagen wirken hier leiser und distanzierter — als wäre selbst die Kasse darauf geschult, niemanden zu wecken.

## Umsetzung

1. **Eingang:** Die bisher ungenutzte Tür an der linken Wand der E71-Lobby (neben dem schwarzen Verzeichnis-Brett) wird zur Konbini-Tür. Neuer Hotspot in `e71Lobby` (sectorAct1.ts), der in die neue Szene `konbiniE71` führt. Emailleschild „Konbini E71 (Typ K-4m)".

2. **Szene `konbiniE71`** (neue Datei `src/game/scenes/konbiniE71.ts`):
   - Neues Hintergrundbild im Unavowed-Malstil: klinisch-kühler Konbini, weiße Fliesen, grelle Leuchtstoffröhren, Regale mit Verbandskästen, Maskenpackungen und Teedosen, ein Kühlregal mit Haltbarmilch, japanische Kasse und Münzzähler wie in E67. Kein traditionell-japanischer Kitsch — eher Apotheken-Ordnung mit Konbini-Layout.
   - LED-Laufband (Decal `ledTicker` mit passender Schräglage) mit Hygiene-Ticker, z. B. „+++ KONBINI E71 (TYP K-4m) +++ RESONANZ-HYGIENE: MASKENPFLICHT IN WARTEBEREICHEN +++ NACHTVERKAUF NUR MIT SCHEIN S/D ODER NOTFALL-BESCHEINIGUNG +++".
   - Hotspots: Verkäufer (Dialog), Regale/Kühlregal/Münzzähler (Look-Texte), Ausgang zurück in die Lobby.

3. **Verkäufer:** Eine neue Figur, direkt ins Bild gemalt (kein Sprite) — z. B. **Rosa Minden**, Nachtschicht-Versorgungswartin, Mitte 40, weißer Kittel über dem beigen Mandats-Arbeitskittel, ruhig und knapp. Neuer Dialog-Baum `krollE71`-Pendant (`mindenKonbini` in `src/game/dialogs/minden.ts`): gleiche Regeln wie E67 (Regelverkauf 06–19 Uhr, danach nur mit Schein S/D oder Notfall-Bezugsschein aus der Leitstelle), aber medizinisch eingefärbt — sie kennt die Resonanz-Hygiene-Vorschriften und kann atmosphärische Hinweise auf die Zusammenbrüche streuen (keine Quest-Fakten, nur Stimmung). Neuer Sprecher `MINDEN` in types.ts + speech.ts (TTS-Stimme).

4. **Sound-Kulisse:** Eigene Variante der Konbini-Ambience (`konbiniAmbienceE71` oder Parameter): gedämpfteres Brummen, leiseres Kühlsurren, japanische Ansagen in ruhigerem, fast flüsterndem Ton („Shizuka ni onegai shimasu" — bitte Ruhe). Wie in E67: Musik pausiert im Raum, Player ausgeblendet, beim Verlassen fortgesetzt (`getSceneMusicPlaylist`-Resolver + `KonbiniAmbienceBridge` in GameShell.tsx, TopBar-Ausblendung um `konbiniE71` erweitern).

5. **Handbuch:** §5.2 im Bewohnerhandbuch um einen Satz ergänzen: In Medizin-Quadranten führt der Konbini die Ausführung K-4m mit Hygiene-Sortiment.

## Technische Details

- Neue Dateien: `src/game/scenes/konbiniE71.ts`, `src/game/dialogs/minden.ts`, `src/assets/scene-konbini-e71.jpg` (generiert), ggf. `src/audio/konbiniAmbienceE71.ts`, neue Ansagen-MP3s in `public/audio/`.
- Änderungen: `sectorAct1.ts` (Hotspot), `scenes/index.ts`, `types.ts` (SceneId, Sprecher), `speech.ts`, `GameShell.tsx`/`getSceneMusicPlaylist`, `TopBar.tsx`, `e67Handbook.ts`.
- Danach: Typecheck, Solve-/Story-/Lore-Checks, Build, kurzer Playwright-Sichtcheck.

## Offene Frage

- Name und Auftreten der Verkäuferin (Vorschlag: Rosa Minden) — gern anpassen.
- Soll der E71-Konbini schon jetzt ein spielbares Item führen (z. B. Masken-Nachschub) oder vorerst reine Atmosphäre bleiben?
