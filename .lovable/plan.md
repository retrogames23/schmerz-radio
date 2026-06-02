
# DSA-Gruppenabenteuer mit menschlichen Gefährten

Solo bleibt vollständig erhalten. Daneben entsteht ein zweiter Spielmodus für 2–4 menschliche Spieler mit Tjark als gemeinsamem KI-Meister.

## Was sich ändert (UI)

### Landingpage `/dsa`
- Erster Button wird umbenannt: **„DSA-Solo-Abenteuer mit KI-Gefährten starten"** → führt wie bisher zu `/dsa/helden`.
- Zweiter Button **„DSA-Gruppenabenteuer mit menschlichen Gefährten starten"** → führt zu `/dsa/gruppe` (Lobby).
- FAQ-Block bekommt 1–2 ergänzende Fragen zum Gruppenmodus.

### Neue Lobby-Seite `/dsa/gruppe`
- Liste **offener Räume**: Name, Setting-Icon, Spieler X/4, Schloss-Symbol bei Passwort, „Beitreten"-Knopf.
- Knopf **„Neuen Raum eröffnen"** → Dialog:
  - Raumname (Pflicht, 3–40 Zeichen)
  - Passwort (optional)
  - Setting wählen (gleiche Liste wie Solo: Stadt, Wildnis, Episch, Dungeon, Hof, Würfel der Götter, Sandbox, Wunsch)
  - Wunsch-Freitext, falls Setting „Wunsch"
  - Checkbox **„Brem & Yelva als NPC-Gefährten mitlaufen lassen"**
  - max. Spielerzahl (2–4)

### Raum-Vorzimmer `/dsa/gruppe/$roomId`
- Liste der bisher beigetretenen Spieler mit ihren Helden (Name, Klasse, LE, AE, AP).
- Jeder Spieler wählt einen Helden aus seinen Slot-1–3 **oder** klickt „Neuen Helden würfeln" (öffnet bestehenden Creator, speichert in einen freien Slot).
- Jeder Spieler hat einen **„Bereit"**-Knopf. Host sieht zusätzlich **„Abenteuer starten"** (aktiv, sobald alle bereit sind und mind. 2 Spieler im Raum).
- Host kann Raum schließen / einen Spieler kicken.
- Beim Start wird der Snapshot jedes gewählten Helden eingefroren (analog zum Solo) und das Abenteuer beginnt.

### Spielraum `/dsa/gruppe/$roomId/spiel`
- Geteilte Erzählung in der Mitte (Tjarks Text + alle Spielereingaben mit Spielernamen davor).
- Eigener Charakterbogen rechts (wie Solo).
- Liste der **Mitspieler-Charaktere** mit Kurzwerten (LE, AE, Status) — keine fremde Inventar/Talent-Details.
- Eingabefeld unten: jederzeit tippbar; Tjark-Antwort wartet kurz auf weitere Eingaben (siehe Spielfluss).
- Statusbanner: „Tjark webt eure Aktionen zusammen…" während der LLM-Anfrage.

## Konzept (Mechanik)

**Spielfluss — freie Reihenfolge:**
- Spieler tippen jederzeit Aktionen ein. Sobald die erste Aktion in einer „Runde" landet, startet ein **Sammelfenster von ~20 Sekunden** (sichtbarer Countdown). Innerhalb des Fensters können andere Spieler nachziehen.
- Nach Ablauf (oder wenn alle aktiven Spieler eine Aktion abgegeben haben) ruft der Server Tjark **einmal** mit allen gesammelten Aktionen auf. Tjark verarbeitet sie als eine zusammenhängende Szene, würfelt für jeden Held einzeln, beschreibt das Ergebnis pro Charakter und stellt die nächste Frage.
- Im Kampf bleibt es bei freier Reihenfolge, Tjark sortiert intern nach INI und beschreibt es entsprechend.

**Helden:** Spieler können einen ihrer drei Solo-Slot-Helden mitbringen **oder** neu würfeln. Beim Start des Abenteuers wird ein **Snapshot** in den Raum gespeichert (wie Solo-Snapshot), damit zwischenzeitliche Solo-Änderungen das Gruppenspiel nicht durcheinanderbringen.

**AP-Belohnung:** Jeder Held bekommt nach Abenteuerende die **volle AP-Gutschrift** (gleicher Mechanismus wie Solo, einmal pro Held). Das Solo-Save wird beim Beenden mit AP, Inventar-Änderungen und Adventure-Zähler aktualisiert.

**Brem & Yelva:** Wird beim Raumanlegen aktiviert/deaktiviert. Wenn aktiv, behandelt Tjark sie wie im Solo (NPC-Gefährten mit eigenem Inventar im Prompt). Default: aus.

**Disconnect:** Wenn ein Spieler länger als ~60 s nicht heartbeatet, markiert der Server seinen Charakter als „abwesend". Tjark bekommt im nächsten System-Hint: „Spieler X ist abwesend, schreibe seinen Helden plausibel kurz aus der Szene (Wache halten, Pferde versorgen, beten)." Kommt der Spieler zurück, schreibt Tjark ihn wieder ein.

