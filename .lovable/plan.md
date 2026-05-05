## Idee — geht problemlos

Wir bauen eine neue Szene **„Kneipenvorraum"** zwischen Aussichtsweg (`elevatorE67`) und `pub`. Vor der Tür steht/hängt **MARV-9**, ein mechanischer Türsteher mit ramponiertem Lautsprechergrill, der über den bestehenden Free-Mode-Chat angesprochen werden kann. Er öffnet erst, wenn Layard ihm im Gespräch ehrlich Empathie zeigt.

Damit wird die Idee gut in die bestehende Architektur integriert:
- Free-Mode-Chat existiert bereits (`FreeChatOverlay`, `npcPersonas`, `/api/public/npc-chat`)
- Persona-System unterstützt `hardFacts`, `secrets`, `worldLore` und kontextabhängige Flags
- Resonanz/Flag-System ist da — wir nutzen es als „Empathie-Score"
- Ein neues Inventar-Item knüpft die Mechanik an dein Wunschthema „Inventar besser nutzen"

---

## Was passiert im Spiel

1. Layard kommt am Ende des Gehwegs an, sieht die Kneipentür — und davor MARV-9 mit Messingblende und schlotternder Servo-Klappe.
2. Beim Anklicken („Tür öffnen") seufzt MARV: *„Bitte. Noch einer. Geh weiter, drinnen ist es genauso traurig wie hier draußen, nur lauter."* — Tür bleibt zu.
3. Über den Knopf **„Mit MARV-9 sprechen"** öffnet sich der bekannte Free-Chat. MARV lamentiert (Anhalter-Marvin-haft, aber Ostblock-Flair der Welt) über Existenz, Schichtbetrieb, „Schmiernippel der Seele" usw.
4. Ein versteckter **Empathie-Score** (0–5) zählt Spielerantworten, die echtes Mitgefühl, Anerkennung seiner Lage oder eine eigene melancholische Reflexion zeigen. Beleidigungen oder Drohungen ziehen ab.
5. Bei Score ≥ 4 bricht MARV emotional ein: *„Du… hast mich gehört. Niemand hört. Geh rein, Layard. Aber sei leise."* — Flag `marvUnlocked` wird gesetzt, Tür ist von nun an offen, Hotspot zur `pub`-Szene aktiv.
6. Optional: Bei besonders gutem Verlauf gibt MARV als Geschenk eine **„Wartungs-Zugangsmarke"** heraus — ein neues Inventar-Item, das später ein anderes Rätsel löst.

### Weitere Inventar-Verzahnung (ohne Aufblähung)
- Ein **Ölkännchen** (im Werkstattbereich findbar) kann auf MARV angewendet werden → er reagiert sichtlich gerührt („Das hat noch nie jemand für mich getan."), Empathie-Score startet bei 2 statt 0.
- Aus MARVs Geschenk-Marke wird später ein klassisches Kombi-Rätsel (z. B. mit `paragraphenNotizbuch` für eine Bürokratie-Hürde).

---

## Technisches Design

### 1. Neue Szene `pubVestibule`
- `src/game/scenes/pub.ts`: zusätzliche Scene `pubVestibule` mit Hintergrund (neues KI-Bild), Hotspots:
  - „MARV-9 ansprechen" → öffnet `FreeChatOverlay` für npc `marv9`
  - „Tür öffnen" → wenn `marvUnlocked` gesetzt: `goTo("pub")`, sonst kurzer Trigger eines MARV-Spruchs
  - „Ölkännchen benutzen" → InventoryDrop-Target
  - „Zurück" → `goTo("elevatorE67")`
- `elevatorE67.ts`: `toPub`-Hotspot zeigt jetzt auf `pubVestibule` statt direkt `pub`.
- `types.ts`: `SceneId` um `"pubVestibule"` erweitern.

### 2. Persona MARV-9
- Neuer Eintrag `marv9` in `src/game/npcPersonas.ts` mit:
  - `personality`: melancholisch-lamentierend, leicht passiv-aggressiv, hochgebildet, zitiert „Wartungshandbuch Vol. III" wie Lyrik
  - `worldLore`: passt sich in den Komplex E67 ein (Schichten, Pneumatik, Schmerz-Radio)
  - `hardFacts`: Baujahr, Seriennummer, dass er Tür Nr. 4 ist, dass er noch nie eine Pause hatte
  - `secrets`: erinnert sich an einen Techniker, der ihn gebaut hat und nie wiederkam
  - `staticDialogIds`: leer (er hat keinen klassischen Dialogbaum, nur ein Initial-Geplänkel)
- `contextFlags`: `["marvOiled", "marvUnlocked"]` — werden in den Prompt durchgereicht.

### 3. Empathie-Bewertung serverseitig (sicher, nicht spoofbar)
Damit das Rätsel nicht trivial per Client-Hack lösbar ist, läuft die Bewertung im bestehenden `/api/public/npc-chat`-Endpoint:

- Erweiterung um optionalen Pfad: wenn `npcId === "marv9"`, ruft der Server **nach** der Persona-Antwort ein zweites, kleines Tool-Calling an Lovable AI (`google/gemini-3-flash-preview`) mit strikter JSON-Schema-Function:
  ```
  rate_empathy({ delta: -1 | 0 | 1 | 2, reason: string })
  ```
  Bewertet wird ausschließlich die letzte User-Nachricht.
- Server speichert den kumulierten Score in einer neuen Tabelle `marv_state(user_id, empathy_score, unlocked, oiled)` (RLS: nur eigener User lesen, schreiben nur via Service-Role aus Edge Function).
- Antwort enthält neben `reply` neue Felder `empathyDelta`, `empathyTotal`, `unlocked`. Der Client zeigt ein dezentes Herz-/Servo-Symbol als Feedback.
- Sobald Score ≥ 4: Server setzt `unlocked = true`. Beim nächsten `usePresence`/Game-Boot wird die Story-Flag `marvUnlocked` aus dieser Tabelle synchronisiert (über kleinen Loader im `GameContext`).

### 4. Inventar-Anbindung
- Neues Item `oilCan` (Fundort z. B. Wartungsraum 5610 oder Kantinen­verwaltung) in `InventoryItemId`.
- `pubVestibule`-Hotspot „MARV" akzeptiert `oilCan` als Drop → setzt Flag `marvOiled`, verbraucht Item, gibt eine Cutscene-artige MARV-Reaktion (statisch, kein LLM nötig). Flag fließt in den System-Prompt: *„Layard hat dich geölt — du bist sichtbar berührt."*
- Optional, neues Item `marvPass` als Belohnung — nur Vergabe, Verwendung kann später definiert werden.

### 5. UI-Kleinigkeiten
- Im `FreeChatOverlay` für `marv9`: Sprecher-Farbe „Messing/Patina", Avatar mit Servo-Klappen-Icon, optionaler Subtext „Empathie: ▮▮▮▯▯".
- Standard-Anti-Jailbreak-Schicht greift bereits — keine Änderung nötig.

### Datenfluss

```text
Spieler --click "Sprechen"--> FreeChatOverlay
       --POST /api/public/npc-chat (npcId: marv9, ctx: {oiled, unlocked})-->
Server: buildMarvPrompt() -> LLM (Antwort)
        -> rate_empathy() -> upsert marv_state
        <- reply + empathyDelta + unlocked
Client: zeigt Antwort + Score; bei unlocked -> setFlag("marvUnlocked")
```

---

## Schritte zur Umsetzung

1. Neue Tabelle `marv_state` + RLS-Policies (Migration).
2. `SceneId` + neue Scene `pubVestibule` (+ Hintergrundbild via AI-Gateway).
3. Persona `marv9` + `buildMarvSystemPrompt()` analog zu `bramPrompt.ts`.
4. `/api/public/npc-chat` um `marv9`-Pfad inkl. Empathie-Bewertung erweitern.
5. Item `oilCan` (+ optional `marvPass`) und Drop-Logik im Vestibül.
6. `FreeChatOverlay`: Score-Anzeige & Unlock-Toast.
7. `GameContext`: beim Boot `marv_state` laden und Flags synchronisieren.

---

## Offene Punkte (kann ich beim Bauen entscheiden, sag Bescheid wenn du anders willst)

- **Score-Schwelle**: 4/5 oder lieber lockerer (3/5)?
- **Ölkännchen-Fundort**: Wartungsraum 5610 wäre thematisch stimmig — okay?
- **MARV-Geschenk** (`marvPass`): jetzt schon einbauen oder erst, wenn wir wissen, welches spätere Rätsel es löst?

Sag mir, ob du so loslegen willst — oder ob du an Persona, Empathie-Mechanik oder Inventar-Anbindung Feinschliff möchtest.