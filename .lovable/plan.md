# Wohnung 1104 — Hanne Brodersen, die Rückkehrerin

## Ziel
Hinter der bisher nur betrachtbaren Tür 1104 (Korridor 11, E71) wohnt eine neue Figur: Alt-Hippie ohne Esoterik, in einer für 1997 auffallend modernen Wohnung. Sehr gesprächig, zieht Layard nach Small Talk in lange philosophische Gespräche — jederzeit verlassbar.

## Die Figur (Arbeitsname, gern änderbar)
**Hanne Brodersen**, geb. 1948 in Hamburg, 1966 in die USA (Bay Area), 1972 zurück ins Mandatsgebiet.
- Kam zurück wegen Vollkornbrot, Gemütlichkeit und der Präzision der deutschen Sprache.
- Vermisst hier das Visionäre, die Weite, das freie Denken und die Beschäftigung mit Computertechnik.
- Besitzt einen Apple Macintosh von 1994 (Performa/Power Mac), auf einem Tischchen neben einem zerlesenen Stapel „Whole Earth Catalog“.
- Ton: warm, schnell, spöttisch, nie esoterisch — sie argumentiert, zitiert, widerspricht sich selbst gern.

## Wohnung
- Neues Hintergrundbild: hell, aufgeräumt, Eames-artiger Sessel, Geodätenkuppel-Modell aus Strohhalmen, Bücherwände, Vollkornbrot auf Holzbrett, der Mac mit leuchtendem Bildschirm.
- Hotspots: Hanne (Gespräch), der Macintosh (Betrachten + kurzer Kommentar von ihr), Whole-Earth-Stapel, Kuppelmodell, Brotbrett, Plattenregal (Dylan), Ausgang.
- Tür 1104 im Korridor wird begehbar (bisheriger Betrachten-Text bleibt als Erstbeschreibung).

## Dialogstruktur
```text
Erstbegegnung (Small Talk: Brot, Hamburg, „Sie sind der von der Bibliothek?“)
        |
     HUB (kehrt immer zurück, jede Ebene hat „Lassen wir das“ / „Ich muss los“)
  ┌──────┬──────────┬───────────┬───────────┬───────────┬──────────┐
 USA &  Fuller     Mumford     Whole Earth  Beat &     Der Mac /
 Rückkehr                       Catalog     Dylan      Computer
```
Jeder Strang 3–5 Ebenen tief, mit Querverweisen zwischen den Strängen (z. B. Mumford „Megamaschine“ → Fuller „Spaceship Earth“ → Brand „Access to tools“). Jede Ebene endet im Rückbezug auf das Mandatsgebiet 1997.

Inhaltliche Kerne (reale Theorien, korrekt wiedergegeben):
- **Fuller**: Spaceship Earth / Bedienungsanleitung, Ephemeralisierung („mehr mit weniger“), Synergetik, Tensegrity, Geodätenkuppel, World Game, „Du änderst Dinge nie, indem du gegen die bestehende Wirklichkeit kämpfst …“ — gespiegelt auf die Verwaltung, die mit mehr Formularen weniger erreicht.
- **Mumford**: Megamaschine (Mythos der Maschine), Pentagon der Macht, autoritäre vs. demokratische Technik, „Die Stadt in der Geschichte“, Paläotechnik/Neotechnik — die Mandatsverwaltung als Megamaschine aus Menschen.
- **Whole Earth Catalog / Stewart Brand**: „We are as gods and might as well get good at it“, „Access to tools“, Stay hungry, stay foolish (Rückseite 1974), Gregory Bateson (Ökologie des Geistes, Doppelbindung), Norbert Wiener (Kybernetik), Marshall McLuhan, Ivan Illich („Werkzeuge für ein konviviales Leben“), E. F. Schumacher (Small is beautiful).
- **Beat & Dylan**: Ginsberg „Howl“ (Moloch!) als Brücke zu Mumford, Burroughs' Kontrollbegriff und Cut-up-Technik (sie zerschneidet Amtsbescheide), Kerouac, Dylan „The Times They Are a-Changin'“, „It's Alright, Ma“ — Poesie als Diagnose, nicht als Trost.
- **Psychologie/Soziologie**: Batesons Doppelbindung auf Mandatsdeutsch, Kontrollgesellschaft, Gemütlichkeit als Betäubung vs. Geborgenheit.
- **Der Mac**: HyperCard, Engelbart, „Computer für den Rest von uns“, das Netz als Whole Earth Catalog ohne Papier — ihre Sehnsucht und ihre Skepsis (Kontrolle durch Vernetzung).

Umfang: ca. 120–160 Dialogzeilen, viele Antwortoptionen. Einige Optionen erscheinen erst nach Wissen aus anderen Strängen oder nach Treffen mit Walter/Ralf/Herbert (kurze Seitenhiebe auf die Nachbarn).

## Spielauswirkung
Rein atmosphärisch, kein Pflichträtsel; ein Flag `metHanne` und pro Strang ein „gehört“-Flag, damit der Hub bei Wiederbesuch neue Einstiege zeigt. Optional später: ein leihbares Buch (Whole Earth Catalog) — nicht Teil dieses Plans.

## Technische Details
- `src/game/scenes/apt1104.ts` (analog `apt1103.ts`), registriert in `scenes/index.ts`; `"apt1104"` in `SceneId` in `types.ts`; Flags `metHanne`, `hanneFuller`, `hanneMumford`, `hanneWEC`, `hanneBeat`, `hanneMac`, `hanneUSA`.
- `door1104` in `corridor11.ts` bekommt `api.goTo("apt1104")`.
- `src/game/dialogs/hanne.ts` mit `hanneIntro`, `hanneHub` und Strang-Bäumen; in `dialogs/index.ts` eingebunden. Jede Choice-Liste enthält einen Exit zum Hub bzw. ein Dialogende.
- Neues Bild `src/assets/scene-apt-1104.jpg` (Imagegen, Stil der bestehenden Szenen).
- Persona-Eintrag in `npcPersonas.ts` für den Freitext-Chat, falls andere Nachbarn ihn haben.
- Danach `bun run scripts/solve-check.mjs` und `lore-check.mjs`; LORE.md um Hanne ergänzen.