**Passwortschutz:** Optionales Klartextpasswort wird gehasht (bcrypt-light über server fn) und nur beim Beitrittsversuch geprüft.

**Lebensdauer:** Räume ohne Aktivität (kein Heartbeat aller Spieler) werden nach 6 h als „beendet" markiert und aus der Lobby-Liste entfernt. Beendete Abenteuer bleiben im Verlauf der teilnehmenden Helden.

## Technisches Konzept

```text
src/routes/
  dsa.index.tsx               → 2 Buttons + 1 FAQ-Eintrag
  dsa.gruppe.tsx              → Lobby (Räume listen, eröffnen)
  dsa.gruppe.$roomId.tsx      → Vorzimmer (Held wählen, bereit)
  dsa.gruppe.$roomId.spiel.tsx→ Spielraum
src/components/dsa-group/
  RoomList.tsx, CreateRoomDialog.tsx, RoomLobby.tsx,
  HeroPicker.tsx, GroupAdventureScene.tsx, PartyPanel.tsx
src/game/dsa/group/
  prompt.ts        (Master-Prompt-Variante für Mehrspieler)
  turnCollector.ts (Sammelfenster-Logik clientseitig)
src/routes/api/public/
  dsa-group.ts     (Server-Route: create/join/leave/ready/start,
                    submit-action, advance-turn, finish)
```

**Datenmodell (neue Tabellen, alle mit GRANT + RLS):**
- `dsa_group_rooms` — id, host_user_id, name, password_hash (nullable), setting, wish_brief, include_npc_companions, max_players, status (`lobby` | `active` | `done`), session_id, current_image_tag, summary, created_at, updated_at.
- `dsa_group_members` — room_id, user_id, slot (1–3 oder 0=temporär), hero_snapshot (jsonb), ready, last_seen_at, joined_at, position. PK (room_id, user_id).
- `dsa_group_messages` — room_id, idx, role (`master` | `player` | `system`), author_user_id (nullable), author_hero_name, content, created_at.
- `dsa_group_pending_actions` — room_id, turn_idx, user_id, hero_name, action, created_at. PK (room_id, turn_idx, user_id).

RLS: nur Mitglieder eines Raums dürfen lesen/schreiben (Helper-Funktion `is_room_member(room_id, uid)`); Host darf Raum schließen; Lobby-Liste (nur Räume mit `status='lobby'` und `password_hash IS NULL OR limited fields`) ist auch für anonyme Auth-User sichtbar (nur Name/Setting/Spielerzahl, nie der Hash).

**Echtzeit:** Supabase Realtime auf den vier Tabellen (`ADD TABLE ... TO PUBLICATION supabase_realtime`). Client abonniert Channel pro Raum für Nachrichten, Mitglieder, Pending-Actions.

**Server-Route `/api/public/dsa-group`** (TanStack server route, mit Auth-Verifikation per Bearer-Token):
- `create`, `join` (mit Passwort), `leave`, `setReady`, `start`
- `submitAction` (legt in `dsa_group_pending_actions` ab; wenn alle aktiven Spieler abgegeben haben oder Timeout abgelaufen ist, ruft Tjark auf)
- `advanceTurn` (Tjark-Aufruf via Lovable AI, schreibt Master-Message und leert Pending)
- `finish` (vergibt AP an alle Helden, schreibt Snapshots zurück in `dsa_heroes` der jeweiligen Spieler)
- Wiederverwendet `llmMasterPrompt.ts` mit Erweiterung: Gruppen-Header („Helden in dieser Tafelrunde: …"), Aktionsblock („Diese Runde haben gehandelt: X tut A, Y tut B, Z ist abwesend").

**Reuse:** Marker-System (`[ITEM+ …]`, `[SCENE: …]`, `[MOOD: …]`, Probenmarker) bleibt unverändert. Inventar-/AP-Änderungen werden pro Held an dessen `dsa_heroes`-Zeile zurückgeschrieben (Tjark referenziert Helden über `[HERO: Name][ITEM+: …]`).

**Login-Pflicht:** Gruppenmodus erfordert eingeloggte Spieler (sonst keine Cross-Device-Persistenz und keine RLS-Identität). Anon-Login wird im Solo erlaubt, im Gruppenmodus blockiert mit Hinweis „Bitte zuerst anmelden".

## Umfang dieses Plans
Großes Feature — wird in einer Build-Phase umgesetzt:
1. Migration (4 Tabellen + Realtime + Helper-Funktion).
2. Landingpage-Buttons + Lobby-Route + CreateRoomDialog.
3. Vorzimmer mit HeroPicker und Ready-Logik.
4. Spielraum mit Sammelfenster + Server-Route + Master-Prompt-Erweiterung.
5. AP-Auszahlung am Ende + Verlaufseintrag bei allen Helden.

Kein Eingriff in Solo-Code außer der Landingpage und einer Wiederverwendung von `llmMasterPrompt.ts` (additiv).
