## Ziel

Neuer undokumentierter Cheat **`cheat superuser`** in Layards Terminal (`worag@centralos`). Nach Eingabe kann `telnet <host>` zu jedem Bewohner-Rechner im Sektornetz ohne Passwortabfrage verbunden werden — die Auth-Stufe wird komplett übersprungen.

## Verhalten

- Eingabe `cheat superuser` (case-insensitive) im normalen Terminal:
  - Kurzer Beep + Bestätigungs-Output (Stil wie bei den anderen Debug-Cheats), z. B.:
    ```
    >> [DEBUG] superuser-mode aktiviert.
    >> telnet umgeht ab jetzt jede Authentifizierung.
    ```
  - Setzt einen neuen React-State `superuser: boolean` auf `true`.
- Nur in Layards Terminal verfügbar: Wenn `localBodoMode === true` (Bodos Terminal) oder wenn man bereits in einer Remote-Session ist (`remoteMode !== null`), wird der Cheat ignoriert / als unbekannter Befehl behandelt — sonst wäre er von Bodo aus ebenfalls nutzbar, was nicht gewünscht ist.
- Nur für Bewohner-Hosts: Hosts ohne `password` (z. B. reine Listening-Hosts wie der `carrier-daemon`-Knoten) bleiben mit `>> Verbindung verweigert: kein telnet-daemon auf Port 23.` — der Cheat erzeugt keine Verbindung wo es technisch keinen Daemon gibt.
- Sonderfall `bodo.e67` / `worag.e67`: Diese sind vollwertige Maschinen. `superuser` führt direkt in den Remote-Modus (gleicher Codepfad wie heute nach erfolgreichem Passwort) — also vollständige Filesystem-Session bis `exit`.
- Sonderfall `philippe.e67`: Wie heute wird das Flag `hackedPhilippe` gesetzt (Story-Hook bleibt erhalten).
- Persistenz: Der Superuser-Status gilt für die gesamte Terminal-Sitzung. Beim Schließen des Terminals (`closeTerminal`) wird der Status zurückgesetzt — analog zu `remoteMode`. So ist es ein bewusster Cheat, kein dauerhafter Story-Flag.

## Technische Umsetzung

Eine Datei betroffen: `src/components/game/Terminal.tsx`.

1. **Neuer State** neben den bestehenden Sub-Modus-States:
   ```tsx
   const [superuser, setSuperuser] = useState(false);
   ```

2. **Cheat-Handler** im Block ab Zeile ~1194 (wo schon `cheat 2611`, `cheat 0001`, `cheat 0002` stehen), eingefügt nach `cheat 2611` und vor `cheat 0001`:
   ```tsx
   if (raw.toLowerCase() === "cheat superuser") {
     // Nur in Layards eigenem Terminal, nicht in Bodos und nicht in einer Remote-Session.
     if (!localBodoMode && !remoteMode) {
       playBeep(0.5 * sfxVolume);
       setSuperuser(true);
       setLines((prev) => [
         ...prev,
         { text: `worag@centralos:~$ ${raw}`, kind: "in" },
         { text: ">> [DEBUG] superuser-mode aktiviert.", kind: "system" },
         { text: ">> telnet umgeht ab jetzt jede Authentifizierung.", kind: "out" },
         { text: "", kind: "out" },
       ]);
       setInput("");
       return;
     }
     // sonst: durchfallen, wird unten als unbekannter Befehl behandelt.
   }
   ```

3. **Telnet-Befehlszweig** (Zeile ~2059) erweitern: Wenn `superuser && host.password`, statt `setTelnetAwaitPass(host.host)` direkt den „Auth-OK"-Pfad ausführen, der heute in Zeile ~1404 ff. nach erfolgreicher Passworteingabe läuft. Refactor-leicht: gemeinsame Hilfsfunktion `enterAuthenticatedSession(host)` einführen, die den heute duplizierten Code (MOTD, Remote-Modus für bodo/worag, sonst `setTelnetHost`, Philippe-Flag) kapselt. Beide Stellen rufen sie auf.

   Für `superuser`-Fall zusätzlich eine Output-Zeile:
   ```
   >> [superuser] Authentifizierung übersprungen.
   ```

4. **Reset**: In `closeTerminal` (oder dem entsprechenden Effekt, der bereits `remoteMode = null` setzt) zusätzlich `setSuperuser(false)`. Damit ist der Cheat nicht über Sitzungen hinweg aktiv.

5. **Keine** Änderungen an `NET_HOSTS`, Filesystem-Dateien, Story-Flags oder Help-Text — der Cheat bleibt undokumentiert wie die anderen `cheat`-Eingaben.

## Akzeptanzkriterien

- In Layards Terminal: `cheat superuser` → Bestätigungstext erscheint.
- Danach: `telnet philippe.e67` → keine Passwortabfrage, direkt in Mini-Telnet-Session, `hackedPhilippe`-Flag wird gesetzt.
- `telnet bodo.e67` → direkt in vollwertige Remote-Session auf Bodos Maschine (Filesystem, Prompt `bodo@bodo:~$`).
- `telnet <host-ohne-passwort>` → unverändert „Verbindung verweigert".
- In Bodos Terminal: `cheat superuser` → wird als unbekannter Befehl behandelt (keine Aktivierung).
- Nach Schließen des Terminals und erneutem Öffnen: Superuser-Status ist wieder aus.
