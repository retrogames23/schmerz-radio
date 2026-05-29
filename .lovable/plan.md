
# Konzept: LLM-Tafelrunde im Gemeinschaftsraum E67

Tjark wird vom skriptierten Erzähler zum echten LLM-Spielleiter. Brem und Yelva werden zu LLM-gespielten Mitabenteurern, die auf Layards Worte reagieren. Das vorhandene `DsaCombatOverlay` und die Combat-Engine bleiben unverändert — der Meister „ruft" Kämpfe nur noch über strukturierte Marker auf.

## 1. User Flow

1. Layard setzt sich an den Tisch → falls noch kein DSA-Charakter existiert, `DsaCharacterCreator` (unverändert).
2. Setting-Auswahl-Screen vor dem ersten Beat:
   - Stadt-Abenteuer (Gareth, Punin, Festum, Al'Anfa, Thorwal-Hafen …)
   - Wildnis-Abenteuer (Reichsforst, Svelltland, Khôm-Rand, Tobrische Steppe …)
   - Episches Abenteuer (Borbarad-Vorzeichen, Tie'Shianna-Tempel, Verlorene Stadt …)
   - Dungeon (Echsenruine, Schwarzmagier-Kerker, Zwergenstollen …)
   - Höfisches Abenteuer (Intrige am Kaiserhof, Mittelreich)
   - „Würfel der Götter" (Meister wählt zufällig)
3. Meister eröffnet die Szene (LLM-Generierung), passendes Vorab-Bild wird eingeblendet.
4. Spieler tippt frei in ein Textfeld („Layard sagt / tut …"). Vorgefertigte Kurzbefehle: *Würfeln*, *Charakterbogen*, *Vom Tisch aufstehen*.
5. Meister antwortet, kann Brem/Yelva sprechen lassen, neues Bild einblenden, oder einen Kampf auslösen.
6. Bei Kampf-Marker → bestehender `DsaCombatOverlay` öffnet sich. Ergebnis (Sieg/Niederlage, finale LE) fließt als System-Nachricht zurück zum Meister, der die Erzählung fortsetzt.
7. „Vom Tisch aufstehen" pausiert. Beim Wiederkommen: exakt gleicher Stand (siehe §5).
8. Charaktertod → Meister bietet im selben Slot ein neues Abenteuer mit neuem Charakter an.

## 2. Rollen im LLM

Ein einziger Aufruf pro Spielerzug, ein Prompt, der drei Sprecher zulässt:
- **TJARK (Meister)** — beschreibt Welt, NPCs, Folgen; setzt Würfelproben und Kämpfe; mahnt bei zu langem Smalltalk zurück zum Abenteuer.
- **BREM** — Streuner-Mitspieler, trocken, pragmatisch (Persona aus `chatter.ts` übernommen).
- **YELVA** — Magierin-Mitspielerin, ironisch, gebildet.
- **LAYARD-Charakter** — wird nicht vom LLM gesprochen; nur wenn der Spieler explizit will, kann er auch outtime („Layard zu Brem: …") schreiben.

Ausgabeformat (strikt geparst):
```text
[TJARK] Du stehst vor dem Hesinde-Tempel …
[SCENE: city_temple]
[BREM] Bevor wir reingehen — wie laut darf ich sein?
[YELVA] Bibliothekslaut, Brem. Bibliothekslaut.
```

Optionale Marker:
- `[SCENE: <tag>]` — wechselt das Bild aus dem festen Pool.
- `[CHECK: KL -2]` — fordert eine Eigenschaftsprobe (vorhandene `rollAttrCheck`-Logik).
- `[COMBAT: wegelagerer_anfuehrer, wegelagerer_armbrust]` — startet `DsaCombatOverlay` mit IDs aus `ENEMY_STATS`.
- `[OUTTIME_WARN]` — Meister mahnt zurück zum Abenteuer (vom Modell selbst gesetzt, Client zeigt subtilen visuellen Cue).
- `[END: victory | defeat | aborted]` — Abenteuer-Abschluss, Angebot eines neuen Settings.

Unbekannte Marker werden ignoriert; bricht Output ab, kann der Client *„Tjark sammelt sich …"* anzeigen und einen Retry-Button bieten.

## 3. Aventurien-Treue (DSA2)

System-Prompt enthält einen kompakten Lore-Pflichtteil:
- Götterzwölf (Praios, Rondra, Efferd, Travia, Boron, Hesinde, Firun, Tsa, Phex, Peraine, Ingerimm, Rahja) + Zwölfgötterliche Tabus.
- Regionen mit knappen Stichpunkten (Mittelreich, Horasreich, Thorwal, Aranien, Tulamidenlande, Svelltland, Nivesengebiet, Maraskan, Echsensümpfe).
- Währung: Dukat / Silbertaler / Heller / Kreuzer.
- Magie: Spruchformeln, AE-Verbrauch, Akademisten vs. Hexen vs. Druiden vs. Elfen — keine D&D-Klassen, keine Mana-Bars.
- Zeit: Praios, Rondra, Efferd … (12 Monate à 30 Tage + Namenlose Tage). „Hal" als Tag.
- Verbote: keine Schusswaffen außer Armbrust/Bogen/Schleuder, keine modernen Begriffe, kein „okay" / „cool".
- Regeltreue: 3W20 unter Eigenschaft, Krankheiten/Gifte nur als Erzählfolge, keine Skillpunkte-Vergabe live (Charakterbogen bleibt statisch — Spielleiter darf nur LE/AE/Gold anpassen).

Lore-Datei: `src/game/dsa/llmLore.ts` — als eine Konstante exportierter Textblock, von Hand kuratiert (~2–3k Token), erweiterbar.

## 4. Bilderpool (vorab gerendert, keine Live-Generierung)

Ein fester Katalog `src/game/dsa/sceneImages.ts` mit Tag → Importpfad. Vorhandene Bilder werden integriert, weitere via `imagegen` einmalig erzeugt:

| Tag | Inhalt |
| --- | --- |
| `forest_path`, `forest_clearing`, `forest_night` | Reichsforst, Lichtungen |
| `mountain_pass`, `mountain_cave` | Hochland, Höhle |
| `swamp`, `coast`, `river_ferry` | Wildnis |
| `city_gate`, `city_market`, `city_alley`, `city_temple`, `city_palace` | Stadt |
| `tavern_ext`, `tavern_int`, `tavern_brawl` | Schenke |
| `dungeon_door`, `dungeon_corridor`, `dungeon_chamber`, `dungeon_crypt` | Verlies |
| `npc_noble`, `npc_priest`, `npc_thug`, `npc_merchant`, `npc_mage` | Generische Porträts |
| `combat_intro`, `aftermath`, `camp_fire` | Allgemein |

Der Meister-Prompt enthält die Liste aller Tags. Wenn das Modell einen unbekannten Tag schreibt, behält der Client das letzte Bild (kein Fehler). Keine Bildgenerierung zur Laufzeit, kein Credit-Verbrauch außer dem Chat-Turn.

## 5. Persistenz & Pause

Pro `user_id` + Tisch-Slot wird ein Adventure-State gespeichert (Lovable Cloud, neue Tabelle `dsa_llm_adventures`):
- `setting` (string)
- `character_snapshot` (jsonb: Name, Klasse, Attribute, LE, AE — eingefroren zu Beginn, danach mutierbar)
- `messages` (jsonb: AI-SDK `UIMessage[]` oder `{role, content}` mit den geparsten Markern, gekappt auf z. B. 200 Einträge / 60k Token, älteste werden summarisiert in `summary`)
- `summary` (text, vom Meister gelegentlich aktualisiert: „Bisher passiert …")
- `current_image_tag` (text)
- `status` (`active` | `victory` | `defeat` | `aborted`)
- `created_at`, `updated_at`

Beim Aufstehen wird nichts geändert. Beim Wiederkommen lädt der Client den Datensatz, zeigt letztes Bild + letzte Meister-Erzählung + Eingabefeld. Kein erneuter LLM-Call nötig.

Tod = `status = defeat`, Charakter wird gelöscht, beim nächsten Hinsetzen Setting-Wahl + neue Charaktererschaffung.

## 6. Outtime-Toleranz

Der Meister-Prompt erlaubt 1–2 Turns lockeren Smalltalk (Brem/Yelva machen Witze). Beim dritten Outtime-Turn in Folge zwingt eine Regel im Prompt einen `[OUTTIME_WARN]`-Marker + sanfte Rückführung („*Tjark tippt aufs Skript* — wollen wir weiter?"). Outtime-Zähler wird serverseitig im State mitgeführt (`offtopic_streak`).

## 7. Kampfsystem-Brücke

Workflow:
1. Meister-Output enthält `[COMBAT: …]`.
2. Client startet `DsaCombatOverlay` mit den IDs (Mapping wie heute über `ENEMY_STATS`). Unbekannte IDs werden gefiltert; bleibt nichts übrig, hängt der Client einen kurzen System-Hinweis an („Kein Gegner ausgewählt — bitte neu beschreiben") und ruft erneut auf.
3. Nach Kampf: Client schreibt eine System-Nachricht in den Verlauf:
   `[COMBAT_RESULT] victory=true hero_le=18/24 fallen=[]` bzw. `defeat`.
4. Nächster LLM-Call erzählt Konsequenzen; bei `defeat` setzt Meister `[END: defeat]` und bietet neues Abenteuer.

Kein Kampf-Code wird angefasst.

## 8. Sicherheit & Limits

- Wie `npc-chat.ts`: Origin-Guard, Auth Pflicht, Per-IP-Rate-Limit, Cloud-Request-Zähler (Donation-Gate).
- Input-Validierung: Spielereingabe 1–500 Zeichen, History max. 60 Einträge.
- Server hängt nicht-überschreibbaren Anti-Jailbreak-Block + DSA-Lore + Bilderpool-Tags + aktuellen `summary` und `character_snapshot` vor jeden Call.
- Modell: `google/gemini-3-flash-preview` (Default), Temperatur 0.8 für Erzählfreude, `max_tokens` 700.

## 9. Technische Umsetzung (Kurzfassung)

```text
src/game/dsa/
  llmLore.ts            ← Aventurien-Stichpunkte (Lore-Block)
  sceneImages.ts        ← Tag → Importpfad
  llmAdventure.ts       ← Settings-Liste, Marker-Parser, Typen
  llmMasterPrompt.ts    ← buildMasterSystemPrompt({setting, character, summary, offtopicStreak})

src/components/game/
  DsaLlmAdventureScene.tsx     ← Ersatz/Variante zu DsaAdventureScene
  DsaLlmSettingPicker.tsx
  DsaLlmTranscript.tsx         ← Chat-Verlauf mit Sprecher-Bubbles + Bildwechsel
  DsaLlmComposer.tsx           ← Eingabefeld

src/routes/api/public/
  dsa-master.ts         ← Server-Route, ruft Lovable AI auf, lädt/speichert State

supabase/migrations/
  <ts>_dsa_llm_adventures.sql  ← Tabelle + RLS (eigene Zeilen lesen/schreiben)
```

`GameContext` bekommt: `dsaLlmOpen`, `openDsaLlm()`, `closeDsaLlm()`, plus Übergabe-Hook von Kampf-Ende zurück in den Transcript. Die alte skriptierte Kampagne (`DSA_CAMPAIGN`) bleibt als Code im Repo, wird im Gemeinschaftsraum aber nicht mehr aufgerufen — bei Bedarf später entfernen.

## 10. Offene Punkte für später (nicht in diesem Plan implementieren)

- Sprach-Ausgabe (TTS) für Meister-Stimme: optional, nutzt bestehende `/api/tts`-Route.
- Würfel-Animation im UI für `[CHECK]`-Marker (jetzt: Ergebnis als Textzeile).
- Mehrere parallele Adventures pro User (jetzt: genau eines, das beim Hinsetzen geladen wird).
