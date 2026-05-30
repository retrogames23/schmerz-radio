# Standalone-DSA unter `/dsa`

## Ziel
Unter `whisperquest.app/dsa` eine eigene Seite, auf der ausschließlich die DSA-Tafelrunde gespielt werden kann — ohne Komplex E67, ohne Kantine, ohne Worag. Drei Speicherplätze, optional Login, sonst nichts vom Stammspiel sichtbar.

Das Stammspiel (`/`) bleibt unverändert: dort taucht weder ein neuer Slot-Picker auf, noch ändert sich der Charakter-Flow, die Tafelrunden-Mechanik oder das Speicher­verhalten.

## UX

### 1. Landingpage `/dsa`
- Eigene Optik (Pergament-Look der DSA-Welt, NICHT der CRT/E67-Stil).
- Header: „Die Tafelrunde" + kurzer Pitch (1–2 Sätze, was hier passiert).
- Login-Button oben rechts: öffnet bestehenden `AuthDialog`. Eingeloggte sehen ihren Namen + Logout.
- Hinweis: „Ohne Login werden deine Helden nur in diesem Browser gespeichert."
- Drei Slot-Karten nebeneinander (mobil: untereinander):
  - **Leer**: „Neuen Helden würfeln" → öffnet Charaktererschaffung für diesen Slot.
  - **Belegt**: Name, Klasse, LE, Status („Abenteuer läuft" / „Bereit für neues Abenteuer" / „Gefallen"). Buttons: „Weiterspielen" und „Held löschen".
- Footer: kleiner Link zurück zu `/` („Zum Stammspiel"), Impressum.

### 2. Spielfluss pro Slot
- Charaktererschaffung (bestehender Würfel-Flow) → Setting-Picker → Tjarks Tafelrunde → Kämpfe → Fail-Forward → Ende.
- Beim Beenden („Vom Tisch aufstehen") landet man wieder auf der Slot-Übersicht, nicht im Stammspiel.

## Architektur

### Wichtigster Punkt — keine Doppelpflege
Die DSA-Komponenten (`DsaCharacterCreator`, `DsaLlmAdventureScene`, `DsaCharacterSheet`, `DsaCombatInteractive`) hängen aktuell hart an `useGame()`. Statt sie zu duplizieren, führe ich einen schmalen Adapter ein:

- Neuer **`DsaHostContext`** mit genau den Feldern, die die DSA-Komponenten brauchen (character get/set, sessionId, open/close-Flags, mood-Setter).
- Die DSA-Komponenten werden so umgestellt, dass sie `useDsaHost()` statt `useGame()` lesen.
- Im Stammspiel wickelt die `GameShell` die DSA-Komponenten in einen `<DsaHostFromGameContext>` ein, der `useGame()` aufruft und in den Host-Shape übersetzt. → Verhalten und gespeicherte Daten im Stammspiel bleiben identisch.
- Auf `/dsa` liefert ein eigener `<StandaloneDsaHost>` denselben Shape aus eigenem State (localStorage + optional Cloud).

Das ist die einzige Stelle, an der Stammspiel-Code angefasst wird — und nur als reines Re-Wiring der Imports, ohne Logikänderung.

### Speicherplätze
- Server-Schema bleibt wie es ist (`dsa_llm_adventures` ist schon nach `(user_id|anon_id, session_id)` partitioniert).
- Drei Slots = drei stabile sessionIds pro Spieler:
  - Eingeloggt: `dsa-slot-1`, `dsa-slot-2`, `dsa-slot-3` (server matcht auf user_id).
  - Anonym: gleiche Slot-Ids + browserbasierte `anonId` (existiert bereits).
- Charakter pro Slot wird in `localStorage` unter `dsa.standalone.slot-{n}.character` abgelegt. Cloud-Sync für den reinen Charakter ist nicht Teil dieses Schritts — die Adventure-Rows enthalten ohnehin den Character-Snapshot.

### Routing
- Neue Datei `src/routes/dsa/index.tsx` → Landingpage mit Slot-Picker.
- Neue Datei `src/routes/dsa/$slot.tsx` → Spielansicht für `/dsa/1`, `/dsa/2`, `/dsa/3`.
- Beide Routen sind komplett unabhängig vom `Game.tsx`/`GameShell`-Tree — kein `MainGame`, kein Adventure-State, keine Worag-Logik.
- Eigene Head-Meta (Titel „DSA Tafelrunde — WhisperQuest", eigene Description, og-Tags).

### Login
- Wiederverwendung von `AuthContext` + `AuthDialog`. Beides ist bereits app-weit verfügbar.
- Slots funktionieren ohne Login (anonym, lokal). Nach Login wandern existierende Anonym-Adventures **nicht** automatisch um — bewusste Entscheidung, weil sonst Konflikte mit eventuell vorhandenen Cloud-Slots entstehen. Stattdessen Hinweis in der UI.

### Was bleibt unverändert
- `src/components/game/Game.tsx`, `GameShell.tsx` Routing-Logik, alle Stammspiel-Szenen, Inventar, Dialoge.
- DSA-Charaktererschaffung, Tafelrunden-Scene und Kampf-Overlay funktional 1:1, nur über neuen Context geliefert.
- Server-Route `/api/public/dsa-master` und Migrations.

## Schritte

1. `DsaHostContext` + `useDsaHost()` einführen, DSA-Komponenten auf den Hook umstellen.
2. `GameShell` mit dem Bridge-Provider versehen, der `useGame()` → DsaHost übersetzt. Smoke-Test im Stammspiel (Worag → DSA-Tisch).
3. `StandaloneDsaHost` für `/dsa` implementieren (Slot-State, localStorage, sessionId-Mapping).
4. Landingpage `/dsa` mit Slot-Karten + Login bauen.
5. Slot-Route `/dsa/$slot` bauen: Creator-Overlay bzw. Adventure-Scene rendern, je nachdem ob ein Charakter existiert. „Aufstehen" navigiert zurück zu `/dsa`.
6. Head-Meta, Footer, Impressum-Link, Smoke-Test als anonymer + eingeloggter User.

## Offene Punkte (Annahmen, korrigiere wenn falsch)
- Charakter-Daten der Slots werden nur lokal gespeichert; nur das laufende Abenteuer landet (wie bisher) in der Cloud. OK?
- Drei Slots sind hart kodiert, keine Umbenennung („Slot 1/2/3" reicht). OK?
- Auf `/dsa` ist kein Backlink zum Komplex E67 sichtbar außer dem dezenten Footer-Link „Zum Stammspiel". OK?