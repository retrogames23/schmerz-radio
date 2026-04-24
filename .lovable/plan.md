# Plan: Telnet-Sessions als „echtes“ Remote-Terminal

## Ziel

Sobald `telnet <host>` mit korrektem Passwort erfolgreich war, soll sich das Terminal **bis `exit`** so verhalten, als säße man tatsächlich am Zielrechner: gleiches Filesystem, gleicher Prompt, gleiche Befehle (`ls -a`, `cd`, `cat <pfad>`, `tree`, Tab-Complete, Verlauf, …) — kein Mini-Befehlssatz mehr.

## Kernidee (einfach umsetzbar)

Bodo und Worag haben heute schon **jeweils einen vollständigen Terminal-Modus** mit eigenem Filesystem (`FILESYSTEM_BODO` / `FILESYSTEM_WORAG`), umgeschaltet über das einzelne Flag `bodoMode` (`terminalBodoMode` aus `GameContext`).

Das nutzen wir aus: eine Telnet-Sitzung ist ab jetzt einfach **„temporär in den Modus des Zielhosts wechseln“**, mit `exit` zurück zum eigenen Host. Damit erbt Telnet kostenlos alle Features des Hauptterminals.

## Welche Hosts profitieren

- **`telnet bodo.e67`** (von Worag aus) und **`telnet worag.e67`** (von Bodo aus): vollwertiger Wechsel ins jeweils andere Filesystem — `cd`, `ls -a`, `cat home/bodo/.freiheit.txt`, `tree`, Tab-Complete, alles.
- **Andere Hosts** (`philippe.e67`, `kamenev.e67`, `helka.e67`, `ennis.e67`, `mira.zks`, `drucker46.e67`, `kantine.e67`): bleiben bei ihrer bestehenden flachen `files`-Map, bekommen aber im selben Aufwasch die gleichen Komfort-Befehle wie der Hauptterminal-Modus, nur ohne Verzeichnisse. Konkret:
  - `ls` / `ls -a` (versteckte Dateien mit Punkt-Präfix)
  - `cat <datei>` mit „Datei nicht gefunden“ statt der heutigen Sonderausgabe
  - `pwd` zeigt `/home/<user>`
  - `help` mit identischem Layout wie auf dem Hauptterminal (reduziert auf das hier Mögliche)
  - **Tab-Complete** und **Pfeil-hoch/runter Verlauf** funktionieren auch in der Session
  - Prompt-Format `user@host:~$` bleibt, damit visuell klar bleibt, dass man remote ist.

## Was sich technisch ändert (Details, optional zu lesen)

Datei: `src/components/game/Terminal.tsx`

1. **Neues State-Feld** `remoteMode: "worag" | "bodo" | null` (oder Wiederverwendung von `telnetHost`). Wird gesetzt, sobald Telnet auf `worag.e67` bzw. `bodo.e67` erfolgreich authentifiziert.
2. **Effektiver Modus** = `remoteMode ?? (terminalBodoMode ? "bodo" : "worag")`. Daraus wird live abgeleitet:
   - `userName`, `homePath`, `homeLabel`
   - `resolvePath`, `pathString`, `FILESYSTEM` (bereits vorhanden)
   - Prompt
3. Der **bestehende Hauptbefehls-Block** (`ls`, `cd`, `cat`, `tree`, `pwd`, `help`, Tab-Complete, History) wird unverändert verwendet. Lediglich:
   - `exit` / `logout` / `quit` schließen die Remote-Session, statt das Terminal zu schließen, wenn `remoteMode !== null`.
   - Sub-Programme, die nicht remote-fähig sind (`adventure`, `lotti`, `sysupdate`, `trouble net`, `report exit`, `radio`, `call …`), sind während Remote-Modus deaktiviert und antworten mit `Befehl in Sitzung nicht verfügbar.` — analog zum heutigen Telnet-Verhalten.
4. **„Privatsphäre“-Filter umkehren**: heute blendet `/home` jeweils das fremde Heimatverzeichnis aus (`hideHomeName`). In Remote-Sessions wird stattdessen das **eigene** Heimatverzeichnis ausgeblendet, denn man ist ja drüben.
5. Für die **anderen Telnet-Hosts** (Philippe, Kamenev, …) bleibt der bestehende Mini-Modus, wird aber um `ls -a`, Tab-Complete und Pfeil-Verlauf ergänzt — gleicher Code, einmal aufgeräumt in eine kleine Hilfsfunktion gezogen.
6. Der **Banner / motd** des Zielhosts wird beim Connect einmalig ausgegeben; Tab-Complete-Quellen schalten beim Sessionwechsel automatisch um, weil sie aus den abgeleiteten `FILESYSTEM` und `cwd` kommen.
7. **Cheat / Hot-Keys**: `cheat 2611` und „Terminal schließen“-Button bleiben global aktiv und brechen ggf. die Telnet-Session sauber ab.

## Warum das einfach ist

- Kein neuer Filesystem-Code: beide kompletten Bäume existieren längst.
- Keine neuen Befehle: der vorhandene Hauptbefehls-Block wird einfach im Remote-Modus ausgeführt.
- Die Mehrarbeit beschränkt sich auf: einen State-Schalter, ein paar abgeleitete Werte umstellen, `exit`-Sonderfall, ein invertierter Privatsphäre-Filter, Sperrliste für nicht-remotefähige Sub-Programme.

## Was bewusst nicht im Scope ist

- Keine Änderung der Hosts ohne vollen Filesystem-Baum (Philippe & Co.) zu vollwertigen Mini-VMs — sie bleiben flach, gewinnen nur Komfort.
- Keine Änderung an `GameContext`/`terminalBodoMode`-Verkabelung außerhalb der Komponente.
- Keine neuen Story-Flags.
