## Ziel
Den DSA-Gruppenraum nicht weiter flicken, sondern den Lobby-/Vorzimmer-Flow so umbauen, dass Raumdaten, Mitglieder, Heldwahl und Bereit-Status zuverlässig aus einer einzigen Server-Quelle kommen.

## Was ich neu baue

1. **Eine zentrale Gruppenraum-API**
   - Die bestehende `/api/public/dsa-group`-Route bleibt als Backend-Einstieg erhalten.
   - Ich ergänze/vereinheitliche eine `state`-Aktion, die Raum, Mitglieder, Nachrichten, Pending Actions und eigene Helden serverseitig lädt.
   - Der Browser muss dann nicht mehr direkt mehrere Tabellen lesen und kann nicht mehr durch fehlende Grants/RLS-Sichtbarkeit in falsche Zustände fallen.

2. **Vorzimmer komplett neu verkabeln**
   - `src/routes/dsa.gruppe.$roomId.tsx` wird auf den neuen Server-State umgestellt.
   - Held auswählen, Bereit toggeln, Raum verlassen, Spieler entfernen und Starten laden nach jeder Aktion den frischen Server-State nach.
   - Die UI zeigt klar: aktueller Spieler, gewählter Held, Bereit-Status, Fehler vom Server und einen manuellen Aktualisieren-Knopf.
   - Keine lokale Vermutung mehr wie „myMember fehlt also kein Held gewählt“.

3. **Lobby robuster machen**
   - `src/routes/dsa.gruppe.tsx` bekommt ebenfalls einen API-State für Räume, statt Räume/Mitglieder direkt per Client aus mehreren Tabellen zusammenzubauen.
   - Raumliste, Mitgliederzahl, Beitreten, Löschen und Weiterleiten werden serverseitig konsistent.

4. **Spielraum an denselben State anbinden**
   - `src/routes/dsa.gruppe.$roomId.spiel.tsx` lädt Raum, Mitglieder, Nachrichten und Pending Actions über dieselbe API.
   - Aktionen wie `heartbeat`, `submitAction`, `advance` bleiben serverseitig, aber die Anzeige hängt nicht mehr an direkten Client-Tabellenabfragen.

5. **Datenbank-Zugriff reparieren, falls nötig**
   - Ich füge eine Migration für die fehlenden Data-API-GRANTs auf den DSA-Gruppentabellen hinzu bzw. stelle sie sicher.
   - Wichtig: Die RLS-Regeln bleiben restriktiv; die neue API nutzt serverseitige Prüfung, damit keine fremden Räume sichtbar werden.

## Technische Umsetzung

- Serverroute ergänzt Aktionen wie:
  - `listRooms`
  - `getRoomState`
  - bestehend: `create`, `join`, `leave`, `deleteRoom`, `kick`, `pickHero`, `setReady`, `start`, `heartbeat`, `submitAction`, `advance`
- State-Antworten enthalten nur sichere Felder:
  - Raum-Metadaten ohne Passwort-Hash
  - Mitglieder nur für berechtigte Raumteilnehmer
  - eigene Helden nur für den angemeldeten Nutzer
- Realtime bleibt als Trigger zum Nachladen erhalten, aber nicht mehr als alleinige Wahrheit.
- Der konkrete Bug bei Raum `c7a26018-2b73-4cc4-bb7f-5a00fb318826`: Die Datenbank zeigt bereits `picked=1` und `ready=1`, aber der Client sieht den Mitgliedsstatus nicht zuverlässig. Der Umbau behebt genau diese Diskrepanz.

## Validierung

- Raumliste lädt für eingeloggte Nutzer.
- Raum erstellen und betreten funktioniert.
- Held wählen aktualisiert sofort den eigenen Slot im Vorzimmer.
- Bereit-Knopf erkennt den gewählten Helden zuverlässig.
- Host sieht Start erst, wenn alle bereit sind.
- Spielraum zeigt Gruppe und Aktionen aus demselben Server-State.