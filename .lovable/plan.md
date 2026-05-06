## Problem

Der Vossbeck-Strang fühlt sich anstrengend und unklar an:

1. **Vossbeck-Abweisung passt nicht zum Spielzustand.** `vossbeckNoBusiness` (vor Kowalk-Erklärung) und `vossbeckUnready` (nach Kowalk, vor Brust-Sieg) sagen aktuell exakt denselben Text: *„Fallnummer? Sie haben keine. Was wollen Sie dann hier?“* Sobald Layard mit Kowalk über 4317 gesprochen hat, **hat** er eine Fallnummer — der Satz ist dann falsch und gibt keine Richtung.
2. **Kein Hinweis auf Brust.** Es wird dem Spieler in dem Moment, in dem er bei Vossbeck abgewiesen wird, nicht gesagt, dass er für ein Gespräch mit Vossbeck erst drei Trainingsfälle bei Brust gewinnen muss.
3. **Kowalk wirkt wie noch ein Hindernis.** Sie erklärt 4317-K, Schicht-A-Logik, Marteau-Verbindung, Pneumatik-Regeln — viel Text, viele Nummern, kein freundlicher Boden. Spieler haben das Gefühl, sich Verwaltungswissen merken zu müssen.
4. **Allgemeiner Spielfluss-Check.** Brust-Trainingsoption ist hinter `knowsVossbeckPath` versteckt, was an sich gut ist — aber Brust selbst stupst Layard nicht aktiv in Richtung Training, wenn Layard ohne Vollmacht reinkommt.

## Ziel

Der Spieler soll nach dem Kowalk-Gespräch klar wissen: **„Ich brauche Brust → drei Trainingsfälle → dann Vossbeck.“** Kowalk soll dabei spürbar auf Layards Seite stehen und ihn entlasten („Sie müssen sich das nicht merken“). Der Vossbeck-Auftritt vor dem Brust-Sieg soll diesen Pfad bestätigen, nicht verwirren.

## Änderungen

### 1. `vossbeckUnready` (nach Kowalk-Gespräch, vor 3 Brust-Siegen) klar umschreiben

Aktuell identisch zu `vossbeckNoBusiness`. Neu: Vossbeck **kennt** den Vorgang 4317, weist aber wegen fehlender Satisfaktionsfähigkeit ab — und nennt Brust beim Namen.

Beispiel-Tonalität (Vossbeck, knapp, ohne aufzuschauen):
- *„Fallnummer.“* — *„4317.“*
- *„Vorgang Vollmacht 4317. Bewohner Worag. — Habe ich auf dem Tisch.“*
- *„Trainingssiege bei Herrn Brust: keine dokumentiert. Ich verhandle nicht mit Bewohnern, die nicht satisfaktionsfähig sind. — Drei in Folge bei Brust. Dann reden wir.“*

`vossbeckNoBusiness` (Layard war noch nicht bei Kowalk) bleibt der schroffe „Fallnummer? Sie haben keine.“-Brush-off.

### 2. Kowalk als guter Geist — Last vom Spieler nehmen

Im `kInsa`-Strang (Erklärung 4317-K) und `kAuth`-Strang (Vossbeck-Pfad) zwei kurze entlastende Einwürfe einbauen, ohne die Lore zu kappen:

- Nach `kInsa6` / vor dem Bestätigungs-Choice: Kowalk legt sanft nach, z. B. *„Keine Angst, Worag — Sie müssen sich das nicht alles merken. Vossbeck hat den Vorgang. Sie müssen nur zu ihm durchkommen.“*
- In `kAuth8` (sie erklärt Vossbeck + satisfaktionsfähig): zweite Choice-Beschriftung freundlicher und klarer auf Brust gemünzt: *„Verstanden. Ich übe mit Brust.“* statt *„Ich rede mit Brust.“* — und Kowalk antwortet kurz beruhigend: *„Brust beißt nicht. Er liest nur viel.“*
- Wenn Layard nach erfolgter Kowalk-Erklärung erneut Kowalk anspricht und noch keine Brust-Siege hat: optionale neue Hilfs-Zeile (Choice in `k0` mit `requires: ["knowsVossbeckPath"]`, `hiddenWhen: ["vossbeckSummoned","gotB3Ration"]`): *„Was war nochmal der Weg?“* → Kowalk fasst in einem Satz zusammen: *„Brust. Trainingsfall. Drei in Folge. Dann Vossbeck. Den Rest mache ich von hier aus.“*

### 3. Brust schiebt aktiv an, sobald Layard den Pfad kennt

`cafeteriaBrust` → `b0`: wenn `knowsVossbeckPath && !vossbeckSummoned && !duelStarted`, soll Brust bei der allgemeinen Anrede freundlicher (für Brust-Verhältnisse) auf den Trainingsfall verweisen. Eine kurze System-/Brust-Zeile reicht: *„Frau Kowalk hat Sie geschickt. Trainingsfall steht für Sie bereit, sobald Sie wollen.“* Damit wird die Trainings-Choice nicht nur sichtbar, sondern aktiv angeboten.

### 4. Hint-Texte anpassen

`act1.b3Authorization` und `act1.bureaucracyDuel` so umformulieren, dass die Reihenfolge **Kowalk-Erklärung → Brust-Training → Vossbeck** als ein Satz lesbar wird. Der dritte (lösende) Hinweis nennt explizit: „Geh zurück in die Kantine, sprich Brust an und wähle ‚Trainingsfall‘. Drei in Folge gewinnen — dann nimmt Vossbeck dich an.“

Außerdem ein neuer früher Hint, sobald `knowsVossbeckPath && !duelOffered`: *„Kowalk hat dir den Weg erklärt. Der nächste Schritt ist nicht Vossbeck, sondern Brust — am Tresen rechts.“*

### 5. Spielbarkeits-Pass über die Quest (kein Mechanik-Umbau)

Nur Text/Trigger-Tuning, keine neue Logik:

- Sicherstellen, dass die `kInsa`-Choice nach der Bestätigung nicht in einem Loop endet, der den Spieler zwingt, dieselben langen 4317-K-Lore-Zeilen erneut zu lesen.
- Im Notizbuch / `Hint`-Tray prüfen, dass nach `gotTillaTransferInfo` der nächste Hint sofort auf „Brust → Training“ zeigt, nicht auf „Vossbeck“.
- Doppelte Vossbeck-Erwähnungen (Brust nennt ihn in `bAuth2` + `bAuth3`, Kowalk in `kAuth7` + `kAuth8` + `kInsa6`) leicht straffen, damit der Name nicht fünfmal hintereinander fällt.

## Was nicht geändert wird

- Mechanik des Bürokratie-Duells, Paragraphen-System, `bureaucracyDuel.ts`.
- Die Lore (4317, Schicht A, Marteau-Verbindung, Tilla-Quittung) bleibt; nur Tonalität & Zwischenzeilen werden weicher.
- Der Endgame-Auftritt von Vossbeck (`v0`–`v6`) bleibt unangetastet.

## Technische Notizen

- **Datei: `src/game/dialogs/cafeteria.ts`**
  - `vossbeckUnready.lines` neu schreiben (Vossbeck kennt 4317, verlangt Brust-Siege).
  - `cafeteriaKowalk`: zwei beruhigende Zeilen in `kInsa6` und `kAuth8` einfügen, neue `k0`-Choice „Was war nochmal der Weg?“ als Recap, gegated auf `knowsVossbeckPath`.
  - `cafeteriaBrust.b0`: kurze Anschub-Zeile bei `knowsVossbeckPath && !duelStarted`.
- **Datei: `src/game/hints.ts`**
  - Hints für `act1.b3Authorization` und `act1.bureaucracyDuel` umformulieren.
  - Optional ein neuer Eintrag „Brust antrainieren“ mit Priority zwischen 50 und 51, gegated auf `knowsVossbeckPath && !duelOffered`.
- **Keine Änderungen** an `bureaucracyDuel.ts`, `BureaucracyDuelOverlay.tsx`, `kantinenverwaltung3603.ts` (Routing bleibt: ohne `knowsVossbeckPath` → `vossbeckNoBusiness`, sonst ohne `vossbeckSummoned` → `vossbeckUnready`, sonst → `cafeteriaVossbeck`).
- Keine neuen Flags nötig — bestehende `knowsVossbeckPath`, `vossbeckSummoned`, `duelOffered`, `duelStarted`, `gotTillaTransferInfo` reichen aus.
